# Umoja SACCO Distributed System (UDS) - Project Documentation

## 1. System Overview

The Umoja SACCO Distributed System (UDS) is an integrated financial management platform currently undergoing a high-fidelity migration. The architecture shifts from a legacy monolithic PHP structure to a modern decoupled approach:
- **Frontend**: Next.js providing a reactive, robust user interface.
- **Backend API**: PHP JSON API handling business logic and system constraints.
- **Database**: MySQL serving as the source of truth, emphasizing accurate accounting through the "Golden Ledger".
- **Design System**: "Forest & Lime", with robust support for "Pure Lights Out" (Dark Mode). Ensure all migrations maintain 100% visual and functional parity.

### 1.1 Key Modules Under Migration

1. **Member Portal (Frontend)**: Financial pages, including Savings, Shares, and Loans functionalities. Consolidates loan repayment pages, integrating Digital Wallet and Notifications functionalities.
2. **Admin Management Portals (Frontend)**: Real-time system monitoring, administrative management pages for Users, Global Configurations, and oversight for the underlying Golden Ledger accounting integrity. Functionalities like global auto-refresh map directly to Next.js reactivity or polling API integrations.
3. **Public Interfaces (Frontend)**: Landing pages, ensuring pixel-perfect headers, hero sections, footers, and background assets replicate the original `index.php`.
4. **Backend Workstreams**: Delivering REST API endpoints from the legacy PHP application structure, handling database migrations (such as adding `reference_no` to the `loans` table), enforcing equity management rules (share limits, authorized capital), and computing dividend distributions accurately.

---

## 2. Project Directory Tree

The core folder structure of the workspace is decoupled into distinct frontend and backend repositories located at `c:\xampp\htdocs\UDS`.

```text
c:\xampp\htdocs\UDS
|
+--- backend/             # Legacy & JSON API PHP backend
|    +--- admin/          # Admin portal logic
|    +--- api/            # JSON API endpoints feeding the Next.js frontend
|    +--- backups/        # Database and system backups
|    +--- cert/           # SSL/TLS certificates and crypto keys
|    +--- config/         # Environment, globals, and database connection strings
|    +--- core/           # Core SACCO business logic & equity management engines
|    +--- cron/           # CRON jobs and background tasks
|    +--- database/       # Migrations and test schemas
|    +--- inc/            # Included utilities and common generic code
|    +--- member/         # Legacy member portal logic
|    +--- public/         # Static assets and entrypoints for remaining legacy pages
|    +--- scripts/        # Utility and maintenance shell/PHP scripts
|    +--- sql/            # SQL dumps and predefined table schemas
|    +--- tests/          # PHPUnit testing suites
|    +--- tools/          # Internal operational tools
|    +--- uploads/        # User-uploaded files and documents
|    +--- vendor/         # Composer dependencies
|    +--- composer.json   # PHP dependency manifest
|    +--- check_schema.php# Schema validation utility
|
+--- frontend/            # Next.js Application Environment
|    +--- .next/          # Build and cache output
|    +--- node_modules/   # NPM dependencies
|    +--- public/         # Static global assets (Forest & Lime icons/imagery)
|    +--- src/            # Next.js Source Code
|         +--- app/       # App Router components (Admin, Member, Landing pages)
|         +--- components/# Shared UI components (Forest & Lime design elements)
|         +--- lib/       # Utility hooks and API callers
|    +--- next.config.ts  # Next.js configuration
|    +--- package.json    # Application metadata and scripts
|    +--- tailwind.config.ts # Styling configurations and tokens
|
+--- index.php            # Master entry or redirect logic
```

## 3. Technology Stack Guidelines

- **Next.js & React**: Utilizing modern App Router paradigms.
- **Styling**: Adhere strictly to the "Forest & Lime" palette and design aesthetics. Dark mode ("Pure Lights Out") is a strict parity requirement across all modules.
- **State Management**: Ensure data reflects the "Golden Ledger" perfectly; double-check API error handling, real-time fetching logic, and data staleness when managing financial endpoints.
- **PHP JSON API**: Ensure endpoints are secure, stateless where possible, and explicitly designed for Next.js cross-origin consumption. Emphasize zero degradation of database integrity.

## 4. Work In Progress Notes

- **Loans Reference Check**: Be aware of schema discrepancies. A recent check confirmed issues with `reference_no` in the `loans` table.
- **Duplication Limits**: The Member Portal loan modules must strictly limit duplicate pages, relying entirely on dynamically populated, unified Next.js API route architecture.
- **Live Edits**: Admin panels have recently incorporated real-time "monitor-like" auto-refresh. Carry over these polling requirements to appropriate Server/Client components in Next.js.
