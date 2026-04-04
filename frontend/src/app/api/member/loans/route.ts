import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const [loans]: any = await pool.execute(
            `SELECT * FROM loans WHERE member_id=? ORDER BY created_at DESC`, 
            [session.id]
        );

        let active_loan = null;
        if (loans.length > 0 && ['pending', 'approved', 'active', 'disbursed'].includes(loans[0].status)) {
            const l = loans[0];
            const maxb = parseFloat(l.amount || 0) + parseFloat(l.interest_amount || 0);
            const cur = parseFloat(l.current_balance || maxb);
            const r = maxb > 0 ? ((maxb - cur) / maxb) * 100 : 0;

            active_loan = {
                progress_percent: r,
                loan_type: l.loan_type,
                current_balance: cur,
                next_repayment_date: new Date(Date.now() + 86400000 * 30).toISOString(),
                total_payable: maxb
            };
        }

        return NextResponse.json({
            status: 'success',
            data: {
                limit: 500000,
                active_loan: active_loan,
                history: loans || []
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
