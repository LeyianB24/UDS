import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await logout();
        return NextResponse.json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { status: 'error', message: 'Internal server error during logout' },
            { status: 500 }
        );
    }
}
