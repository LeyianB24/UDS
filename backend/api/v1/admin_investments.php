<?php
/**
 * api/v1/admin_investments.php
 * Administrative investment management endpoint
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
        $status = $_GET['status'] ?? '';
        $type = $_GET['type'] ?? '';

        $where = "1=1";
        $params = [];
        $types = "";

        if (!empty($status)) {
            $where .= " AND i.status = ?";
            $params[] = $status;
            $types .= "s";
        }

        if (!empty($type)) {
            $where .= " AND i.investment_type = ?";
            $params[] = $type;
            $types .= "s";
        }

        // Get investments
        $stmt = $conn->prepare("
            SELECT
                i.investment_id,
                i.title,
                i.description,
                i.investment_type,
                i.amount,
                i.expected_return,
                i.actual_return,
                i.start_date,
                i.end_date,
                i.status,
                i.created_at,
                i.created_by,
                u.username as created_by_name,
                COALESCE(i.actual_return, 0) - i.amount as profit_loss
            FROM investments i
            LEFT JOIN users u ON i.created_by = u.user_id
            WHERE $where
            ORDER BY i.created_at DESC
        ");
        if (!empty($types)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $investments = [];
        while ($row = $result->fetch_assoc()) {
            $investments[] = $row;
        }

        // Get investment summary
        $stmt = $conn->prepare("
            SELECT
                investment_type,
                COUNT(*) as count,
                SUM(amount) as total_invested,
                SUM(COALESCE(actual_return, 0)) as total_returns,
                AVG(expected_return) as avg_expected_return
            FROM investments
            GROUP BY investment_type
        ");
        $stmt->execute();
        $summaryResult = $stmt->get_result();

        $summary = [];
        while ($row = $summaryResult->fetch_assoc()) {
            $summary[] = $row;
        }

        // Get portfolio stats
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_investments,
                SUM(amount) as total_invested,
                SUM(COALESCE(actual_return, 0)) as total_returns,
                SUM(COALESCE(actual_return, 0)) - SUM(amount) as total_profit_loss,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
                COUNT(CASE WHEN status = 'matured' THEN 1 END) as matured_count,
                AVG(expected_return) as avg_expected_return
            FROM investments
        ");
        $stmt->execute();
        $stats = $stmt->get_result()->fetch_assoc();

        api_success([
            'investments' => $investments,
            'summary' => $summary,
            'stats' => $stats
        ]);

    } elseif ($action === 'types') {
        // Get investment types
        $stmt = $conn->prepare("
            SELECT DISTINCT investment_type, COUNT(*) as count
            FROM investments
            GROUP BY investment_type
            ORDER BY count DESC
        ");
        $stmt->execute();
        $result = $stmt->get_result();

        $types = [];
        while ($row = $result->fetch_assoc()) {
            $types[] = $row;
        }

        api_success(['types' => $types]);

    } elseif ($action === 'performance') {
        // Get investment performance over time
        $stmt = $conn->prepare("
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') as month,
                investment_type,
                SUM(amount) as invested,
                SUM(COALESCE(actual_return, 0)) as returns
            FROM investments
            WHERE YEAR(created_at) = YEAR(CURDATE())
            GROUP BY DATE_FORMAT(created_at, '%Y-%m'), investment_type
            ORDER BY month
        ");
        $stmt->execute();
        $result = $stmt->get_result();

        $performance = [];
        while ($row = $result->fetch_assoc()) {
            $performance[] = $row;
        }

        api_success(['performance' => $performance]);
    }

} elseif ($method === 'POST') {
    $action = $_POST['action'] ?? 'create';

    if ($action === 'create') {
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $type = trim($_POST['investment_type'] ?? '');
        $amount = (float)($_POST['amount'] ?? 0);
        $expectedReturn = (float)($_POST['expected_return'] ?? 0);
        $startDate = $_POST['start_date'] ?? date('Y-m-d');
        $endDate = $_POST['end_date'] ?? null;

        if (empty($title) || empty($type) || $amount <= 0) {
            api_error("Title, type, and valid amount are required", 400);
        }

        $stmt = $conn->prepare("
            INSERT INTO investments (
                title, description, investment_type, amount, expected_return,
                start_date, end_date, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)
        ");
        $stmt->bind_param("ssddsssi", $title, $description, $type, $amount, $expectedReturn, $startDate, $endDate, $admin_id);
        $stmt->execute();

        api_success([
            'message' => 'Investment created successfully',
            'investment_id' => $conn->insert_id
        ]);

    } elseif ($action === 'mature') {
        $investmentId = (int)($_POST['investment_id'] ?? 0);
        $actualReturn = (float)($_POST['actual_return'] ?? 0);

        if (!$investmentId) {
            api_error("Investment ID is required", 400);
        }

        $stmt = $conn->prepare("
            UPDATE investments SET
                status = 'matured',
                actual_return = ?,
                end_date = CURDATE()
            WHERE investment_id = ? AND status = 'active'
        ");
        $stmt->bind_param("di", $actualReturn, $investmentId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            api_success(['message' => 'Investment matured successfully']);
        } else {
            api_error("Investment not found or already matured", 404);
        }
    }

} elseif ($method === 'PUT') {
    $investmentId = (int)($_GET['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$investmentId || !$data) {
        api_error("Investment ID and data are required", 400);
    }

    $stmt = $conn->prepare("
        UPDATE investments SET
            title = ?,
            description = ?,
            investment_type = ?,
            amount = ?,
            expected_return = ?,
            start_date = ?,
            end_date = ?
        WHERE investment_id = ?
    ");
    $stmt->bind_param("ssddsssi", $data['title'], $data['description'], $data['investment_type'], $data['amount'], $data['expected_return'], $data['start_date'], $data['end_date'], $investmentId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        api_success(['message' => 'Investment updated successfully']);
    } else {
        api_error("Investment not found", 404);
    }

} elseif ($method === 'DELETE') {
    $investmentId = (int)($_GET['id'] ?? 0);

    if (!$investmentId) {
        api_error("Investment ID is required", 400);
    }

    $stmt = $conn->prepare("DELETE FROM investments WHERE investment_id = ?");
    $stmt->bind_param("i", $investmentId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        api_success(['message' => 'Investment deleted successfully']);
    } else {
        api_error("Investment not found", 404);
    }
}
?>