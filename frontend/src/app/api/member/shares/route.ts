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
                portfolio_value: 30000,
                gain_pct: 12.5,
                units: 1500,
                ownership_pct: 0.25,
                share_price: 20,
                projected_dividend: 4500,
                chart_data: [
                    { label: 'Jan', value: 5000 },
                    { label: 'Feb', value: 5000 },
                    { label: 'Mar', value: 10000 },
                    { label: 'Apr', value: 10000 },
                    { label: 'May', value: 15000 },
                    { label: 'Jun', value: 15000 }
                ],
                history: []
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
