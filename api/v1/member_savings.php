<?php
require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    api_error('Method not allowed', 405);
}

$member_id = (int)($_SESSION['member_id'] ?? 0);
if ($member_id <= 0) {
    api_error('Unauthorized', 401);
}

$engine = new FinancialEngine($conn);
$balances = $engine->getBalances($member_id);

$netSavings       = (float)($balances['savings'] ?? 0.0);
$totalSavings     = $engine->getLifetimeCredits($member_id, 'savings');
$totalWithdrawals = $engine->getCategoryWithdrawals($member_id, 'savings');
$retainPct        = $totalSavings > 0 ? min(100, ($netSavings / $totalSavings) * 100) : 0;

// 6-month trend data
$trend = [];
for ($i = 5; $i >= 0; $i--) {
    $m = date('Y-m', strtotime("-$i months"));
    $q = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE member_id=? AND transaction_type IN ('deposit','contribution','savings_deposit') AND DATE_FORMAT(created_at,'%Y-%m')=?");
    $q->bind_param("is", $member_id, $m);
    $q->execute();
    $trend[] = [
        'month' => date('M', strtotime($m . "-01")),
        'amount' => (float)$q->get_result()->fetch_row()[0]
    ];
    $q->close();
}

// History
$allowedTypes = ['deposit','contribution','savings_deposit','withdrawal','withdrawal_initiate','withdrawal_finalize'];
$sqlHistory = "SELECT transaction_id as id, created_at, transaction_type, notes, amount, 'Done' as status 
               FROM transactions 
               WHERE member_id = ? AND transaction_type IN ('" . implode("','", $allowedTypes) . "') 
               ORDER BY created_at DESC LIMIT 50";
$stmt = $conn->prepare($sqlHistory);
$stmt->bind_param("i", $member_id);
$stmt->execute();
$res = $stmt->get_result();
$history = [];
while ($row = $res->fetch_assoc()) {
    $row['amount'] = (float)$row['amount'];
    $history[] = $row;
}
$stmt->close();

api_success([
    'net_savings' => $netSavings,
    'total_deposited' => $totalSavings,
    'total_withdrawn' => $totalWithdrawals,
    'retention_rate' => $retainPct,
    'trend' => $trend,
    'history' => $history
]);
