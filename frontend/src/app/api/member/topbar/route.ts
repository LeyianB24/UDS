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

        // Fetch profile picture, gender, name from members table
        const [memberRows] = await pool.execute(
            'SELECT full_name, gender, profile_pic FROM members WHERE member_id = ?',
            [memberId]
        ) as any[];

        const member = memberRows[0] || {};

        // Convert BLOB profile_pic to base64 string if it exists
        let picBase64: string | null = null;
        if (member.profile_pic && Buffer.isBuffer(member.profile_pic)) {
            picBase64 = member.profile_pic.toString('base64');
        }

        // Fetch unread messages count
        const [msgRows] = await pool.execute(
            `SELECT COUNT(*) as cnt FROM messages 
             WHERE member_id = ? AND is_read = 0`,
            [memberId]
        ) as any[];

        // Fetch unread notifications count
        const [notifRows] = await pool.execute(
            `SELECT COUNT(*) as cnt FROM notifications 
             WHERE member_id = ? AND status = 'unread'`,
            [memberId]
        ) as any[];

        // Fetch recent messages (last 5)
        const [recentMsgs] = await pool.execute(
            `SELECT message_id, sender_name, subject, body, sent_at, is_read 
             FROM messages WHERE member_id = ? ORDER BY sent_at DESC LIMIT 5`,
            [memberId]
        ) as any[];

        // Fetch recent notifications (last 5)
        const [recentNotifs] = await pool.execute(
            `SELECT notification_id, message, created_at, status 
             FROM notifications WHERE member_id = ? ORDER BY created_at DESC LIMIT 5`,
            [memberId]
        ) as any[];

        return NextResponse.json({
            status: 'success',
            data: {
                profile: {
                    name: member.full_name || session.name || 'Member',
                    gender: member.gender || 'male',
                    pic: picBase64,
                },
                unread: {
                    messages: msgRows[0]?.cnt || 0,
                    notifications: notifRows[0]?.cnt || 0,
                },
                recent: {
                    messages: recentMsgs || [],
                    notifications: recentNotifs || [],
                }
            }
        });
    } catch (error: any) {
        // If DB tables don't exist yet, return safe defaults rather than crashing
        const session = await getSession().catch(() => null);
        return NextResponse.json({
            status: 'success',
            data: {
                profile: {
                    name: session?.name || 'Member',
                    gender: 'male',
                    pic: null,
                },
                unread: { messages: 0, notifications: 0 },
                recent: { messages: [], notifications: [] }
            }
        });
    }
}
