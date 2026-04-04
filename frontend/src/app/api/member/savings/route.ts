import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }
        const member_id = session.id;

        // ── Real savings balance from contributions ────────────────────
        let total_deposited = 0;
        let total_withdrawn = 0;

        try {
            const [depRows]: any = await pool.execute(
                `SELECT COALESCE(SUM(amount), 0) as total
                 FROM contributions WHERE member_id = ? AND contribution_type = 'savings'`,
                [member_id]
            );
            total_deposited = parseFloat(depRows[0]?.total) || 0;
        } catch { /* contributions table issue */ }

        try {
            const [withRows]: any = await pool.execute(
                `SELECT COALESCE(SUM(amount), 0) as total
                 FROM transactions WHERE member_id = ?
                 AND transaction_type IN ('withdrawal', 'savings_withdrawal')
                 AND status = 'completed'`,
                [member_id]
            );
            total_withdrawn = parseFloat(withRows[0]?.total) || 0;
        } catch { /* transactions table issue */ }

        const net_savings = Math.max(0, total_deposited - total_withdrawn);
        const retention_rate = total_deposited > 0 ? (net_savings / total_deposited) * 100 : 100;

        // ── Monthly trend (last 6 months from contributions) ──────────
        const trend: { month: string; amount: number }[] = [];
        try {
            const [trendRows]: any = await pool.execute(
                `SELECT
                    DATE_FORMAT(created_at, '%b') as month,
                    DATE_FORMAT(created_at, '%Y-%m') as ym,
                    COALESCE(SUM(amount), 0) as amount
                 FROM contributions
                 WHERE member_id = ?
                   AND contribution_type = 'savings'
                   AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                 GROUP BY ym, month
                 ORDER BY ym ASC`,
                [member_id]
            );
            for (const r of trendRows) {
                trend.push({ month: r.month, amount: parseFloat(r.amount) || 0 });
            }
        } catch { /* build empty trend if query fails */ }

        // Fill any missing months with 0
        if (trend.length === 0) {
            const months = ['Jan','Feb','Mar','Apr','May','Jun'];
            months.forEach(m => trend.push({ month: m, amount: 0 }));
        }

        // ── Recent transaction history ────────────────────────────────
        let history: any[] = [];
        try {
            const [h]: any = await pool.execute(
                `SELECT contribution_id as id, 'savings' as transaction_type, amount, created_at, reference_no, status
                 FROM contributions WHERE member_id = ? AND contribution_type = 'savings'
                 ORDER BY created_at DESC LIMIT 20`,
                [member_id]
            );
            history = h || [];
        } catch { /* no history */ }

        return NextResponse.json({
            status: 'success',
            data: {
                net_savings,
                total_deposited,
                total_withdrawn,
                retention_rate,
                trend,
                history
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
