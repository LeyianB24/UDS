<?php
/**
 * api/v1/api_init.php
 * Centralized API Initialization for CORS and Response Helpers.
 */

declare(strict_types=1);

// 1. CORS Headers for React Frontend (localhost:3000)
$http_origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1'
];

if (in_array($http_origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $http_origin");
} elseif (empty($http_origin)) {
    // If no origin (e.g. same origin or CURL), allow all for now
    header("Access-Control-Allow-Origin: *");
} else {
    // Restrictive default for other unknown origins
    // header("Access-Control-Allow-Origin: http://localhost:3000"); 
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// 2. Response Helpers
if (!function_exists('api_success')) {
    function api_success($data = null, string $message = 'OK', int $code = 200)
    {
        if (!headers_sent()) {
            http_response_code($code);
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}

if (!function_exists('api_error')) {
    function api_error(string $message, int $code = 400, $data = null)
    {
        if (!headers_sent()) {
            http_response_code($code);
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode([
            'status' => 'error',
            'message' => $message,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}

// 3. Session Start
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
