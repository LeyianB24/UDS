import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'all';
        const category = searchParams.get('category') || 'all';
        const q = searchParams.get('q') || '';
        const id = searchParams.get('id');

        // Fetch single ticket details
        if (id) {
            const [tickets] = await pool.execute<RowDataPacket[]>(`
                SELECT s.support_id, s.member_id, s.subject, s.message, s.status, s.created_at, s.attachment, s.category,
                CASE WHEN s.member_id > 0 THEN m.full_name ELSE 'System' END AS sender_name,
                CASE WHEN s.member_id > 0 THEN 'Member' ELSE 'Internal' END AS sender_role
                FROM support_tickets s
                LEFT JOIN members m ON s.member_id = m.member_id
                WHERE s.support_id = ?
            `, [id]);

            if (!tickets.length) {
                return NextResponse.json({ status: 'error', message: 'Ticket not found' }, { status: 404 });
            }

            const ticket = tickets[0];

            // Fetch replies
            const [replies] = await pool.execute<RowDataPacket[]>(`
                SELECT r.reply_id, r.message, r.sender_type, r.created_at, r.attachment,
                CASE WHEN r.sender_type = 'admin' THEN a.full_name ELSE m.full_name END AS sender_name
                FROM support_replies r
                LEFT JOIN admins a ON r.sender_id = a.admin_id AND r.sender_type = 'admin'
                LEFT JOIN members m ON r.sender_id = m.member_id AND r.sender_type = 'member'
                WHERE r.support_id = ?
                ORDER BY r.created_at ASC
            `, [id]);

            return NextResponse.json({
                status: 'success',
                data: { ticket, replies }
            });
        }

        // Fetch multiple tickets (list)
        let query = `
            SELECT s.support_id, s.member_id, s.subject, s.message, s.status, s.created_at, s.category,
            CASE WHEN s.member_id > 0 THEN m.full_name ELSE 'System' END AS sender_name,
            CASE WHEN s.member_id > 0 THEN 'Member' ELSE 'Internal' END AS sender_role
            FROM support_tickets s
            LEFT JOIN members m ON s.member_id = m.member_id
            WHERE 1=1
        `;
        const params: string[] = [];

        if (status !== 'all') {
            query += " AND s.status = ?";
            params.push(status);
        }

        if (category !== 'all') {
            query += " AND s.category = ?";
            params.push(category);
        }

        if (q) {
            query += " AND (s.subject LIKE ? OR s.message LIKE ? OR s.support_id LIKE ?)";
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }

        query += " ORDER BY s.created_at DESC";

        const [tickets] = await pool.execute<RowDataPacket[]>(query, params);

        // Stats
        const [statsRows] = await pool.execute<RowDataPacket[]>(`
            SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status='Open'    THEN 1 ELSE 0 END) as open,
            SUM(CASE WHEN status='Closed'  THEN 1 ELSE 0 END) as closed
            FROM support_tickets
        `);

        return NextResponse.json({
            status: 'success',
            data: {
                tickets,
                stats: {
                    total: parseInt(statsRows[0]?.total || 0),
                    pending: parseInt(statsRows[0]?.pending || 0),
                    open: parseInt(statsRows[0]?.open || 0),
                    closed: parseInt(statsRows[0]?.closed || 0),
                }
            }
        });

    } catch (error: unknown) {
        return NextResponse.json({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const admin_id = session.id;
        const body = await request.json();
        const { action } = body;

        if (action === 'reply') {
            const { support_id, message, status } = body;
            
            await pool.execute(
                `INSERT INTO support_replies (support_id, sender_id, sender_type, message, created_at) VALUES (?, ?, 'admin', ?, NOW())`,
                [support_id, admin_id, message]
            );

            if (status) {
                await pool.execute(`UPDATE support_tickets SET status = ? WHERE support_id = ?`, [status, support_id]);
            }

            return NextResponse.json({ status: 'success', message: 'Reply added successfully' });
        }

        if (action === 'update_status') {
            const { support_id, status } = body;
            await pool.execute(`UPDATE support_tickets SET status = ? WHERE support_id = ?`, [status, support_id]);
            return NextResponse.json({ status: 'success', message: 'Status updated successfully' });
        }

        return NextResponse.json({ status: 'error', message: 'Invalid action' }, { status: 400 });

    } catch (error: unknown) {
        return NextResponse.json({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
