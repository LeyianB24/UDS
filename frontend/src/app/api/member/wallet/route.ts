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

        // 1. Fetch Balances (Total Wallet Balance)
        const balances = await getBalances(userId);
        const walletBalance = balances.wallet || 0;

        // 2. Fetch Wallet Specific History (mpesa_transactions, dividends, payouts)
        // We look for transactions targeting the 'wallet' account.
        const [history]: any = await pool.execute(
            `SELECT created_at, transaction_type, amount, notes, status, reference_no
             FROM transactions 
             WHERE member_id = ? AND (source_account = 'wallet' OR destination_account = 'wallet')
             ORDER BY created_at DESC LIMIT 30`,
            [userId]
        );

        // 3. Stats
        const [statsRes]: any = await pool.execute(
            `SELECT 
                SUM(CASE WHEN destination_account = 'wallet' AND transaction_type = 'dividend_payment' THEN amount ELSE 0 END) as total_dividends,
                SUM(CASE WHEN destination_account = 'wallet' AND transaction_type = 'payout' THEN amount ELSE 0 END) as total_payouts,
                SUM(CASE WHEN source_account = 'wallet' AND transaction_type = 'withdrawal' THEN amount ELSE 0 END) as total_withdrawn
             FROM transactions WHERE member_id = ? AND status = 'completed'`,
            [userId]
        );

        return NextResponse.json({
            status: 'success',
            data: {
                balance: walletBalance,
                stats: statsRes[0] || { total_dividends: 0, total_payouts: 0, total_withdrawn: 0 },
                history: history
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
