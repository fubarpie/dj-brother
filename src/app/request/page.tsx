'use client';

import { useState, useEffect } from 'react';
import '../globals.css';

interface Track {
    id: string;
    title: string;
    artist: string;
}

export default function RequestPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState<number | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const lastRequest = localStorage.getItem('lastRequestTime');
        if (lastRequest) {
            const remaining = 10 * 60 * 1000 - (Date.now() - parseInt(lastRequest));
            if (remaining > 0) {
                setCooldown(remaining);
                const timer = setInterval(() => {
                    setCooldown(prev => (prev ? prev - 1000 : null));
                }, 1000);
                return () => clearInterval(timer);
            }
        }
    }, [success]);

    const search = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const submitRequest = async (track: Track) => {
        try {
            const res = await fetch('/api/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-device-id': getDeviceId()
                },
                body: JSON.stringify({
                    title: track.title,
                    artist: track.artist,
                    mbid: track.id
                })
            });

            if (res.ok) {
                setSuccess(true);
                localStorage.setItem('lastRequestTime', Date.now().toString());
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to submit request');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting request');
        }
    };

    const getDeviceId = () => {
        let id = localStorage.getItem('deviceId');
        if (!id) {
            id = Math.random().toString(36).substring(7);
            localStorage.setItem('deviceId', id);
        }
        return id;
    };

    const formatCooldown = (ms: number) => {
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    if (cooldown && cooldown > 0) {
        return (
            <div className="request-container success-message">
                <h1>Cooldown Active</h1>
                <p>You can make another request in:</p>
                <div className="countdown">{formatCooldown(cooldown)}</div>
                <p>Thanks for the music!</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="request-container success-message">
                <h1>Request Received! 🎧</h1>
                <p>Your song has been added to the automated DJ's queue. If it's available or can be found, it will play soon!</p>
                <button className="search-box" style={{ marginTop: '2rem' }} onClick={() => setSuccess(false)}>
                    Make another (after cooldown)
                </button>
            </div>
        );
    }

    return (
        <div className="request-container">
            <h1 className="song-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Request a Song</h1>
            <form onSubmit={search}>
                <input
                    type="text"
                    className="search-box"
                    placeholder="Search for a song or artist..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>

            {loading && <p>Searching MusicBrainz...</p>}

            <div className="results-list">
                {results.map(track => (
                    <div key={track.id} className="result-item" onClick={() => submitRequest(track)}>
                        <div className="result-title">{track.title}</div>
                        <div className="result-artist">{track.artist}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
