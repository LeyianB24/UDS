<?php
/**
 * api/v1/messages.php
 * Unified messaging engine for both Admins and Members.
 */

require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';

$method = $_SERVER['REQUEST_METHOD'];
$admin_id = $_SESSION['admin_id'] ?? null;
$member_id = $_SESSION['member_id'] ?? null;

if (!$admin_id && !$member_id) {
    api_error("Unauthorized session.", 401);
}

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($admin_id) {
        // ADMIN ACTIONS
        if ($action === 'list') {
            // Get all conversations with latest message
            $sql = "SELECT DISTINCT m.from_member_id as member_id, mem.full_name, mem.member_reg_no,
                    (SELECT body FROM messages WHERE from_member_id = m.from_member_id OR to_member_id = m.from_member_id ORDER BY created_at DESC LIMIT 1) as last_msg,
                    (SELECT created_at FROM messages WHERE from_member_id = m.from_member_id OR to_member_id = m.from_member_id ORDER BY created_at DESC LIMIT 1) as last_date,
                    (SELECT COUNT(*) FROM messages WHERE from_member_id = m.from_member_id AND is_read = 0 AND to_admin_id IS NOT NULL) as unread_count
                    FROM messages m
                    JOIN members mem ON m.from_member_id = mem.member_id OR m.to_member_id = mem.member_id
                    WHERE m.from_member_id IS NOT NULL
                    ORDER BY last_date DESC";
            $res = $conn->query($sql);
            api_success($res->fetch_all(MYSQLI_ASSOC));
        } elseif ($action === 'thread') {
            $mid = (int)($_GET['member_id'] ?? 0);
            $stmt = $conn->prepare("SELECT * FROM messages WHERE from_member_id = ? OR to_member_id = ? ORDER BY created_at ASC");
            $stmt->bind_param("ii", $mid, $mid);
            $stmt->execute();
            api_success($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
        }
    } else {
        // MEMBER ACTIONS
        $stmt = $conn->prepare("SELECT * FROM messages WHERE from_member_id = ? OR to_member_id = ? ORDER BY created_at ASC");
        $stmt->bind_param("ii", $member_id, $member_id);
        $stmt->execute();
        api_success($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $body = $input['body'] ?? '';
    
    if (empty($body)) api_error("Empty message body.");

    if ($admin_id) {
        $to_member_id = (int)($input['to_member_id'] ?? 0);
        if ($to_member_id <= 0) api_error("Recipient member ID required.");
        
        $stmt = $conn->prepare("INSERT INTO messages (from_admin_id, to_member_id, body, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->bind_param("iis", $admin_id, $to_member_id, $body);
        if ($stmt->execute()) api_success(null, "Message dispatched to member.");
    } else {
        // From Member to Admin
        $to_admin_id = 1; // Default pool
        $stmt = $conn->prepare("INSERT INTO messages (from_member_id, to_admin_id, body, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->bind_param("iis", $member_id, $to_admin_id, $body);
        if ($stmt->execute()) api_success(null, "Message dispatched to support queue.");
    }
}
?>
