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

        // Fetch messages for the member (either to them or from them)
        const [messages]: any = await pool.execute(
            `SELECT m.*, 
                    CASE 
                        WHEN m.from_admin_id IS NOT NULL THEN 'System Admin' 
                        ELSE 'Me' 
                    END as sender_name 
             FROM messages m 
             WHERE m.to_member_id = ? OR m.from_member_id = ? 
             ORDER BY m.created_at DESC 
             LIMIT 50`,
            [memberId, memberId]
        );

        const unreadCount = messages.filter((m: any) => m.to_member_id === memberId && !m.is_read).length;

        return NextResponse.json({
            status: 'success',
            data: {
                messages,
                unread_count: unreadCount
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

        const memberId = session.id;
        const { subject, body, to_admin_id } = await request.json();

        if (!body) {
            return NextResponse.json({ status: 'error', message: 'Message body is required' }, { status: 400 });
        }

        const adminId = to_admin_id || 1; // Default to admin 1

        const [result]: any = await pool.execute(
            `INSERT INTO messages (from_member_id, to_admin_id, subject, body, created_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [memberId, adminId, subject || 'No Subject', body]
        );

        return NextResponse.json({
            status: 'success',
            message: 'Message sent successfully',
            data: {
                message_id: result.insertId
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const memberId = session.id;
        const { message_id } = await request.json();

        if (!message_id) {
            return NextResponse.json({ status: 'error', message: 'Message ID is required' }, { status: 400 });
        }

        await pool.execute(
            `UPDATE messages SET is_read = 1 WHERE message_id = ? AND to_member_id = ?`,
            [message_id, memberId]
        );

        return NextResponse.json({
            status: 'success',
            message: 'Message marked as read'
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
