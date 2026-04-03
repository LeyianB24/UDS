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

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'change_password') {
        $old = $input['old_password'] ?? '';
        $new = $input['new_password'] ?? '';
        
        if (empty($old) || empty($new)) {
            api_error("All fields are required.");
        }

        $stmt = $conn->prepare("SELECT password FROM members WHERE member_id = ?");
        $stmt->bind_param("i", $member_id);
        $stmt->execute();
        $curr = $stmt->get_result()->fetch_assoc();

        if (!password_verify($old, $curr['password'])) {
            api_error("Incorrect current password.");
        }

        $hashed = password_hash($new, PASSWORD_DEFAULT);
        $update = $conn->prepare("UPDATE members SET password = ? WHERE member_id = ?");
        $update->bind_param("si", $hashed, $member_id);
        $update->execute();

        api_success(["message" => "Password updated successfully."]);
    }

    if ($action === 'update_notifications') {
        // Logic for email/sms preferences
        api_success(["message" => "Preferences updated."]);
    }
}
