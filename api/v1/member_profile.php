<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';
require_once __DIR__ . '/../../inc/notification_helpers.php';

// Auth Guard
if (!isset($_SESSION['member_id']) && !isset($_SESSION['admin_id'])) {
    api_error("Unauthorized.", 401);
}

$member_id = (int)($_GET['member_id'] ?? $_SESSION['member_id'] ?? 0);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM members WHERE member_id = ?");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $member = $stmt->get_result()->fetch_assoc();
    if (!$member) api_error("Member not found.");

    // Format avatar
    unset($member['password']);
    if (!empty($member['profile_pic'])) {
       $member['profile_pic'] = base64_encode($member['profile_pic']);
    }

    // KYC documents
    $doc_stmt = $conn->prepare("SELECT * FROM member_documents WHERE member_id = ?");
    $doc_stmt->bind_param("i", $member_id);
    $doc_stmt->execute();
    $docs = $doc_stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Registration Fee status
    $reg_fee_paid = ($member['registration_fee_status'] === 'paid' || $member['reg_fee_paid'] == 1);

    api_success([
        'profile' => $member,
        'docs'    => $docs,
        'is_paid' => $reg_fee_paid
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Regular update or KYC update?
    $action = $input['action'] ?? 'update_profile';

    if ($action === 'update_profile') {
        $email      = trim($input['email'] ?? '');
        $phone      = trim($input['phone'] ?? '');
        $address    = trim($input['address'] ?? '');
        $occupation = trim($input['occupation'] ?? '');
        $dob        = trim($input['dob'] ?? '');
        $nok_name   = trim($input['nok_name'] ?? '');
        $nok_phone  = trim($input['nok_phone'] ?? '');
        $remove_pic = (bool)($input['remove_pic'] ?? false);
        $pic_base64 = $input['profile_pic_base64'] ?? null;

        $pic_data = null;
        if ($remove_pic) {
            $pic_data = null;
        } elseif ($pic_base64) {
            $pic_data = base64_decode($pic_base64);
        } else {
            // Keep current
            $curr = $conn->query("SELECT profile_pic FROM members WHERE member_id = $member_id")->fetch_assoc();
            $pic_data = $curr['profile_pic'];
        }

        $sql = "UPDATE members SET email=?, phone=?, address=?, occupation=?, dob=?, next_of_kin_name=?, next_of_kin_phone=?, profile_pic=? WHERE member_id=?";
        $stmt = $conn->prepare($sql);
        $null = null;
        $stmt->bind_param("ssssssssbi", $email, $phone, $address, $occupation, $dob, $nok_name, $nok_phone, $null, $member_id);
        if ($pic_data !== null) $stmt->send_long_data(7, $pic_data);
        
        if ($stmt->execute()) {
            send_notification($conn, $member_id, 'profile_updated');
            api_success(["message" => "Profile updated successfully!"]);
        } else {
            api_error("Update failed: " . $conn->error);
        }
    }

    if ($action === 'upload_kyc') {
        $doc_type = $input['doc_type'] ?? '';
        $file_base64 = $input['file_base64'] ?? '';
        $file_name = $input['file_name'] ?? '';

        if (!$doc_type || !$file_base64) api_error("Missing document data.");

        $file_data = base64_decode($file_base64);
        $upload_dir = __DIR__ . '/../../uploads/kyc/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
        
        $ext = pathinfo($file_name, PATHINFO_EXTENSION) ?: 'jpg';
        $new_name = "{$doc_type}_{$member_id}_".time().".$ext";
        
        if (file_put_contents($upload_dir . $new_name, $file_data)) {
            $stmt = $conn->prepare("INSERT INTO member_documents (member_id, document_type, file_path, status) VALUES (?, ?, ?, 'pending') ON DUPLICATE KEY UPDATE file_path=VALUES(file_path), status='pending', uploaded_at=NOW()");
            $stmt->bind_param("iss", $member_id, $doc_type, $new_name);
            $stmt->execute();

            $conn->query("UPDATE members SET kyc_status='pending' WHERE member_id=$member_id AND kyc_status='not_submitted'");
            api_success(["message" => "Document uploaded and queued for review."]);
        } else {
            api_error("Failed to save file.");
        }
    }
}
