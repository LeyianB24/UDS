-- USMS Master Sync SQL
-- Database: `umoja_drivers_sacco` (Source) -> `umoja-drivers-sacco` (Target)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- [Note: This is a reconstructed sync script based on the user's provided schema]
-- Tables included: properties, property_sales, reconciliation_logs, roles, role_permissions, 
-- salary_grades, savings, shares, share_settings, share_transactions, 
-- statutory_deductions, statutory_rules, support_replies, support_tickets, 
-- system_config, system_modules, system_module_pages, system_settings, 
-- transactions, transaction_alerts, welfare_cases, welfare_donations, 
-- welfare_support, withdrawal_requests, etc.

-- (I will use the mysql command to copy from the other DB if possible, 
-- or I'll just run the definitions provided by the user)

-- Since I have the definitions from the user's prompt, I'll apply them.

CREATE TABLE IF NOT EXISTS `properties` (
  `property_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `category` enum('plot','apartment','commercial','other') DEFAULT 'plot',
  `location` varchar(255) DEFAULT NULL,
  `size_description` varchar(100) DEFAULT NULL,
  `purchase_cost` decimal(14,2) DEFAULT NULL,
  `asking_price` decimal(14,2) DEFAULT NULL,
  `status` enum('available','sold','development') DEFAULT 'available',
  `investment_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `property_sales` (
  `sale_id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `buyer_name` varchar(150) NOT NULL,
  `buyer_contact` varchar(80) DEFAULT NULL,
  `sale_price` decimal(14,2) NOT NULL,
  `sale_date` datetime DEFAULT current_timestamp(),
  `recorded_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`sale_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ... and so on for the others.
-- Actually, the most reliable way to sync is to use the existing `umoja_drivers_sacco` 
-- which already has all 70 tables, and clone it to `umoja-drivers-sacco`.

-- I'll use a PHP script to perform the sync to ensure precision.
