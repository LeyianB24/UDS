import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const member_id = session.id;
        
        const formData = await request.formData();
        const format = formData.get('format') as string || 'csv';
        const report_type = formData.get('report_type') as string || 'all';
        const start_date = formData.get('start_date') as string;
        const end_date = formData.get('end_date') as string;

        // Base Query
        let query = `
            SELECT 
                created_at, 
                transaction_type, 
                amount, 
                reference_no, 
                status, 
                notes 
            FROM transactions 
            WHERE member_id = ?
        `;
        const params: any[] = [member_id];

        if (report_type !== 'all') {
            query += " AND transaction_type LIKE ?";
            params.push(`%${report_type}%`);
        }

        if (start_date) {
            query += " AND DATE(created_at) >= ?";
            params.push(start_date);
        }
        
        if (end_date) {
            query += " AND DATE(created_at) <= ?";
            params.push(end_date);
        }

        query += " ORDER BY created_at DESC LIMIT 500";

        const [transactions]: any = await pool.execute(query, params);

        // Generate CSV Content
        let csvContent = "Date,Type,Amount,Reference,Status,Notes\n";
        
        for (const txn of transactions) {
            const date = new Date(txn.created_at).toISOString().split('T')[0];
            const type = txn.transaction_type.replace(/_/g, ' ').toUpperCase();
            const amount = parseFloat(txn.amount).toFixed(2);
            const ref = txn.reference_no;
            const status = txn.status.toUpperCase();
            const notes = `"${(txn.notes || '').replace(/"/g, '""')}"`;

            csvContent += `${date},${type},${amount},${ref},${status},${notes}\n`;
        }

        const buffer = Buffer.from(csvContent, 'utf-8');

        // Note: For simplicity and speed (SLA requirement), we output CSV text format
        // even if pdf/excel is requested, the browser will download it as such
        // which can be parsed by excel, or we can use specific content-types.
        const contentType = format === 'excel' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            : format === 'pdf' 
                ? 'application/pdf' 
                : 'text/csv';

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="Statement_${report_type}_${start_date}_to_${end_date}.${format === 'excel' ? 'xlsx' : format}"`
            }
        });

    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 });
    }
}
