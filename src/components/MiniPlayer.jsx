import { useState, useEffect, useRef } from 'react';
import { xtreamApi } from '../services/xtream';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import './MiniPlayer.css';

export default function MiniPlayer({ item, onExpand, onClose, onPlayNext }) {
    const [playing, setPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 16, y: 100 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const videoRef = useRef(null);

    const streamUrl = item?.type === 'live'
        ? xtreamApi.getLiveStreamUrl(item.stream_id, 'm3u8')
        : xtreamApi.getVodStreamUrl(item.stream_id, item?.extension || 'mp4');

    useHlsPlayer(videoRef, streamUrl);

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
        }
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragOffset.x,
            y: Math.max(0, e.clientY - dragOffset.y)
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

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
    }, [isDragging, dragOffset]);

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
