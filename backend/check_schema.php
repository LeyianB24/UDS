<?php
require_once 'c:/xampp/htdocs/UDS/backend/config/app.php';
$res = $conn->query("DESCRIBE messages");
while($row = $res->fetch_assoc()) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}
echo "\n--- Support Tickets ---\n";
$res = $conn->query("DESCRIBE support_tickets");
while($row = $res->fetch_assoc()) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}
?>
