import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const [loans]: any = await pool.execute(`SELECT * FROM loans WHERE member_id=? ORDER BY created_at DESC`, [session.id]);

        return NextResponse.json({
            status: 'success',
            data: {
                active_loans: loans.length,
                total_balance: loans.reduce((acc: number, cur: any) => acc + parseFloat(cur.balance || 0), 0),
                next_payment: 0,
                loans: loans,
                eligibility: {
                    max_amount: 500000,
                    status: 'Eligible',
                    reasons: []
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
