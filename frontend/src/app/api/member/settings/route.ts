import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const memberId = session.id;

        const [members]: any = await pool.execute(
            `SELECT full_name, email, phone, gender, address, member_reg_no, created_at FROM members WHERE member_id = ?`,
            [memberId]
        );

        if (members.length === 0) {
            return NextResponse.json({ status: 'error', message: 'Member not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: 'success',
            data: { member: members[0] }
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

        const memberId = session.id;
        const body = await request.json();
        const { action } = body;

        if (action === 'update_profile') {
            const { email, phone, gender, address } = body;
            await pool.execute(
                `UPDATE members SET email = ?, phone = ?, gender = ?, address = ? WHERE member_id = ?`,
                [email, phone, gender, address, memberId]
            );
            return NextResponse.json({ status: 'success', message: 'Profile updated successfully' });
        }

        if (action === 'change_password') {
            const { current_password, new_password } = body;

            const [users]: any = await pool.execute(`SELECT password FROM members WHERE member_id = ?`, [memberId]);
            const user = users[0];

            const match = await bcrypt.compare(current_password, user.password);
            if (!match) {
                return NextResponse.json({ status: 'error', message: 'Incorrect current password' }, { status: 400 });
            }

            if (new_password.length < 6) {
                return NextResponse.json({ status: 'error', message: 'Password must be at least 6 characters' }, { status: 400 });
            }

            const hashed = await bcrypt.hash(new_password, 10);
            await pool.execute(`UPDATE members SET password = ? WHERE member_id = ?`, [hashed, memberId]);

            return NextResponse.json({ status: 'success', message: 'Password changed successfully' });
        }

        return NextResponse.json({ status: 'error', message: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
