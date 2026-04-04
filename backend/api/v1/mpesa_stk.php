require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';
require_once __DIR__ . '/../../inc/GatewayFactory.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';
require_once __DIR__ . '/../../inc/ShareValuationEngine.php';
require_once __DIR__ . '/../../inc/TransactionHelper.php';
require_once __DIR__ . '/../../inc/notification_helpers.php';

// Auth Guard
if (!isset($_SESSION['member_id'])) {
    api_error("Unauthorized. Please log in as a member.", 401);
}

$member_id = (int)$_SESSION['member_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    api_error("Method not allowed.", 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$amount = (float)($input['amount'] ?? 0);
$phone_raw = (string)($input['phone'] ?? '');
$type = (string)($input['contribution_type'] ?? 'savings');
$loan_id = isset($input['loan_id']) ? (int)$input['loan_id'] : null;
$case_id = isset($input['case_id']) ? (int)$input['case_id'] : null;

// Normalize Phone
function normalize_phone(string $raw): string {
    $digits = preg_replace('/\D+/', '', $raw);
    if (preg_match('/^0([0-9]{9})$/', $digits, $m)) return '254' . $m[1];
    if (preg_match('/^7([0-9]{8})$/', $digits, $m)) return '2547' . $m[1]; 
    if (preg_match('/^2547[0-9]{8}$/', $digits)) return $digits;
    return '';
}

$phone = normalize_phone($phone_raw);

if (empty($phone)) api_error("Invalid phone number format.");
if ($amount < 10) api_error("Minimum amount is KES 10.");

// Idempotency check 
$stmt_check = $conn->prepare("SELECT id FROM mpesa_requests WHERE member_id = ? AND amount = ? AND status = 'pending' AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE) LIMIT 1");
$stmt_check->bind_param("id", $member_id, $amount);
$stmt_check->execute();
if ($stmt_check->get_result()->fetch_assoc()) api_error("A similar request is already pending. Please wait a minute.");

try {
    $gateway = GatewayFactory::get('mpesa');
    $ref = 'PAY-' . strtoupper(bin2hex(random_bytes(6)));
    $txn_desc = "SACCO " . ucfirst($type) . " Payment";

    // Initiate
    $result = $gateway->initiateDeposit($phone, $amount, $ref, $txn_desc);
    if (!$result['success']) throw new Exception($result['message']);
    
    $checkoutRequestID = $result['checkout_id'];
    $is_sandbox = (defined('APP_ENV') && APP_ENV === 'sandbox');
    $status = $is_sandbox ? 'completed' : 'pending';
    $mock_receipt = $is_sandbox ? 'SANDBOX-' . strtoupper(bin2hex(random_bytes(4))) : null;

    $conn->begin_transaction();

    // 1. M-Pesa Request
    $stmt = $conn->prepare("INSERT INTO mpesa_requests (member_id, phone, amount, checkout_request_id, status, reference_no, mpesa_receipt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("isdssss", $member_id, $phone, $amount, $checkoutRequestID, $status, $ref, $mock_receipt);
    $stmt->execute();

    // 2. Contributions
    $contrib_type_db = ($type === 'welfare_case') ? 'welfare' : $type;
    $stmt = $conn->prepare("INSERT INTO contributions (member_id, contribution_type, amount, payment_method, reference_no, status, created_at) VALUES (?, ?, ?, 'mpesa', ?, ?, NOW())");
    $c_status = $is_sandbox ? 'active' : 'pending';
    $stmt->bind_param("isdss", $member_id, $contrib_type_db, $amount, $ref, $c_status);
    $stmt->execute();
    $contrib_id = $conn->insert_id;

    // 3. Category Logic
    if ($type === 'loan_repayment' && $loan_id) {
        $stmt_l = $conn->prepare("SELECT current_balance FROM loans WHERE loan_id = ?");
        $stmt_l->bind_param("i", $loan_id);
        $stmt_l->execute();
        $loan_row = $stmt_l->get_result()->fetch_assoc();
        if ($loan_row) {
            $new_bal = max(0, (float)$loan_row['current_balance'] - $amount);
            $stmt_rep = $conn->prepare("INSERT INTO loan_repayments (loan_id, amount_paid, payment_date, payment_method, reference_no, mpesa_receipt, remaining_balance, status) VALUES (?, ?, NOW(), 'mpesa', ?, ?, ?, ?)");
            $rep_status = $is_sandbox ? 'Completed' : 'Pending';
            $stmt_rep->bind_param("idssds", $loan_id, $amount, $ref, $mock_receipt, $new_bal, $rep_status);
            $stmt_rep->execute();
        }
    } elseif ($type === 'shares') {
        $svEngine = new ShareValuationEngine($conn);
        $svEngine->issueShares($member_id, $amount, $ref, 'mpesa');
    }

    // 4. Ledger (Immediate if Sandbox)
    if ($is_sandbox) {
        TransactionHelper::record([
            'member_id'     => $member_id,
            'amount'        => $amount,
            'type'          => 'credit',
            'category'      => $contrib_type_db,
            'ref_no'        => $mock_receipt ?? $ref,
            'notes'         => ucfirst($contrib_type_db) . " deposit via M-Pesa",
            'method'        => 'mpesa',
            'related_id'    => ($type === 'loan_repayment') ? $loan_id : $contrib_id,
            'related_table' => ($type === 'loan_repayment') ? 'loans' : 'contributions'
        ]);
        send_notification($conn, $member_id, 'payment_success', ['amount' => $amount, 'ref' => $ref]);
    }

    $conn->commit();
    api_success(["message" => "Payment request sent! Please complete on your phone.", "ref" => $ref, "status" => $status]);

} catch (Exception $e) {
    try { $conn->rollback(); } catch (Throwable $t) {}
    api_error("M-Pesa Error: " . $e->getMessage());
}
