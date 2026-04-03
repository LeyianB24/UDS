<?php
/**
 * api/v1/member_support.php
 * Handles support ticket submission and history for members.
 */

require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';

// Auth Guard
if (!isset($_SESSION['member_id'])) {
    api_error("Unauthorized.", 401);
}

$member_id = (int)$_SESSION['member_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch member's support tickets
    $stmt = $conn->prepare("SELECT * FROM support_tickets WHERE member_id = ? ORDER BY created_at DESC");
    if (!$stmt) api_error("Failed to prepare ticket query.");

    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $tickets = $res->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    api_success($tickets);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $subject = $input['subject'] ?? '';
    $category = $input['category'] ?? 'general';
    $message = $input['message'] ?? '';

    if (empty($subject) || empty($message)) {
        api_error("Subject and message are required.");
    }

    $ref = 'TKT-' . strtoupper(bin2hex(random_bytes(4)));

    $stmt = $conn->prepare("INSERT INTO support_tickets (member_id, ref_no, subject, category, message, status, priority, created_at) VALUES (?, ?, ?, ?, ?, 'open', 'normal', NOW())");
    if (!$stmt) api_error("Failed to prepare ticket insertion.");

    $stmt->bind_param("issss", $member_id, $ref, $subject, $category, $message);
    
    if ($stmt->execute()) {
        $ticket_id = $conn->insert_id;
        api_success(['ticket_id' => $ticket_id, 'ref_no' => $ref], "Support ticket submitted! Reference: " . $ref);
    } else {
        api_error("Failed to submit ticket: " . $conn->error);
    }
    $stmt->close();
}
