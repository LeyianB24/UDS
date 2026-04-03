<?php
// recreate_db_v2.php
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'umoja-drivers-sacco';
$dump = __DIR__ . '/umoja_sacco_db.sql';

$mysqli = new mysqli($host, $user, $pass);
if ($mysqli->connect_error) {
    die("Connect Error: " . $mysqli->connect_error);
}

// 1. Drop and Create with backticks
echo "Resetting database `$db`...\n";
$mysqli->query("DROP DATABASE IF EXISTS `$db` ");
$mysqli->query("CREATE DATABASE `$db` ");
$mysqli->select_db($db);

// 2. Import SQL dump
if (!file_exists($dump)) {
    die("Dump file not found: $dump");
}

echo "Reading dump file...\n";
$sql = file_get_contents($dump);

// 3. Split queries (simple version, assuming standard dump)
// A better way is to use the mysql CLI but with correct escaping for Windows
$mysqli->close();

echo "Importing using CLI with escaped name...\n";
$command = "C:\\xampp\\mysql\\bin\\mysql.exe -u root \"$db\" < \"$dump\"";
// We must use cmd /c for redirection
$finalCommand = "cmd /c \"$command\"";

system($finalCommand, $returnVar);

echo "Final Return Var: $returnVar\n";
if ($returnVar === 0) {
    echo "Import successful.\n";
} else {
    echo "Import failed with code $returnVar.\n";
}
