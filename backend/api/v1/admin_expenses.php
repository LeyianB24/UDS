<?php
/**
 * api/v1/admin_expenses.php
 * Administrative expense management endpoint
 */

require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';

if (!isset($_SESSION['admin_id'])) {
    api_error("Unauthorized.", 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$admin_id = $_SESSION['admin_id'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($action === 'list') {
        $category = $_GET['category'] ?? '';
        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-t');

        $where = "e.created_at BETWEEN ? AND ?";
        $params = [$startDate, $endDate];
        $types = "ss";

        if (!empty($category)) {
            $where .= " AND e.category = ?";
            $params[] = $category;
            $types .= "s";
        }

        // Get expenses
        $stmt = $conn->prepare("
            SELECT
                e.expense_id,
                e.description,
                e.category,
                e.amount,
                e.created_at,
                e.approved_at,
                e.status,
                u.username as created_by,
                au.username as approved_by
            FROM expenses e
            LEFT JOIN users u ON e.created_by = u.user_id
            LEFT JOIN users au ON e.approved_by = au.user_id
            WHERE $where
            ORDER BY e.created_at DESC
        ");
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $expenses = [];
        while ($row = $result->fetch_assoc()) {
            $expenses[] = $row;
        }

        // Get expense summary
        $stmt = $conn->prepare("
            SELECT
                category,
                COUNT(*) as count,
                SUM(amount) as total_amount,
                AVG(amount) as avg_amount
            FROM expenses
            WHERE created_at BETWEEN ? AND ?
            GROUP BY category
            ORDER BY total_amount DESC
        ");
        $stmt->bind_param("ss", $startDate, $endDate);
        $stmt->execute();
        $summaryResult = $stmt->get_result();

        $summary = [];
        while ($row = $summaryResult->fetch_assoc()) {
            $summary[] = $row;
        }

        // Get total stats
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_expenses,
                SUM(amount) as total_amount,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
            FROM expenses
            WHERE created_at BETWEEN ? AND ?
        ");
        $stmt->bind_param("ss", $startDate, $endDate);
        $stmt->execute();
        $stats = $stmt->get_result()->fetch_assoc();

        api_success([
            'expenses' => $expenses,
            'summary' => $summary,
            'stats' => $stats,
            'filters' => [
                'category' => $category,
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);

    } elseif ($action === 'categories') {
        // Get expense categories
        $stmt = $conn->prepare("
            SELECT DISTINCT category, COUNT(*) as count, SUM(amount) as total
            FROM expenses
            GROUP BY category
            ORDER BY total DESC
        ");
        $stmt->execute();
        $result = $stmt->get_result();

        $categories = [];
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }

        api_success(['categories' => $categories]);

    } elseif ($action === 'budget') {
        // Get budget vs actual expenses
        $year = $_GET['year'] ?? date('Y');
        $month = $_GET['month'] ?? date('m');

        $stmt = $conn->prepare("
            SELECT
                category,
                SUM(CASE WHEN YEAR(created_at) = ? AND MONTH(created_at) = ? THEN amount ELSE 0 END) as actual_amount,
                AVG(amount) as avg_monthly
            FROM expenses
            WHERE YEAR(created_at) = ?
            GROUP BY category
        ");
        $stmt->bind_param("ii", $year, $month, $year);
        $stmt->execute();
        $result = $stmt->get_result();

        $budget = [];
        while ($row = $result->fetch_assoc()) {
            $budget[] = $row;
        }

        api_success([
            'budget' => $budget,
            'year' => $year,
            'month' => $month
        ]);
    }

} elseif ($method === 'POST') {
    $action = $_POST['action'] ?? 'create';

    if ($action === 'create') {
        $description = trim($_POST['description'] ?? '');
        $category = trim($_POST['category'] ?? '');
        $amount = (float)($_POST['amount'] ?? 0);

        if (empty($description) || empty($category) || $amount <= 0) {
            api_error("Description, category, and valid amount are required", 400);
        }

        $stmt = $conn->prepare("
            INSERT INTO expenses (description, category, amount, created_by, status)
            VALUES (?, ?, ?, ?, 'pending')
        ");
        $stmt->bind_param("ssd", $description, $category, $amount, $admin_id);
        $stmt->execute();

        api_success([
            'message' => 'Expense created successfully',
            'expense_id' => $conn->insert_id
        ]);

    } elseif ($action === 'approve') {
        $expenseId = (int)($_POST['expense_id'] ?? 0);

        if (!$expenseId) {
            api_error("Expense ID is required", 400);
        }

        $stmt = $conn->prepare("
            UPDATE expenses SET
                status = 'approved',
                approved_by = ?,
                approved_at = NOW()
            WHERE expense_id = ? AND status = 'pending'
        ");
        $stmt->bind_param("ii", $admin_id, $expenseId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            api_success(['message' => 'Expense approved successfully']);
        } else {
            api_error("Expense not found or already processed", 404);
        }

    } elseif ($action === 'reject') {
        $expenseId = (int)($_POST['expense_id'] ?? 0);
        $reason = trim($_POST['reason'] ?? '');

        if (!$expenseId) {
            api_error("Expense ID is required", 400);
        }

        $stmt = $conn->prepare("
            UPDATE expenses SET
                status = 'rejected',
                notes = CONCAT(IFNULL(notes, ''), ' [Rejected: ', ?, ']')
            WHERE expense_id = ? AND status = 'pending'
        ");
        $stmt->bind_param("si", $reason, $admin_id, $expenseId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            api_success(['message' => 'Expense rejected']);
        } else {
            api_error("Expense not found or already processed", 404);
        }
    }

} elseif ($method === 'PUT') {
    $expenseId = (int)($_GET['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$expenseId || !$data) {
        api_error("Expense ID and data are required", 400);
    }

    $stmt = $conn->prepare("
        UPDATE expenses SET
            description = ?,
            category = ?,
            amount = ?
        WHERE expense_id = ? AND status = 'pending'
    ");
    $stmt->bind_param("ssdi", $data['description'], $data['category'], $data['amount'], $expenseId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        api_success(['message' => 'Expense updated successfully']);
    } else {
        api_error("Expense not found or cannot be edited", 404);
    }

} elseif ($method === 'DELETE') {
    $expenseId = (int)($_GET['id'] ?? 0);

    if (!$expenseId) {
        api_error("Expense ID is required", 400);
    }

    $stmt = $conn->prepare("
        DELETE FROM expenses
        WHERE expense_id = ? AND status = 'pending'
    ");
    $stmt->bind_param("i", $expenseId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        api_success(['message' => 'Expense deleted successfully']);
    } else {
        api_error("Expense not found or cannot be deleted", 404);
    }
}
?>