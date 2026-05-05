import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || '';

        let where = "1=1";
        const params: any[] = [];

        if (type) {
            where += " AND t.transaction_type = ?";
            params.push(type);
        }
        if (search) {
            where += " AND (t.reference_no LIKE ? OR m.full_name LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        const sql = `
            SELECT t.*, m.full_name, m.national_id, i.title as asset_title
            FROM transactions t
            LEFT JOIN members m ON t.member_id = m.member_id
            LEFT JOIN investments i ON t.related_table = 'investments' AND t.related_id = i.investment_id
            WHERE ${where} 
            ORDER BY t.created_at DESC 
            LIMIT 50
        `;

        const [transactions]: any = await pool.execute(sql, params);

        const [statsRows]: any = await pool.execute(`
            SELECT
                SUM(CASE WHEN transaction_type IN ('deposit','savings_deposit','share_purchase','revenue_inflow','loan_repayment','share_capital') THEN amount ELSE 0 END) as total_in,
                SUM(CASE WHEN transaction_type IN ('withdrawal','expense') THEN amount ELSE 0 END) as total_out,
                COUNT(*) as total_count
            FROM transactions
        `);

        const [members]: any = await pool.execute(`SELECT member_id, full_name, national_id FROM members ORDER BY full_name ASC`);
        const [investments]: any = await pool.execute(`SELECT investment_id, title FROM investments WHERE status = 'active' ORDER BY title ASC`);

        return NextResponse.json({
            status: 'success',
            data: {
                transactions,
                stats: statsRows[0],
                members,
                investments
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let connection;
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (action === 'record_txn') {
            const { member_id, transaction_type, amount, notes, reference_no, payment_method, unified_asset_id, txn_date } = body;

            const amt = parseFloat(amount);
            if (amt <= 0) return NextResponse.json({ status: 'error', message: 'Amount must be greater than zero.' });

            if (['deposit', 'withdrawal', 'loan_repayment', 'share_capital'].includes(transaction_type) && !member_id) {
                return NextResponse.json({ status: 'error', message: 'Member selection is required for this transaction type.' });
            }

            connection = await pool.getConnection();
            await connection.beginTransaction();

            const category = {
                'deposit': 'savings',
                'withdrawal': 'wallet',
                'share_capital': 'shares',
                'loan_repayment': 'loans',
                'expense': 'expense',
                'income': 'income'
            }[transaction_type as string] || 'general';

            let related_id = null;
            let related_table = null;

            if (transaction_type === 'loan_repayment' && member_id) {
                const [lRes]: any = await connection.execute(`SELECT loan_id FROM loans WHERE member_id = ? AND status = 'disbursed' LIMIT 1`, [member_id]);
                if (lRes.length > 0) {
                    related_id = lRes[0].loan_id;
                    related_table = 'loans';
                }
            } else if (['expense', 'income'].includes(transaction_type)) {
                if (unified_asset_id && unified_asset_id !== 'other_0') {
                    const parts = unified_asset_id.split('_');
                    if (parts.length === 2) {
                        related_id = parseInt(parts[1], 10);
                        related_table = 'investments';
                    }
                }
            }

            // Insert into ledger (transactions table)
            const [insRes]: any = await connection.execute(
                `INSERT INTO transactions (member_id, amount, transaction_type, category, reference_no, notes, payment_channel, related_id, related_table, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))`,
                [
                    member_id || null, 
                    amt, 
                    transaction_type, 
                    category, 
                    reference_no || `TXN${Date.now()}`, 
                    notes || '', 
                    payment_method || 'cash', 
                    related_id, 
                    related_table,
                    txn_date ? `${txn_date} ${new Date().toTimeString().split(' ')[0]}` : null
                ]
            );

            // Update balances if applicable
            if (member_id) {
                if (transaction_type === 'deposit') {
                    await connection.execute(`UPDATE members SET total_savings = total_savings + ? WHERE member_id = ?`, [amt, member_id]);
                } else if (transaction_type === 'withdrawal') {
                    await connection.execute(`UPDATE members SET wallet_balance = wallet_balance - ? WHERE member_id = ?`, [amt, member_id]);
                } else if (transaction_type === 'share_capital') {
                    // Update shares
                    const [mRes]: any = await connection.execute(`SELECT total_shares FROM members WHERE member_id = ?`, [member_id]);
                    const currentShares = parseFloat(mRes[0].total_shares);
                    // Assume 1 share = 1000 KES for simplicity, or just update total_shares_value depending on schema.
                    // Assuming shares are updated directly or stored as value. Let's just update total_shares.
                    await connection.execute(`UPDATE members SET total_shares = total_shares + ? WHERE member_id = ?`, [Math.floor(amt / 1000), member_id]);
                } else if (transaction_type === 'loan_repayment' && related_id) {
                    await connection.execute(`UPDATE loans SET paid_amount = paid_amount + ? WHERE loan_id = ?`, [amt, related_id]);
                }
            }

            await connection.commit();
            return NextResponse.json({ status: 'success', message: 'Transaction recorded successfully!' });
        }

        throw new Error('Invalid action');

    } catch (error: any) {
        if (connection) await connection.rollback();
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
