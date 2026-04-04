import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const member_id = session.id;
        const { searchParams } = new URL(request.url);
        
        const type = searchParams.get('type');
        const date = searchParams.get('date');
        const from = searchParams.get('from');
        const to   = searchParams.get('to');

        // 1. Transaction List with optional filters
        let query = "SELECT transaction_id, transaction_type, amount, reference_no, created_at, payment_channel as channel, notes FROM transactions WHERE member_id = ?";
        const params: any[] = [member_id];

        if (type) { query += " AND transaction_type = ?"; params.push(type); }
        if (date) { query += " AND DATE(created_at) = ?"; params.push(date); }
        if (from) { query += " AND DATE(created_at) >= ?"; params.push(from); }
        if (to)   { query += " AND DATE(created_at) <= ?"; params.push(to); }
        
        query += " ORDER BY created_at DESC";
        const [transactions]: any = await pool.execute(query, params);

        // 2. Aggregate Stats / KPIs
        const statsQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN transaction_type IN ('deposit','contribution') THEN amount ELSE 0 END), 0) as total_deposited,
                COALESCE(SUM(CASE WHEN transaction_type IN ('withdrawal','savings_withdrawal') THEN amount ELSE 0 END), 0) as total_withdrawn,
                COALESCE(SUM(CASE WHEN transaction_type IN ('loan_repayment','repayment') THEN amount ELSE 0 END), 0) as total_repaid,
                COUNT(*) as txn_count
            FROM transactions WHERE member_id = ?
        `;
        const [statsRows]: any = await pool.execute(statsQuery, [member_id]);
        const stats = statsRows[0];

        const [loanRows]: any = await pool.execute(
            `SELECT COALESCE(SUM(current_balance), 0) as active_loans FROM loans WHERE member_id=? AND status IN ('approved','disbursed','active')`,
            [member_id]
        );
        const active_loans = parseFloat(loanRows[0]?.active_loans || 0);

        // 3. 12-Month Flow Data
        const chart_labels: string[] = [];
        const chart_in: number[] = [];
        const chart_out: number[] = [];
        const chart_net: number[] = [];

        for (let i = 11; i >= 0; i--) {
            const dateObj = new Date();
            dateObj.setMonth(dateObj.getMonth() - i);
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const ms = `${y}-${m}-01`;
            const me = `${y}-${m}-31`; // Simplified for query range

            const label = dateObj.toLocaleDateString('default', { month: 'short' });
            chart_labels.push(label);

            const [[monthFlow]]: any = await pool.execute(`
                SELECT 
                    SUM(CASE WHEN transaction_type IN ('deposit','contribution') THEN amount ELSE 0 END) as \`in\`,
                    SUM(CASE WHEN transaction_type IN ('withdrawal','loan_repayment') THEN amount ELSE 0 END) as \`out\`
                FROM transactions 
                WHERE member_id = ? AND created_at BETWEEN ? AND ?
            `, [member_id, `${ms} 00:00:00`, `${me} 23:59:59`]);

            const mIn = parseFloat(monthFlow?.in || 0);
            const mOut = parseFloat(monthFlow?.out || 0);
            chart_in.push(mIn);
            chart_out.push(mOut);
            chart_net.push(mIn - mOut);
        }

        // 4. Type Breakdown (Doughnut)
        const [breakdown]: any = await pool.execute(
            `SELECT transaction_type as label, SUM(amount) as total 
             FROM transactions WHERE member_id = ? 
             GROUP BY transaction_type ORDER BY total DESC LIMIT 7`,
            [member_id]
        );

        return NextResponse.json({
            status: 'success',
            data: {
                transactions,
                stats: {
                    total_deposited: parseFloat(stats.total_deposited),
                    total_withdrawn: parseFloat(stats.total_withdrawn),
                    total_repaid: parseFloat(stats.total_repaid),
                    txn_count: stats.txn_count,
                    active_loans,
                    net_savings: parseFloat(stats.total_deposited) - parseFloat(stats.total_withdrawn)
                },
                charts: {
                    labels: chart_labels,
                    inflows: chart_in,
                    outflows: chart_out,
                    net: chart_net
                },
                breakdown: breakdown.map((b: any) => ({
                    label: (b.label || '').replace(/_/g, ' ').replace(/\b\w/g, (c:any) => c.toUpperCase()),
                    value: parseFloat(b.total)
                }))
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
