<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';

// Auth Guard
if (!isset($_SESSION['member_id'])) {
    api_error("Unauthorized. Please log in as a member.", 401);
}

$member_id = $_SESSION['member_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $engine = new FinancialEngine($conn);
    $balances = $engine->getBalances($member_id);
    
    $netSavings = (float)($balances['savings'] ?? 0.0);
    $totalSavings = $engine->getLifetimeCredits($member_id, 'savings');
    $totalWithdrawals = $engine->getCategoryWithdrawals($member_id, 'savings');

    // Filters
    $typeFilter = $_GET['type'] ?? '';
    $startDate = $_GET['start_date'] ?? '';
    $endDate = $_GET['end_date'] ?? '';

    $allowedTypes = ['deposit','contribution','savings_deposit','withdrawal','withdrawal_initiate','withdrawal_finalize'];
    $where = "WHERE member_id = ? AND transaction_type IN ('".implode("','", $allowedTypes)."')";
    $params = [$member_id];
    $types = "i";

    if ($typeFilter === 'deposit') {
        $where .= " AND transaction_type IN ('deposit','contribution','savings_deposit')";
    } elseif ($typeFilter === 'withdrawal') {
        $where .= " AND transaction_type IN ('withdrawal','withdrawal_initiate','withdrawal_finalize')";
    }

    if ($startDate && $endDate) {
        $where .= " AND DATE(created_at) BETWEEN ? AND ?";
        $params[] = $startDate;
        $params[] = $endDate;
        $types .= "ss";
    }

    $query = "SELECT * FROM transactions $where ORDER BY created_at DESC LIMIT 50";
    $stmt = $conn->prepare($query);
    if (!empty($params)) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $history = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // 6-month trend
    $trend = [];
    $labels = [];
    for ($i = 5; $i >= 0; $i--) {
        $m = date('Y-m', strtotime("-$i months"));
        $labels[] = date('M', strtotime("-$i months"));
        $q = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE member_id=? AND transaction_type IN ('deposit','contribution','savings_deposit') AND DATE_FORMAT(created_at,'%Y-%m')=?");
        $q->bind_param("is", $member_id, $m);
        $q->execute();
        $trend[] = (float)$q->get_result()->fetch_row()[0];
    }

    api_success([
        'balances' => [
            'net_savings' => $netSavings,
            'total_deposited' => $totalSavings,
            'total_withdrawn' => $totalWithdrawals
        ],
        'history' => $history,
        'trend' => [
            'data' => $trend,
            'labels' => $labels
        ]
    ]);
}
