require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';

// Auth Guard
if (!isset($_SESSION['member_id'])) {
    api_error("Unauthorized.", 401);
}

$member_id = (int)$_SESSION['member_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $limit = (int)($_GET['limit'] ?? 50);
    $offset = (int)($_GET['offset'] ?? 0);
    $type = $_GET['type'] ?? 'all'; // Filter by ledger category

    $sql = "SELECT * FROM transactions WHERE member_id = ?";
    $params = [$member_id];
    $types = "i";

    if ($type !== 'all') {
        $sql .= " AND related_table = ?";
        $params[] = $type;
        $types .= "s";
    }

    $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $txns = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Get totals for filtering
    $totals = $conn->query("SELECT related_table as category, COUNT(*) as count FROM transactions WHERE member_id = $member_id GROUP BY related_table")->fetch_all(MYSQLI_ASSOC);

    api_success([
        'transactions' => $txns,
        'totals'       => $totals
    ]);
}
