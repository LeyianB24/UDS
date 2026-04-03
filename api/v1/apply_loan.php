<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';
require_once __DIR__ . '/../../inc/SettingsHelper.php';

// Auth Guard
if (!isset($_SESSION['member_id'])) {
    api_error("Unauthorized. Please log in as a member.", 401);
}

$member_id = $_SESSION['member_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    api_error("Method not allowed.", 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// 1. Eligibility Checks
$stmt_check = $conn->prepare("SELECT status, kyc_status, registration_fee_status, reg_fee_paid FROM members WHERE member_id = ?");
$stmt_check->bind_param("i", $member_id);
$stmt_check->execute();
$m_data = $stmt_check->get_result()->fetch_assoc();

if (!$m_data || $m_data['status'] !== 'active') {
    api_error("Only active members can apply for loans.");
}
if ($m_data['kyc_status'] !== 'approved') {
    api_error("Your KYC verification is not yet complete. Please ensure your ID and photo are uploaded and verified.");
}
if ($m_data['registration_fee_status'] !== 'paid' && $m_data['reg_fee_paid'] != 1) {
    api_error("You must pay the mandatory SACCO registration fee before you can apply for a loan.");
}

// Check for existing pending or active loans
$stmt_existing = $conn->prepare("SELECT COUNT(*) as count FROM loans WHERE member_id = ? AND status IN ('pending', 'approved', 'disbursed')");
$stmt_existing->bind_param("i", $member_id);
$stmt_existing->execute();
if ($stmt_existing->get_result()->fetch_assoc()['count'] > 0) {
    api_error("You already have a pending or active loan. Please complete it first.");
}

// 2. Validate Input
$loan_type = $input['loan_type'] ?? '';
$amount = (float)($input['amount'] ?? 0);
$duration = (int)($input['duration_months'] ?? 0);
$purpose = $input['notes'] ?? '';
$g1 = (int)($input['guarantor_1'] ?? 0);
$g2 = (int)($input['guarantor_2'] ?? 0);

if (!$loan_type || !$amount || !$duration || !$purpose || !$g1 || !$g2) {
    api_error("Missing required fields.");
}

if ($g1 === $g2) {
    api_error("Please select two different guarantors.");
}

if ($amount < 500) {
    api_error("Minimum loan amount is KES 500.");
}

// Portfolio Limit check
$engine = new FinancialEngine($conn);
$balances = $engine->getBalances($member_id);
$max_limit = (float)($balances['savings'] ?? 0) * 3;

if ($amount > $max_limit) {
    api_error("Loan limit exceeded. Your maximum limit is KES " . number_format($max_limit) . " based on your savings.");
}

// 3. Financials
$interest_rate = (float)SettingsHelper::get('loan_interest_rate', 12.00);
$interest_amount = $amount * ($interest_rate / 100);
$total_payable = $amount + $interest_amount;
$lock_per_guarantor = $amount / 2;

// 4. Transactional Insert
$conn->begin_transaction();
try {
    $sql = "INSERT INTO loans (
                member_id, 
                loan_type, 
                amount, 
                interest_rate, 
                duration_months, 
                status, 
                application_date, 
                notes,
                total_payable,
                current_balance
            ) VALUES (?, ?, ?, ?, ?, 'pending', NOW(), ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isddisdd", 
        $member_id, 
        $loan_type, 
        $amount, 
        $interest_rate, 
        $duration, 
        $purpose,
        $total_payable,
        $total_payable
    );
    $stmt->execute();
    $loan_id = $conn->insert_id;

    // Insert Guarantors
    $stmt_g = $conn->prepare("INSERT INTO loan_guarantors (loan_id, member_id, amount_locked, status, created_at) VALUES (?, ?, ?, 'pending', NOW())");
    
    // G1
    $stmt_g->bind_param("iid", $loan_id, $g1, $lock_per_guarantor);
    $stmt_g->execute();
    
    // G2
    $stmt_g->bind_param("iid", $loan_id, $g2, $lock_per_guarantor);
    $stmt_g->execute();

    $conn->commit();
    
    // Notification (Optional integration)
    if (file_exists(__DIR__ . '/../../inc/notification_helpers.php')) {
        require_once __DIR__ . '/../../inc/notification_helpers.php';
        if (function_exists('add_admin_notification')) {
            add_admin_notification("New Loan Application", "A member has applied for a KES " . number_format($amount, 2) . " loan.", "manager", "admin/pages/loans.php");
        }
    }

    api_success(["message" => "Loan application submitted successfully!", "loan_id" => $loan_id]);

} catch (Exception $e) {
    $conn->rollback();
    api_error("Application failed: " . $e->getMessage());
}
