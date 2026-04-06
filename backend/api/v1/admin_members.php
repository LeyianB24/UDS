<?php
/**
 * api/v1/admin_members.php
 * Administrative member management (Listing, Filter, Status Update).
 */

require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';

// Permissions check
if (!isset($_SESSION['admin_id'])) {
    api_error("Unauthorized.", 401);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 1. Stats
    $stats = $conn->query("SELECT 
        COUNT(CASE WHEN status='active' THEN 1 END) as active, 
        COUNT(CASE WHEN status='suspended' THEN 1 END) as suspended, 
        COUNT(CASE WHEN status='inactive' THEN 1 END) as pending, 
        COUNT(*) as total 
    FROM members")->fetch_assoc();

    // 2. Filters
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
    $id = (int)($input['member_id'] ?? 0);

    if ($id <= 0) api_error("Invalid member ID.");

    $new_status = match($action) {
        'approve' => 'active',
        'suspend' => 'suspended',
        'reactivate' => 'active',
        default => null
    };

    if (!$new_status) api_error("Invalid action specification.");

    $stmt = $conn->prepare("UPDATE members SET status = ? WHERE member_id = ?");
    $stmt->bind_param("si", $new_status, $id);
    
    if ($stmt->execute()) {
        // Audit log integration
        $admin_id = $_SESSION['admin_id'];
        $log_action = "Registry Update";
        $log_detail = "Member #ID $id updated to status $new_status.";
        $stmt_log = $conn->prepare("INSERT INTO audit_logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())");
        $stmt_log->bind_param("iss", $admin_id, $log_action, $log_detail);
        $stmt_log->execute();
        
        api_success(null, "Registry manifest updated successfully.");
    } else {
        api_error("Ledger synchronization failed: " . $conn->error);
    }
}
?>
