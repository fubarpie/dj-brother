import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
        return new NextResponse('Path required', { status: 400 });
    }

    // Security check: ensure path is within the music directory
    const absolutePath = path.resolve(filePath);
    const musicDir = path.resolve(process.env.MUSIC_DIR || './music');

    if (!absolutePath.startsWith(musicDir)) {
        return new NextResponse('Access denied', { status: 403 });
    }

    if (!fs.existsSync(absolutePath)) {
        return new NextResponse('File not found', { status: 404 });
    }

    const stat = fs.statSync(absolutePath);
    const fileSize = stat.size;
    const range = req.headers.get('range');

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(absolutePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'audio/mpeg',
        };
        // @ts-ignore
        return new NextResponse(file, { status: 206, headers: head });
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mpeg',
        };
        const file = fs.createReadStream(absolutePath);
        // @ts-ignore
        return new NextResponse(file, { headers: head });
    }
}
