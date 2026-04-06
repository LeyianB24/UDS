import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost/UDS/backend/api/v1/admin_transactions.php';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const start = searchParams.get('start') || '';
    const end = searchParams.get('end') || '';
    
    try {
        const response = await axios.get(`${BACKEND_URL}?q=${q}&type=${type}&start=${start}&end=${end}`, {
            headers: {
                'Cookie': req.headers.get('cookie') || '',
            }
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
