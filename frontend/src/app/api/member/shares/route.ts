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

        // 1. Fetch Balances (including Shares)
        const balances = await getBalances(userId);
        const sharesBalance = balances.shares || 0;

        // 2. Fetch Global Sacco Stats for Ownership %
        // total_shares_issued from settings or sum of all members' shares
        const [totalSharesRes]: any = await pool.execute(
            `SELECT SUM(current_balance) as total FROM ledger_accounts WHERE category = 'shares'`
        );
        const globalTotalShares = totalSharesRes[0]?.total || 1; // Avoid division by zero
        const ownershipPct = (sharesBalance / globalTotalShares) * 100;

        // 3. Current Share Price (Typically fixed or from settings)
        const sharePrice = 100; // Standard price in KES
        const ownershipUnits = sharesBalance / sharePrice;

        // 4. Fetch Share Transaction History (mpesa_transactions or direct ledger)
        // We'll use the contributions table for consistency with business logic
        const [history]: any = await pool.execute(
            `SELECT created_at, reference_no, amount as total_value, (amount / ?) as units, ? as unit_price, 'share_purchase' as transaction_type
             FROM contributions 
             WHERE member_id = ? AND contribution_type = 'shares' AND status IN ('completed', 'active')
             ORDER BY created_at DESC`,
            [sharePrice, sharePrice, userId]
        );

        // 5. Generate Chart Data (Last 6 months)
        const [chartRes]: any = await pool.execute(
            `SELECT DATE_FORMAT(created_at, '%b') as label, SUM(amount) as value 
             FROM contributions 
             WHERE member_id = ? AND contribution_type = 'shares' AND status IN ('completed', 'active')
             GROUP BY label ORDER BY MIN(created_at) ASC LIMIT 6`,
            [userId]
        );

        return NextResponse.json({
            status: 'success',
            data: {
                portfolio_value: sharesBalance,
                units: ownershipUnits,
                share_price: sharePrice,
                gain_pct: 0, // Placeholder for actual valuation growth logic
                projected_dividend: sharesBalance * 0.125, // Est 12.5% dividend
                ownership_pct: ownershipPct,
                history: history,
                chart_data: chartRes.length > 0 ? chartRes : [
                    { label: 'Jan', value: 0 },
                    { label: 'Feb', value: 0 },
                    { label: 'Mar', value: 0 }
                ]
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
