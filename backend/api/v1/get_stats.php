<?php
/**
 * api/v1/get_stats.php
 * Returns high-level dashboard statistics.
 */

// 1. Members count
$res = $conn->query("SELECT COUNT(*) as total FROM members WHERE status = 'active'");
$memberCount = $res->fetch_assoc()['total'] ?? 0;

// 2. Total Savings (Summarized from members table for efficiency)
$res = $conn->query("SELECT SUM(savings_balance) as total FROM members");
$totalSavings = $res->fetch_assoc()['total'] ?? 0;

// 3. Active Loans count
$res = $conn->query("SELECT COUNT(*) as total FROM loans WHERE status IN ('approved', 'disbursed')");
$loanCount = $res->fetch_assoc()['total'] ?? 0;

api_success([
    'members' => (int)$memberCount,
    'savings' => (float)$totalSavings,
    'loans'   => (int)$loanCount,
    'health'  => 'Optimal'
]);
