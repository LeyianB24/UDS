<?php
$c = new mysqli('localhost', 'root', '', 'umoja-drivers-sacco');
$res = $c->query("SHOW TABLES");
echo "Count: " . $res->num_rows . "\n";
while($row = $res->fetch_row()) {
    echo $row[0] . "\n";
}
