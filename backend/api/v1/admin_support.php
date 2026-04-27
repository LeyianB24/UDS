<?php
/**
 * api/v1/admin_support.php
 * Administrative support ticket management endpoint
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
        $priority = $_GET['priority'] ?? '';

        $where = "1=1";
        $params = [];
        $types = "";

        if (!empty($status)) {
            $where .= " AND s.status = ?";
            $params[] = $status;
            $types .= "s";
        }

        if (!empty($priority)) {
            $where .= " AND s.priority = ?";
            $params[] = $priority;
            $types .= "s";
        }

        // Get support tickets
        $stmt = $conn->prepare("
            SELECT
                s.ticket_id,
                s.subject,
                s.description,
                s.category,
                s.priority,
                s.status,
                s.created_at,
                s.updated_at,
                s.resolved_at,
                m.full_name as member_name,
                m.member_reg_no,
                u.username as assigned_to,
                COUNT(r.reply_id) as reply_count
            FROM support_tickets s
            LEFT JOIN members m ON s.member_id = m.member_id
            LEFT JOIN users u ON s.assigned_to = u.user_id
            LEFT JOIN support_replies r ON s.ticket_id = r.ticket_id
            WHERE $where
            GROUP BY s.ticket_id
            ORDER BY
                CASE s.priority
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END,
                s.created_at DESC
        ");
        if (!empty($types)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $tickets = [];
        while ($row = $result->fetch_assoc()) {
            $tickets[] = $row;
        }

        // Get support stats
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_tickets,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count,
                COUNT(CASE WHEN priority = 'urgent' AND status IN ('open', 'in_progress') THEN 1 END) as urgent_count,
                AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_time
            FROM support_tickets
            WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ");
        $stmt->execute();
        $stats = $stmt->get_result()->fetch_assoc();

        api_success([
            'tickets' => $tickets,
            'stats' => $stats
        ]);

    } elseif ($action === 'detail') {
        $ticketId = (int)($_GET['ticket_id'] ?? 0);

        if (!$ticketId) {
            api_error("Ticket ID is required", 400);
        }

        // Get ticket details
        $stmt = $conn->prepare("
            SELECT
                s.*,
                m.full_name as member_name,
                m.email as member_email,
                m.phone as member_phone,
                u.username as assigned_to_name
            FROM support_tickets s
            LEFT JOIN members m ON s.member_id = m.member_id
            LEFT JOIN users u ON s.assigned_to = u.user_id
            WHERE s.ticket_id = ?
        ");
        $stmt->bind_param("i", $ticketId);
        $stmt->execute();
        $ticket = $stmt->get_result()->fetch_assoc();

        if (!$ticket) {
            api_error("Ticket not found", 404);
        }

        // Get ticket replies
        $stmt = $conn->prepare("
            SELECT
                r.*,
                CASE
                    WHEN r.user_id IS NOT NULL THEN u.username
                    WHEN r.member_id IS NOT NULL THEN m.full_name
                    ELSE 'System'
                END as author_name,
                CASE
                    WHEN r.user_id IS NOT NULL THEN 'admin'
                    WHEN r.member_id IS NOT NULL THEN 'member'
                    ELSE 'system'
                END as author_type
            FROM support_replies r
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN members m ON r.member_id = m.member_id
            WHERE r.ticket_id = ?
            ORDER BY r.created_at ASC
        ");
        $stmt->bind_param("i", $ticketId);
        $stmt->execute();
        $result = $stmt->get_result();

        $replies = [];
        while ($row = $result->fetch_assoc()) {
            $replies[] = $row;
        }

        $ticket['replies'] = $replies;

        api_success(['ticket' => $ticket]);

    } elseif ($action === 'categories') {
        // Get support categories
        $stmt = $conn->prepare("
            SELECT category, COUNT(*) as count
            FROM support_tickets
            GROUP BY category
            ORDER BY count DESC
        ");
        $stmt->execute();
        $result = $stmt->get_result();

        $categories = [];
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }

        api_success(['categories' => $categories]);
    }

} elseif ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'assign') {
        $ticketId = (int)($_POST['ticket_id'] ?? 0);
        $assignedTo = (int)($_POST['assigned_to'] ?? 0);

        if (!$ticketId || !$assignedTo) {
            api_error("Ticket ID and assigned user are required", 400);
        }

        $stmt = $conn->prepare("
            UPDATE support_tickets SET
                assigned_to = ?,
                status = 'in_progress',
                updated_at = NOW()
            WHERE ticket_id = ?
        ");
        $stmt->bind_param("ii", $assignedTo, $ticketId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            api_success(['message' => 'Ticket assigned successfully']);
        } else {
            api_error("Ticket not found", 404);
        }

    } elseif ($action === 'reply') {
        $ticketId = (int)($_POST['ticket_id'] ?? 0);
        $message = trim($_POST['message'] ?? '');
        $isInternal = isset($_POST['internal']) ? 1 : 0;

        if (!$ticketId || empty($message)) {
            api_error("Ticket ID and message are required", 400);
        }

        // Add reply
        $stmt = $conn->prepare("
            INSERT INTO support_replies (ticket_id, user_id, message, is_internal, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->bind_param("iisi", $ticketId, $admin_id, $message, $isInternal);
        $stmt->execute();

        // Update ticket
        $stmt = $conn->prepare("
            UPDATE support_tickets SET
                updated_at = NOW(),
                status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END
            WHERE ticket_id = ?
        ");
        $stmt->bind_param("i", $ticketId);
        $stmt->execute();

        api_success([
            'message' => 'Reply added successfully',
            'reply_id' => $conn->insert_id
        ]);

    } elseif ($action === 'resolve') {
        $ticketId = (int)($_POST['ticket_id'] ?? 0);
        $resolution = trim($_POST['resolution'] ?? '');

        if (!$ticketId) {
            api_error("Ticket ID is required", 400);
        }

        $stmt = $conn->prepare("
            UPDATE support_tickets SET
                status = 'resolved',
                resolution = ?,
                resolved_at = NOW(),
                updated_at = NOW()
            WHERE ticket_id = ?
        ");
        $stmt->bind_param("si", $resolution, $ticketId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            api_success(['message' => 'Ticket resolved successfully']);
        } else {
            api_error("Ticket not found", 404);
        }

    } elseif ($action === 'close') {
        $ticketId = (int)($_POST['ticket_id'] ?? 0);

        if (!$ticketId) {
            api_error("Ticket ID is required", 400);
        }

        $stmt = $conn->prepare("
            UPDATE support_tickets SET
                status = 'closed',
                updated_at = NOW()
            WHERE ticket_id = ?
        ");
        $stmt->bind_param("i", $ticketId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            api_success(['message' => 'Ticket closed successfully']);
        } else {
            api_error("Ticket not found", 404);
        }
    }

} elseif ($method === 'PUT') {
    $ticketId = (int)($_GET['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$ticketId || !$data) {
        api_error("Ticket ID and data are required", 400);
    }

    $stmt = $conn->prepare("
        UPDATE support_tickets SET
            priority = ?,
            category = ?,
            assigned_to = ?,
            status = ?,
            updated_at = NOW()
        WHERE ticket_id = ?
    ");
    $stmt->bind_param("sssii", $data['priority'], $data['category'], $data['assigned_to'], $data['status'], $ticketId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        api_success(['message' => 'Ticket updated successfully']);
    } else {
        api_error("Ticket not found", 404);
    }
}
?>