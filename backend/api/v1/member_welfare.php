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
    $engine = new FinancialEngine($conn);
    $balances = $engine->getBalances($member_id);

    // Pool balance
    $welfare_pool = 0;
    if (method_exists($engine, 'getWelfarePoolBalance')) {
        $welfare_pool = (float)$engine->getWelfarePoolBalance();
    } else {
        $pr = $conn->query("SELECT SUM(amount) as total FROM contributions WHERE contribution_type='welfare' AND status IN ('completed','active')");
        $welfare_pool = (float)($pr->fetch_assoc()['total'] ?? 0);
    }

    // Total given lifetime
    $total_given = 0;
    if (method_exists($engine, 'getMemberWelfareLifetime')) {
        $total_given = (float)$engine->getMemberWelfareLifetime($member_id);
    } else {
        $tg = $conn->prepare("SELECT SUM(amount) as t FROM contributions WHERE member_id=? AND contribution_type='welfare' AND status IN ('completed','active')");
        $tg->bind_param("i", $member_id);
        $tg->execute();
        $total_given = (float)($tg->get_result()->fetch_assoc()['t'] ?? 0);
    }

    // Welfare contributions history
    $stmt = $conn->prepare("SELECT amount, status, reference_no, created_at FROM contributions WHERE member_id=? AND contribution_type='welfare' ORDER BY created_at DESC");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $contributions = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Support received
    $support_received = [];
    $total_received = 0;
    $sr = $conn->prepare("SELECT * FROM welfare_support WHERE member_id=? ORDER BY date_granted DESC");
    if ($sr) {
        $sr->bind_param("i", $member_id);
        $sr->execute();
        $rows = $sr->get_result()->fetch_all(MYSQLI_ASSOC);
        foreach ($rows as $row) {
            if (in_array($row['status'], ['disbursed','approved'])) $total_received += (float)$row['amount'];
            $support_received[] = $row;
        }
    }

    // Member's own cases
    $member_cases = [];
    $mc = $conn->prepare("SELECT * FROM welfare_cases WHERE related_member_id=? ORDER BY created_at DESC");
    if ($mc) {
        $mc->bind_param("i", $member_id);
        $mc->execute();
        $member_cases = $mc->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Community active cases
    $community_cases = [];
    $cc = $conn->query("SELECT c.*, (SELECT COUNT(*) FROM welfare_donations WHERE case_id=c.case_id) as donor_count FROM welfare_cases c WHERE c.status IN ('active','approved','funded') ORDER BY c.created_at DESC");
    if ($cc) $community_cases = $cc->fetch_all(MYSQLI_ASSOC);

    $net_standing = $total_given - $total_received;

    // Chart data (monthly totals)
    $chart_data = [];
    foreach ($contributions as $c) {
        $mk = date('Y-m', strtotime($c['created_at']));
        $chart_data[$mk] = ($chart_data[$mk] ?? 0) + (float)$c['amount'];
    }
    ksort($chart_data);

    api_success([
        'welfare_pool'        => $welfare_pool,
        'total_given'         => $total_given,
        'total_received'      => $total_received,
        'net_standing'        => $net_standing,
        'withdrawable'        => (float)($balances['welfare'] ?? 0),
        'contributions'       => $contributions,
        'support_received'    => $support_received,
        'member_cases'        => $member_cases,
        'community_cases'     => $community_cases,
        'chart_labels'        => array_keys($chart_data),
        'chart_values'        => array_values($chart_data),
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $title      = trim($input['title'] ?? '');
    $desc       = trim($input['description'] ?? '');
    $req_amount = (float)($input['requested_amount'] ?? 0);

    if (empty($title) || $req_amount <= 0) {
        api_error("Title and requested amount are required.");
    }

    $stmt = $conn->prepare("INSERT INTO welfare_cases (title, description, requested_amount, related_member_id, status, created_at) VALUES (?, ?, ?, ?, 'pending', NOW())");
    $stmt->bind_param("ssdi", $title, $desc, $req_amount, $member_id);
    if ($stmt->execute()) {
        api_success(['message' => 'Your welfare case has been submitted for review.']);
    } else {
        api_error("Failed to submit case: " . $conn->error);
    }
}
