'use client';

import { useState, useEffect } from 'react';
import '../globals.css';

interface Song {
    id: string;
    title: string;
    artist: string;
    isRequest: boolean;
    playedAt: string | null;
    status?: string;
}

export default function AdminPage() {
    const [queue, setQueue] = useState<Song[]>([]);
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const qRes = await fetch('/api/queue');
            const qData = await qRes.json();
            setQueue(qData);

            // We might need a separate API for all requests
            const rRes = await fetch('/api/admin/requests');
            if (rRes.ok) {
                const rData = await rRes.json();
                setRequests(rData);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="request-container" style={{ background: '#000' }}>
            <h1 className="song-title" style={{ fontSize: '3rem' }}>Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid #333' }}>Current Queue</h2>
                    {queue.length === 0 && <p>Queue is empty.</p>}
                    {queue.map((song, i) => (
                        <div key={song.id} style={{ padding: '0.5rem', background: song.isRequest ? '#1a1a1a' : '#0a0a0a', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{i + 1}. {song.title} - {song.artist}</span>
                            {song.isRequest && <span style={{ color: '#aaa', fontSize: '0.8rem' }}>(Request)</span>}
                        </div>
                    ))}
                </div>

                <div>
                    <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid #333' }}>Recent Guest Activity</h2>
                    {requests.map(req => (
                        <div key={req.id} style={{ padding: '0.5rem', borderBottom: '1px solid #222', fontSize: '0.9rem' }}>
                            <strong>{req.title}</strong> - {req.artist}
                            <div style={{ color: req.status === 'READY' ? 'green' : req.status === 'FAILED' ? 'red' : 'orange' }}>
                                Status: {req.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
