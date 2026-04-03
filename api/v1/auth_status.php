<?php
/**
 * api/v1/auth_status.php
 * Returns the current session status (admin, member, or guest).
 */

if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . '/../../config/app.php';

$response = [
    'authenticated' => false,
    'portal' => 'guest',
    'user' => null
];

if (isset($_SESSION['admin_id'])) {
    $response = [
        'authenticated' => true,
        'portal' => 'admin',
        'user' => [
            'id' => $_SESSION['admin_id'],
            'name' => $_SESSION['full_name'] ?? 'Admin',
            'username' => $_SESSION['username'] ?? 'admin',
            'role' => $_SESSION['role'] ?? 'staff'
        ]
    ];
} elseif (isset($_SESSION['member_id'])) {
    $response = [
        'authenticated' => true,
        'portal' => 'member',
        'user' => [
            'id' => $_SESSION['member_id'],
            'name' => $_SESSION['full_name'] ?? 'Member',
            'username' => $_SESSION['username'] ?? 'member',
            'role' => 'member'
        ]
    ];
}

header('Content-Type: application/json');
echo json_encode($response);
exit;
