<?php
declare(strict_types=1);

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
    
    // Fetch welfare specific history
    $stmt = $conn->prepare("SELECT * FROM transactions WHERE member_id = ? AND related_table = 'welfare_ledger' ORDER BY created_at DESC LIMIT 50");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $history = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Fetch welfare benefits/situations if table exists
    $benefits = $conn->query("SELECT * FROM welfare_situations ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);

    api_success([
        'welfare_balance' => $balances['welfare'],
        'history'         => $history,
        'benefits'        => $benefits
    ]);
}
