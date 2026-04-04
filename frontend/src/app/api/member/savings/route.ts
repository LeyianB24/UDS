import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const [txns]: any = await pool.execute(
            `SELECT * FROM transactions WHERE member_id=? AND transaction_type IN ('deposit','contribution','withdrawal') ORDER BY created_at DESC LIMIT 20`, 
            [session.id]
        );
        
        let total_deposited = 50000;
        let total_withdrawn = 12000;
        let net_savings = total_deposited - total_withdrawn;
        let retention_rate = (net_savings / total_deposited) * 100;

        return NextResponse.json({
            status: 'success',
            data: {
                net_savings,
                total_deposited,
                total_withdrawn,
                retention_rate,
                trend: [
                    { month: 'Jan', amount: 5000 },
                    { month: 'Feb', amount: 10000 },
                    { month: 'Mar', amount: 15000 },
                    { month: 'Apr', amount: 20000 },
                    { month: 'May', amount: 25000 },
                    { month: 'Jun', amount: 30000 },
                ],
                history: txns || []
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
