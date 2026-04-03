require_once __DIR__ . '/api_init.php';
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

api_success($response);
