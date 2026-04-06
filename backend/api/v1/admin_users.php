<?php
/**
 * api/v1/admin_users.php
 * Administrative staff & role management.
 */

require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';

// Superadmin required for internal user management
if (!isset($_SESSION['admin_id'])) {
    api_error("Unauthorized.", 401);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 1. Roles
    $roles_res = $conn->query("SELECT * FROM roles ORDER BY name ASC");
    $roles = $roles_res->fetch_all(MYSQLI_ASSOC);

    // 2. Admins
    $users_res = $conn->query("SELECT a.admin_id, a.full_name, a.username, a.email, a.role_id, a.created_at, r.name as role_name 
                                FROM admins a 
                                LEFT JOIN roles r ON a.role_id = r.id 
                                ORDER BY a.created_at DESC");
    $users = $users_res->fetch_all(MYSQLI_ASSOC);

    api_success([
        'roles' => $roles,
        'users' => $users,
        'current_admin_id' => $_SESSION['admin_id']
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'create') {
        $fullname = trim($input['full_name'] ?? '');
        $email    = trim($input['email'] ?? '');
        $username = trim($input['username'] ?? '');
        $role_id  = (int)($input['role_id'] ?? 0);
        $password = trim($input['password'] ?? $username);

        if (empty($fullname) || empty($email) || empty($username) || $role_id <= 0) {
            api_error("Missing required staff manifest data.");
        }

        $check = $conn->prepare("SELECT admin_id FROM admins WHERE email = ? OR username = ?");
        $check->bind_param("ss", $email, $username);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            api_error("Staff record with this email or username already exists.");
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $conn->prepare("INSERT INTO admins (full_name, username, email, password, role_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->bind_param("ssssi", $fullname, $username, $email, $hashed, $role_id);
        
        if ($stmt->execute()) {
            api_success(['admin_id' => $conn->insert_id], "Staff account provisioned successfully.");
        } else {
            api_error("Internal ledger failure: " . $conn->error);
        }
    }

    if ($action === 'update') {
        $id = (int)($input['admin_id'] ?? 0);
        $fullname = trim($input['full_name'] ?? '');
        $email    = trim($input['email'] ?? '');
        $role_id  = (int)($input['role_id'] ?? 0);
        $password = trim($input['password'] ?? '');

        if ($id <= 0) api_error("Invalid staff identifier.");

        $stmt = $conn->prepare("UPDATE admins SET full_name = ?, email = ?, role_id = ? WHERE admin_id = ?");
        $stmt->bind_param("ssii", $fullname, $email, $role_id, $id);
        $stmt->execute();

        if (!empty($password)) {
            $hashed = password_hash($password, PASSWORD_BCRYPT);
            $ps = $conn->prepare("UPDATE admins SET password = ? WHERE admin_id = ?");
            $ps->bind_param("si", $hashed, $id);
            $ps->execute();
        }

        api_success(null, "Staff record synchronized.");
    }

    if ($action === 'delete') {
        $id = (int)($input['admin_id'] ?? 0);
        if ($id === $_SESSION['admin_id']) api_error("Self-demolition prohibited.");
        
        $stmt = $conn->prepare("DELETE FROM admins WHERE admin_id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            api_success(null, "Staff record purged.");
        } else {
            api_error("Purge failure.");
        }
    }
}
?>
