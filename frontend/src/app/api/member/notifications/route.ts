import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const memberId = session.id;

        const [notifications]: any = await pool.execute(
            `SELECT notification_id, title, message, is_read, created_at 
             FROM notifications WHERE member_id = ? 
             ORDER BY created_at DESC LIMIT 50`,
            [memberId]
        );

        return NextResponse.json({
            status: 'success',
            data: { notifications }
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

        if (action === 'mark_all_read') {
            await pool.execute(
                `UPDATE notifications SET is_read = 1 WHERE member_id = ? AND is_read = 0`,
                [memberId]
            );
            return NextResponse.json({ status: 'success', message: 'All notifications marked as read' });
        }

        return NextResponse.json({ status: 'error', message: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
