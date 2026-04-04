import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const [txns]: any = await pool.execute(`SELECT * FROM transactions WHERE member_id=? AND transaction_type='deposit' ORDER BY created_at DESC LIMIT 10`, [session.id]);
        
        return NextResponse.json({
            status: 'success',
            data: {
                total_savings: 45000,
                monthly_target: 5000,
                this_month: 2500,
                interest_earned: 1250,
                transactions: txns,
                chart: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    data: [5000, 10000, 15000, 20000, 25000, 30000]
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
