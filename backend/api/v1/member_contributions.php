require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';

// Auth Guard
if (!isset($_SESSION['member_id'])) {
    api_error("Unauthorized.", 401);
}

$member_id = (int)$_SESSION['member_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $page             = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
    $records_per_page = isset($_GET['limit']) && is_numeric($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset           = ($page - 1) * $records_per_page;

    $filter_from = $_GET['from']  ?? '';
    $filter_to   = $_GET['to']    ?? '';
    $filter_type = $_GET['type']  ?? '';

    // -- STATS --
    $stmt_stats = $conn->prepare("SELECT
        COALESCE(SUM(amount),0) as grand_total,
        COALESCE(SUM(CASE WHEN contribution_type='savings' THEN amount ELSE 0 END),0) as total_savings,
        COALESCE(SUM(CASE WHEN contribution_type='shares'  THEN amount ELSE 0 END),0) as total_shares,
        COALESCE(SUM(CASE WHEN contribution_type='welfare' THEN amount ELSE 0 END),0) as total_welfare,
        COUNT(*) as total_count,
        COUNT(CASE WHEN contribution_type='savings' THEN 1 END) as count_savings,
        COUNT(CASE WHEN contribution_type='shares'  THEN 1 END) as count_shares,
        COUNT(CASE WHEN contribution_type='welfare' THEN 1 END) as count_welfare
        FROM contributions WHERE member_id = ?");
    $stmt_stats->bind_param("i", $member_id);
    $stmt_stats->execute();
    $stats = $stmt_stats->get_result()->fetch_assoc();

    // Authoritative savings balance (from FinancialEngine)
    $_engine = new FinancialEngine($conn);
    $_balances = $_engine->getBalances($member_id);
    $ledger_savings = (float)$_balances['savings'];

    // -- TREND DATA --
    $trend_labels  = [];
    $trend_savings = [];
    $trend_shares = [];
    $trend_welfare = [];
    for ($i = 6; $i >= 0; $i--) {
        $ms = date('Y-m-01', strtotime("-$i months"));
        $me = date('Y-m-t',  strtotime("-$i months"));
        $trend_labels[] = date('M', strtotime($ms));
        $stmt_t = $conn->prepare("SELECT
            COALESCE(SUM(CASE WHEN contribution_type='savings' THEN amount ELSE 0 END),0) as sv,
            COALESCE(SUM(CASE WHEN contribution_type='shares'  THEN amount ELSE 0 END),0) as sh,
            COALESCE(SUM(CASE WHEN contribution_type='welfare' THEN amount ELSE 0 END),0) as wf
            FROM contributions WHERE member_id=? AND DATE(created_at) BETWEEN ? AND ?");
        $stmt_t->bind_param("iss", $member_id, $ms, $me); $stmt_t->execute();
        $tr = $stmt_t->get_result()->fetch_assoc();
        $trend_savings[] = round((float)$tr['sv'], 2);
        $trend_shares[]  = round((float)$tr['sh'], 2);
        $trend_welfare[] = round((float)$tr['wf'], 2);
        $stmt_t->close();
    }

    // -- ACTIVE STREAK --
    $stmt_streak = $conn->prepare("SELECT COUNT(DISTINCT DATE(created_at)) as active_days FROM contributions WHERE member_id=? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $stmt_streak->bind_param("i", $member_id); $stmt_streak->execute();
    $active_days = (int)($stmt_streak->get_result()->fetch_assoc()['active_days'] ?? 0);

    // -- LISTING --
    $sql_base = "FROM contributions WHERE member_id = ?";
    $params = [$member_id]; $types = "i";
    if (!empty($filter_type) && $filter_type !== 'all') { $sql_base .= " AND contribution_type = ?"; $params[] = $filter_type; $types .= "s"; }
    if (!empty($filter_from) && !empty($filter_to)) { $sql_base .= " AND DATE(created_at) BETWEEN ? AND ?"; $params[] = $filter_from; $params[] = $filter_to; $types .= "ss"; }

    // Count Total
    $stmt_count = $conn->prepare("SELECT COUNT(*) as total " . $sql_base);
    $ref_params = []; foreach ($params as $k => $v) $ref_params[$k] = &$params[$k];
    $stmt_count->bind_param($types, ...$ref_params); $stmt_count->execute();
    $total_rows  = $stmt_count->get_result()->fetch_assoc()['total'];
    $total_pages = (int)ceil($total_rows / $records_per_page);

    // Get FilterRecords
    $stmt = $conn->prepare("SELECT contribution_id, reference_no, contribution_type, amount, payment_method, created_at, status " . $sql_base . " ORDER BY created_at DESC LIMIT ?, ?");
    $all_params = array_merge($params, [$offset, $records_per_page]);
    $final_refs = []; foreach ($all_params as $k => $v) $final_refs[$k] = &$all_params[$k];
    $stmt->bind_param($types . "ii", ...$final_refs);
    $stmt->execute();
    $history = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    api_success([
        'stats' => array_merge($stats, ['ledger_savings' => $ledger_savings, 'active_days' => $active_days]),
        'trend' => [
            'labels' => $trend_labels,
            'savings' => $trend_savings,
            'shares' => $trend_shares,
            'welfare' => $trend_welfare,
        ],
        'history' => $history,
        'pagination' => [
            'page' => $page,
            'total_pages' => $total_pages,
            'total_rows' => $total_rows,
            'limit' => $records_per_page
        ]
    ]);
}
