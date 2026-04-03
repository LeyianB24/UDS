<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/email.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    api_error('Method not allowed', 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? ($_POST['email'] ?? ''));

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    api_error("Please enter a valid email address.", 400);
}

// Check member
$stmt = $conn->prepare("SELECT member_id, full_name, email FROM members WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();
$user_type = 'member';

if (!$user) {
    $stmt->close();
    $stmt = $conn->prepare("SELECT admin_id, full_name, email FROM admins WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();
    $user_type = 'admin';
}

if ($user) {
    // Generate pass
    $temp_password = substr(str_shuffle('abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%'), 0, 8);
    $hashed_password = password_hash($temp_password, PASSWORD_DEFAULT);
    
    $id_col  = ($user_type === 'member') ? 'member_id' : 'admin_id';
    $user_id = ($user_type === 'member') ? $user['member_id'] : $user['admin_id'];
    $table   = ($user_type === 'member') ? 'members' : 'admins';

    $update = $conn->prepare("UPDATE $table SET password = ? WHERE $id_col = ?");
    $update->bind_param("si", $hashed_password, $user_id);

    if ($update->execute()) {
        $subject = "Your New Temporary Password";
        $body = "
            <div style='font-family:Arial,sans-serif;color:#333;'>
                <h3>Hello {$user['full_name']},</h3>
                <p>We received a request to reset your password for your <strong>" . SITE_NAME . "</strong> account.</p>
                <p>Your new temporary password is:</p>
                <h2 style='background:#ecfdf5;color:#065f46;padding:15px;text-align:center;border-radius:8px;letter-spacing:2px;border:1px dashed #059669;'>{$temp_password}</h2>
                <p>Please log in using this password and <strong>change it immediately</strong> from your profile settings.</p>
                <p><a href='" . SITE_URL . "/login' style='background-color:#0A6B3A;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;'>Login Now</a></p>
                <p style='color:#666;font-size:0.9em;'>If you did not request this, please contact support immediately.</p>
            </div>
        ";
        
        $mid = ($user_type === 'member') ? $user_id : null;
        $aid = ($user_type === 'admin')  ? $user_id : null;

        if (sendEmailWithNotification($email, $subject, $body, $mid, $aid)) {
            api_success(null, "A temporary password has been sent to {$email}. Please check your inbox and spam folder.");
        } else {
            api_error("System could not send the email. Please try again later.", 500);
        }
    } else {
        api_error("Database update failed. Please try again.", 500);
    }
} else {
    // For security, don't reveal if email exists. Still send success.
    api_success(null, "If an account exists with that email, a reset link has been sent.");
}
