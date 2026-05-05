import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// ── Share Valuation Engine (migrated from ShareValuationEngine.php) ──────────
// NAV = (Total Assets - Total Liabilities) / Total Units Issued
// Unit Price floor = KES 10.00 (par value)
const PAR_VALUE = 10.0;
const WHT_RATE  = 0.05; // 5% Withholding Tax on dividends

async function getValuation(): Promise<{
    equity: number;
    total_assets: number;
    liabilities: number;
    total_units: number;
    price: number;
    shareholders: number;
}> {
    // 1. Total Assets = total savings + total shares paid in + total loan portfolio
    const [assetRows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
            COALESCE(SUM(CASE WHEN transaction_type IN ('savings_deposit','deposit') AND status='completed' THEN amount ELSE 0 END), 0) AS total_savings,
            COALESCE(SUM(CASE WHEN transaction_type = 'share_capital' AND status='completed' THEN amount ELSE 0 END), 0) AS total_share_capital,
            COALESCE(SUM(CASE WHEN transaction_type = 'loan_disbursement' AND status='completed' THEN amount ELSE 0 END), 0) AS total_loans
        FROM transactions
    `);
    const savings      = Number(assetRows[0]?.total_savings ?? 0);
    const shareCapital = Number(assetRows[0]?.total_share_capital ?? 0);
    const loans        = Number(assetRows[0]?.total_loans ?? 0);
    const totalAssets  = savings + shareCapital + loans;

    // 2. Total Liabilities = outstanding loan portfolio (principal owed)
    const [liabRows] = await pool.execute<RowDataPacket[]>(`
        SELECT COALESCE(SUM(remaining_balance), 0) AS liabilities FROM loans WHERE status IN ('disbursed','overdue')
    `);
    const liabilities = Number(liabRows[0]?.liabilities ?? 0);

    // 3. Equity
    const equity = totalAssets - liabilities;

    // 4. Total units: sum from member_shareholdings
    const [unitRows] = await pool.execute<RowDataPacket[]>(`
        SELECT COALESCE(SUM(units_owned), 0) AS total_units, COUNT(*) AS shareholders FROM member_shareholdings WHERE units_owned > 0
    `);
    const totalUnits   = Number(unitRows[0]?.total_units ?? 0);
    const shareholders = Number(unitRows[0]?.shareholders ?? 0);

    // 5. NAV per unit (floor at par value)
    const price = totalUnits > 0
        ? Math.max(equity / totalUnits, PAR_VALUE)
        : PAR_VALUE;

    return { equity, total_assets: totalAssets, liabilities, total_units: totalUnits, price, shareholders };
}

// ── GET: Dashboard data ───────────────────────────────────────────────────────
export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';

        const valuation = await getValuation();

        // Top 5 shareholders
        const totalUnits = valuation.total_units || 1;
        const [topHolders] = await pool.execute<RowDataPacket[]>(`
            SELECT m.full_name, ms.units_owned, ms.total_amount_paid,
                   (ms.units_owned / ?) * 100 AS ownership_pct
            FROM member_shareholdings ms
            JOIN members m ON ms.member_id = m.member_id
            WHERE ms.units_owned > 0
            ORDER BY ms.units_owned DESC
            LIMIT 5
        `, [totalUnits]);

        // Pending exit requests
        const [pendingExits] = await pool.execute<RowDataPacket[]>(`
            SELECT w.*, m.full_name
            FROM withdrawal_requests w
            JOIN members m ON w.member_id = m.member_id
            WHERE w.source_ledger = 'shares' AND w.status = 'pending'
            ORDER BY w.created_at ASC
        `);

        // Transaction history
        let txnWhere = "1=1";
        const txnParams: string[] = [];
        if (q) {
            txnWhere += " AND (m.full_name LIKE ? OR st.reference_no LIKE ?)";
            txnParams.push(`%${q}%`, `%${q}%`);
        }
        const [transactions] = await pool.execute<RowDataPacket[]>(`
            SELECT st.transaction_id, st.created_at, st.reference_no, st.units,
                   st.unit_price, st.total_value, st.transaction_type,
                   m.full_name
            FROM share_transactions st
            LEFT JOIN members m ON st.member_id = m.member_id
            WHERE ${txnWhere}
            ORDER BY st.created_at DESC
            LIMIT 100
        `, txnParams);

        // Chart: running unit value over time
        const [chartRows] = await pool.execute<RowDataPacket[]>(`
            SELECT DATE_FORMAT(created_at, '%b %d') AS label,
                   SUM(total_value) AS value
            FROM share_transactions
            WHERE transaction_type IN ('purchase', 'migration', 'share_capital')
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
            LIMIT 30
        `);

        return NextResponse.json({
            status: 'success',
            data: {
                valuation,
                top_holders: topHolders,
                pending_exits: pendingExits,
                transactions,
                chart: {
                    labels: chartRows.map(r => r.label),
                    data:   chartRows.map(r => Number(r.value)),
                }
            }
        });

    } catch (error: unknown) {
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// ── POST: Actions ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;
        const adminId = session.id;

        // ── Distribute Dividend ──────────────────────────────────────────────
        if (action === 'distribute_dividend') {
            const pool_amount = parseFloat(body.dividend_pool);
            const fiscal_year = body.fiscal_year || new Date().getFullYear();

            if (isNaN(pool_amount) || pool_amount <= 0) {
                return NextResponse.json({ status: 'error', message: 'Invalid dividend pool amount' }, { status: 400 });
            }

            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();

                // Get all active shareholders with units > 0
                const [holders] = await conn.execute<RowDataPacket[]>(`
                    SELECT ms.member_id, ms.units_owned, m.full_name
                    FROM member_shareholdings ms
                    JOIN members m ON ms.member_id = m.member_id
                    WHERE ms.units_owned > 0
                `);

                if (!holders.length) {
                    await conn.rollback();
                    conn.release();
                    return NextResponse.json({ status: 'error', message: 'No shareholders to distribute to' }, { status: 400 });
                }

                const totalUnitsResult = holders.reduce((sum: number, h) => sum + Number(h.units_owned), 0);
                const ref = `DIV-${fiscal_year}-${Date.now().toString(36).toUpperCase()}`;

                for (const holder of holders) {
                    const ownershipPct   = Number(holder.units_owned) / totalUnitsResult;
                    const grossAmount    = pool_amount * ownershipPct;
                    const whtDeduction   = grossAmount * WHT_RATE;
                    const netAmount      = grossAmount - whtDeduction;

                    // Credit member's savings/wallet with net dividend
                    await conn.execute(
                        `INSERT INTO transactions (member_id, transaction_type, amount, status, reference_no, notes, created_at)
                         VALUES (?, 'dividend', ?, 'completed', ?, ?, NOW())`,
                        [holder.member_id, netAmount, `${ref}-M${holder.member_id}`,
                         `Dividend FY${fiscal_year}: Gross KES ${grossAmount.toFixed(2)}, WHT KES ${whtDeduction.toFixed(2)}, Net KES ${netAmount.toFixed(2)}`]
                    );

                    await conn.execute(
                        `UPDATE members SET savings_balance = savings_balance + ? WHERE member_id = ?`,
                        [netAmount, holder.member_id]
                    );
                }

                // Audit log
                await conn.execute(
                    `INSERT INTO audit_logs (admin_id, action, details, severity, ip_address, created_at)
                     VALUES (?, 'dividend_distribution', ?, 'info', 'system', NOW())`,
                    [adminId, `Distributed KES ${pool_amount.toFixed(2)} to ${holders.length} shareholders for FY${fiscal_year}. Ref: ${ref}`]
                );

                await conn.commit();
                conn.release();

                return NextResponse.json({
                    status: 'success',
                    message: `KES ${pool_amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })} distributed proportionally to ${holders.length} shareholders for FY${fiscal_year}. 5% WHT deducted.`
                });

            } catch (err) {
                await conn.rollback();
                conn.release();
                throw err;
            }
        }

        // ── Process Exit Request ─────────────────────────────────────────────
        if (action === 'process_exit') {
            const { request_id, status, admin_notes, payout_method } = body;

            if (!['approved', 'rejected'].includes(status)) {
                return NextResponse.json({ status: 'error', message: 'Invalid status' }, { status: 400 });
            }

            const [reqRows] = await pool.execute<RowDataPacket[]>(`
                SELECT * FROM withdrawal_requests
                WHERE withdrawal_id = ? AND source_ledger = 'shares' AND status = 'pending'
            `, [request_id]);

            if (!reqRows.length) {
                return NextResponse.json({ status: 'error', message: 'Exit request not found or already processed' }, { status: 404 });
            }

            const req = reqRows[0];
            const conn = await pool.getConnection();

            try {
                await conn.beginTransaction();

                if (status === 'approved') {
                    // Record payout transaction
                    await conn.execute(
                        `INSERT INTO transactions (member_id, transaction_type, amount, payment_channel, status, reference_no, notes, created_at)
                         VALUES (?, 'withdrawal', ?, ?, 'completed', ?, ?, NOW())`,
                        [req.member_id, req.amount, payout_method ?? 'bank',
                         req.ref_no, `Exit Request Approved: ${admin_notes}`]
                    );

                    // Deactivate member
                    await conn.execute(
                        `UPDATE members SET status = 'inactive' WHERE member_id = ?`,
                        [req.member_id]
                    );

                    // Zero out their shareholding
                    await conn.execute(
                        `UPDATE member_shareholdings SET units_owned = 0, total_amount_paid = 0 WHERE member_id = ?`,
                        [req.member_id]
                    );
                }

                if (status === 'rejected') {
                    // Reinstate their shares (no financial posting needed — shares were never removed)
                    await conn.execute(
                        `INSERT INTO transactions (member_id, transaction_type, amount, status, reference_no, notes, created_at)
                         VALUES (?, 'share_capital', ?, 'completed', ?, ?, NOW())`,
                        [req.member_id, req.amount, `${req.ref_no}-REV`, `Exit Request Rejected: ${admin_notes}`]
                    );
                }

                // Update request status
                await conn.execute<ResultSetHeader>(
                    `UPDATE withdrawal_requests SET status = ?, notes = CONCAT(IFNULL(notes,''), '\nAdmin: ', ?), updated_at = NOW()
                     WHERE withdrawal_id = ?`,
                    [status, admin_notes, request_id]
                );

                // Audit
                await conn.execute(
                    `INSERT INTO audit_logs (admin_id, action, details, severity, ip_address, created_at)
                     VALUES (?, 'exit_request_processed', ?, 'info', 'system', NOW())`,
                    [adminId, `Exit request #${request_id} for member #${req.member_id} ${status}. Notes: ${admin_notes}`]
                );

                await conn.commit();
                conn.release();

                return NextResponse.json({
                    status: 'success',
                    message: status === 'approved'
                        ? `Exit approved. Payout of KES ${Number(req.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })} processed. Member deactivated.`
                        : 'Exit request rejected and shares reinstated.'
                });

            } catch (err) {
                await conn.rollback();
                conn.release();
                throw err;
            }
        }

        return NextResponse.json({ status: 'error', message: 'Invalid action' }, { status: 400 });

    } catch (error: unknown) {
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
