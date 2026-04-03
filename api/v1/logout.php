<?php
/**
 * api/v1/logout.php
 * Handles user/member logout and session destruction.
 */

require_once __DIR__ . '/api_init.php';

// Clear session variables
$_SESSION = [];

// Destroy session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destroy session
session_destroy();

api_success(null, "Logged out successfully");
