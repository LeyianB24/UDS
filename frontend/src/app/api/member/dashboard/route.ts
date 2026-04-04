import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const member_id = session.id;

        // ── 1. Member basics ──────────────────────────────────────────
        const [members]: any = await pool.execute(
            `SELECT full_name, member_reg_no, created_at FROM members WHERE member_id=?`,
            [member_id]
        );
        if (!members.length) {
            return NextResponse.json({ status: 'error', message: 'Member not found' }, { status: 404 });
        }
        const md = members[0];
        const first_name = md.full_name?.split(' ')[0] || 'Member';
        const join_date  = new Date(md.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        // ── 2. Balances (each query wrapped independently) ────────────
        let savings = 0, shares = 0, wallet = 0;

        // Try contributions table (always exists)
        try {
            const [cRows]: any = await pool.execute(
                `SELECT
                    COALESCE(SUM(CASE WHEN contribution_type='savings' THEN amount ELSE 0 END),0) as sv,
                    COALESCE(SUM(CASE WHEN contribution_type='shares'  THEN amount ELSE 0 END),0) as sh
                 FROM contributions WHERE member_id = ?`,
                [member_id]
            );
            savings = parseFloat(cRows[0]?.sv) || 0;
            shares  = parseFloat(cRows[0]?.sh) || 0;
        } catch { /* contributions table may be empty or unavailable */ }

        // Try to get more accurate savings from ledger if it exists
        try {
            const [lRows]: any = await pool.execute(
                `SELECT
                    COALESCE(SUM(CASE WHEN transaction_type IN ('deposit','savings_deposit','contribution') THEN amount ELSE 0 END)
                           - SUM(CASE WHEN transaction_type IN ('withdrawal','savings_withdrawal') THEN amount ELSE 0 END), 0) as bal
                 FROM transactions WHERE member_id=? AND status='completed'`,
                [member_id]
            );
            const ledger = parseFloat(lRows[0]?.bal) || 0;
            if (ledger > 0) savings = ledger;
        } catch { /* transactions table may not have these columns */ }

        // ── 3. Active loans outstanding balance ───────────────────────
        let loans = 0;
        // Try 'current_balance' column (used in newer schema)
        try {
            const [loanRows]: any = await pool.execute(
                `SELECT COALESCE(SUM(current_balance), 0) as b
                 FROM loans WHERE member_id=? AND status IN ('approved','disbursed','active')`,
                [member_id]
            );
            loans = parseFloat(loanRows[0]?.b) || 0;
        } catch {
            // Fall back to 'amount' if 'current_balance' doesn't exist
            try {
                const [loanRows2]: any = await pool.execute(
                    `SELECT COALESCE(SUM(amount), 0) as b
                     FROM loans WHERE member_id=? AND status IN ('approved','disbursed','active')`,
                    [member_id]
                );
                loans = parseFloat(loanRows2[0]?.b) || 0;
            } catch { /* loans table unavailable */ }
        }

        // ── 4. Derived metrics ────────────────────────────────────────
        const net_worth = savings + shares - loans;
        const loan_pct  = Math.min(100, (loans / 500000) * 100);
        const health    = Math.max(0, Math.round(100 - loan_pct * 0.3 - (savings < 5000 ? 10 : 0)));

        // ── 5. Recent transactions ────────────────────────────────────
        let recent_txn: any[] = [];
        try {
            const [txRows]: any = await pool.execute(
                `SELECT transaction_type, amount, created_at, reference_no
                 FROM transactions WHERE member_id=? ORDER BY created_at DESC LIMIT 8`,
                [member_id]
            );
            recent_txn = txRows;
        } catch { /* transactions table may not have reference_no */ 
            try {
                const [txRows2]: any = await pool.execute(
                    `SELECT transaction_type, amount, created_at
                     FROM transactions WHERE member_id=? ORDER BY created_at DESC LIMIT 8`,
                    [member_id]
                );
                recent_txn = txRows2;
            } catch { /* skip */ }
        }

        return NextResponse.json({
            status: 'success',
            data: {
                member_name: md.full_name,
                first_name,
                reg_no: md.member_reg_no,
                join_date,
                balances: { wallet, savings, shares, loans, net_worth },
                loan_pct,
                stats: {
                    month_contrib: 0,
                    total_deposits: savings,
                    total_withdrawals: 0,
                    welfare_total: 0,
                    pending_loans: 0,
                    health
                },
                chartData: {
                    mo_labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                    sav_arr:   [0,0,0,0,0,0,0,0,0,0,0,savings],
                    ctb_arr:   [0,0,0,0,0,0,0,0,0,0,0,0],
                    rep_arr:   [0,0,0,0,0,0,0,0,0,0,0,0],
                    inc_labels: ['Jul','Aug','Sep','Oct','Nov','Dec'],
                    inc_arr:    [0,0,0,0,0,savings],
                    exp_arr:    [0,0,0,0,0,loans],
                    radar: [90, 70, 100, 85, 60, 75]
                },
                recent_txn
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
