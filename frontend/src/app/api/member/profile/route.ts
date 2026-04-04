import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'member') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const memberId = session.id;

        // Fetch member data
        const [members]: any = await pool.execute(`SELECT * FROM members WHERE member_id = ?`, [memberId]);
        if (members.length === 0) return NextResponse.json({ status: 'error', message: 'Member not found' }, { status: 404 });
        
        const member = members[0];

        // Fetch KYC docs
        const [docs]: any = await pool.execute(`SELECT * FROM member_documents WHERE member_id = ?`, [memberId]);

        // Registration fee txn
        const [feeTxns]: any = await pool.execute(
            `SELECT * FROM transactions WHERE member_id = ? AND (transaction_type = 'registration_fee' OR description LIKE '%Registration%') ORDER BY created_at DESC LIMIT 1`,
            [memberId]
        );

        // Convert profile_pic blob to Base64 if exists
        let profilePic = null;
        if (member.profile_pic) {
            profilePic = `data:image/jpeg;base64,${member.profile_pic.toString('base64')}`;
        }

        // Clean sensitive/heavy data for JSON
        const safeMember = { ...member };
        delete safeMember.profile_pic;
        delete safeMember.password;

        return NextResponse.json({
            status: 'success',
            data: {
                member: safeMember,
                profile_pic: profilePic,
                documents: docs,
                fee_txn: feeTxns[0] || null
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
        const formData = await request.formData();
        
        const action = formData.get('action') as string;

        if (action === 'update_profile') {
            const email = formData.get('email') as string;
            const phone = formData.get('phone') as string;
            const address = formData.get('address') as string;
            const dob = formData.get('dob') as string;
            const occupation = formData.get('occupation') as string;
            const nok_name = formData.get('nok_name') as string;
            const nok_phone = formData.get('nok_phone') as string;
            const removePic = formData.get('remove_pic') === 'true';
            const profilePicFile = formData.get('profile_pic') as File | null;

            let picData: any = undefined; // undefined means don't update column

            if (removePic) {
                picData = null;
            } else if (profilePicFile && profilePicFile.size > 0) {
                const buffer = Buffer.from(await profilePicFile.arrayBuffer());
                picData = buffer;
            }

            let sql = `UPDATE members SET email=?, phone=?, address=?, dob=?, occupation=?, next_of_kin_name=?, next_of_kin_phone=?`;
            const params: any[] = [email, phone, address, dob, occupation, nok_name, nok_phone];

            if (picData !== undefined) {
                sql += `, profile_pic=?`;
                params.push(picData);
            }

            sql += ` WHERE member_id=?`;
            params.push(memberId);

            await pool.execute(sql, params);

            return NextResponse.json({ status: 'success', message: 'Profile updated successfully' });
        }

        if (action === 'upload_kyc') {
            const docType = formData.get('doc_type') as string;
            const file = formData.get('kyc_doc') as File;

            if (!file || file.size === 0) return NextResponse.json({ status: 'error', message: 'No file uploaded' }, { status: 400 });

            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = path.extname(file.name);
            const fileName = `${docType}_${memberId}_${Date.now()}${ext}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'kyc');

            // Ensure directory exists
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, fileName), buffer);

            // DB update
            await pool.execute(
                `INSERT INTO member_documents (member_id, document_type, file_path, status) 
                 VALUES (?, ?, ?, 'pending') 
                 ON DUPLICATE KEY UPDATE file_path=VALUES(file_path), status='pending', uploaded_at=NOW()`,
                [memberId, docType, fileName]
            );

            // Update kyc_status on member if not already something else
            await pool.execute(
                `UPDATE members SET kyc_status='pending' WHERE member_id=? AND kyc_status='not_submitted'`,
                [memberId]
            );

            return NextResponse.json({ status: 'success', message: 'Document uploaded and awaiting review' });
        }

        return NextResponse.json({ status: 'error', message: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
