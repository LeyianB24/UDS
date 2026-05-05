import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Helper to generate member number
const generateMemberNo = async (): Promise<string> => {
    let unique = false;
    let regNo = '';
    while (!unique) {
        const rand = Math.floor(Math.random() * 90000) + 10000;
        regNo = `UDS-${rand}`;
        const [rows]: any = await pool.execute(`SELECT 1 FROM members WHERE member_reg_no = ?`, [regNo]);
        if (rows.length === 0) unique = true;
    }
    return regNo;
};

// Ensure upload dir exists
const getUploadDir = () => {
    const dir = path.join(process.cwd(), '..', 'uploads', 'kyc');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

export async function POST(request: Request) {
    let connection;
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        
        const full_name = formData.get('full_name') as string;
        const national_id = formData.get('national_id') as string;
        const phone = formData.get('phone') as string;
        const email = formData.get('email') as string;
        const address = formData.get('address') as string || '';
        const gender = formData.get('gender') as string || 'male';
        const password = formData.get('password') as string || 'password123';
        const dob = formData.get('dob') as string || null;
        const occupation = formData.get('occupation') as string || '';
        const nok_name = formData.get('nok_name') as string || '';
        const nok_phone = formData.get('nok_phone') as string || '';
        const payment_method = formData.get('payment_method') as string || 'cash';
        const is_paid = formData.get('is_paid') === 'true';

        if (!full_name || !national_id || !phone || !email) {
            return NextResponse.json({ status: 'error', message: 'All required fields must be filled in.' }, { status: 400 });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const reg_no = await generateMemberNo();
        const hashed = await bcrypt.hash(password, 10);
        const fee_status = is_paid ? 'paid' : 'unpaid';
        const status = is_paid ? 'active' : 'inactive';
        const kyc_status = 'not_submitted';

        const [result]: any = await connection.execute(
            `INSERT INTO members (member_reg_no, full_name, national_id, phone, email, address, gender, password, join_date, status, registration_fee_status, reg_fee_paid, dob, occupation, next_of_kin_name, next_of_kin_phone, kyc_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
            [reg_no, full_name, national_id, phone, email, address, gender, hashed, status, fee_status, is_paid ? 1 : 0, dob, occupation, nok_name, nok_phone, kyc_status]
        );

        const member_id = result.insertId;
        const uploadDir = getUploadDir();

        const filesToProcess = [
            { field: 'passport_photo', type: 'passport_photo' },
            { field: 'national_id_front', type: 'national_id_front' },
            { field: 'national_id_back', type: 'national_id_back' }
        ];

        let uploadedCount = 0;

        for (const fileDef of filesToProcess) {
            const file = formData.get(fileDef.field) as File | null;
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const ext = file.name.split('.').pop() || 'jpg';
                const filename = `${fileDef.type}_${member_id}_${Date.now()}.${ext}`;
                const filepath = path.join(uploadDir, filename);
                
                fs.writeFileSync(filepath, buffer);

                await connection.execute(
                    `INSERT INTO member_documents (member_id, document_type, file_path, status, verified_at) VALUES (?, ?, ?, 'verified', NOW())`,
                    [member_id, fileDef.type, filename]
                );
                uploadedCount++;
            }
        }

        if (uploadedCount > 0) {
            await connection.execute(`UPDATE members SET kyc_status = 'approved' WHERE member_id = ?`, [member_id]);
        }

        if (is_paid) {
            const ref = payment_method === 'cash' 
                ? 'CSH-' + Math.random().toString(36).substring(2, 8).toUpperCase() 
                : 'MPS-OFFICE';
            
            await connection.execute(
                `INSERT INTO transactions (member_id, amount, transaction_type, payment_channel, reference_no, notes, status, created_at, related_table, related_id)
                 VALUES (?, ?, 'income', ?, ?, ?, 'completed', NOW(), 'members', ?)`,
                [member_id, 1000.00, payment_method, ref, `Registration Fee for Member ${reg_no}`, member_id]
            );
        }

        await connection.commit();
        connection.release();

        return NextResponse.json({ 
            status: 'success', 
            message: `Member successfully registered with ID: ${reg_no}` 
        });

    } catch (error: unknown) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        return NextResponse.json({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
