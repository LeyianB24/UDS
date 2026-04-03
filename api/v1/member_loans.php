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
    
    $total_savings = (float)($balances['savings'] ?? 0.0);
    $wallet_balance = (float)($balances['wallet'] ?? 0.0);
    $max_loan_limit = $total_savings * 3;
    $is_eligible = ($total_savings > 0);

    // Active/Pending Loans
    $active_loan = null;
    $pending_loan = null;

    $stmt = $conn->prepare("SELECT * FROM loans WHERE member_id = ? AND status NOT IN ('completed', 'rejected', 'settled') ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($row = $res->fetch_assoc()) {
        if ($row['status'] === 'pending' || $row['status'] === 'approved') {
            $pending_loan = $row;
        } else {
            $active_loan = $row;
        }
    }

    // Progress for Active Loan
    if ($active_loan) {
        $loan_id = (int)$active_loan['loan_id'];
        
        // Fetch Total Fines
        $f_stmt = $conn->prepare("SELECT SUM(amount) as tf FROM fines WHERE loan_id = ?");
        $f_stmt->bind_param("i", $loan_id);
        $f_stmt->execute();
        $total_fines = (float)($f_stmt->get_result()->fetch_assoc()['tf'] ?? 0);

        $base_total = (float)$active_loan['total_payable'];
        if ($base_total <= 0) $base_total = (float)$active_loan['amount'] * (1 + ((float)$active_loan['interest_rate']/100));
        
        $total_payable = $base_total + $total_fines;
        $outstanding = (float)$active_loan['current_balance'];
        $repaid = max(0, $total_payable - $outstanding);
        $progress = ($total_payable > 0) ? ($repaid / $total_payable) * 100 : 0;

        $active_loan['outstanding_balance'] = $outstanding;
        $active_loan['repaid_amount'] = $repaid;
        $active_loan['progress_percent'] = min(100, $progress);
        $active_loan['total_fines'] = $total_fines;
        $active_loan['is_overdue'] = (!empty($active_loan['next_repayment_date']) && strtotime((string)$active_loan['next_repayment_date']) < time());
        
        // Guarantors
        $g_stmt = $conn->prepare("SELECT m.full_name FROM loan_guarantors g JOIN members m ON g.member_id = m.member_id WHERE g.loan_id = ?");
        $g_stmt->bind_param("i", $loan_id);
        $g_stmt->execute();
        $active_loan['guarantors'] = array_column($g_stmt->get_result()->fetch_all(MYSQLI_ASSOC), 'full_name');
    }

    // History
    $stmt = $conn->prepare("SELECT * FROM loans WHERE member_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $history = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Other Members (for guarantors)
    $stmt = $conn->prepare("SELECT member_id, full_name, national_id FROM members WHERE member_id != ? AND status = 'active' ORDER BY full_name ASC");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $other_members = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    api_success([
        'balances' => [
            'total_savings' => $total_savings,
            'wallet_balance' => $wallet_balance,
            'max_loan_limit' => $max_loan_limit,
            'is_eligible' => $is_eligible
        ],
        'active_loan' => $active_loan,
        'pending_loan' => $pending_loan,
        'history' => $history,
        'available_guarantors' => $other_members
    ]);
}
