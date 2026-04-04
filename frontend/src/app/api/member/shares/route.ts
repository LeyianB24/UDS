import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            status: 'success',
            data: {
                total_shares: 15000,
                total_value: 30000,   // Assuming KES 2.0 per share
                dividend_earned: 4500,
                transactions: [],
                chart: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    data: [5000, 5000, 10000, 10000, 15000, 15000]
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
