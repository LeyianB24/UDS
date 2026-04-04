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

        // ── 1. Fetch all loans for this member ──────────────────────
        let loans: any[] = [];
        try {
            const [loanRows]: any = await pool.execute(
                `SELECT loan_id, loan_type, amount, current_balance, total_payable,
                        interest_rate, status, created_at, disbursed_at,
                        next_repayment_date, repayment_period, purpose
                 FROM loans WHERE member_id = ? ORDER BY created_at DESC`,
                [member_id]
            );
            loans = loanRows || [];
        } catch {
            // If current_balance doesn't exist, try without it
            try {
                const [loanRows2]: any = await pool.execute(
                    `SELECT loan_id, loan_type, amount, total_payable,
                            interest_rate, status, created_at, disbursed_at,
                            next_repayment_date, repayment_period, purpose
                     FROM loans WHERE member_id = ? ORDER BY created_at DESC`,
                    [member_id]
                );
                loans = loanRows2 || [];
            } catch { /* no loans table */ }
        }

        // ── 2. Parse active / pending loan ──────────────────────────
        let active_loan: any = null;
        let pending_loan: any = null;

        for (const l of loans) {
            const status = (l.status || '').toLowerCase();
            const amt    = parseFloat(l.amount) || 0;
            const r      = parseFloat(l.interest_rate) || 12;
            const maxb   = parseFloat(l.total_payable) || (amt + amt * (r / 100));
            const cur    = parseFloat(l.current_balance) || maxb;
            const prog   = maxb > 0 ? Math.min(100, ((maxb - cur) / maxb) * 100) : 0;

            if (['active', 'disbursed'].includes(status) && !active_loan) {
                // Fetch guarantors for this loan
                let guarantors: string[] = [];
                try {
                    const [gRows]: any = await pool.execute(
                        `SELECT m.full_name FROM loan_guarantors lg
                         JOIN members m ON lg.guarantor_id = m.member_id
                         WHERE lg.loan_id = ?`,
                        [l.loan_id]
                    );
                    guarantors = gRows.map((g: any) => g.full_name);
                } catch { /* loan_guarantors table may not exist */ }

                active_loan = {
                    loan_id: l.loan_id,
                    loan_type: l.loan_type || 'Personal Loan',
                    amount: amt,
                    current_balance: cur,
                    status,
                    progress_percent: prog,
                    total_payable: maxb,
                    interest_rate: r,
                    next_repayment_date: l.next_repayment_date
                        ? new Date(l.next_repayment_date).toISOString()
                        : new Date(Date.now() + 86400000 * 30).toISOString(),
                    guarantors,
                };
            }

            if (['pending', 'approved'].includes(status) && !pending_loan) {
                pending_loan = {
                    loan_id: l.loan_id,
                    amount: amt,
                    status,
                    loan_type: l.loan_type || 'Personal Loan',
                };
            }
        }

        // ── 3. Real savings balance for loan limit calculation ───────
        let total_savings = 0;
        try {
            const [savRows]: any = await pool.execute(
                `SELECT COALESCE(SUM(amount), 0) as total
                 FROM contributions WHERE member_id = ? AND contribution_type = 'savings'`,
                [member_id]
            );
            total_savings = parseFloat(savRows[0]?.total) || 0;
        } catch { /* no contributions table */ }

        const limit = total_savings * 3;  // Standard SACCO formula: 3× savings

        // ── 4. Loan repayment history ────────────────────────────────
        let repayment_history: any[] = [];
        try {
            const [repRows]: any = await pool.execute(
                `SELECT t.transaction_id, t.amount, t.created_at, t.reference_no, t.transaction_type
                 FROM transactions t
                 WHERE t.member_id = ? AND t.transaction_type IN ('loan_repayment','repayment')
                 ORDER BY t.created_at DESC LIMIT 10`,
                [member_id]
            );
            repayment_history = repRows || [];
        } catch { /* no repayment history */ }

        return NextResponse.json({
            status: 'success',
            data: {
                limit,
                wallet_balance: 0,         // wallet not currently tracked separately
                total_savings,
                active_loan,
                pending_loan,
                history: loans,
                repayment_history,
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
