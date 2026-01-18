'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './globals.css';

interface Song {
  id: string;
  title: string;
  artist: string;
  filePath: string;
}

export default function Billboard() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [nextSong, setNextSong] = useState<Song | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [requestUrl, setRequestUrl] = useState('');
  const [mounted, setMounted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<HTMLAudioElement | null>(null);
  const nextSourceRef = useRef<HTMLAudioElement | null>(null);
  const currentGainRef = useRef<GainNode | null>(null);
  const nextGainRef = useRef<GainNode | null>(null);

  const CROSSFADE_TIME = 5; // seconds

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    setRequestUrl(`${window.location.origin}/request`);
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchQueue();
    return () => clearInterval(timer);
  }, []);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (data && data.length > 0) {
        if (!currentSong) {
          setCurrentSong(data[0]);
          if (data.length > 1) setNextSong(data[1]);
        } else {
          setNextSong(data.find((s: Song) => s.id !== currentSong.id) || null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch queue', err);
    }
  };

  const playSong = (song: Song) => {
    initAudio();
    const ctx = audioContextRef.current!;

    const audio = new Audio(`/api/stream?path=${encodeURIComponent(song.filePath)}`);
    audio.crossOrigin = "anonymous";
    const source = ctx.createMediaElementSource(audio);
    const gain = ctx.createGain();

    source.connect(gain);
    gain.connect(ctx.destination);

    audio.play();

    // Set up crossfade check
    audio.ontimeupdate = () => {
      if (audio.duration - audio.currentTime < CROSSFADE_TIME && !nextSourceRef.current && nextSong) {
        startCrossfade();
      }
    };

    audio.onended = () => {
      onSongEnd(song.id);
    };

    currentSourceRef.current = audio;
    currentGainRef.current = gain;
  };

  const startCrossfade = () => {
    if (!nextSong) return;

    const ctx = audioContextRef.current!;
    const nextAudio = new Audio(`/api/stream?path=${encodeURIComponent(nextSong.filePath)}`);
    nextAudio.crossOrigin = "anonymous";
    const nextSource = ctx.createMediaElementSource(nextAudio);
    const nextGain = ctx.createGain();

    nextSource.connect(nextGain);
    nextGain.connect(ctx.destination);

    // Fade out current
    if (currentGainRef.current) {
      currentGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + CROSSFADE_TIME);
    }

    // Fade in next
    nextGain.gain.setValueAtTime(0, ctx.currentTime);
    nextGain.gain.linearRampToValueAtTime(1, ctx.currentTime + CROSSFADE_TIME);

    nextAudio.play();

    // Transition refs
    nextSourceRef.current = nextAudio;
    nextGainRef.current = nextGain;

    // After crossfade, swap current and next
    setTimeout(() => {
      if (currentSourceRef.current) {
        currentSourceRef.current.pause();
      }
      setCurrentSong(nextSong);
      setNextSong(null);
      currentSourceRef.current = nextSourceRef.current;
      currentGainRef.current = nextGainRef.current;
      nextSourceRef.current = null;
      nextGainRef.current = null;
      fetchQueue();
    }, CROSSFADE_TIME * 1000);
  };

  const onSongEnd = async (id: string) => {
    await fetch('/api/queue', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  };

  // Start initial playback on guest interaction (browsers require interaction)
  const handleStart = () => {
    if (currentSong && !currentSourceRef.current) {
      playSong(currentSong);
    }
  };

  return (
    <main className="billboard-container" onClick={handleStart}>
      <div className="billboard-header">
        <span>DJ Brother</span>
        <span>{mounted && time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}</span>
      </div>

      <div className="billboard-content">
        {currentSong ? (
          <>
            <h1 className="song-title">{currentSong.title}</h1>
            <h2 className="artist-name">{currentSong.artist}</h2>
            {!currentSourceRef.current && (
              <p style={{ marginTop: '2rem', opacity: 0.5 }}>Click to start the music</p>
            )}
          </>
        ) : (
          <h1 className="song-title">Awaiting Requests...</h1>
        )}
      </div>

      <div className="billboard-footer">
        <div className="qr-code-wrapper">
          {requestUrl && <QRCodeSVG value={requestUrl} size={160} />}
        </div>
        <div className="footer-text">
          <p>Scan to request the next track.</p>
          <p>One request per device every 10 mins.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.6rem' }}>{requestUrl}</p>
        </div>
      </div>
    </main>
  );
}
