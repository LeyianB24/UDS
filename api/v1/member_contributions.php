<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';

// Auth Guard
if (!isset($_SESSION['member_id'])) {
    api_error("Unauthorized.", 401);
}

$member_id = (int)$_SESSION['member_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM transactions WHERE member_id = ? AND transaction_type LIKE '%contribution%' ORDER BY created_at DESC LIMIT 100");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $txns = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Group by fund type
    $summary = $conn->query("SELECT related_table, SUM(amount) as total FROM transactions WHERE member_id = $member_id AND transaction_type LIKE '%contribution%' GROUP BY related_table")->fetch_all(MYSQLI_ASSOC);

    api_success([
        'contributions' => $txns,
        'summary'       => $summary
    ]);
}
