<?php
/**
 * api/v1/topbar_data.php
 * Unified endpoint for Member Topbar (Profile, Unread Counts, Recent Items)
 */
require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';

$member_id = (int)($_SESSION['member_id'] ?? 0);
if ($member_id <= 0) {
    api_error('Unauthorized', 401);
}

// 1. Profile Info
$stmt = $conn->prepare("SELECT full_name, profile_pic, gender FROM members WHERE member_id=?");
$stmt->bind_param("i", $member_id); $stmt->execute();
$u = $stmt->get_result()->fetch_assoc(); $stmt->close();

$member_name = $u['full_name'] ?? 'Member';
$gender      = $u['gender'] ?? 'male';
$profile_pic = !empty($u['profile_pic']) ? base64_encode($u['profile_pic']) : null;

// 2. Unread Counts
$unread_msg = 0; $unread_notif = 0;
$stmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM messages WHERE to_member_id=? AND is_read=0");
$stmt->bind_param("i", $member_id); $stmt->execute();
$unread_msg = $stmt->get_result()->fetch_assoc()['cnt']; $stmt->close();

if ($conn->query("SHOW TABLES LIKE 'notifications'")->num_rows > 0) {
    $stmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM notifications WHERE user_type='member' AND user_id=? AND status='unread'");
    $stmt->bind_param("i", $member_id); $stmt->execute();
    $unread_notif = $stmt->get_result()->fetch_assoc()['cnt']; $stmt->close();
}

// 3. Recent Items (last 5 each)
$recent_msgs = []; $recent_notifs = [];

$msg_sql = "SELECT m.message_id, m.body, m.sent_at, m.is_read, COALESCE(a.full_name, mem.full_name, 'System') AS sender_name 
            FROM messages m LEFT JOIN admins a ON m.from_admin_id=a.admin_id 
            LEFT JOIN members mem ON m.from_member_id=mem.member_id 
            WHERE m.to_member_id=? ORDER BY m.sent_at DESC LIMIT 5";
if ($stmt = $conn->prepare($msg_sql)) {
    $stmt->bind_param("i", $member_id); $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) $recent_msgs[] = $row;
    $stmt->close();
}

if ($conn->query("SHOW TABLES LIKE 'notifications'")->num_rows > 0) {
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE user_type='member' AND user_id=? ORDER BY created_at DESC LIMIT 5");
    $stmt->bind_param("i", $member_id); $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) $recent_notifs[] = $row;
    $stmt->close();
}

api_success([
    'profile' => [
        'name' => $member_name,
        'gender' => $gender,
        'pic' => $profile_pic
    ],
    'unread' => [
        'messages' => (int)$unread_msg,
        'notifications' => (int)$unread_notif
    ],
    'recent' => [
        'messages' => $recent_msgs,
        'notifications' => $recent_notifs
    ]
]);
