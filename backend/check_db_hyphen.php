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

$expected_tables = [
    'admins', 'admin_module_permissions', 'audit_logs', 'callback_logs', 'contributions', 'cron_runs', 
    'dividend_payouts', 'dividend_periods', 'email_queue', 'employees', 'employee_salary_history', 
    'export_logs', 'financial_export_logs', 'fines', 'integrity_checks', 'investments', 
    'investment_expenses', 'investment_income', 'job_role_mapping', 'job_titles', 'ledger_accounts', 
    'ledger_entries', 'ledger_transactions', 'legacy_expenses_backup', 'legacy_vehicles_backup', 
    'legacy_vehicle_expenses_backup', 'legacy_vehicle_income_backup', 'loans', 'loan_guarantors', 
    'loan_repayments', 'members', 'member_documents', 'member_shareholdings', 'messages', 
    'module_audit_trail', 'mpesa_requests', 'next_of_kin', 'notifications', 'password_reset_tokens', 
    'payment_channels', 'payroll', 'payroll_items', 'payroll_runs', 'payslips', 'permissions', 
    'properties', 'property_sales', 'reconciliation_logs', 'roles', 'role_permissions', 
    'salary_grades', 'savings', 'shares', 'share_settings', 'share_transactions', 
    'statutory_deductions', 'statutory_rules', 'support_replies', 'support_tickets', 
    'system_config', 'system_modules', 'system_module_pages', 'system_settings', 'transactions', 
    'transaction_alerts', 'welfare_cases', 'welfare_donations', 'welfare_support', 
    'withdrawal_requests', '_migrations'
];

$res = $conn->query("SHOW TABLES");
$actual_tables = [];
while ($row = $res->fetch_row()) {
    $actual_tables[] = $row[0];
}

$results = [
    'present' => [],
    'missing' => []
];

foreach ($expected_tables as $table) {
    if (in_array($table, $actual_tables)) {
        $results['present'][] = $table;
    } else {
        $results['missing'][] = $table;
    }
}

echo "Present: " . count($results['present']) . "\n";
echo "Missing: " . count($results['missing']) . "\n";
echo "MISSING_TABLES:\n" . implode("\n", $results['missing']) . "\n";
