import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch Loans
        const [loans]: any = await pool.execute(
            `SELECT * FROM loans WHERE member_id=? ORDER BY created_at DESC`, 
            [session.id]
        );

        let active_loan = null;
        let pending_loan = null;

        if (loans.length > 0) {
            const first = loans[0];
            if (['pending', 'approved'].includes(first.status)) {
                pending_loan = {
                    amount: parseFloat(first.amount),
                    status: first.status
                };
            } else if (['active', 'disbursed'].includes(first.status)) {
                const l = first;
                const amt = parseFloat(l.amount || 0);
                const r = parseFloat(l.interest_rate || 12);
                const maxb = parseFloat(l.total_payable || (amt + (amt * (r/100))));
                const cur = parseFloat(l.current_balance || maxb);
                const prog = maxb > 0 ? ((maxb - cur) / maxb) * 100 : 0;

                active_loan = {
                    loan_id: l.loan_id,
                    loan_type: l.loan_type,
                    amount: amt,
                    current_balance: cur,
                    status: l.status,
                    progress_percent: prog > 100 ? 100 : prog,
                    total_payable: maxb,
                    interest_rate: r,
                    next_repayment_date: l.next_repayment_date ? new Date(l.next_repayment_date).toISOString() : new Date(Date.now() + 86400000 * 30).toISOString(),
                    guarantors: [] // Mocked for now to save complex queries
                };
            }
        }

        // Fetch Balances
        const [txns]: any = await pool.execute(`SELECT transaction_type, amount FROM transactions WHERE member_id=? AND status='completed'`, [session.id]);
        let total_savings = 50000;
        let wallet = 12000;
        
        const limit = total_savings * 3;

        return NextResponse.json({
            status: 'success',
            data: {
                limit: limit,
                wallet_balance: wallet,
                total_savings: total_savings,
                active_loan: active_loan,
                pending_loan: pending_loan,
                history: loans || []
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
