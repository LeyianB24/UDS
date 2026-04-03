require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';

// Auth Guard
if (!isset($_SESSION['member_id'])) {
    api_error("Unauthorized.", 401);
}

$member_id = (int)$_SESSION['member_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE member_id = ? ORDER BY created_at DESC LIMIT 100");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $notifs = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    
    $unread = 0;
    foreach($notifs as $n) if(!$n['is_read']) $unread++;

    api_success([
        'notifications' => $notifs,
        'unread_count'  => $unread
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    $all = (bool)($input['all'] ?? false);

    if ($all) {
        $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE member_id = ?");
        $stmt->bind_param("i", $member_id);
        $stmt->execute();
    } elseif ($id > 0) {
        $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND member_id = ?");
        $stmt->bind_param("ii", $id, $member_id);
        $stmt->execute();
    }

    api_success(["message" => "Marked as read."]);
}
