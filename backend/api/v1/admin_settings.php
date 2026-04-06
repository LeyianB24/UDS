<?php
/**
 * api/v1/admin_settings.php
 * Administrative system configuration and profile management.
 */

require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/SettingsHelper.php';

// Auth Guard
if (!isset($_SESSION['admin_id'])) {
    api_error("Unauthorized.", 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$admin_id = $_SESSION['admin_id'];

if ($method === 'GET') {
    // 1. Profile
    $me_res = $conn->query("SELECT a.admin_id, a.full_name, a.username, a.email, r.name as role_name 
                            FROM admins a 
                            LEFT JOIN roles r ON a.role_id = r.id 
                            WHERE a.admin_id = $admin_id");
    $me = $me_res->fetch_assoc();

    // 2. System Settings
    $sys = SettingsHelper::all();

    api_success([
        'profile' => $me,
        'settings' => $sys,
        'server' => [
            'php_version' => phpversion(),
            'os' => PHP_OS,
            'time' => date('Y-m-d H:i:s'),
            'ip' => $_SERVER['SERVER_ADDR'] ?? '127.0.0.1'
        ]
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'update_profile') {
        $fullname = trim($input['full_name'] ?? '');
        $email    = trim($input['email'] ?? '');
        $username = trim($input['username'] ?? '');

        if (empty($fullname) || empty($email) || empty($username)) api_error("Missing required profile fields.");

        $stmt = $conn->prepare("UPDATE admins SET full_name = ?, email = ?, username = ? WHERE admin_id = ?");
        $stmt->bind_param("sssi", $fullname, $email, $username, $admin_id);
        if ($stmt->execute()) {
            $_SESSION['full_name'] = $fullname;
            api_success(null, "Personnel profile updated.");
        } else {
            api_error("Ledger update failure.");
        }
    }

    if ($action === 'change_password') {
        $current = $input['current_password'] ?? '';
        $new     = $input['new_password'] ?? '';
        
        $stmt = $conn->prepare("SELECT password FROM admins WHERE admin_id = ?");
        $stmt->bind_param("i", $admin_id);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if (!password_verify($current, $user['password'])) api_error("Invalid cryptographic current password.");
        
        $hash = password_hash($new, PASSWORD_BCRYPT);
        $upd = $conn->prepare("UPDATE admins SET password = ? WHERE admin_id = ?");
        $upd->bind_param("si", $hash, $admin_id);
        if ($upd->execute()) {
            api_success(null, "Security credentials updated.");
        } else {
            api_error("Credential update failure.");
        }
    }

    if ($action === 'update_system' && $_SESSION['role_id'] == 1) {
        $updates = $input['settings'] ?? [];
        $count = 0;
        foreach ($updates as $key => $val) {
            if (SettingsHelper::set(strtoupper($key), trim((string)$val), $admin_id)) {
                $count++;
            }
        }
        api_success(['updated' => $count], "System configuration synchronized.");
    }
}
?>
