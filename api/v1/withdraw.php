<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';
require_once __DIR__ . '/../../inc/TransactionHelper.php';
require_once __DIR__ . '/../../inc/GatewayFactory.php';
require_once __DIR__ . '/../../inc/notification_helpers.php';

// Auth Guard
if (!isset($_SESSION['member_id'])) {
    api_error("Unauthorized.", 401);
}

$member_id = (int)$_SESSION['member_id'];
$method = $_SERVER['REQUEST_METHOD'];

$engine = new FinancialEngine($conn);
$balances = $engine->getBalances($member_id);

if ($method === 'GET') {
    $type = $_GET['type'] ?? 'wallet';
    
    $sources = [
        'wallet'  => ['title' => 'Wallet Balance', 'balance' => $balances['wallet'], 'min' => 10],
        'savings' => ['title' => 'Savings Account', 'balance' => max(0, $balances['savings'] - 500), 'min' => 10, 'note' => 'Min balance KES 500 required'],
        'loans'   => ['title' => 'Loan Funds', 'balance' => $balances['wallet'], 'min' => 10],
        'shares'  => ['title' => 'Share Capital (SACCO Exit)', 'balance' => $balances['shares'], 'min' => 10, 'is_exit' => true],
        'welfare' => ['title' => 'Welfare Benefit', 'balance' => $balances['welfare'], 'min' => 10]
    ];

    $current = $sources[$type] ?? $sources['wallet'];
    
    // Fetch member phone
    $stmt = $conn->prepare("SELECT phone FROM members WHERE member_id = ?");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $phone = $stmt->get_result()->fetch_assoc()['phone'] ?? '';

    api_success([
        'source' => $current,
        'phone'  => $phone,
        'type'   => $type
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $amount = (float)($input['amount'] ?? 0);
    $phone = trim($input['phone'] ?? '');
    $type = $input['type'] ?? 'wallet';

    if ($amount <= 0) api_error("Invalid amount.");
    if (empty($phone)) api_error("Phone number required.");

    $ledger_cats = [
        'wallet'  => FinancialEngine::CAT_WALLET,
        'savings' => FinancialEngine::CAT_SAVINGS,
        'loans'   => FinancialEngine::CAT_WALLET,
        'shares'  => FinancialEngine::CAT_SHARES,
        'welfare' => FinancialEngine::CAT_WELFARE
    ];

    $cat = $ledger_cats[$type] ?? FinancialEngine::CAT_WALLET;
    $available = ($type === 'savings') ? ($balances['savings'] - 500) : $balances[$type === 'loans' ? 'wallet' : $type];

    if ($amount > $available) api_error("Insufficient balance. Available: KES " . number_format($available, 2));

    $conn->begin_transaction();
    try {
        $ref = 'WD-' . strtoupper(bin2hex(random_bytes(5)));
        $notes = ($type === 'shares') ? "SACCO Exit Request ($ref) - Shares" : "Withdrawal Initiated ($ref) to $phone";

        // 1. Debit Ledger (Hold)
        $engine->transact([
            'member_id'   => $member_id,
            'amount'      => $amount,
            'action_type' => 'withdrawal_initiate',
            'method'      => ($type === 'shares') ? 'manual' : 'paystack',
            'source_cat'  => $cat,
            'reference'   => $ref,
            'notes'       => $notes
        ]);

        // 2. Log Request
        $stmt = $conn->prepare("INSERT INTO withdrawal_requests (member_id, ref_no, amount, source_ledger, phone_number, status, notes) VALUES (?, ?, ?, ?, ?, 'initiated', ?)");
        $stmt->bind_param("isdsss", $member_id, $ref, $amount, $type, $phone, $notes);
        $stmt->execute();
        $withdrawal_id = $conn->insert_id;

        if ($type === 'shares') {
            $conn->query("UPDATE withdrawal_requests SET status = 'pending' WHERE withdrawal_id = $withdrawal_id");
            $conn->commit();
            send_notification($conn, $member_id, 'withdrawal_request', ['amount' => $amount, 'ref' => $ref]);
            api_success(["message" => "Exit Request Received. Admin will review and process your SACCO exit.", "ref" => $ref]);
        } else {
            // Gateway Call
            $gateway = GatewayFactory::get('paystack');
            $gw_res = $gateway->initiateWithdrawal($phone, $amount, $ref, "Withdrawal $ref");

            if ($gw_res['success']) {
                $gw_ref = $gw_res['reference'] ?? '';
                $conn->query("UPDATE withdrawal_requests SET status = 'pending', mpesa_conversation_id = '$gw_ref' WHERE withdrawal_id = $withdrawal_id");
                $conn->commit();
                send_notification($conn, $member_id, 'withdrawal_request', ['amount' => $amount, 'ref' => $ref]);
                api_success(["message" => "Withdrawal Processing. Funds will be sent to $phone shortly.", "ref" => $ref]);
            } else {
                throw new Exception("Gateway Error: " . $gw_res['message']);
            }
        }
    } catch (Exception $e) {
        $conn->rollback();
        api_error($e->getMessage());
    }
}
