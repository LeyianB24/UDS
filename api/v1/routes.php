<?php
declare(strict_types=1);
/**
 * api/v1/routes.php
 * USMS API v1 — Central Request Router
 *
 * Routes incoming requests to the appropriate handler script.
 * All API responses must follow the standard JSON envelope:
 *   { "status": "success"|"error", "data": ..., "message": "..." }
 *
 * Usage: All API calls should go through this file.
 * Direct file access is still allowed for backwards compat, but
 * this router is the canonical entry point.
 *
 * Add new routes in the $routes map below.
 */

// ── Bootstrap ────────────────────────────────────────────────────────────────
require_once __DIR__ . '/api_init.php';
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../inc/Auth.php';


// ── Route Registry ────────────────────────────────────────────────────────────
// Format: 'METHOD:endpoint' => ['file' => 'path/to/handler.php', 'auth' => 'admin'|'member'|'none']
$routes = [
    // Admin API — Notifications
    'POST:ajax_mark_read'       => ['file' => 'ajax_mark_read.php',       'auth' => 'admin'],

    // Admin API — Exports
    'GET:export_revenue'        => ['file' => 'export_revenue.php',        'auth' => 'admin'],
    'GET:generate_statement'    => ['file' => 'generate_statement.php',    'auth' => 'admin'],

    // Admin API — Charts & Stats
    'GET:get_stats'             => ['file' => 'get_stats.php',             'auth' => 'admin'],
    'GET:get_chart_data'        => ['file' => 'get_chart_data.php',        'auth' => 'admin'],

    // Shared — Auth & Status
    'GET:auth_status'           => ['file' => 'auth_status.php',           'auth' => 'none'],
    'POST:login'                => ['file' => 'login.php',                 'auth' => 'none'],
    'POST:register'             => ['file' => 'register.php',              'auth' => 'none'],
    'POST:forgot_password'      => ['file' => 'forgot_password.php',       'auth' => 'none'],
    'GET:search_members'        => ['file' => 'search_members.php',        'auth' => 'admin'],
    'GET:members'               => ['file' => 'members.php',               'auth' => 'admin'],
    
    // Member Facing (Support both Admin & Member)
    'GET:member_dashboard'      => ['file' => 'member_dashboard.php',      'auth' => 'member'],
    'GET:member_savings'        => ['file' => 'member_savings.php',        'auth' => 'both'],
    'GET:member_shares'         => ['file' => 'member_shares.php',         'auth' => 'both'],
    'GET:member_loans'          => ['file' => 'member_loans.php',          'auth' => 'both'],
    'POST:apply_loan'           => ['file' => 'apply_loan.php',            'auth' => 'member'],
    'POST:mpesa_stk'            => ['file' => 'mpesa_stk.php',             'auth' => 'member'],
    'GET:loan_reviews'          => ['file' => 'loan_reviews.php',          'auth' => 'admin'],
    'POST:loan_reviews'         => ['file' => 'loan_reviews.php',          'auth' => 'admin'],
    'GET:member_profile'        => ['file' => 'member_profile.php',        'auth' => 'both'],
    'POST:member_profile'       => ['file' => 'member_profile.php',        'auth' => 'both'],
    'GET:withdraw'              => ['file' => 'withdraw.php',              'auth' => 'member'],
    'POST:withdraw'             => ['file' => 'withdraw.php',              'auth' => 'member'],
    'GET:member_transactions'   => ['file' => 'member_transactions.php',   'auth' => 'member'],
    'GET:member_notifications'  => ['file' => 'member_notifications.php',  'auth' => 'member'],
    'POST:member_notifications' => ['file' => 'member_notifications.php',  'auth' => 'member'],
    'GET:member_welfare'        => ['file' => 'member_welfare.php',        'auth' => 'member'],
    'POST:member_settings'       => ['file' => 'member_settings.php',       'auth' => 'member'],
    'GET:member_contributions'  => ['file' => 'member_contributions.php',  'auth' => 'member'],
];

// ── Resolve the Incoming Request ──────────────────────────────────────────────
$method   = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$endpoint = $_GET['action'] ?? $_GET['endpoint'] ?? '';

if (empty($endpoint)) {
    api_error('Missing endpoint parameter.', 400);
}

$key = $method . ':' . $endpoint;

if (!isset($routes[$key])) {
    api_error('Unknown endpoint: ' . htmlspecialchars($endpoint), 404);
}

$route = $routes[$key];

// ── Auth Guard ────────────────────────────────────────────────────────────────
match ($route['auth']) {
    'admin'  => Auth::requireAdmin(),
    'member' => (function () {
        if (!isset($_SESSION['member_id'])) {
            api_error('Unauthorized: Member login required', 401);
        }
    })(),
    'both'   => (function () {
        if (!isset($_SESSION['admin_id']) && !isset($_SESSION['member_id'])) {
            api_error('Unauthorized: Login required', 401);
        }
    })(),
    default  => null,
};

// ── Dispatch ──────────────────────────────────────────────────────────────────
$handlerPath = __DIR__ . '/' . $route['file'];

if (!file_exists($handlerPath)) {
    api_error('Handler not found for endpoint: ' . htmlspecialchars($endpoint), 500);
}

// Make helpers available to the handler
$GLOBALS['api_success'] = 'api_success';
$GLOBALS['api_error']   = 'api_error';

require $handlerPath;
exit;
