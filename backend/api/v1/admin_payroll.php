<?php
/**
 * api/v1/admin_payroll.php
 * Administrative payroll management endpoint
 */

require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';

if (!isset($_SESSION['admin_id'])) {
    api_error("Unauthorized.", 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$admin_id = $_SESSION['admin_id'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($action === 'list') {
        // Get payroll records
        $stmt = $conn->prepare("
            SELECT
                p.payroll_id,
                p.employee_id,
                e.full_name as employee_name,
                e.position,
                p.month,
                p.year,
                p.basic_salary,
                p.allowances,
                p.deductions,
                p.gross_pay,
                p.net_pay,
                p.status,
                p.created_at,
                p.processed_at
            FROM payroll p
            JOIN employees e ON p.employee_id = e.employee_id
            ORDER BY p.year DESC, p.month DESC, p.created_at DESC
        ");
        $stmt->execute();
        $result = $stmt->get_result();

        $payrolls = [];
        while ($row = $result->fetch_assoc()) {
            $payrolls[] = $row;
        }

        // Get payroll summary stats
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_payrolls,
                SUM(net_pay) as total_payments,
                AVG(net_pay) as avg_payment,
                COUNT(CASE WHEN status = 'processed' THEN 1 END) as processed_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
            FROM payroll
            WHERE YEAR(created_at) = YEAR(CURDATE())
        ");
        $stmt->execute();
        $stats = $stmt->get_result()->fetch_assoc();

        api_success([
            'payrolls' => $payrolls,
            'stats' => $stats
        ]);

    } elseif ($action === 'employees') {
        // Get employees for payroll
        $stmt = $conn->prepare("
            SELECT
                e.employee_id,
                e.full_name,
                e.position,
                e.department,
                e.basic_salary,
                e.hire_date,
                e.status
            FROM employees e
            WHERE e.status = 'active'
            ORDER BY e.full_name
        ");
        $stmt->execute();
        $result = $stmt->get_result();

        $employees = [];
        while ($row = $result->fetch_assoc()) {
            $employees[] = $row;
        }

        api_success(['employees' => $employees]);

    } elseif ($action === 'template') {
        $month = $_GET['month'] ?? date('m');
        $year = $_GET['year'] ?? date('Y');

        // Generate payroll template for the month
        $stmt = $conn->prepare("
            SELECT
                e.employee_id,
                e.full_name,
                e.position,
                e.basic_salary,
                e.allowances,
                e.deductions,
                CASE WHEN p.payroll_id IS NOT NULL THEN 1 ELSE 0 END as already_processed
            FROM employees e
            LEFT JOIN payroll p ON e.employee_id = p.employee_id
                AND p.month = ? AND p.year = ?
            WHERE e.status = 'active'
            ORDER BY e.full_name
        ");
        $stmt->bind_param("ii", $month, $year);
        $stmt->execute();
        $result = $stmt->get_result();

        $template = [];
        while ($row = $result->fetch_assoc()) {
            $basic = (float)$row['basic_salary'];
            $allowances = (float)($row['allowances'] ?? 0);
            $deductions = (float)($row['deductions'] ?? 0);
            $gross = $basic + $allowances;
            $net = $gross - $deductions;

            $template[] = [
                'employee_id' => $row['employee_id'],
                'employee_name' => $row['full_name'],
                'position' => $row['position'],
                'basic_salary' => $basic,
                'allowances' => $allowances,
                'deductions' => $deductions,
                'gross_pay' => $gross,
                'net_pay' => $net,
                'already_processed' => (bool)$row['already_processed']
            ];
        }

        api_success([
            'month' => $month,
            'year' => $year,
            'template' => $template
        ]);
    }

} elseif ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'process') {
        // Process payroll for multiple employees
        $payrollData = json_decode($_POST['payroll_data'] ?? '[]', true);
        $month = (int)($_POST['month'] ?? date('m'));
        $year = (int)($_POST['year'] ?? date('Y'));

        if (empty($payrollData)) {
            api_error("Payroll data is required", 400);
        }

        $conn->begin_transaction();
        try {
            $processed = 0;
            foreach ($payrollData as $data) {
                $employeeId = (int)$data['employee_id'];
                $basicSalary = (float)$data['basic_salary'];
                $allowances = (float)$data['allowances'];
                $deductions = (float)$data['deductions'];
                $grossPay = (float)$data['gross_pay'];
                $netPay = (float)$data['net_pay'];

                // Check if payroll already exists
                $stmt = $conn->prepare("
                    SELECT payroll_id FROM payroll
                    WHERE employee_id = ? AND month = ? AND year = ?
                ");
                $stmt->bind_param("iii", $employeeId, $month, $year);
                $stmt->execute();
                $existing = $stmt->get_result()->fetch_assoc();

                if ($existing) {
                    // Update existing
                    $stmt = $conn->prepare("
                        UPDATE payroll SET
                            basic_salary = ?, allowances = ?, deductions = ?,
                            gross_pay = ?, net_pay = ?, status = 'processed',
                            processed_at = NOW(), processed_by = ?
                        WHERE payroll_id = ?
                    ");
                    $stmt->bind_param("ddddiii", $basicSalary, $allowances, $deductions, $grossPay, $netPay, $admin_id, $existing['payroll_id']);
                    $stmt->execute();
                } else {
                    // Insert new
                    $stmt = $conn->prepare("
                        INSERT INTO payroll (
                            employee_id, month, year, basic_salary, allowances,
                            deductions, gross_pay, net_pay, status, processed_by
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processed', ?)
                    ");
                    $stmt->bind_param("iiidddddi", $employeeId, $month, $year, $basicSalary, $allowances, $deductions, $grossPay, $netPay, $admin_id);
                    $stmt->execute();
                }
                $processed++;
            }

            $conn->commit();
            api_success([
                'message' => "Processed payroll for $processed employees",
                'processed_count' => $processed
            ]);

        } catch (Exception $e) {
            $conn->rollback();
            api_error("Failed to process payroll: " . $e->getMessage(), 500);
        }

    } elseif ($action === 'generate_payslips') {
        $payrollIds = json_decode($_POST['payroll_ids'] ?? '[]', true);

        if (empty($payrollIds)) {
            api_error("Payroll IDs are required", 400);
        }

        // Generate payslips (would create PDF files)
        $generated = [];
        foreach ($payrollIds as $payrollId) {
            // Mock payslip generation
            $generated[] = [
                'payroll_id' => $payrollId,
                'payslip_url' => "/api/v1/download_payslip.php?id=$payrollId",
                'generated_at' => date('Y-m-d H:i:s')
            ];
        }

        api_success([
            'message' => 'Payslips generated successfully',
            'payslips' => $generated
        ]);

    } else {
        api_error("Invalid action", 400);
    }

} elseif ($method === 'PUT') {
    // Update payroll record
    $payrollId = (int)($_GET['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$payrollId || !$data) {
        api_error("Payroll ID and data are required", 400);
    }

    $stmt = $conn->prepare("
        UPDATE payroll SET
            basic_salary = ?, allowances = ?, deductions = ?,
            gross_pay = ?, net_pay = ?, status = ?
        WHERE payroll_id = ?
    ");
    $stmt->bind_param("ddddsi", $data['basic_salary'], $data['allowances'], $data['deductions'], $data['gross_pay'], $data['net_pay'], $data['status'], $payrollId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        api_success(['message' => 'Payroll updated successfully']);
    } else {
        api_error("Payroll not found or no changes made", 404);
    }

} elseif ($method === 'DELETE') {
    $payrollId = (int)($_GET['id'] ?? 0);

    if (!$payrollId) {
        api_error("Payroll ID is required", 400);
    }

    $stmt = $conn->prepare("DELETE FROM payroll WHERE payroll_id = ?");
    $stmt->bind_param("i", $payrollId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        api_success(['message' => 'Payroll deleted successfully']);
    } else {
        api_error("Payroll not found", 404);
    }
}
?>