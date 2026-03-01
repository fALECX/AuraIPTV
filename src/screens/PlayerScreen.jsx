import { useState, useEffect, useCallback } from 'react';
import './PlayerScreen.css';

const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const PlayFill = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>;
const PauseFill = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
const SkipBack = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" /></svg>;
const SkipFwd = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>;
const VolumeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>;
const CastIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8.5C5.6 5.4 9.6 3.5 14 3.5s8.4 1.9 12 5" /><path d="M5 12c2.4-2 5.4-3.2 9-3.2s6.6 1.2 9 3.2" /><path d="M8 15.5C9.4 14.5 11 14 13 14s3.6.5 5 1.5" /><circle cx="13" cy="19" r="2" /></svg>;
const FullscreenIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>;

function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
}

export default function PlayerScreen({ item, onBack }) {
    const [playing, setPlaying] = useState(true);
    const [progress, setProgress] = useState(12); // percentage 0–100
    const [showControls, setShowControls] = useState(true);
    const [duration] = useState(item?.type === 'live' ? null : 165 * 60); // 2h45 or null for live

    // Auto-hide controls after 4s of no interaction
    useEffect(() => {
        if (!showControls) return;
        const t = setTimeout(() => setShowControls(false), 4000);
        return () => clearTimeout(t);
    }, [showControls]);

    // Simulate playback progress
    useEffect(() => {
        if (!playing || item?.type === 'live') return;
        const t = setInterval(() => setProgress(p => Math.min(p + 0.05, 100)), 500);
        return () => clearInterval(t);
    }, [playing, item]);

    const tap = useCallback(() => setShowControls(v => !v), []);

    const currentSeconds = duration ? (progress / 100) * duration : 0;

    return (
        <div className="player-screen" onClick={tap}>
            {/* Simulated video frame using hero image */}
            <img
                className="player-video-bg"
                src={item?.hero || item?.poster}
                alt={item?.title}
                draggable={false}
            />

            {/* Controls Overlay */}
            <div className={`player-overlay ${showControls ? '' : 'hidden'}`} onClick={e => e.stopPropagation()}>
                {/* Top */}
                <div className="player-top">
                    <button className="player-back-btn" onClick={onBack}><BackIcon /></button>
                    <div className="player-title-block">
                        <div className="player-title">{item?.title}</div>
                        <div className="player-subtitle">{item?.genre} · {item?.year}</div>
                    </div>
                    {item?.type === 'live' && <div className="player-live-chip"><span className="player-live-dot" />LIVE</div>}
                    <button className="player-top-icon"><CastIcon /></button>
                    <button className="player-top-icon"><FullscreenIcon /></button>
                </div>

                {/* Center play controls */}
                <div className="player-center">
                    <button className="player-center-btn" onClick={() => setProgress(p => Math.max(0, p - 4))}>
                        <SkipBack />
                    </button>
                    <button className="player-main-play" onClick={() => setPlaying(v => !v)}>
                        {playing ? <PauseFill /> : <PlayFill />}
                    </button>
                    <button className="player-center-btn" onClick={() => setProgress(p => Math.min(100, p + 4))}>
                        <SkipFwd />
                    </button>
                </div>

                {/* Bottom glass controls */}
                <div className="player-bottom">
                    <div className="player-glass-controls">
                        {/* Progress */}
                        {item?.type !== 'live' && (
                            <>
                                <div className="player-time-row">
                                    <span className="player-time">{formatTime(currentSeconds)}</span>
                                    <span className="player-time">{formatTime(duration)}</span>
                                </div>
                                <div
                                    className="player-progress-wrap"
                                    onClick={e => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const pct = ((e.clientX - rect.left) / rect.width) * 100;
                                        setProgress(Math.max(0, Math.min(100, pct)));
                                    }}
                                >
                                    <div className="player-progress-fill" style={{ width: `${progress}%` }}>
                                        <div className="player-progress-thumb" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Bottom Row */}
                        <div className="player-controls-row">
                            {/* Volume */}
                            <div className="player-volume-row">
                                <button className="player-ctrl-btn"><VolumeIcon /></button>
                                <div className="player-volume-track">
                                    <div className="player-volume-fill" />
                                </div>
                            </div>

                            <button className="player-ctrl-btn">CC</button>
                            <button className="player-ctrl-btn">1×</button>
                            <button className="player-ctrl-btn">
                                <FullscreenIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
