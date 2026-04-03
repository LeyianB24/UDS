<?php
$db_config = [
    'host'     => 'localhost',
    'user'     => 'root',
    'pass'     => '',
    'dbname'   => 'umoja-drivers-sacco'
];

$conn = new mysqli($db_config['host'], $db_config['user'], $db_config['pass'], $db_config['dbname']);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sqlFile = __DIR__ . '/sync_missing.sql';
if (!file_exists($sqlFile)) {
    die("SQL file not found: $sqlFile");
}

$sql = file_get_contents($sqlFile);

// Split by semicolon but be careful with triggers or multi-line statements.
// This is a simple split for standard CREATE TABLE statements.
$queries = explode(';', $sql);

$success = 0;
$failed = 0;

foreach ($queries as $query) {
    $query = trim($query);
    if (empty($query)) continue;
    
    if ($conn->query($query)) {
        $success++;
    } else {
        echo "Error in query: " . $conn->error . "\n";
        $failed++;
    }
}

echo "Sync complete. Success: $success, Failed: $failed\n";
$conn->close();
