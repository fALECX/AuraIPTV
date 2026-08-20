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
            videoRef.current.play().catch(() => { });
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
            <div className="mini-player-header">
                <span className="mini-player-title">{item?.title}</span>
                <div className="mini-player-actions">
                    <button
                        className="mini-player-btn"
                        onClick={(e) => { e.stopPropagation(); setPlaying(!playing); }}
                    >
                        {playing ? '⏸' : '▶'}
                    </button>
                    <button
                        className="mini-player-btn"
                        onClick={(e) => { e.stopPropagation(); onExpand(); }}
                    >
                        ⛶
                    </button>
                    <button
                        className="mini-player-btn mini-player-close"
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            <video
                ref={videoRef}
                className="mini-player-video"
                autoPlay
                playsInline
                muted
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
                onClick={(e) => { e.stopPropagation(); onExpand(); }}
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
