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

$total_savings = (float)$balances['savings'];
$max_loan_limit = $total_savings * 3;

// Active Loan
$stmt = $conn->prepare("SELECT * FROM loans WHERE member_id = ? AND status NOT IN ('completed', 'rejected', 'settled') ORDER BY created_at DESC LIMIT 1");
$stmt->bind_param("i", $member_id);
$stmt->execute();
$active_loan = $stmt->get_result()->fetch_assoc();
$stmt->close();

$active_loan_data = null;
if ($active_loan) {
    $loan_id = (int)$active_loan['loan_id'];
    
    // Fetch Total Fines
    $f_stmt = $conn->prepare("SELECT SUM(amount) as tf FROM fines WHERE loan_id = ?");
    $f_stmt->bind_param("i", $loan_id);
    $f_stmt->execute();
    $total_fines = (float)($f_stmt->get_result()->fetch_assoc()['tf'] ?? 0);
    $f_stmt->close();

    $base_total_payable = (float)$active_loan['total_payable'] > 0 ? (float)$active_loan['total_payable'] : ((float)$active_loan['amount'] * (1 + ((float)$active_loan['interest_rate']/100)));
    $total_payable = $base_total_payable + $total_fines;
    
    $outstanding_balance = (float)$active_loan['current_balance'];
    $repaid_amount = max(0, $total_payable - $outstanding_balance);
    $progress_percent = $total_payable > 0 ? min(100, ($repaid_amount / $total_payable) * 100) : 0;

    $active_loan_data = array_merge($active_loan, [
        'amount' => (float)$active_loan['amount'],
        'current_balance' => (float)$active_loan['current_balance'],
        'total_payable' => (float)$total_payable,
        'progress_percent' => (float)$progress_percent,
        'next_repayment_date' => $active_loan['next_repayment_date']
    ]);
}

// History
$stmt = $conn->prepare("SELECT * FROM loans WHERE member_id = ? ORDER BY created_at DESC LIMIT 50");
$stmt->bind_param("i", $member_id);
$stmt->execute();
$res = $stmt->get_result();
$history = [];
while ($row = $res->fetch_assoc()) {
    $row['amount'] = (float)$row['amount'];
    $row['current_balance'] = (float)$row['current_balance'];
    $history[] = $row;
}
$stmt->close();

api_success([
    'limit' => $max_loan_limit,
    'active_loan' => $active_loan_data,
    'history' => $history
]);
