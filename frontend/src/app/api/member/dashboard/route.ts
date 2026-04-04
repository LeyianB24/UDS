import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const member_id = session.id;

        // 1. Member basics
        const [members]: any = await pool.execute(`SELECT full_name, member_reg_no, created_at FROM members WHERE member_id=?`, [member_id]);
        if (members.length === 0) return NextResponse.json({ status: 'error', message: 'Member not found' }, { status: 404 });
        const md = members[0];
        
        const first_name = md.full_name?.split(' ')[0] || 'Member';
        const join_date = new Date(md.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        // 2. Balances — try ledger_entries first, fall back to contributions-based calc
        let wallet = 0, savings = 0, shares = 0;
        try {
            const [ledgerRows]: any = await pool.execute(`
                SELECT la.category, SUM(le.credit - le.debit) as balance 
                FROM ledger_entries le 
                JOIN ledger_accounts la ON le.account_id = la.account_id 
                WHERE la.member_id = ? 
                GROUP BY la.category
            `, [member_id]);
            ledgerRows.forEach((r: any) => {
                if (r.category === 'wallet')  wallet  = parseFloat(r.balance) || 0;
                if (r.category === 'savings') savings = parseFloat(r.balance) || 0;
                if (r.category === 'shares')  shares  = parseFloat(r.balance) || 0;
            });
        } catch {
            // ledger_entries table may not exist — fall back to contributions aggregate
            try {
                const [cRows]: any = await pool.execute(`
                    SELECT
                        COALESCE(SUM(CASE WHEN contribution_type='savings' THEN amount ELSE 0 END),0) as sv,
                        COALESCE(SUM(CASE WHEN contribution_type='shares'  THEN amount ELSE 0 END),0) as sh
                    FROM contributions WHERE member_id = ?
                `, [member_id]);
                savings = parseFloat(cRows[0]?.sv) || 0;
                shares  = parseFloat(cRows[0]?.sh) || 0;
            } catch { /* leave at 0 */ }
        }

        const [loanRows]: any = await pool.execute(
            `SELECT COALESCE(SUM(current_balance), 0) as b FROM loans WHERE member_id=? AND status IN ('approved', 'disbursed', 'active')`,
            [member_id]
        );
        const loans = parseFloat(loanRows[0]?.b) || 0;

        const net_worth = savings + shares - loans;
        const loan_pct = min(100, (loans / 500000) * 100);

        // 6. Recent transactions
        const [recent_txn]: any = await pool.execute(`SELECT transaction_type, amount, created_at, reference_no FROM transactions WHERE member_id=? ORDER BY created_at DESC LIMIT 8`, [member_id]);

        // Placeholder for charts/stats to keep response fast and reliable for Demo
        const month_contrib = 2500;
        const total_deposits = 50000;
        const total_withdrawals = 12000;
        const welfare_total = 1000;
        const pending_loans = 0;

        const health = Math.max(0, Math.round(100 - (loan_pct*0.3) - (savings < 5000 ? 10 : 0)));

        return NextResponse.json({
            status: 'success',
            data: {
                member_name: md.full_name,
                first_name,
                reg_no: md.member_reg_no,
                join_date,
                balances: { wallet, savings, shares, loans, net_worth },
                loan_pct,
                stats: { month_contrib, total_deposits, total_withdrawals, welfare_total, pending_loans, health },
                chartData: {
                    mo_labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    sav_arr: [5000, 10000, 15000, 20000, 25000, 30000, 35000, 38000, 40000, 42000, 44000, savings > 44000 ? savings : 45000],
                    ctb_arr: [2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500],
                    rep_arr: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    inc_labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    inc_arr: [5000, 4500, 6000, 5500, 7000, 6500],
                    exp_arr: [1200, 800, 1500, 1000, 2000, 1800],
                    radar: [90, 70, 100, 85, 60, 75]
                },
                recent_txn
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

function min(a: number, b: number) { return a < b ? a : b; }
