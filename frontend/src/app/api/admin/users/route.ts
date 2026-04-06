import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost/UDS/backend/api/v1/admin_users.php';

export async function GET(req: NextRequest) {
    try {
        const response = await axios.get(BACKEND_URL, {
            headers: {
                'Cookie': req.headers.get('cookie') || '',
            }
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await axios.post(BACKEND_URL, body, {
            headers: {
                'Cookie': req.headers.get('cookie') || '',
                'Content-Type': 'application/json'
            }
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
