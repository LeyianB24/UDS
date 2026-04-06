<?php
/**
 * api/v1/admin_loans.php
 * Administrative loan lifecycle management (Stats, Search, Approval, Disbursement).
 */

require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';

// Auth Guard
if (!isset($_SESSION['admin_id'])) {
    api_error("Unauthorized.", 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$admin_id = $_SESSION['admin_id'];

if ($method === 'GET') {
    // 1. Stats
    $stats = $conn->query("SELECT 
        COUNT(CASE WHEN status='pending' THEN 1 END) as pending_count,
        SUM(CASE WHEN status='pending' THEN amount ELSE 0 END) as pending_val,
        COUNT(CASE WHEN status='approved' THEN 1 END) as approved_count,
        SUM(CASE WHEN status='approved' THEN amount ELSE 0 END) as approved_val,
        COUNT(CASE WHEN status='disbursed' THEN 1 END) as active_count,
        SUM(CASE WHEN status='disbursed' THEN current_balance ELSE 0 END) as active_portfolio,
        COUNT(CASE WHEN status='disbursed' AND DATE(next_repayment_date) < CURDATE() THEN 1 END) as overdue_count
        FROM loans")->fetch_assoc();

    // 2. Filters & Search
    $filter = $_GET['status'] ?? 'all';
    $search = $_GET['q'] ?? '';
    $where  = "1=1";
    $params = [];
    $types  = "";

    if ($filter !== 'all') {
        if ($filter === 'overdue') {
            $where .= " AND status = 'disbursed' AND DATE(next_repayment_date) < CURDATE()";
        } else {
            $where .= " AND status = ?";
            $params[] = $filter;
            $types .= "s";
        }
    }
    if (!empty($search)) {
        $sq = "%$search%";
        $where .= " AND (m.full_name LIKE ? OR m.member_reg_no LIKE ? OR l.reference_no LIKE ?)";
        $params[] = $sq; $params[] = $sq; $params[] = $sq;
        $types .= "sss";
    }

    $sql = "SELECT l.*, m.full_name, m.member_reg_no, m.phone, 
            a.full_name as approver_name
            FROM loans l 
            JOIN members m ON l.member_id = m.member_id 
            LEFT JOIN admins a ON l.approved_by = a.admin_id
            WHERE $where 
            ORDER BY field(l.status, 'pending', 'approved', 'disbursed', 'rejected'), l.created_at DESC";
            
    $stmt = $conn->prepare($sql);
    if (!empty($params)) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $loans = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    api_success([
        'stats' => $stats,
        'loans' => $loans
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $loan_id = (int)($input['loan_id'] ?? 0);
    
    if ($loan_id <= 0) api_error("Target loan identifier required.");

    $conn->begin_transaction();
    try {
        if ($action === 'approve') {
            $stmt = $conn->prepare("UPDATE loans SET status='approved', approved_by=?, approval_date=NOW() WHERE loan_id=?");
            $stmt->bind_param("ii", $admin_id, $loan_id);
            if (!$stmt->execute()) throw new Exception("Failed to update status.");
            
        } elseif ($action === 'disburse') {
            $ref = $input['ref_no'] ?? ("DSB-" . date('Ymd') . "-" . rand(1000, 9999));
            $pm = $input['payment_method'] ?? 'cash';
            
            $stmt = $conn->prepare("SELECT amount, member_id FROM loans WHERE loan_id=?");
            $stmt->bind_param("i", $loan_id);
            $stmt->execute();
            $l = $stmt->get_result()->fetch_assoc();
            
            $engine = new FinancialEngine($conn);
            $engine->transact([
                'member_id'   => $l['member_id'],
                'amount'      => (float)$l['amount'],
                'action_type' => 'loan_disbursement',
                'reference'   => $ref,
                'method'      => $pm,
                'related_id'  => $loan_id,
                'related_table' => 'loans',
                'notes'       => "Loan disbursement via manual terminal."
            ]);
            
            $conn->query("UPDATE loans SET current_balance=amount, status='disbursed', disbursement_date=NOW() WHERE loan_id=$loan_id");
            
        } elseif ($action === 'reject') {
            $reason = $input['reason'] ?? 'Rejected by supervisor.';
            $stmt = $conn->prepare("UPDATE loans SET status='rejected', notes=CONCAT(IFNULL(notes,''), ?) WHERE loan_id=?");
            $reason_text = " [Rejected: " . $reason . "]";
            $stmt->bind_param("si", $reason_text, $loan_id);
            $stmt->execute();
        }

        $conn->commit();
        api_success(null, "Loan ledger updated successfully.");
    } catch (Exception $e) {
        $conn->rollback();
        api_error($e->getMessage());
    }
}
?>
