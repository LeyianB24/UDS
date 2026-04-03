<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';

// Auth Guard
if (!isset($_SESSION['admin_id'])) {
    api_error("Unauthorized. Please log in as an administrator.", 401);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 1. Stats
    $stats = $conn->query("SELECT 
        COUNT(CASE WHEN status='active'    THEN 1 END) as active, 
        COUNT(CASE WHEN status='suspended' THEN 1 END) as suspended, 
        COUNT(CASE WHEN status='inactive'  THEN 1 END) as pending, 
        COUNT(*) as total 
    FROM members")->fetch_assoc();

    // 2. Members List
    $filter = $_GET['status'] ?? 'all';
    $search = $_GET['q'] ?? '';
    $where  = "1=1";
    $params = [];
    $types  = "";

    if ($filter !== 'all') {
        $where   .= " AND status = ?";
        $params[] = $filter;
        $types   .= "s";
    }
    if (!empty($search)) {
        $sq       = "%$search%";
        $where   .= " AND (full_name LIKE ? OR national_id LIKE ? OR email LIKE ? OR phone LIKE ?)";
        $params[] = $sq; $params[] = $sq; $params[] = $sq; $params[] = $sq;
        $types   .= "ssss";
    }

    $query = "SELECT * FROM members WHERE $where ORDER BY join_date DESC LIMIT 100";
    $stmt  = $conn->prepare($query);
    if (!empty($params)) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $members = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    api_success([
        'stats' => $stats,
        'members' => $members
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $member_id = (int) ($input['member_id'] ?? 0);

    if (!$member_id) api_error("Invalid member ID.");

    $new_status = match($action) {
        'approve'    => 'active',
        'suspend'    => 'suspended',
        'reactivate' => 'active',
        default      => null
    };

    if (!$new_status) api_error("Invalid action.");

    $stmt = $conn->prepare("UPDATE members SET status = ? WHERE member_id = ?");
    $stmt->bind_param("si", $new_status, $member_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        // Audit Log
        $admin_id = $_SESSION['admin_id'];
        $log_action = "Member Status Updated";
        $log_detail = "Member ID $member_id status changed to $new_status.";
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        $stmt_log = $conn->prepare("INSERT INTO audit_logs (admin_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, NOW())");
        $stmt_log->bind_param("isss", $admin_id, $log_action, $log_detail, $ip);
        $stmt_log->execute();

        api_success(["message" => "Status updated successfully."]);
    } else {
        api_error("No changes made.");
    }
}
