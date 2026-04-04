import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const loanId = searchParams.get('loan_id');

        if (!loanId) return NextResponse.json({ status: 'error', message: 'Loan ID required' }, { status: 400 });

        const [loans]: any = await pool.execute(
            `SELECT l.*, m.phone 
             FROM loans l 
             JOIN members m ON l.member_id = m.member_id
             WHERE l.loan_id = ? AND l.member_id = ?`,
            [loanId, session.id]
        );

        if (loans.length === 0) return NextResponse.json({ status: 'error', message: 'Loan not found' }, { status: 404 });

        return NextResponse.json({
            status: 'success',
            data: loans[0]
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

        const { loan_id, amount, phone } = await request.json();

        // 1. Fetch Loan for Balance Check
        const [loans]: any = await pool.execute(
            `SELECT current_balance, total_payable FROM loans WHERE loan_id = ? AND member_id = ?`,
            [loan_id, session.id]
        );
        if (loans.length === 0) return NextResponse.json({ status: 'error', message: 'Loan not found' }, { status: 404 });
        
        const balance = parseFloat(loans[0].current_balance || loans[0].total_payable);
        if (amount > balance) {
            return NextResponse.json({ status: 'error', message: `Amount exceeds outstanding balance (KES ${balance})` }, { status: 400 });
        }

        // 2. Generate M-Pesa Refs
        const checkoutId = 'ws_CO_' + crypto.randomBytes(8).toString('hex');
        const ref = 'PAY-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        // 3. Initiate Request in DB (Status: pending)
        // In a real system, we'd call Daraja API here.
        await pool.execute(
            `INSERT INTO mpesa_requests (member_id, phone, amount, checkout_request_id, status, reference_no, created_at) 
             VALUES (?, ?, ?, ?, 'pending', ?, NOW())`,
            [session.id, phone, amount, checkoutId, ref]
        );

        // Pre-create some records like contributions or repayments with 'pending' status
        await pool.execute(
            `INSERT INTO contributions (member_id, contribution_type, amount, payment_method, reference_no, status, created_at) 
             VALUES (?, 'loan_repayment', ?, 'mpesa', ?, 'pending', NOW())`,
            [session.id, amount, ref]
        );

        return NextResponse.json({
            status: 'success',
            message: 'STK Push sent to your phone. Please enter your M-Pesa PIN to complete.',
            data: { checkoutId, ref }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
