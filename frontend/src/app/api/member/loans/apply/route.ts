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

        // 1. Check Eligibility
        const [members]: any = await pool.execute(
            `SELECT status, kyc_status, registration_fee_status, reg_fee_paid FROM members WHERE member_id = ?`,
            [userId]
        );
        const member = members[0];

        const eligibility = {
            active: member.status === 'active',
            kyc: member.kyc_status === 'approved',
            regFee: member.registration_fee_status === 'paid' || member.reg_fee_paid == 1,
            noActiveLoan: true
        };

        const [activeLoans]: any = await pool.execute(
            `SELECT COUNT(*) as count FROM loans WHERE member_id = ? AND status IN ('pending', 'approved', 'disbursed')`,
            [userId]
        );
        eligibility.noActiveLoan = activeLoans[0].count === 0;

        // 2. Fetch Balances for calculation
        const balances = await getBalances(userId);

        // 3. Fetch Potential Guarantors
        const [guarantors]: any = await pool.execute(
            `SELECT member_id, full_name, member_reg_no FROM members WHERE member_id != ? AND status = 'active' ORDER BY full_name ASC`,
            [userId]
        );

        return NextResponse.json({
            status: 'success',
            data: {
                member,
                eligibility,
                balances,
                guarantors,
                settings: {
                    interest_rate: 12.00, // Default
                    max_multiplier: 3
                }
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
        const { loan_type, amount, duration_months, notes, guarantor_1, guarantor_2 } = await request.json();

        // 1. Validation (Same as apply_loan.php)
        const balances = await getBalances(userId);
        const maxLimit = balances.savings * 3;

        if (amount > maxLimit) {
            return NextResponse.json({ status: 'error', message: `Loan limit exceeded. Max: KES ${maxLimit.toLocaleString()}` }, { status: 400 });
        }

        if (amount < 500) return NextResponse.json({ status: 'error', message: 'Minimum loan is KES 500' }, { status: 400 });
        if (!guarantor_1 || !guarantor_2 || guarantor_1 === guarantor_2) {
            return NextResponse.json({ status: 'error', message: 'Please select two different guarantors' }, { status: 400 });
        }

        // 2. Math
        const interestRate = 12.00; // Assume constant or fetch from settings
        const interestAmount = amount * (interestRate / 100);
        const totalPayable = amount + interestAmount;
        const lockPerGuarantor = amount / 2;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 3. Insert Loan (Defensive reference_no)
            const refNo = `L-${Date.now()}`;
            let loanId;
            try {
                const [loanRes]: any = await connection.execute(
                    `INSERT INTO loans (member_id, reference_no, loan_type, amount, interest_rate, duration_months, status, application_date, notes, total_payable, current_balance) 
                     VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), ?, ?, ?)`,
                    [userId, refNo, loan_type, amount, interestRate, duration_months, notes, totalPayable, totalPayable]
                );
                loanId = loanRes.insertId;
            } catch (err) {
                // Fallback for schemas missing reference_no
                const [loanRes]: any = await connection.execute(
                    `INSERT INTO loans (member_id, loan_type, amount, interest_rate, duration_months, status, application_date, notes, total_payable, current_balance) 
                     VALUES (?, ?, ?, ?, ?, 'pending', NOW(), ?, ?, ?)`,
                    [userId, loan_type, amount, interestRate, duration_months, notes, totalPayable, totalPayable]
                );
                loanId = loanRes.insertId;
            }

            // 4. Insert Guarantors
            const gSql = `INSERT INTO loan_guarantors (loan_id, member_id, amount_locked, status, created_at) VALUES (?, ?, ?, 'pending', NOW())`;
            await connection.execute(gSql, [loanId, guarantor_1, lockPerGuarantor]);
            await connection.execute(gSql, [loanId, guarantor_2, lockPerGuarantor]);

            await connection.commit();
            return NextResponse.json({ status: 'success', message: 'Loan application submitted for review' });
        } catch (e: any) {
            await connection.rollback();
            throw e;
        } finally {
            connection.release();
        }

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
