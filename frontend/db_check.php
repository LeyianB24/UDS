<?php
$c = new mysqli('localhost', 'root', '', 'umoja-drivers-sacco');
$r = $c->query('SELECT email, password FROM members LIMIT 1');
print_r($r->fetch_assoc());
?>
