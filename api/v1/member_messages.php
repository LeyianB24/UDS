<?php
/**
 * api/v1/member_messages.php
 * Handles member messaging (inbox, threads, sending).
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
    // Fetch inbox messages
    // Assuming table 'messages' exists with columns: message_id, from_member_id, from_admin_id, to_member_id, to_admin_id, subject, body, is_read, created_at
    $stmt = $conn->prepare("
        SELECT m.*, 
               CASE WHEN m.from_admin_id IS NOT NULL THEN 'System Admin' ELSE 'Member' END as sender_name 
        FROM messages m 
        WHERE m.to_member_id = ? 
        ORDER BY m.created_at DESC 
        LIMIT 50
    ");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $messages = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    
    $unread = 0;
    foreach($messages as $m) if(!$m['is_read']) $unread++;

    api_success([
        'messages' => $messages,
        'unread_count' => $unread
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? 'send';

    if ($action === 'send') {
        $subject = $input['subject'] ?? 'No Subject';
        $body = $input['body'] ?? '';
        
        if (empty($body)) api_error("Message body cannot be empty.");

        // Send to admin (default admin_id 1 if not specified)
        $to_admin_id = 1; 

        $stmt = $conn->prepare("INSERT INTO messages (from_member_id, to_admin_id, subject, body, created_at) VALUES (?, ?, ?, ?, NOW())");
        $stmt->bind_param("iiss", $member_id, $to_admin_id, $subject, $body);
        
        if ($stmt->execute()) {
            api_success(null, "Message sent successfully.");
        } else {
            api_error("Failed to send message: " . $conn->error);
        }
    } elseif ($action === 'mark_read') {
        $id = (int)($input['id'] ?? 0);
        if ($id > 0) {
            $stmt = $conn->prepare("UPDATE messages SET is_read = 1 WHERE message_id = ? AND to_member_id = ?");
            $stmt->bind_param("ii", $id, $member_id);
            $stmt->execute();
            api_success(null, "Message marked as read.");
        }
    }
}
