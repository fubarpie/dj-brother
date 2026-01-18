import { NextRequest, NextResponse } from 'next/server';
import { addGuestRequest } from '@/lib/queue';

export async function POST(req: NextRequest) {
    try {
        const { title, artist, mbid } = await req.json();
        const deviceId = req.headers.get('x-device-id') || req.ip || 'unknown';

        const request = await addGuestRequest(title, artist, mbid, deviceId);
        return NextResponse.json(request);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
