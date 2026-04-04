import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const memberId = session.id;
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
        const filterType = url.searchParams.get('type') || '';
        const filterFrom = url.searchParams.get('from') || '';
        const filterTo   = url.searchParams.get('to')   || '';
        const perPage = 10;
        const offset  = (page - 1) * perPage;

        // ── Stats ──
        const [statsRows] = await pool.execute(`
            SELECT
                COALESCE(SUM(amount),0) as grand_total,
                COALESCE(SUM(CASE WHEN contribution_type='savings' THEN amount ELSE 0 END),0) as total_savings,
                COALESCE(SUM(CASE WHEN contribution_type='shares'  THEN amount ELSE 0 END),0) as total_shares,
                COALESCE(SUM(CASE WHEN contribution_type='welfare' THEN amount ELSE 0 END),0) as total_welfare,
                COUNT(*) as total_count,
                COUNT(CASE WHEN contribution_type='savings' THEN 1 END) as count_savings,
                COUNT(CASE WHEN contribution_type='shares'  THEN 1 END) as count_shares,
                COUNT(CASE WHEN contribution_type='welfare' THEN 1 END) as count_welfare
            FROM contributions WHERE member_id = ?
        `, [memberId]) as any[];

        const stats = statsRows[0] || {};
        const grandTotal  = parseFloat(stats.grand_total)   || 0;
        const savingsVal  = parseFloat(stats.total_savings)  || 0;
        const sharesVal   = parseFloat(stats.total_shares)   || 0;
        const welfareVal  = parseFloat(stats.total_welfare)  || 0;
        const totalCount  = parseInt(stats.total_count)      || 0;
        const cntSavings  = parseInt(stats.count_savings)    || 0;
        const cntShares   = parseInt(stats.count_shares)     || 0;
        const cntWelfare  = parseInt(stats.count_welfare)    || 0;

        // ── Savings ledger balance ──
        const [savLedger] = await pool.execute(`
            SELECT COALESCE(SUM(CASE WHEN transaction_type IN ('deposit','savings_deposit','contribution') THEN amount ELSE 0 END)
                         - SUM(CASE WHEN transaction_type IN ('withdrawal','savings_withdrawal') THEN amount ELSE 0 END), 0) as bal
            FROM transactions WHERE member_id = ? AND status = 'completed'
        `, [memberId]) as any[];
        const ledgerSavings = parseFloat((savLedger[0] as any)?.bal) || savingsVal;

        // ── Monthly trend (last 7 months) ──
        const trendLabels: string[] = [];
        const trendSavings: number[] = [];
        const trendShares: number[]  = [];
        const trendWelfare: number[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const ms = `${y}-${m}-01`;
            const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
            const me = `${y}-${m}-${lastDay}`;
            trendLabels.push(d.toLocaleString('default', { month: 'short' }));

            const [tr] = await pool.execute(`
                SELECT
                    COALESCE(SUM(CASE WHEN contribution_type='savings' THEN amount ELSE 0 END),0) as sv,
                    COALESCE(SUM(CASE WHEN contribution_type='shares'  THEN amount ELSE 0 END),0) as sh,
                    COALESCE(SUM(CASE WHEN contribution_type='welfare' THEN amount ELSE 0 END),0) as wf
                FROM contributions WHERE member_id=? AND DATE(created_at) BETWEEN ? AND ?
            `, [memberId, ms, me]) as any[];
            const row = (tr as any[])[0] || {};
            trendSavings.push(parseFloat(row.sv) || 0);
            trendShares.push(parseFloat(row.sh)  || 0);
            trendWelfare.push(parseFloat(row.wf) || 0);
        }

        // ── Active days streak (last 30 days) ──
        const [streakRows] = await pool.execute(`
            SELECT COUNT(DISTINCT DATE(created_at)) as active_days
            FROM contributions WHERE member_id=? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, [memberId]) as any[];
        const activeDays = parseInt((streakRows as any[])[0]?.active_days) || 0;

        // ── Build filtered query ──
        let whereClause = 'WHERE member_id = ?';
        const qParams: any[] = [memberId];
        if (filterType) { whereClause += ' AND contribution_type = ?'; qParams.push(filterType); }
        if (filterFrom && filterTo) { whereClause += ' AND DATE(created_at) BETWEEN ? AND ?'; qParams.push(filterFrom, filterTo); }

        // Count
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) as total FROM contributions ${whereClause}`,
            qParams
        ) as any[];
        const totalRows  = parseInt((countRows as any[])[0]?.total) || 0;
        const totalPages = Math.ceil(totalRows / perPage);

        // Records
        const [records] = await pool.execute(
            `SELECT contribution_id, reference_no, contribution_type, amount, payment_method, created_at, status
             FROM contributions ${whereClause} ORDER BY created_at DESC LIMIT ?, ?`,
            [...qParams, offset, perPage]
        ) as any[];

        return NextResponse.json({
            status: 'success',
            data: {
                stats: { grandTotal, savingsVal, sharesVal, welfareVal, totalCount, cntSavings, cntShares, cntWelfare, ledgerSavings, activeDays },
                trend: { labels: trendLabels, savings: trendSavings, shares: trendShares, welfare: trendWelfare },
                pagination: { page, totalRows, totalPages, perPage, offset },
                records: records as any[],
                filters: { type: filterType, from: filterFrom, to: filterTo },
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
