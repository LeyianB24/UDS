<?php
/**
 * api/v1/admin_notifications.php
 * Administrative notification management endpoint
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
        $type = $_GET['type'] ?? '';
        $status = $_GET['status'] ?? '';

        $where = "1=1";
        $params = [];
        $types = "";

        if (!empty($type)) {
            $where .= " AND n.type = ?";
            $params[] = $type;
            $types .= "s";
        }

        if (!empty($status)) {
            $where .= " AND n.status = ?";
            $params[] = $status;
            $types .= "s";
        }

        // Get notifications
        $stmt = $conn->prepare("
            SELECT
                n.notification_id,
                n.title,
                n.message,
                n.type,
                n.priority,
                n.status,
                n.created_at,
                n.sent_at,
                n.created_by,
                u.username as created_by_name,
                COUNT(nr.recipient_id) as recipient_count,
                COUNT(CASE WHEN nr.read_at IS NOT NULL THEN 1 END) as read_count
            FROM notifications n
            LEFT JOIN users u ON n.created_by = u.user_id
            LEFT JOIN notification_recipients nr ON n.notification_id = nr.notification_id
            WHERE $where
            GROUP BY n.notification_id
            ORDER BY n.created_at DESC
        ");
        if (!empty($types)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $notifications = [];
        while ($row = $result->fetch_assoc()) {
            $notifications[] = $row;
        }

        // Get notification stats
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_notifications,
                COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
                COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count,
                COUNT(CASE WHEN type = 'system' THEN 1 END) as system_count,
                COUNT(CASE WHEN type = 'announcement' THEN 1 END) as announcement_count,
                COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_count
            FROM notifications
        ");
        $stmt->execute();
        $stats = $stmt->get_result()->fetch_assoc();

        api_success([
            'notifications' => $notifications,
            'stats' => $stats
        ]);

    } elseif ($action === 'types') {
        // Get notification types
        $types = [
            ['type' => 'system', 'label' => 'System Notifications', 'description' => 'Automated system messages'],
            ['type' => 'announcement', 'label' => 'Announcements', 'description' => 'Important announcements to members'],
            ['type' => 'reminder', 'label' => 'Reminders', 'description' => 'Payment and deadline reminders'],
            ['type' => 'alert', 'label' => 'Alerts', 'description' => 'Urgent alerts and warnings']
        ];

        api_success(['types' => $types]);

    } elseif ($action === 'templates') {
        // Get notification templates
        $stmt = $conn->prepare("
            SELECT template_id, name, type, subject_template, message_template, variables
            FROM notification_templates
            WHERE is_active = 1
            ORDER BY name
        ");
        $stmt->execute();
        $result = $stmt->get_result();

        $templates = [];
        while ($row = $result->fetch_assoc()) {
            $templates[] = $row;
        }

        api_success(['templates' => $templates]);
    }

} elseif ($method === 'POST') {
    $action = $_POST['action'] ?? 'create';

    if ($action === 'create') {
        $title = trim($_POST['title'] ?? '');
        $message = trim($_POST['message'] ?? '');
        $type = $_POST['type'] ?? 'announcement';
        $priority = $_POST['priority'] ?? 'normal';
        $recipients = $_POST['recipients'] ?? 'all'; // 'all', 'active_members', or array of member_ids
        $scheduledAt = $_POST['scheduled_at'] ?? null;

        if (empty($title) || empty($message)) {
            api_error("Title and message are required", 400);
        }

        $conn->begin_transaction();
        try {
            // Create notification
            $status = $scheduledAt ? 'scheduled' : 'draft';
            $stmt = $conn->prepare("
                INSERT INTO notifications (title, message, type, priority, status, created_by, scheduled_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->bind_param("sssssis", $title, $message, $type, $priority, $status, $admin_id, $scheduledAt);
            $stmt->execute();
            $notificationId = $conn->insert_id;

            // Add recipients
            if ($recipients === 'all') {
                $stmt = $conn->prepare("
                    INSERT INTO notification_recipients (notification_id, member_id)
                    SELECT ?, member_id FROM members WHERE status = 'active'
                ");
                $stmt->bind_param("i", $notificationId);
                $stmt->execute();
            } elseif ($recipients === 'active_members') {
                $stmt = $conn->prepare("
                    INSERT INTO notification_recipients (notification_id, member_id)
                    SELECT ?, member_id FROM members WHERE status = 'active' AND last_login > DATE_SUB(NOW(), INTERVAL 30 DAY)
                ");
                $stmt->bind_param("i", $notificationId);
                $stmt->execute();
            } elseif (is_array($recipients)) {
                foreach ($recipients as $memberId) {
                    $stmt = $conn->prepare("
                        INSERT INTO notification_recipients (notification_id, member_id)
                        VALUES (?, ?)
                    ");
                    $stmt->bind_param("ii", $notificationId, $memberId);
                    $stmt->execute();
                }
            }

            $conn->commit();
            api_success([
                'message' => 'Notification created successfully',
                'notification_id' => $notificationId
            ]);

        } catch (Exception $e) {
            $conn->rollback();
            api_error("Failed to create notification: " . $e->getMessage(), 500);
        }

    } elseif ($action === 'send') {
        $notificationId = (int)($_POST['notification_id'] ?? 0);

        if (!$notificationId) {
            api_error("Notification ID is required", 400);
        }

        $conn->begin_transaction();
        try {
            // Update notification status
            $stmt = $conn->prepare("
                UPDATE notifications SET
                    status = 'sent',
                    sent_at = NOW()
                WHERE notification_id = ? AND status IN ('draft', 'scheduled')
            ");
            $stmt->bind_param("i", $notificationId);
            $stmt->execute();

            if ($stmt->affected_rows === 0) {
                throw new Exception("Notification not found or already sent");
            }

            // Here you would integrate with your email/SMS service to actually send notifications
            // For now, we'll just mark them as sent

            $conn->commit();
            api_success(['message' => 'Notification sent successfully']);

        } catch (Exception $e) {
            $conn->rollback();
            api_error("Failed to send notification: " . $e->getMessage(), 500);
        }

    } elseif ($action === 'duplicate') {
        $notificationId = (int)($_POST['notification_id'] ?? 0);

        if (!$notificationId) {
            api_error("Notification ID is required", 400);
        }

        $conn->begin_transaction();
        try {
            // Get original notification
            $stmt = $conn->prepare("
                SELECT title, message, type, priority
                FROM notifications WHERE notification_id = ?
            ");
            $stmt->bind_param("i", $notificationId);
            $stmt->execute();
            $original = $stmt->get_result()->fetch_assoc();

            if (!$original) {
                throw new Exception("Notification not found");
            }

            // Create duplicate
            $stmt = $conn->prepare("
                INSERT INTO notifications (title, message, type, priority, status, created_by)
                VALUES (?, ?, ?, ?, 'draft', ?)
            ");
            $stmt->bind_param("ssssi", $original['title'] . ' (Copy)', $original['message'], $original['type'], $original['priority'], $admin_id);
            $stmt->execute();
            $newId = $conn->insert_id;

            $conn->commit();
            api_success([
                'message' => 'Notification duplicated successfully',
                'notification_id' => $newId
            ]);

        } catch (Exception $e) {
            $conn->rollback();
            api_error("Failed to duplicate notification: " . $e->getMessage(), 500);
        }
    }

} elseif ($method === 'PUT') {
    $notificationId = (int)($_GET['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$notificationId || !$data) {
        api_error("Notification ID and data are required", 400);
    }

    $stmt = $conn->prepare("
        UPDATE notifications SET
            title = ?,
            message = ?,
            type = ?,
            priority = ?,
            scheduled_at = ?
        WHERE notification_id = ?
    ");
    $stmt->bind_param("sssssi", $data['title'], $data['message'], $data['type'], $data['priority'], $data['scheduled_at'], $notificationId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        api_success(['message' => 'Notification updated successfully']);
    } else {
        api_error("Notification not found", 404);
    }

} elseif ($method === 'DELETE') {
    $notificationId = (int)($_GET['id'] ?? 0);

    if (!$notificationId) {
        api_error("Notification ID is required", 400);
    }

    $stmt = $conn->prepare("
        DELETE n, nr FROM notifications n
        LEFT JOIN notification_recipients nr ON n.notification_id = nr.notification_id
        WHERE n.notification_id = ? AND n.status = 'draft'
    ");
    $stmt->bind_param("i", $notificationId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        api_success(['message' => 'Notification deleted successfully']);
    } else {
        api_error("Notification not found or cannot be deleted", 404);
    }
}
?>