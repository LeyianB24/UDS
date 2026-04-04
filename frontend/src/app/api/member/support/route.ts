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

        // Fetch ticket history
        const [tickets]: any = await pool.execute(
            `SELECT support_id, category, subject, status, created_at 
             FROM support_tickets WHERE member_id = ? 
             ORDER BY created_at DESC LIMIT 10`,
            [memberId]
        );

        // Calculate counts
        const openCount = tickets.filter((t: any) => t.status.toLowerCase() === 'pending').length;
        const resolvedCount = tickets.filter((t: any) => ['resolved', 'closed'].includes(t.status.toLowerCase())).length;

        return NextResponse.json({
            status: 'success',
            data: {
                tickets,
                counts: {
                    open: openCount,
                    resolved: resolvedCount,
                    total: tickets.length
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

        const memberId = session.id;
        const body = await request.json();
        const { category, subject, message, priority, reference_no } = body;

        if (!subject || !message) {
            return NextResponse.json({ status: 'error', message: 'Subject and message are required' }, { status: 400 });
        }

        // Simple routing logic based on PHP SUPPORT_ROUTING_MAP
        const routing: Record<string, string> = {
            loans: 'Loans Officer',
            savings: 'Savings Officer',
            shares: 'Shares Officer',
            welfare: 'Welfare Officer',
            withdrawals: 'Finance Officer',
            technical: 'IT Support',
            profile: 'Customer Relations',
            investments: 'Investment Officer',
            general: 'Superadmin'
        };

        const targetRole = routing[category] || 'Superadmin';
        
        // Find role ID
        const [roles]: any = await pool.execute(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [targetRole]);
        const assignedRoleId = roles.length > 0 ? roles[0].id : 1;

        const priorityPrefix = priority.toUpperCase() === 'NORMAL' ? '' : `[${priority.toUpperCase()}] `;
        const fullSubject = priorityPrefix + subject;
        const fullMessage = reference_no ? `${message}\n\nReference: ${reference_no}` : message;

        const [result]: any = await pool.execute(
            `INSERT INTO support_tickets (member_id, category, assigned_role_id, subject, message, status, created_at) 
             VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`,
            [memberId, category || 'general', assignedRoleId, fullSubject, fullMessage]
        );

        const ticketId = result.insertId;

        // Notifications
        await pool.execute(
            `INSERT INTO notifications (member_id, title, message, status, user_type, user_id, created_at) 
             VALUES (?, ?, ?, 'unread', 'member', ?, NOW())`,
            [memberId, `Ticket #${ticketId}`, `Ticket #${ticketId} submitted successfully.`, memberId]
        );

        return NextResponse.json({
            status: 'success',
            message: `Ticket #${ticketId} submitted.`,
            ticket_id: ticketId
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
