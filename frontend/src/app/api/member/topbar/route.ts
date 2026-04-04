import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            status: 'success',
            data: {
                profile: {
                    name: session.name,
                    gender: 'male' // Default fallback
                },
                unread: {
                    messages: 1,
                    notifications: 2
                },
                recent: {
                    messages: [
                        { message_id: 1, sender_name: 'Admin System', subject: 'Welcome to Umoja', sent_at: new Date().toISOString(), is_read: 0 }
                    ],
                    notifications: [
                        { notification_id: 1, message: 'Your login was highly successful.', created_at: new Date().toISOString(), status: 'unread' },
                        { notification_id: 2, message: 'Account sync complete across system.', created_at: new Date(Date.now() - 3600000).toISOString(), status: 'unread' }
                    ]
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
