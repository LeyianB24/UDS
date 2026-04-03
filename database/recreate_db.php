<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'umoja-drivers-sacco';
$dump = 'database/umoja_sacco_db.sql';

$mysqli = new mysqli($host, $user, $pass);
if ($mysqli->connect_error) {
    die("Connect Error: " . $mysqli->connect_error);
}

// 1. Drop and Create
$mysqli->query("DROP DATABASE IF EXISTS `$db` ");
$mysqli->query("CREATE DATABASE `$db` ");
$mysqli->close();

echo "Database recreated. Importing dump...\n";

// 2. Import using cmd /c
$command = "cmd /c \"C:\\xampp\\mysql\\bin\\mysql.exe -u root `$db` < $dump\"";
$output = shell_exec($command);

echo "Import complete.\n";
echo $output;
