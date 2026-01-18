import { NextRequest, NextResponse } from 'next/server';
import { getNextSongs, markAsPlayed } from '@/lib/queue';

export const dynamic = 'force-dynamic';

export async function GET() {
    const queue = await getNextSongs();
    return NextResponse.json(queue);
}

export async function PATCH(req: NextRequest) {
    const { id } = await req.json();
    await markAsPlayed(id);
    return NextResponse.json({ success: true });
}
