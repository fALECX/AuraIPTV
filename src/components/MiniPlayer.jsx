import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { getPlaybackSources } from '../services/playback';
import { clearWatchProgress, getWatchProgress, markAsWatched, saveWatchProgress } from '../utils/watchProgress';
import './MiniPlayer.css';

export default function MiniPlayer({ item, onExpand, onClose, onPlayNext }) {
    const [playing, setPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 16, y: 100 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [useCompatibleSource, setUseCompatibleSource] = useState(false);
    const [muted, setMuted] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const hideTimer = useRef(null);
    const videoRef = useRef(null);
    const lastProgressSaveRef = useRef(0);

    const playbackSources = useMemo(() => getPlaybackSources({
        stream_id: item?.stream_id,
        type: item?.type,
        extension: item?.extension,
    }), [item?.extension, item?.stream_id, item?.type]);
    const streamUrl = useCompatibleSource ? playbackSources.compatible : playbackSources.original;

    const handlePlaybackError = useCallback(() => {
        if (!useCompatibleSource && playbackSources.compatible !== playbackSources.original) {
            setUseCompatibleSource(true);
        } else {
            setPlaying(false);
        }
    }, [playbackSources.compatible, playbackSources.original, useCompatibleSource]);

    useHlsPlayer(videoRef, streamUrl, {
        onFatalError: handlePlaybackError,
    });

    useEffect(() => setUseCompatibleSource(false), [item?.id]);

    useEffect(() => () => {
        const video = videoRef.current;
        if (item?.type !== 'live' && video?.currentTime > 5) {
            saveWatchProgress(item, video.currentTime, video.duration);
        }
    }, [item]);

    useEffect(() => {
        if (videoRef.current && playing) {
            videoRef.current.play().catch(() => {
                // Autoplay with sound can be blocked; fall back to muted playback
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    setMuted(true);
                    videoRef.current.play().catch(() => { });
                }
            });
        }
    }, [playing]);

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        if (total > 0) {
            setProgress((current / total) * 100);
            if (item.type !== 'live' && current - lastProgressSaveRef.current >= 5) {
                saveWatchProgress(item, current, total);
                lastProgressSaveRef.current = current;
            }
        }
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        const point = e.touches?.[0] || e;
        setPosition({
            x: point.clientX - dragOffset.x,
            y: Math.max(0, point.clientY - dragOffset.y)
        });
    }, [dragOffset.x, dragOffset.y, isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => () => clearTimeout(hideTimer.current), []);

    const revealControls = () => {
        setShowControls(true);
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    };

    if (!item) return null;

    return (
        <div
            className="mini-player"
            style={{
                left: position.x,
                top: position.y,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={(e) => {
                setIsDragging(true);
                setDragOffset({
                    x: e.touches[0].clientX - position.x,
                    y: e.touches[0].clientY - position.y
                });
            }}
        >
            <div className="mini-player-title-bar">
                <span className="mini-player-title">{item?.title}</span>
            </div>

            <div className={`mini-player-controls ${showControls || !playing ? 'visible' : ''}`}>
                <button
                    className="mini-player-btn mini-player-expand"
                    aria-label="Expand player"
                    onClick={(e) => { e.stopPropagation(); onExpand(); }}
                >
                    ⛶
                </button>
                <button
                    className="mini-player-btn mini-player-close"
                    aria-label="Close player"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                >
                    ✕
                </button>
                <button
                    className="mini-player-btn mini-player-play"
                    aria-label={playing ? 'Pause' : 'Play'}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (playing) videoRef.current?.pause();
                        setPlaying(!playing);
                        revealControls();
                    }}
                >
                    {playing ? '⏸' : '▶'}
                </button>
                <button
                    className="mini-player-btn mini-player-mute"
                    aria-label={muted ? 'Unmute' : 'Mute'}
                    onClick={(e) => { e.stopPropagation(); setMuted(!muted); revealControls(); }}
                >
                    {muted ? '🔇' : '🔊'}
                </button>
            </div>

            <video
                ref={videoRef}
                className="mini-player-video"
                autoPlay
                playsInline
                muted={muted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                    const saved = getWatchProgress(item);
                    if (videoRef.current && saved > 10) videoRef.current.currentTime = saved;
                }}
                onEnded={() => {
                    markAsWatched(item, videoRef.current?.duration);
                    clearWatchProgress(item);
                    setPlaying(false);
                    onPlayNext?.();
                }}
                onError={handlePlaybackError}
                onClick={(e) => { e.stopPropagation(); revealControls(); }}
            />

            <div
                className="mini-player-progress"
                style={{ width: `${progress}%` }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current) {
                        const rect = e.currentTarget.parentElement.getBoundingClientRect();
                        const pct = (e.clientX - rect.left) / rect.width;
                        videoRef.current.currentTime = pct * videoRef.current.duration;
                    }
                }}
            />
        </div>
    );
}
