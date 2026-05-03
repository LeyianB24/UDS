import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const [accounts]: any = await pool.execute(`SELECT * FROM ledger_accounts ORDER BY account_type ASC, category ASC, account_name ASC`);

        let total_assets = 0;
        let total_liabilities = 0;
        let total_equity = 0;
        let revenue_total = 0;
        let expense_total = 0;

        const asset_cats: Record<string, any> = {};
        const liab_cats: Record<string, any> = {};
        const equity_cats: Record<string, any> = {};

        for (const acc of accounts) {
            const bal = parseFloat(acc.current_balance);
            const type = acc.account_type.toLowerCase();
            const cat = acc.category || (type === 'equity' ? 'Equity' : 'Uncategorized');

            if (type === 'asset') {
                total_assets += bal;
                if (!asset_cats[cat]) asset_cats[cat] = { total: 0, items: [] };
                asset_cats[cat].total += bal;
                asset_cats[cat].items.push(acc);
            } else if (type === 'liability') {
                total_liabilities += bal;
                if (!liab_cats[cat]) liab_cats[cat] = { total: 0, items: [] };
                liab_cats[cat].total += bal;
                liab_cats[cat].items.push(acc);
            } else if (type === 'equity') {
                total_equity += bal;
                if (!equity_cats[cat]) equity_cats[cat] = { total: 0, items: [] };
                equity_cats[cat].total += bal;
                equity_cats[cat].items.push(acc);
            } else if (type === 'revenue') {
                revenue_total += bal;
            } else if (type === 'expense') {
                expense_total += bal;
            }
        }

        const net_income = revenue_total - expense_total;
        const balance_check = total_assets - (total_liabilities + total_equity + net_income);
        const is_balanced = Math.abs(balance_check) < 0.01;

        return NextResponse.json({
            status: 'success',
            data: {
                total_assets,
                total_liabilities,
                total_equity,
                net_income,
                balance_check,
                is_balanced,
                categories: {
                    assets: asset_cats,
                    liabilities: liab_cats,
                    equity: equity_cats
                }
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
