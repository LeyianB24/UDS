import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.id;

        // 1. Fetch Profile Data (Names, Pic)
        const [user]: any = await pool.execute(
            `SELECT first_name, last_name, avatar as pic, gender 
             FROM members WHERE member_id = ?`,
            [userId]
        );
        const userData = user[0] || { first_name: 'Member', last_name: '', pic: null, gender: 'male' };
        const fullName = `${userData.first_name} ${userData.last_name}`.trim();

        // 2. Fetch Unread Counts
        const [unreadMsg]: any = await pool.execute(
            `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0`,
            [userId]
        );
        const [unreadNot]: any = await pool.execute(
            `SELECT COUNT(*) as count FROM notifications WHERE member_id = ? AND status = 'unread'`,
            [userId]
        );

        // 3. Fetch Recent Notifications (Top 5)
        const [notifications]: any = await pool.execute(
            `SELECT notification_id, message, status, created_at 
             FROM notifications WHERE member_id = ? 
             ORDER BY created_at DESC LIMIT 5`,
            [userId]
        );

        // 4. Fetch Recent Messages (Top 5)
        const [messages]: any = await pool.execute(
            `SELECT m.message_id, m.subject, m.body, m.sent_at, m.is_read, 'Support' as sender_name
             FROM messages m
             WHERE m.receiver_id = ?
             ORDER BY m.sent_at DESC LIMIT 5`,
            [userId]
        );

        return NextResponse.json({
            status: 'success',
            data: {
                profile: {
                    name: fullName,
                    pic: userData.pic,
                    gender: userData.gender
                },
                unread: {
                    messages: unreadMsg[0]?.count || 0,
                    notifications: unreadNot[0]?.count || 0
                },
                recent: {
                    messages: messages,
                    notifications: notifications
                }
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
