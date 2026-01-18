import axios from 'axios';

const MUSICBRAINZ_URL = 'https://musicbrainz.org/ws/2';

export interface MBTrack {
    id: string;
    title: string;
    artist: string;
    album?: string;
}

export async function searchTracks(query: string): Promise<MBTrack[]> {
    try {
        const response = await axios.get(`${MUSICBRAINZ_URL}/recording`, {
            params: {
                query: `recording:"${query}" OR artist:"${query}"`,
                fmt: 'json',
                limit: 10
            },
            headers: {
                'User-Agent': 'DJBrother/1.0.0 ( contact@djbrother.app )'
            },
            timeout: 15000 // 15 seconds
        });

        return response.data.recordings.map((rec: any) => ({
            id: rec.id,
            title: rec.title,
            artist: rec['artist-credit']?.[0]?.name || 'Unknown Artist',
            album: rec.releases?.[0]?.title || 'Unknown Album'
        }));
    } catch (error) {
        console.error('MusicBrainz search error:', error);
        return [];
    }
}
