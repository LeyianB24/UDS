<?php
/**
 * api/v1/admin_transactions.php
 * Administrative transaction monitoring (The Golden Ledger).
 */

require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';

// Auth Guard
if (!isset($_SESSION['admin_id'])) {
    api_error("Unauthorized.", 401);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 1. Params
    $search = $_GET['q'] ?? '';
    $type   = $_GET['type'] ?? '';
    $start  = $_GET['start'] ?? '';
    $end    = $_GET['end'] ?? '';
    $limit  = 100;

    // 2. Build SQL
    $where  = "1=1";
    $params = [];
    $types  = "";

    if (!empty($search)) {
        $sq = "%$search%";
        $where .= " AND (t.reference_no LIKE ? OR t.notes LIKE ? OR m.full_name LIKE ?)";
        $params[] = $sq; $params[] = $sq; $params[] = $sq;
        $types .= "sss";
    }

    if (!empty($type)) {
        $where .= " AND t.transaction_type = ?";
        $params[] = $type;
        $types .= "s";
    }

    if (!empty($start)) {
        $where .= " AND t.created_at >= ?";
        $params[] = "$start 00:00:00";
        $types .= "s";
    }

    if (!empty($end)) {
        $where .= " AND t.created_at <= ?";
        $params[] = "$end 23:59:59";
        $types .= "s";
    }

    // 3. Main Query
    $sql = "SELECT t.*, m.full_name, m.national_id 
            FROM transactions t 
            LEFT JOIN members m ON t.member_id = m.member_id 
            WHERE $where 
            ORDER BY t.created_at DESC LIMIT $limit";
            
    $stmt = $conn->prepare($sql);
    if (!empty($params)) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $transactions = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // 4. Stats Query
    $stats_sql = "SELECT 
        SUM(CASE WHEN transaction_type IN ('deposit','income','revenue_inflow','loan_repayment') THEN amount ELSE 0 END) as total_in,
        SUM(CASE WHEN transaction_type IN ('withdrawal','expense','expense_outflow','loan_disbursement') THEN amount ELSE 0 END) as total_out,
        COUNT(*) as count
        FROM transactions t 
        LEFT JOIN members m ON t.member_id = m.member_id 
        WHERE $where";
        
    $stmt_s = $conn->prepare($stats_sql);
    if (!empty($params)) $stmt_s->bind_param($types, ...$params);
    $stmt_s->execute();
    $stats = $stmt_s->get_result()->fetch_assoc();

    api_success([
        'stats' => $stats,
        'transactions' => $transactions
    ]);
}
?>
