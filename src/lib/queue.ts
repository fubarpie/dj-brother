import { prisma } from './prisma';
import { findInLibrary, downloadFromYouTube } from './downloader';

export async function addGuestRequest(title: string, artist: string, mbid: string, deviceId: string) {
    // 1. Check cooldown for device
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRequest = await prisma.request.findFirst({
        where: {
            deviceId,
            createdAt: { gte: tenMinutesAgo }
        }
    });

    if (recentRequest) {
        throw new Error('Please wait 10 minutes between requests.');
    }

    // 2. Check if already in queue or library
    const existingSong = await findInLibrary(title, artist);

    const request = await prisma.request.create({
        data: {
            title,
            artist,
            mbid,
            deviceId,
            status: existingSong ? 'READY' : 'PENDING'
        }
    });

    if (!existingSong) {
        // Start background download
        // We don't await this so the user gets a completion page quickly
        processDownload(request.id, title, artist);
    } else {
        // Add to actual play queue (the Song table)
        await queueSong(title, artist, existingSong, true);
    }

    return request;
}

async function processDownload(requestId: string, title: string, artist: string) {
    await prisma.request.update({
        where: { id: requestId },
        data: { status: 'DOWNLOADING' }
    });

    const filePath = await downloadFromYouTube(title, artist);

    if (filePath) {
        await prisma.request.update({
            where: { id: requestId },
            data: { status: 'READY' }
        });
        await queueSong(title, artist, filePath, true);
    } else {
        await prisma.request.update({
            where: { id: requestId },
            data: { status: 'FAILED' }
        });
    }
}

async function queueSong(title: string, artist: string, filePath: string, isRequest: boolean) {
    // Find the next available order index
    const lastSong = await prisma.song.findFirst({
        orderBy: { order: 'desc' }
    });
    const nextOrder = (lastSong?.order ?? 0) + 1;

    await prisma.song.create({
        data: {
            title,
            artist,
            filePath,
            isRequest,
            order: nextOrder
        }
    });
}

export async function getNextSongs(limit = 10) {
    return prisma.song.findMany({
        where: { playedAt: null },
        orderBy: { order: 'asc' },
        take: limit
    });
}

export async function markAsPlayed(songId: string) {
    return prisma.song.update({
        where: { id: songId },
        data: { playedAt: new Date() }
    });
}
