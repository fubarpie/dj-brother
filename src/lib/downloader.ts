import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const MUSIC_DIR = process.env.MUSIC_DIR || './music';

export async function downloadFromYouTube(title: string, artist: string): Promise<string | null> {
    const query = `${title} ${artist} official audio`;
    const sanitizedTitle = title.replace(/[^\w\s]/gi, '');
    const sanitizedArtist = artist.replace(/[^\w\s]/gi, '');
    const fileName = `${sanitizedArtist} - ${sanitizedTitle}.mp3`;
    const filePath = path.join(MUSIC_DIR, fileName);

    if (!fs.existsSync(MUSIC_DIR)) {
        fs.mkdirSync(MUSIC_DIR, { recursive: true });
    }

    try {
        // Check if yt-dlp is installed
        try {
            await execAsync('yt-dlp --version');
        } catch {
            console.error('yt-dlp is not installed on this system. Please use Docker or install it locally.');
            return null;
        }

        // Search and download the best audio
        const command = `yt-dlp --extract-audio --audio-format mp3 --output "${filePath}" "ytsearch1:${query}"`;
        console.log(`Executing: ${command}`);
        await execAsync(command);

        return filePath;
    } catch (error) {
        console.error('Download error:', error);
        return null;
    }
}

export async function findInLibrary(title: string, artist: string): Promise<string | null> {
    // Simple check for file existence in music dir based on naming convention
    const sanitizedTitle = title.replace(/[^\w\s]/gi, '');
    const sanitizedArtist = artist.replace(/[^\w\s]/gi, '');
    const fileName = `${sanitizedArtist} - ${sanitizedTitle}.mp3`;
    const filePath = path.join(MUSIC_DIR, fileName);

    if (fs.existsSync(filePath)) {
        return filePath;
    }

    // Also check for partial matches or other formats if needed
    return null;
}
