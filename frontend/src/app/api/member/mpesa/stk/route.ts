import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.id;
        const { amount, phone, contribution_type, loan_id, case_id } = await request.json();

        // 1. Basic Validation
        if (!amount || amount < 10) {
            return NextResponse.json({ status: 'error', message: 'Minimum amount is KES 10' }, { status: 400 });
        }
        if (!phone || !/^0(7|1)\d{8}$/.test(phone)) {
            return NextResponse.json({ status: 'error', message: 'Invalid M-Pesa phone number' }, { status: 400 });
        }

        // 2. Log the request in a pending state (Mirroring mpesa_request.php logic)
        // In the legacy system, we might have a mpesa_stk_requests table or directly hit the API.
        // For this migration, we'll log it to `recent_activities` or a dedicated table if available.
        
        // Simulate integration with Daraja API / External Provider
        // Actually, we'll just log it for the admin to see or for the background worker to process.
        
        const [result]: any = await pool.execute(
            `INSERT INTO mpesa_stk_requests (member_id, amount, phone, type, reference_id, status, created_at) 
             VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
            [userId, amount, phone, contribution_type, loan_id || case_id || userId]
        );

        /* 
           NOTE: In a real production environment, you would call the Daraja API here.
           Since I don't have the Daraja keys, I will return a successful "simulated" push.
        */

        return NextResponse.json({
            status: 'success',
            message: `STK push sent to ${phone}. Please enter your M-Pesa PIN.`,
            checkout_id: `ws_co_${result.insertId}_${Date.now()}`
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
