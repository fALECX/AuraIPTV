import { useState, useEffect, useCallback, useRef } from 'react';
import { xtreamApi } from '../services/xtream';
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
    if (isNaN(s)) return "00:00";
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
}

export default function PlayerScreen({ item, onBack }) {
    const [playing, setPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [streamError, setStreamError] = useState(false);
    const [transcodeFallback, setTranscodeFallback] = useState(false);
    const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
    const videoRef = useRef(null);

    const currentExt = transcodeFallback ? 'm3u8' : (item?.extension || 'mp4');

    const streamUrl = item?.type === 'live'
        ? xtreamApi.getLiveStreamUrl(item.stream_id, 'm3u8')
        : item?.type === 'series'
            ? xtreamApi.getSeriesStreamUrl(item.stream_id, currentExt)
            : xtreamApi.getVodStreamUrl(item.stream_id, currentExt);

    // Auto-hide controls after 4s of no interaction
    useEffect(() => {
        if (!showControls) return;
        const t = setTimeout(() => setShowControls(false), 4000);
        return () => clearTimeout(t);
    }, [showControls, lastInteractionTime]);

    // Force controls visibility on orientation change to fix "unresponsive tap" bug
    useEffect(() => {
        const handleResize = () => {
            setShowControls(true);
        };
        window.addEventListener('orientationchange', handleResize);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('orientationchange', handleResize);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Handle Play / Pause
    useEffect(() => {
        if (videoRef.current && !streamError) {
            if (playing) {
                videoRef.current.play().catch(e => {
                    console.warn("Autoplay prevented or playback error:", e);
                    if (e.name === 'NotSupportedError') {
                        setStreamError(true);
                    }
                });
            } else {
                videoRef.current.pause();
            }
        }
    }, [playing, streamError]);

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        if (total > 0) {
            setProgress((current / total) * 100);
            setDuration(total);
        }
    };

    const seek = (timeChange) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime += timeChange;
    };

    const cycleSpeed = () => {
        const speeds = [1, 1.25, 1.5, 2];
        const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
        setPlaybackSpeed(nextSpeed);
        if (videoRef.current) {
            videoRef.current.playbackRate = nextSpeed;
        }
    };

    const toggleSubtitles = () => {
        if (!videoRef.current) return;
        const tracks = videoRef.current.textTracks;
        if (!tracks || tracks.length === 0) {
            alert("No subtitles available for this stream.");
            return;
        }

        let anyShowing = false;
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].mode === 'showing') {
                anyShowing = true;
                tracks[i].mode = 'hidden';
            }
        }

        if (!anyShowing) {
            // Pick the first available text track
            tracks[0].mode = 'showing';
            alert(`Subtitles Enabled: ${tracks[0].label || tracks[0].language || 'Track 1'}`);
        } else {
            alert("Subtitles Disabled");
        }
    };

    const cycleAudioTrack = () => {
        if (!videoRef.current) return;
        const tracks = videoRef.current.audioTracks;
        if (!tracks || tracks.length <= 1) {
            alert("No alternate audio tracks available for this stream.");
            return;
        }
        let currentIndex = -1;
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].enabled) currentIndex = i;
        }
        const nextIndex = (currentIndex + 1) % tracks.length;
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].enabled = (i === nextIndex);
        }
        alert(`Audio Track: ${tracks[nextIndex].label || tracks[nextIndex].language || `Track ${nextIndex + 1}`}`);
    };

    const tap = useCallback((e) => {
        setLastInteractionTime(Date.now());

        // Prevent toggle when clicking interactables directly
        const isInteractive = e.target.closest('button') || e.target.closest('.player-progress-wrap') || e.target.closest('.player-volume-track') || e.target.closest('.player-bottom');
        if (isInteractive) return;

        setShowControls(v => !v);
    }, []);

    const currentSeconds = duration ? (progress / 100) * duration : 0;

    return (
        <div className="player-screen" onClick={tap} style={{ background: '#000' }}>
            <video
                ref={videoRef}
                className="player-video-bg"
                src={streamUrl}
                autoPlay
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setPlaying(false)}
                onError={() => {
                    console.error("Video element triggered onError.");
                    setStreamError(true);
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 0, pointerEvents: 'none', display: streamError ? 'none' : 'block' }}
            />

            {/* Error Overlay */}
            {streamError && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: '#000', color: '#fff', flexDirection: 'column', padding: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>Playback Error</h3>
                    <p style={{ margin: '0 0 20px 0', color: 'rgba(255,255,255,0.7)', fontSize: '14px', maxWidth: '300px' }}>
                        This {item?.extension || 'mp4'} stream contains a codec your browser doesn't support natively (like HEVC), or the source link has expired.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={onBack}
                            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 24px', borderRadius: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}
                        >
                            <BackIcon /> Go Back
                        </button>
                        {!transcodeFallback && (
                            <button
                                onClick={() => {
                                    setTranscodeFallback(true);
                                    setStreamError(false);
                                    setPlaying(true);
                                    if (videoRef.current) {
                                        videoRef.current.load();
                                    }
                                }}
                                style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}
                            >
                                Try Transcoded Stream
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Controls Overlay */}
            <div className={`player-overlay ${showControls ? '' : 'hidden'}`}>
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
                    <button className="player-center-btn" onClick={() => seek(-15)}>
                        <SkipBack />
                    </button>
                    <button className="player-main-play" onClick={() => setPlaying(v => !v)}>
                        {playing ? <PauseFill /> : <PlayFill />}
                    </button>
                    <button className="player-center-btn" onClick={() => seek(15)}>
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
                                        const newTime = (pct / 100) * duration;
                                        if (videoRef.current) {
                                            videoRef.current.currentTime = newTime;
                                        }
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

                            <button className="player-ctrl-btn" onClick={cycleAudioTrack}>Audio</button>
                            <button className="player-ctrl-btn" onClick={toggleSubtitles}>CC</button>
                            <button className="player-ctrl-btn" onClick={cycleSpeed}>{playbackSpeed}×</button>
                            <button className="player-ctrl-btn" onClick={() => {
                                if (videoRef.current) {
                                    if (videoRef.current.requestFullscreen) {
                                        videoRef.current.requestFullscreen();
                                    } else if (videoRef.current.webkitRequestFullscreen) {
                                        videoRef.current.webkitRequestFullscreen();
                                    }
                                }
                            }}>
                                <FullscreenIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
