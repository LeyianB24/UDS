import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getBalances } from '@/lib/finance';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.id;

        // 1. Fetch Stats from Ledger
        const balances = await getBalances(userId);
        
        // Pool Balance (System Account)
        const [poolRows]: any = await pool.execute(
            `SELECT current_balance FROM ledger_accounts WHERE account_name = 'Welfare Fund Pool' LIMIT 1`
        );
        const poolBalance = poolRows[0]?.current_balance || 0;

        // Total Lifetime Contributed (Sum of all credits to member's welfare account)
        const [contribRows]: any = await pool.execute(
            `SELECT SUM(credit) as total FROM ledger_entries le 
             JOIN ledger_accounts la ON le.account_id = la.account_id 
             WHERE la.member_id = ? AND la.category = 'welfare'`,
            [userId]
        );
        const totalGiven = contribRows[0]?.total || 0;

        // Total Support Received (Sum of all debits to member's welfare account)
        const [supportRows]: any = await pool.execute(
            `SELECT SUM(debit) as total FROM ledger_entries le 
             JOIN ledger_accounts la ON le.account_id = la.account_id 
             WHERE la.member_id = ? AND la.category = 'welfare'`,
            [userId]
        );
        const totalReceived = supportRows[0]?.total || 0;

        // 2. Fetch Contributions List (Legacy sync)
        const [allContribs]: any = await pool.execute(
            `SELECT amount, status, reference_no, created_at FROM contributions WHERE member_id = ? AND contribution_type = 'welfare' ORDER BY created_at DESC`,
            [userId]
        );

        // 3. Fetch Community Cases
        const [communityCases]: any = await pool.execute(
            `SELECT c.*, (SELECT COUNT(*) FROM welfare_donations WHERE case_id = c.case_id) as donor_count FROM welfare_cases c WHERE c.status IN ('active', 'approved', 'funded') ORDER BY c.created_at DESC`
        );

        // 4. Fetch Support History (welfare_support table)
        const [supportHistory]: any = await pool.execute(
            `SELECT * FROM welfare_support WHERE member_id = ? ORDER BY date_granted DESC`,
            [userId]
        );

        // 5. Fetch My Cases
        const [myCases]: any = await pool.execute(
            `SELECT * FROM welfare_cases WHERE related_member_id = ? ORDER BY created_at DESC`,
            [userId]
        );

        return NextResponse.json({
            status: 'success',
            data: {
                poolBalance,
                totalGiven,
                totalReceived,
                withdrawableBenefit: balances.welfare || 0,
                allContribs,
                communityCases,
                supportHistory,
                myCases
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.id;
        const { title, description, requested_amount } = await request.json();

        if (!title || !requested_amount) {
            return NextResponse.json({ status: 'error', message: 'Title and amount are required' }, { status: 400 });
        }

        await pool.execute(
            `INSERT INTO welfare_cases (title, description, requested_amount, related_member_id, status, created_at) VALUES (?, ?, ?, ?, 'pending', NOW())`,
            [title, description, requested_amount, userId]
        );

        return NextResponse.json({ status: 'success', message: 'Your welfare request has been submitted for review.' });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
