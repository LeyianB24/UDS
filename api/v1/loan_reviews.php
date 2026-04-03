<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';
require_once __DIR__ . '/../../inc/SettingsHelper.php';
require_once __DIR__ . '/../../inc/notification_helpers.php';

// Auth Guard
if (!isset($_SESSION['admin_id'])) {
    api_error("Unauthorized. Admin access required.", 401);
}

$admin_id = (int)$_SESSION['admin_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $status_filter = $_GET['status'] ?? 'pending';
    $search = trim($_GET['q'] ?? '');

    $where_clauses = ["1=1"];
    $params = [];
    $types = "";

    if ($status_filter !== 'all') {
        $where_clauses[] = "l.status = ?";
        $params[] = $status_filter;
        $types .= "s";
    }

    if ($search) {
        $where_clauses[] = "(m.full_name LIKE ? OR m.national_id LIKE ? OR l.loan_id LIKE ?)";
        $term = "%$search%";
        $params[] = $term; $params[] = $term; $params[] = $term;
        $types .= "sss";
    }

    $where_sql = implode(" AND ", $where_clauses);
    $sql = "SELECT l.*, m.full_name, m.national_id, m.phone, m.profile_pic 
            FROM loans l 
            JOIN members m ON l.member_id = m.member_id 
            WHERE $where_sql 
            ORDER BY l.created_at DESC";

    $stmt = $conn->prepare($sql);
    if (!empty($params)) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $res = $stmt->get_result();
    $loans = $res->fetch_all(MYSQLI_ASSOC);

    // Stats
    $stats = $conn->query("SELECT
        COUNT(CASE WHEN status='pending'  THEN 1 END) as pending,
        COUNT(CASE WHEN status='approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status IN ('disbursed','active') THEN 1 END) as active
        FROM loans")->fetch_assoc();

    // Attach Guarantors for each loan if needed (or just do it on demand)
    foreach ($loans as &$l) {
        $l['initials'] = strtoupper(implode('', array_map(fn($w) => $w[0], array_slice(explode(' ', trim($l['full_name'])), 0, 2))));
        if ($l['profile_pic']) $l['profile_pic'] = base64_encode($l['profile_pic']);
        
        $g_stmt = $conn->prepare("SELECT lg.*, m.full_name FROM loan_guarantors lg JOIN members m ON lg.member_id = m.member_id WHERE lg.loan_id = ?");
        $g_stmt->bind_param("i", $l['loan_id']);
        $g_stmt->execute();
        $l['guarantors'] = $g_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    api_success([
        'loans' => $loans,
        'stats' => $stats
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $loan_id = (int)($input['loan_id'] ?? 0);
    $action = $input['action'] ?? ''; // 'approve' or 'reject'
    $notes = trim($input['notes'] ?? '');

    if (!$loan_id) api_error("Missing Loan ID.");

    // Load Loan Info
    $stmt = $conn->prepare("SELECT l.*, m.full_name, m.member_id FROM loans l JOIN members m ON l.member_id = m.member_id WHERE l.loan_id = ?");
    $stmt->bind_param("i", $loan_id);
    $stmt->execute();
    $loan = $stmt->get_result()->fetch_assoc();
    if (!$loan) api_error("Loan not found.");

    if ($action === 'approve') {
        // Eligibility check
        $engine = new FinancialEngine($conn);
        $balances = $engine->getBalances($loan['member_id']);
        $limit = (float)$balances['savings'] * 3;
        
        if ((float)$loan['amount'] > ($limit + 0.01)) {
            api_error("Approval Failed: Member's 3x Savings Limit is KES " . number_format($limit) . ". Applied amount exceeds this.");
        }

        $min_guarantors = (int)SettingsHelper::get('min_guarantor_count', 2);
        if (count($loan['guarantors'] ?? []) < $min_guarantors) {
            // Re-fetch guarantors if not attached
            $g_res = $conn->query("SELECT COUNT(*) FROM loan_guarantors WHERE loan_id = $loan_id");
            if ((int)($g_res->fetch_row()[0] ?? 0) < $min_guarantors) {
                api_error("Approval Failed: This loan requires at least $min_guarantors guarantors.");
            }
        }

        $new_status = 'approved';
        $log_action = 'Loan Approval';
        $log_details = "Approved Loan #$loan_id. Queued for disbursement.";
    } elseif ($action === 'reject') {
        if (empty($notes)) api_error("Please provide a rejection reason.");
        $new_status = 'rejected';
        $log_action = 'Loan Rejection';
        $log_details = "Rejected Loan #$loan_id. Reason: $notes";
    } else {
        api_error("Invalid action.");
    }

    $conn->begin_transaction();
    try {
        $stmt_upd = $conn->prepare("UPDATE loans SET status = ?, approved_by = ?, approval_date = NOW() WHERE loan_id = ?");
        $stmt_upd->bind_param("sii", $new_status, $admin_id, $loan_id);
        $stmt_upd->execute();

        $g_status = ($action === 'approve') ? 'approved' : 'rejected';
        $conn->query("UPDATE loan_guarantors SET status = '$g_status' WHERE loan_id = $loan_id");

        $loan_ref = 'LOAN-' . str_pad((string)$loan_id, 5, '0', STR_PAD_LEFT);
        if ($action === 'approve') {
            send_notification($conn, (int)$loan['member_id'], 'loan_approved', ['amount' => (float)$loan['amount'], 'ref' => $loan_ref]);
        } else {
            send_notification($conn, (int)$loan['member_id'], 'loan_rejected', ['amount' => (float)$loan['amount'], 'rejection_reason' => $notes, 'ref' => $loan_ref]);
        }

        // Audit Log
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $stmt_audit = $conn->prepare("INSERT INTO audit_logs (admin_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, NOW())");
        $stmt_audit->bind_param("isss", $admin_id, $log_action, $log_details, $ip);
        $stmt_audit->execute();

        $conn->commit();
        api_success(["message" => "Loan #$loan_id has been " . strtoupper($new_status)]);

    } catch (Exception $e) {
        $conn->rollback();
        api_error("System error: " . $e->getMessage());
    }
}
