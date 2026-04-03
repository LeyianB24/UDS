-- master_sync.sql
-- Re-syncing the `umoja-drivers-sacco` database.

-- Add missing tables
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

CREATE TABLE IF NOT EXISTS `reconciliation_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `ledger_sum` decimal(15,2) NOT NULL,
  `account_balance` decimal(15,2) NOT NULL,
  `difference` decimal(15,2) NOT NULL,
  `status` enum('flagged','resolved') DEFAULT 'flagged',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `salary_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `grade_name` varchar(50) NOT NULL,
  `basic_salary` decimal(15,2) DEFAULT 0.00,
  `house_allowance` decimal(15,2) DEFAULT 0.00,
  `transport_allowance` decimal(15,2) DEFAULT 0.00,
  `risk_allowance` decimal(15,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at" timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `savings` (
  `saving_id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_no` varchar(50) DEFAULT NULL,
  `transaction_type` enum('deposit','withdrawal') DEFAULT 'deposit',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reference_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`saving_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `shares` (
  `share_id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `share_units` int(11) NOT NULL DEFAULT 0,
  `unit_price` decimal(10,2) DEFAULT 1.00,
  `total_value` decimal(12,2) GENERATED ALWAYS AS (`share_units` * `unit_price`) VIRTUAL,
  `purchase_date` datetime DEFAULT current_timestamp(),
  `reference_no` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`share_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `share_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `total_authorized_units` decimal(20,4) DEFAULT 1000000.0000,
  `initial_unit_price` decimal(20,2) DEFAULT 100.00,
  `par_value` decimal(20,2) DEFAULT 100.00,
  `last_valuation_date` datetime DEFAULT current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `share_transactions` (
  `txn_id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `units` decimal(20,4) NOT NULL,
  `unit_price` decimal(20,2) NOT NULL,
  `total_value` decimal(30,2) NOT NULL,
  `transaction_type` enum('purchase','dividend','transfer','migration') NOT NULL,
  `reference_no` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`txn_id`),
  UNIQUE KEY `reference_no` (`reference_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `statutory_deductions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `type` enum('percentage','fixed','bracket') DEFAULT 'percentage',
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`value`)),
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `statutory_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `type` enum('percentage','fixed','bracket') NOT NULL,
  `value` decimal(10,4) DEFAULT NULL,
  `min_amount` decimal(12,2) DEFAULT NULL,
  `max_amount` decimal(12,2) DEFAULT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `support_replies` (
  `reply_id` int(11) NOT NULL AUTO_INCREMENT,
  `support_id` int(11) NOT NULL,
  `sender_type` enum('admin','member') NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `user_role` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `attachment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`reply_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `support_tickets" (
  `support_id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `member_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `category` enum('loans','savings','shares','welfare','withdrawals','technical','profile','investments','general','loan','accounting','tech') DEFAULT 'general',
  `assigned_role_id` int(11) DEFAULT NULL,
  `priority` enum('low','medium','high','critical') DEFAULT 'medium',
  `status` varchar(20) DEFAULT 'Pending',
  `is_resolved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `attachment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`support_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `system_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description" varchar(255) DEFAULT NULL,
  `updated_at" timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `system_modules` (
  `module_id` int(11) NOT NULL AUTO_INCREMENT,
  `module_name` varchar(100) NOT NULL,
  `module_slug` varchar(50) NOT NULL COMMENT 'e.g. member_management, loans, financial',
  `module_icon` varchar(50) DEFAULT 'bi-box',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`module_id`),
  UNIQUE KEY `module_name` (`module_name`),
  UNIQUE KEY `module_slug` (`module_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `system_module_pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `page_path` varchar(255) NOT NULL COMMENT 'Relative path from web root, e.g. admin/pages/users.php',
  `is_entry_point` tinyint(1) DEFAULT 0 COMMENT 'Whether this is the main page for the module',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_path` (`page_path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `system_settings" (
  `setting_key" varchar(50) NOT NULL,
  `setting_value" text NOT NULL,
  `description" varchar(255) DEFAULT NULL,
  `updated_at" timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `transaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `ledger_transaction_id` int(11) DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `type" enum('credit','debit') NOT NULL DEFAULT 'credit',
  `category" varchar(100) DEFAULT 'General',
  `reference_no" varchar(50) DEFAULT NULL,
  `related_id" int(11) DEFAULT NULL,
  `related_table" varchar(50) DEFAULT NULL,
  `recorded_by" int(11) DEFAULT NULL,
  `transaction_date" datetime DEFAULT current_timestamp(),
  `payment_channel" varchar(80) DEFAULT NULL,
  `description" varchar(255) DEFAULT NULL,
  `notes" text DEFAULT NULL,
  `created_by_admin" int(11) DEFAULT NULL,
  `created_at" timestamp NOT NULL DEFAULT current_timestamp(),
  `mpesa_request_id" varchar(100) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `transaction_alerts" (
  `alert_id" int(11) NOT NULL AUTO_INCREMENT,
  `alert_type" varchar(50) NOT NULL,
  `severity" enum('info','warning','critical') DEFAULT 'warning',
  `contribution_id" int(11) NOT NULL,
  `member_id" int(11) DEFAULT NULL,
  `message" text NOT NULL,
  `acknowledged" tinyint(1) DEFAULT 0,
  `acknowledged_at" timestamp NULL DEFAULT NULL,
  `acknowledged_by" int(11) DEFAULT NULL,
  `created_at" timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`alert_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `welfare_cases" (
  `case_id" int(11) NOT NULL AUTO_INCREMENT,
  `related_member_id" int(11) DEFAULT NULL,
  `case_type" enum('sickness','bereavement','education','accident','other') DEFAULT 'other',
  `title" varchar(255) NOT NULL,
  `description" text NOT NULL,
  `admin_notes" text DEFAULT NULL,
  `requested_amount" decimal(15,2) DEFAULT 0.00,
  `approved_amount" decimal(15,2) DEFAULT 0.00,
  `total_raised" decimal(15,2) DEFAULT 0.00,
  `total_disbursed" decimal(15,2) DEFAULT 0.00,
  `target_amount" decimal(15,2) NOT NULL DEFAULT 0.00,
  `status" enum('pending','active','approved','rejected','funded','closed','disbursed') NOT NULL DEFAULT 'pending',
  `created_by" int(11) DEFAULT NULL,
  `created_at" timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `welfare_donations" (
  `donation_id" int(11) NOT NULL AUTO_INCREMENT,
  `case_id" int(11) NOT NULL,
  `member_id" int(11) NOT NULL,
  `amount" decimal(15,2) NOT NULL,
  `reference_no" varchar(50) NOT NULL,
  `created_at" timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`donation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `welfare_support" (
  `support_id" int(11) NOT NULL AUTO_INCREMENT,
  `member_id" int(11) NOT NULL,
  `amount" decimal(15,2) NOT NULL,
  `reference_no" varchar(50) DEFAULT NULL,
  `reason" varchar(255) DEFAULT NULL,
  `case_id" int(11) DEFAULT NULL,
  `granted_by" int(11) DEFAULT NULL,
  `date_granted" datetime DEFAULT current_timestamp(),
  `status" enum('pending','granted','rejected') DEFAULT 'pending',
  `created_at" timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`support_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `withdrawal_requests" (
  `withdrawal_id" int(11) NOT NULL AUTO_INCREMENT,
  `member_id" int(11) NOT NULL,
  `ref_no" varchar(50) NOT NULL,
  `amount" decimal(15,2) NOT NULL,
  `source_ledger" varchar(50) DEFAULT 'savings',
  `phone_number" varchar(30) NOT NULL,
  `status" enum('initiated','pending','completed','failed','reversed') DEFAULT 'initiated',
  `mpesa_conversation_id" varchar(100) DEFAULT NULL,
  `mpesa_receipt" varchar(50) DEFAULT NULL,
  `result_code" int(11) DEFAULT NULL,
  `result_desc" text DEFAULT NULL,
  `notes" text DEFAULT NULL,
  `callback_received_at" timestamp NULL DEFAULT NULL,
  `created_at" timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at" timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`withdrawal_id`),
  UNIQUE KEY `ref_no` (`ref_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
