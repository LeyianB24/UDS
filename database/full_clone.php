<?php
// full_clone.php
$host = 'localhost';
$user = 'root';
$pass = '';
$source_db = 'umoja_drivers_sacco';
$target_db = 'umoja-drivers-sacco';

$mysqli = new mysqli($host, $user, $pass);
if ($mysqli->connect_error) die($mysqli->connect_error);

// 1. Recreate target database
$mysqli->query("DROP DATABASE IF EXISTS `$target_db` ");
$mysqli->query("CREATE DATABASE `$target_db` ");

$res = $mysqli->query("SHOW TABLES FROM `$source_db` ");
$tables = [];
while($row = $res->fetch_row()) $tables[] = $row[0];

echo "Cloning " . count($tables) . " tables...\n";

foreach ($tables as $table) {
    // Clone schema
    $mysqli->query("CREATE TABLE `$target_db`.`$table` LIKE `$source_db`.`$table` ");
    // Clone data
    $mysqli->query("INSERT INTO `$target_db`.`$table` SELECT * FROM `$source_db`.`$table` ");
    echo "Cloned: $table\n";
}

echo "Cloning complete.\n";
$mysqli->close();
