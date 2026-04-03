<?php
$c = new mysqli('localhost', 'root', '', 'umoja_drivers_sacco');
$res = $c->query("SHOW TABLES");
echo "Source Count: " . $res->num_rows . "\n";
while($row = $res->fetch_row()) {
    echo $row[0] . "\n";
}
