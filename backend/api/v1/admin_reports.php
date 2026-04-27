<?php
/**
 * api/v1/admin_reports.php
 * Administrative reports and analytics endpoint
 */

require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';

if (!isset($_SESSION['admin_id'])) {
    api_error("Unauthorized.", 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$admin_id = $_SESSION['admin_id'];

if ($method === 'GET') {
    $period = $_GET['period'] ?? 'monthly';

    // Calculate date range based on period
    $dateRange = getDateRange($period);

    // Financial Reports Data
    $financialReports = [
        'balance_sheet' => getBalanceSheetData($conn, $dateRange),
        'income_statement' => getIncomeStatementData($conn, $dateRange),
        'cash_flow' => getCashFlowData($conn, $dateRange),
        'trial_balance' => getTrialBalanceData($conn, $dateRange)
    ];

    // Member Reports Data
    $memberReports = [
        'member_list' => getMemberListData($conn),
        'active_members' => getActiveMembersData($conn, $dateRange),
        'new_members' => getNewMembersData($conn, $dateRange),
        'member_contributions' => getMemberContributionsData($conn, $dateRange)
    ];

    // Loan Reports Data
    $loanReports = [
        'loan_portfolio' => getLoanPortfolioData($conn),
        'loan_performance' => getLoanPerformanceData($conn, $dateRange),
        'loan_defaults' => getLoanDefaultsData($conn, $dateRange),
        'loan_disbursements' => getLoanDisbursementsData($conn, $dateRange)
    ];

    // Operational Reports Data
    $operationalReports = [
        'transaction_summary' => getTransactionSummaryData($conn, $dateRange),
        'revenue_analysis' => getRevenueAnalysisData($conn, $dateRange),
        'expense_breakdown' => getExpenseBreakdownData($conn, $dateRange),
        'audit_trail' => getAuditTrailData($conn, $dateRange)
    ];

    api_success([
        'period' => $period,
        'date_range' => $dateRange,
        'financial_reports' => $financialReports,
        'member_reports' => $memberReports,
        'loan_reports' => $loanReports,
        'operational_reports' => $operationalReports
    ]);

} elseif ($method === 'POST') {
    // Generate and download specific report
    $reportType = $_POST['report_type'] ?? '';
    $format = $_POST['format'] ?? 'pdf';
    $period = $_POST['period'] ?? 'monthly';

    if (empty($reportType)) {
        api_error("Report type is required", 400);
    }

    $dateRange = getDateRange($period);

    // Generate report based on type
    $reportData = generateReport($conn, $reportType, $dateRange, $format);

    if ($reportData) {
        api_success([
            'report_type' => $reportType,
            'format' => $format,
            'data' => $reportData,
            'generated_at' => date('Y-m-d H:i:s')
        ]);
    } else {
        api_error("Failed to generate report", 500);
    }
}

function getDateRange($period) {
    $now = new DateTime();
    $start = new DateTime();
    $end = new DateTime();

    switch ($period) {
        case 'daily':
            $start = $now->modify('-1 day');
            break;
        case 'weekly':
            $start = $now->modify('-1 week');
            break;
        case 'monthly':
            $start = $now->modify('-1 month');
            break;
        case 'quarterly':
            $start = $now->modify('-3 months');
            break;
        case 'yearly':
            $start = $now->modify('-1 year');
            break;
        default:
            $start = $now->modify('-1 month');
    }

    return [
        'start' => $start->format('Y-m-d'),
        'end' => $end->format('Y-m-d')
    ];
}

function getBalanceSheetData($conn, $dateRange) {
    // Assets
    $stmt = $conn->prepare("
        SELECT
            SUM(CASE WHEN category = 'savings' THEN balance ELSE 0 END) as savings_assets,
            SUM(CASE WHEN category = 'shares' THEN balance ELSE 0 END) as shares_assets,
            SUM(CASE WHEN category = 'wallet' THEN balance ELSE 0 END) as wallet_assets
        FROM member_balances
    ");
    $stmt->execute();
    $assets = $stmt->get_result()->fetch_assoc();

    // Liabilities
    $stmt = $conn->prepare("
        SELECT SUM(current_balance) as loan_liabilities
        FROM loans
        WHERE status = 'disbursed'
    ");
    $stmt->execute();
    $liabilities = $stmt->get_result()->fetch_assoc();

    // Equity
    $stmt = $conn->prepare("
        SELECT SUM(amount) as equity_contributions
        FROM transactions
        WHERE transaction_type = 'contribution'
        AND created_at BETWEEN ? AND ?
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $equity = $stmt->get_result()->fetch_assoc();

    return [
        'assets' => $assets,
        'liabilities' => $liabilities,
        'equity' => $equity,
        'total_assets' => array_sum($assets),
        'total_liabilities' => $liabilities['loan_liabilities'] ?? 0,
        'total_equity' => $equity['equity_contributions'] ?? 0
    ];
}

function getIncomeStatementData($conn, $dateRange) {
    // Revenue
    $stmt = $conn->prepare("
        SELECT
            SUM(CASE WHEN transaction_type = 'contribution' THEN amount ELSE 0 END) as contributions,
            SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) as deposits,
            SUM(CASE WHEN transaction_type IN ('loan_interest', 'revenue_inflow') THEN amount ELSE 0 END) as other_income
        FROM transactions
        WHERE created_at BETWEEN ? AND ?
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $revenue = $stmt->get_result()->fetch_assoc();

    // Expenses
    $stmt = $conn->prepare("
        SELECT
            SUM(CASE WHEN category = 'operational' THEN amount ELSE 0 END) as operational_expenses,
            SUM(CASE WHEN category = 'administrative' THEN amount ELSE 0 END) as admin_expenses,
            SUM(CASE WHEN category = 'other' THEN amount ELSE 0 END) as other_expenses
        FROM expenses
        WHERE created_at BETWEEN ? AND ?
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $expenses = $stmt->get_result()->fetch_assoc();

    return [
        'revenue' => $revenue,
        'expenses' => $expenses,
        'total_revenue' => array_sum($revenue),
        'total_expenses' => array_sum($expenses),
        'net_income' => array_sum($revenue) - array_sum($expenses)
    ];
}

function getCashFlowData($conn, $dateRange) {
    // Operating Activities
    $stmt = $conn->prepare("
        SELECT
            SUM(CASE WHEN transaction_type IN ('contribution', 'deposit') THEN amount ELSE 0 END) as cash_inflows,
            SUM(CASE WHEN transaction_type IN ('withdrawal', 'loan_repayment') THEN amount ELSE 0 END) as cash_outflows
        FROM transactions
        WHERE created_at BETWEEN ? AND ?
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $operating = $stmt->get_result()->fetch_assoc();

    // Investing Activities
    $stmt = $conn->prepare("
        SELECT SUM(amount) as investment_outflows
        FROM investments
        WHERE created_at BETWEEN ? AND ?
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $investing = $stmt->get_result()->fetch_assoc();

    // Financing Activities
    $stmt = $conn->prepare("
        SELECT SUM(amount) as loan_disbursements
        FROM loans
        WHERE status = 'disbursed'
        AND disbursement_date BETWEEN ? AND ?
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $financing = $stmt->get_result()->fetch_assoc();

    return [
        'operating_activities' => $operating,
        'investing_activities' => $investing,
        'financing_activities' => $financing,
        'net_cash_flow' => ($operating['cash_inflows'] ?? 0) - ($operating['cash_outflows'] ?? 0) - ($investing['investment_outflows'] ?? 0) + ($financing['loan_disbursements'] ?? 0)
    ];
}

function getTrialBalanceData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT
            la.category,
            la.account_name,
            SUM(le.credit) as total_credit,
            SUM(le.debit) as total_debit,
            (SUM(le.credit) - SUM(le.debit)) as balance
        FROM ledger_entries le
        JOIN ledger_accounts la ON le.account_id = la.account_id
        WHERE le.created_at BETWEEN ? AND ?
        GROUP BY la.account_id, la.category, la.account_name
        ORDER BY la.category, la.account_name
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $result = $stmt->get_result();

    $accounts = [];
    while ($row = $result->fetch_assoc()) {
        $accounts[] = $row;
    }

    return [
        'accounts' => $accounts,
        'total_debit' => array_sum(array_column($accounts, 'total_debit')),
        'total_credit' => array_sum(array_column($accounts, 'total_credit'))
    ];
}

function getMemberListData($conn) {
    $stmt = $conn->prepare("
        SELECT
            m.member_id,
            m.full_name,
            m.member_reg_no,
            m.email,
            m.phone,
            m.created_at,
            m.status,
            mb.savings_balance,
            mb.shares_balance,
            mb.wallet_balance
        FROM members m
        LEFT JOIN member_balances mb ON m.member_id = mb.member_id
        ORDER BY m.created_at DESC
    ");
    $stmt->execute();
    $result = $stmt->get_result();

    $members = [];
    while ($row = $result->fetch_assoc()) {
        $members[] = $row;
    }

    return [
        'members' => $members,
        'total_members' => count($members),
        'active_members' => count(array_filter($members, fn($m) => $m['status'] === 'active'))
    ];
}

function getActiveMembersData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT COUNT(*) as active_count
        FROM members
        WHERE status = 'active'
        AND last_login BETWEEN ? AND ?
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getNewMembersData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT COUNT(*) as new_members_count
        FROM members
        WHERE created_at BETWEEN ? AND ?
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getMemberContributionsData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT
            m.full_name,
            m.member_reg_no,
            SUM(t.amount) as total_contributions,
            COUNT(t.transaction_id) as contribution_count
        FROM members m
        LEFT JOIN transactions t ON m.member_id = t.member_id
        AND t.transaction_type = 'contribution'
        AND t.created_at BETWEEN ? AND ?
        GROUP BY m.member_id, m.full_name, m.member_reg_no
        ORDER BY total_contributions DESC
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $result = $stmt->get_result();

    $contributions = [];
    while ($row = $result->fetch_assoc()) {
        $contributions[] = $row;
    }

    return $contributions;
}

function getLoanPortfolioData($conn) {
    $stmt = $conn->prepare("
        SELECT
            COUNT(*) as total_loans,
            SUM(amount) as total_amount,
            SUM(current_balance) as outstanding_balance,
            AVG(amount) as average_loan_size,
            COUNT(CASE WHEN status = 'disbursed' THEN 1 END) as active_loans
        FROM loans
    ");
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getLoanPerformanceData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT
            COUNT(CASE WHEN status = 'disbursed' THEN 1 END) as disbursed_loans,
            COUNT(CASE WHEN status = 'repaid' THEN 1 END) as repaid_loans,
            COUNT(CASE WHEN status = 'defaulted' THEN 1 END) as defaulted_loans,
            AVG(DATEDIFF(CURDATE(), disbursement_date)) as avg_loan_age
        FROM loans
        WHERE disbursement_date BETWEEN ? AND ?
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getLoanDefaultsData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT
            COUNT(*) as defaulted_loans,
            SUM(amount) as defaulted_amount
        FROM loans
        WHERE status = 'defaulted'
        AND created_at BETWEEN ? AND ?
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getLoanDisbursementsData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT
            DATE_FORMAT(disbursement_date, '%Y-%m') as month,
            COUNT(*) as disbursements_count,
            SUM(amount) as disbursements_amount
        FROM loans
        WHERE status = 'disbursed'
        AND disbursement_date BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(disbursement_date, '%Y-%m')
        ORDER BY month
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $result = $stmt->get_result();

    $disbursements = [];
    while ($row = $result->fetch_assoc()) {
        $disbursements[] = $row;
    }

    return $disbursements;
}

function getTransactionSummaryData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT
            transaction_type,
            COUNT(*) as count,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount
        FROM transactions
        WHERE created_at BETWEEN ? AND ?
        GROUP BY transaction_type
        ORDER BY total_amount DESC
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $result = $stmt->get_result();

    $summary = [];
    while ($row = $result->fetch_assoc()) {
        $summary[] = $row;
    }

    return $summary;
}

function getRevenueAnalysisData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(CASE WHEN transaction_type = 'contribution' THEN amount ELSE 0 END) as contributions,
            SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) as deposits,
            SUM(CASE WHEN transaction_type IN ('loan_interest', 'revenue_inflow') THEN amount ELSE 0 END) as other_revenue
        FROM transactions
        WHERE created_at BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $result = $stmt->get_result();

    $analysis = [];
    while ($row = $result->fetch_assoc()) {
        $analysis[] = $row;
    }

    return $analysis;
}

function getExpenseBreakdownData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT
            category,
            SUM(amount) as total_amount,
            COUNT(*) as expense_count
        FROM expenses
        WHERE created_at BETWEEN ? AND ?
        GROUP BY category
        ORDER BY total_amount DESC
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $result = $stmt->get_result();

    $breakdown = [];
    while ($row = $result->fetch_assoc()) {
        $breakdown[] = $row;
    }

    return $breakdown;
}

function getAuditTrailData($conn, $dateRange) {
    $stmt = $conn->prepare("
        SELECT
            al.action,
            al.details,
            al.created_at,
            u.username as performed_by,
            m.full_name as affected_member
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.user_id
        LEFT JOIN members m ON al.member_id = m.member_id
        WHERE al.created_at BETWEEN ? AND ?
        ORDER BY al.created_at DESC
        LIMIT 100
    ");
    $stmt->bind_param("ss", $dateRange['start'], $dateRange['end']);
    $stmt->execute();
    $result = $stmt->get_result();

    $trail = [];
    while ($row = $result->fetch_assoc()) {
        $trail[] = $row;
    }

    return $trail;
}

function generateReport($conn, $reportType, $dateRange, $format) {
    // This would generate actual PDF/Excel reports
    // For now, return mock data structure
    return [
        'report_type' => $reportType,
        'date_range' => $dateRange,
        'format' => $format,
        'generated_at' => date('Y-m-d H:i:s'),
        'data' => [] // Would contain actual report data
    ];
}
?>