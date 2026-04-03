require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/Auth.php';

$data = json_decode(file_get_contents('php://input'), true);

$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    api_error('Please enter both identifier (email/username) and password.', 400);
}

// 1. Try Admin Login
$stmt = $conn->prepare("
    SELECT a.admin_id, a.full_name, a.username, a.role_id, r.name as role_name, a.password 
    FROM admins a 
    JOIN roles r ON a.role_id = r.id 
    WHERE a.email = ? OR a.username = ? 
    LIMIT 1
");
$stmt->bind_param('ss', $email, $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res && $res->num_rows > 0) {
    $admin = $res->fetch_assoc();
    if (password_verify($password, $admin['password']) || hash('sha256', $password) === $admin['password'] || $password === $admin['password']) {
        session_regenerate_id(true);
        $_SESSION['admin_id']   = $admin['admin_id'];
        $_SESSION['admin_name'] = !empty($admin['full_name']) ? $admin['full_name'] : $admin['username'];
        $_SESSION['role_id']    = $admin['role_id'];
        $_SESSION['role']       = strtolower($admin['role_name']);
        
        api_success([
            'portal' => 'admin',
            'user' => [
                'id' => $admin['admin_id'],
                'name' => $_SESSION['admin_name'],
                'role' => $_SESSION['role']
            ]
        ]);
    }
}

// 2. Try Member Login
$stmt = $conn->prepare("
    SELECT member_id, full_name, member_reg_no, password, registration_fee_status 
    FROM members 
    WHERE email = ? OR member_reg_no = ? 
    LIMIT 1
");
$stmt->bind_param('ss', $email, $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res && $res->num_rows > 0) {
    $member = $res->fetch_assoc();
    if (password_verify($password, $member['password']) || hash('sha256', $password) === $member['password'] || $password === $member['password']) {
        session_regenerate_id(true);
        $_SESSION['member_id']   = $member['member_id'];
        $_SESSION['member_name'] = $member['full_name'];
        $_SESSION['role']        = 'member';
        
        api_success([
            'portal' => 'member',
            'user' => [
                'id' => $member['member_id'],
                'name' => $member['full_name'],
                'role' => 'member'
            ]
        ]);
    }
}

api_error('Invalid login credentials.', 401);
