<?php
require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/ShareValuationEngine.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    api_error('Method not allowed', 405);
}

$member_id = (int)($_SESSION['member_id'] ?? 0);
if ($member_id <= 0) {
    api_error('Unauthorized', 401);
}

$svEngine = new ShareValuationEngine($conn);
$valuation = $svEngine->getValuation();
$current_share_price = (float)$valuation['price'];
$ownership_pct = $svEngine->getOwnershipPercentage($member_id);

$stmt = $conn->prepare("SELECT units_owned, total_amount_paid, average_purchase_price FROM member_shareholdings WHERE member_id = ?");
$stmt->bind_param("i", $member_id);
$stmt->execute();
$shareholding = $stmt->get_result()->fetch_assoc() ?? ['units_owned'=>0,'total_amount_paid'=>0,'average_purchase_price'=>0];
$stmt->close();

$totalUnits = (float)$shareholding['units_owned'];
$portfolioValue = $totalUnits * $current_share_price;
$totalGain = $portfolioValue - (float)$shareholding['total_amount_paid'];
$gainPct = ($shareholding['total_amount_paid'] > 0) ? ($totalGain / $shareholding['total_amount_paid']) * 100 : 0;

$dividend_rate_projections = 12.5;
$projectedDividend = $portfolioValue * ($dividend_rate_projections / 100);

// History
$sqlHistory = "SELECT created_at, reference_no, units, unit_price, total_value, transaction_type FROM share_transactions WHERE member_id = ? ORDER BY created_at DESC LIMIT 50";
$stmt = $conn->prepare($sqlHistory);
$stmt->bind_param("i", $member_id);
$stmt->execute();
$res = $stmt->get_result();
$history = [];
$chart_data = [];
$running_units = 0;

$temp_history = [];
while ($row = $res->fetch_assoc()) {
    $row['units'] = (float)$row['units'];
    $row['unit_price'] = (float)$row['unit_price'];
    $row['total_value'] = (float)$row['total_value'];
    $temp_history[] = $row;
}
$stmt->close();

// Reverse for chart calculation
foreach (array_reverse($temp_history) as $txn) {
    if (in_array($txn['transaction_type'], ['purchase','migration'])) $running_units += (float)$txn['units'];
    $chart_data[] = [
        'label' => date('M d', strtotime($txn['created_at'])),
        'value' => (float)($running_units * $current_share_price)
    ];
}

api_success([
    'portfolio_value' => $portfolioValue,
    'units' => $totalUnits,
    'share_price' => $current_share_price,
    'gain_pct' => $gainPct,
    'projected_dividend' => $projectedDividend,
    'ownership_pct' => $ownership_pct,
    'history' => $temp_history,
    'chart_data' => $chart_data
]);
