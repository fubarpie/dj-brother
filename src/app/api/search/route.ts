import { NextRequest, NextResponse } from 'next/server';
import { searchTracks } from '@/lib/musicbrainz';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const results = await searchTracks(query);
    return NextResponse.json(results);
}
