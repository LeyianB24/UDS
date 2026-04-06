import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost/UDS/backend/api/v1/admin_loans.php';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const q = searchParams.get('q') || '';
    
    try {
        const response = await axios.get(`${BACKEND_URL}?status=${status}&q=${q}`, {
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
