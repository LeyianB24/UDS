require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';
require_once __DIR__ . '/../../inc/notification_helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Basic fields from POST (multipart/form-data)
    $full_name   = trim($_POST['full_name'] ?? '');
    $national_id = trim($_POST['national_id'] ?? '');
    $phone       = trim($_POST['phone'] ?? '');
    $email       = trim($_POST['email'] ?? '');
    $password    = $_POST['password'] ?? '';
    $gender      = $_POST['gender'] ?? 'male';
    $dob         = $_POST['dob'] ?? '';
    $occupation  = trim($_POST['occupation'] ?? '');
    $address     = trim($_POST['address'] ?? '');
    $nok_name    = trim($_POST['nok_name'] ?? '');
    $nok_phone   = trim($_POST['nok_phone'] ?? '');

    // Validation
    $errors = [];
    if (empty($full_name)) $errors[] = "Full name is required.";
    if (empty($national_id)) $errors[] = "National ID is required.";
    if (empty($phone)) $errors[] = "Phone number is required.";
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Valid email is required.";
    if (strlen($password) < 6) $errors[] = "Password must be at least 6 characters.";
    
    // Duplicate check
    $check = $conn->prepare("SELECT member_id FROM members WHERE email = ? OR phone = ? OR national_id = ? LIMIT 1");
    $check->bind_param("sss", $email, $phone, $national_id);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        api_error("A member with this email, phone, or ID already exists.");
    }

    // Required KYC check
    $required_docs = ['passport_photo', 'national_id_front', 'national_id_back'];
    foreach ($required_docs as $doc) {
        if (!isset($_FILES[$doc]) || $_FILES[$doc]['error'] !== UPLOAD_ERR_OK) {
            api_error("All KYC documents are required (" . str_replace('_', ' ', $doc) . ").");
        }
    }

    if (!empty($errors)) {
        api_error(implode(" ", $errors));
    }

    // Start Transaction
    $conn->begin_transaction();
    try {
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $reg_no = generate_member_no($conn); // Should be in functions.php
        $status = 'inactive';
        $kyc_status = 'pending';

        $insertSql = "INSERT INTO members (member_reg_no, full_name, national_id, phone, email, password, join_date, status, reg_fee_paid, gender, dob, occupation, address, next_of_kin_name, next_of_kin_phone, kyc_status) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 0, ?, ?, ?, ?, ?, ?, ?)";
        $ins = $conn->prepare($insertSql);
        $ins->bind_param("ssssssssssssss", $reg_no, $full_name, $national_id, $phone, $email, $hashed, $status, $gender, $dob, $occupation, $address, $nok_name, $nok_phone, $kyc_status);
        
        if (!$ins->execute()) {
            throw new Exception("Failed to create member record.");
        }
        
        $newMemberId = $ins->insert_id;

        // Process Documents
        $upload_dir = __DIR__ . '/../../uploads/kyc/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

        foreach ($required_docs as $doc_type) {
            $ext      = pathinfo($_FILES[$doc_type]['name'], PATHINFO_EXTENSION);
            $filename = "{$doc_type}_{$newMemberId}_" . time() . ".$ext";
            $target   = $upload_dir . $filename;
            
            if (move_uploaded_file($_FILES[$doc_type]['tmp_name'], $target)) {
                $doc_stmt = $conn->prepare("INSERT INTO member_documents (member_id, document_type, file_path, status) VALUES (?, ?, ?, 'pending')");
                $doc_stmt->bind_param("iss", $newMemberId, $doc_type, $filename);
                $doc_stmt->execute();
            } else {
                throw new Exception("Failed to upload $doc_type.");
            }
        }

        $conn->commit();

        // Initial Notification
        send_notification($conn, (int)$newMemberId, 'registration_success', ['member_no' => $reg_no]);

        // Auto-login after registration
        $_SESSION['member_id'] = $newMemberId;
        $_SESSION['member_name'] = $full_name;
        $_SESSION['role'] = 'member';

        api_success([
            'member_id' => $newMemberId,
            'reg_no'    => $reg_no
        ], "Registration successful!");

    } catch (Exception $e) {
        $conn->rollback();
        api_error($e->getMessage());
    }
}
