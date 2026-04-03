require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/functions.php';
require_once __DIR__ . '/../../inc/ShareValuationEngine.php';
require_once __DIR__ . '/../../inc/FinancialEngine.php';

// Auth Guard
if (!isset($_SESSION['member_id'])) {
    api_error("Unauthorized. Please log in as a member.", 401);
}

$member_id = $_SESSION['member_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $svEngine = new ShareValuationEngine($conn);
    $valuation = $svEngine->getValuation();
    $current_share_price = (float)$valuation['price'];
    $ownership_pct = $svEngine->getOwnershipPercentage($member_id);

    $stmt = $conn->prepare("SELECT units_owned, total_amount_paid, average_purchase_price FROM member_shareholdings WHERE member_id = ?");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $shareholding = $stmt->get_result()->fetch_assoc() ?? ['units_owned'=>0,'total_amount_paid'=>0,'average_purchase_price'=>0];

    $totalUnits = (float)$shareholding['units_owned'];
    $portfolioValue = $totalUnits * $current_share_price;
    $totalGain = $portfolioValue - (float)$shareholding['total_amount_paid'];
    $gainPct = ($shareholding['total_amount_paid'] > 0) ? ($totalGain / $shareholding['total_amount_paid']) * 100 : 0;

    // Projected Dividend (Static rate from original script or dynamic)
    $dividend_rate_projection = 12.5;
    $projectedDividend = $portfolioValue * ($dividend_rate_projection / 100);

    // History
    $sqlHistory = "SELECT created_at, reference_no, units as share_units, unit_price, total_value, transaction_type FROM share_transactions WHERE member_id = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($sqlHistory);
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $transactions = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Chart Data
    $chartLabels = [];
    $chartData = [];
    $runningUnits = 0;
    foreach (array_reverse($transactions) as $txn) {
        if (in_array($txn['transaction_type'], ['purchase','migration'])) $runningUnits += (float)($txn['share_units'] ?? ($txn['total_value'] / $current_share_price));
        $chartLabels[] = date('M d', strtotime($txn['created_at']));
        $chartData[] = $runningUnits * $current_share_price;
    }

    api_success([
        'valuation' => [
            'share_price' => $current_share_price,
            'portfolio_value' => $portfolioValue,
            'gain_pct' => $gainPct,
            'ownership_pct' => $ownership_pct,
            'projected_dividend' => $projectedDividend,
            'total_units' => $totalUnits
        ],
        'history' => $transactions,
        'chart' => [
            'labels' => $chartLabels,
            'data' => $chartData
        ]
    ]);
}
