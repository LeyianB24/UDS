<?php
declare(strict_types=1);

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

// 1. Member basics
$stmt = $conn->prepare("SELECT full_name, member_reg_no, created_at FROM members WHERE member_id=?");
$stmt->bind_param("i", $member_id); $stmt->execute();
$md = $stmt->get_result()->fetch_assoc(); $stmt->close();
$member_name = $md['full_name'] ?? 'Member';
$reg_no      = $md['member_reg_no'] ?? 'N/A';
$join_date   = date('M Y', strtotime($md['created_at'] ?? 'now'));
$first_name  = explode(' ', $member_name)[0];

// 2. Balances
$engine        = new FinancialEngine($conn);
$balances      = $engine->getBalances($member_id);
$cur_bal       = (float)$balances['wallet'];
$total_savings = (float)$balances['savings'];
$total_shares  = (float)$balances['shares'];
$active_loans  = (float)$balances['loans'];
$net_worth     = $total_savings + $total_shares - $active_loans;
$loan_limit    = 500000;
$loan_pct      = $loan_limit > 0 ? min(100, ($active_loans / $loan_limit) * 100) : 0;

// 3. 12-month arrays
$mo_labels = []; $sav_arr = []; $ctb_arr = []; $rep_arr = [];
for ($i = 11; $i >= 0; $i--) {
    $ms = date('Y-m-01', strtotime("-$i months"));
    $me = date('Y-m-t',  strtotime("-$i months"));
    $mo_labels[] = date('M', strtotime($ms));
    
    $stmt = $conn->prepare("SELECT COALESCE(SUM(le.credit-le.debit),0) FROM ledger_entries le JOIN ledger_accounts la ON le.account_id=la.account_id WHERE la.member_id=? AND la.category='savings' AND le.created_at BETWEEN ? AND ?");
    $stmt->bind_param("iss", $member_id, $ms, $me); $stmt->execute();
    $sav_arr[] = (float)$stmt->get_result()->fetch_row()[0]; $stmt->close();
    
    foreach (['contribution'=>&$ctb_arr, 'loan_repayment'=>&$rep_arr] as $type => &$arr) {
        $stmt = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE member_id=? AND transaction_type=? AND created_at BETWEEN ? AND ?");
        $stmt->bind_param("isss", $member_id, $type, $ms, $me); $stmt->execute();
        $arr[] = (float)$stmt->get_result()->fetch_row()[0]; $stmt->close();
    }
}

// 4. 6-month income vs outflow
$inc_labels = []; $inc_arr = []; $exp_arr = [];
for ($i = 5; $i >= 0; $i--) {
    $ms = date('Y-m-01', strtotime("-$i months"));
    $me = date('Y-m-t',  strtotime("-$i months"));
    $inc_labels[] = date('M', strtotime($ms));
    $stmt = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE member_id=? AND transaction_type IN('deposit','contribution') AND created_at BETWEEN ? AND ?");
    $stmt->bind_param("iss", $member_id, $ms, $me); $stmt->execute();
    $inc_arr[] = (float)$stmt->get_result()->fetch_row()[0]; $stmt->close();
    $stmt = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE member_id=? AND transaction_type IN('withdrawal','loan_repayment') AND created_at BETWEEN ? AND ?");
    $stmt->bind_param("iss", $member_id, $ms, $me); $stmt->execute();
    $exp_arr[] = (float)$stmt->get_result()->fetch_row()[0]; $stmt->close();
}

// 5. Extra stats
$stmt = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE member_id=? AND transaction_type='contribution' AND MONTH(created_at)=MONTH(NOW())");
$stmt->bind_param("i",$member_id); $stmt->execute();
$month_contrib = (float)$stmt->get_result()->fetch_row()[0]; $stmt->close();

$stmt = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE member_id=? AND transaction_type IN('deposit','contribution')");
$stmt->bind_param("i",$member_id); $stmt->execute();
$total_deposits = (float)$stmt->get_result()->fetch_row()[0]; $stmt->close();

$stmt = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE member_id=? AND transaction_type='withdrawal'");
$stmt->bind_param("i",$member_id); $stmt->execute();
$total_withdrawals = (float)$stmt->get_result()->fetch_row()[0]; $stmt->close();

$stmt = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE member_id=? AND transaction_type='welfare'");
$stmt->bind_param("i",$member_id); $stmt->execute();
$welfare_total = (float)$stmt->get_result()->fetch_row()[0]; $stmt->close();

$stmt = $conn->prepare("SELECT COUNT(*) FROM loans WHERE member_id=? AND status='pending'");
$stmt->bind_param("i",$member_id); $stmt->execute();
$pending_loans = (int)$stmt->get_result()->fetch_row()[0]; $stmt->close();

// 6. Recent transactions
$recent_txn = [];
$stmt = $conn->prepare("SELECT transaction_type, amount, created_at, reference_no FROM transactions WHERE member_id=? ORDER BY created_at DESC LIMIT 8");
$stmt->bind_param("i",$member_id); $stmt->execute();
$res = $stmt->get_result();
while ($r = $res->fetch_assoc()) $recent_txn[] = $r;
$stmt->close();

// 7. Health score
$health = max(0, round(100
    - min(30, ($loan_pct/100)*30)
    - ($month_contrib == 0 ? 15 : 0)
    - ($total_savings < 5000 ? 10 : 0)
    - ($pending_loans > 0 ? 5 : 0)
));

// 8. Radar dimensions
$radar = [
    min(100, ($total_savings  / 100000) * 100),
    min(100, ($total_shares   / 50000)  * 100),
    max(0,   100 - $loan_pct),
    min(100, ($month_contrib  / 5000)   * 100),
    min(100, ($welfare_total  / 10000)  * 100),
    min(100, ($cur_bal        / 20000)  * 100),
];

api_success([
    'member_name' => $member_name,
    'first_name' => $first_name,
    'reg_no' => $reg_no,
    'join_date' => $join_date,
    'balances' => [
        'wallet' => $cur_bal,
        'savings' => $total_savings,
        'shares' => $total_shares,
        'loans' => $active_loans,
        'net_worth' => $net_worth
    ],
    'loan_pct' => $loan_pct,
    'chartData' => [
        'mo_labels' => $mo_labels,
        'sav_arr' => $sav_arr,
        'ctb_arr' => $ctb_arr,
        'rep_arr' => $rep_arr,
        'inc_labels' => $inc_labels,
        'inc_arr' => $inc_arr,
        'exp_arr' => $exp_arr,
        'radar' => $radar
    ],
    'stats' => [
        'month_contrib' => $month_contrib,
        'total_deposits' => $total_deposits,
        'total_withdrawals' => $total_withdrawals,
        'welfare_total' => $welfare_total,
        'pending_loans' => $pending_loans,
        'health' => $health
    ],
    'recent_txn' => $recent_txn
]);
