import { useRef } from 'react';

const DRAG_THRESHOLD_PX = 10;
const CLICK_SUPPRESSION_MS = 600;

export default function MediaCard({ item, onSelect, onPlay, showProgress = false }) {
    const progress = showProgress && item.watchPosition
        ? (item.watchPosition / (item.duration || 3600)) * 100
        : null;
    const longPressTimeout = useRef(null);
    const gesture = useRef(null);
    const suppressClickUntil = useRef(0);

    const clearLongPress = () => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
        }
    };

    const handleQuickPlay = () => {
        if (onPlay && item.type !== 'series') onPlay(item);
    };

    const handlePointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        gesture.current = {
            x: event.clientX,
            y: event.clientY,
            dragged: false,
            longPressed: false,
        };

        if (event.pointerType === 'touch' || event.pointerType === 'pen') {
            clearLongPress();
            longPressTimeout.current = setTimeout(() => {
                if (!gesture.current?.dragged) {
                    gesture.current.longPressed = true;
                    suppressClickUntil.current = Date.now() + CLICK_SUPPRESSION_MS;
                    handleQuickPlay();
                }
            }, 500);
        }
    };

    const handlePointerMove = (event) => {
        if (!gesture.current || gesture.current.dragged) return;
        const distance = Math.hypot(
            event.clientX - gesture.current.x,
            event.clientY - gesture.current.y,
        );
        if (distance >= DRAG_THRESHOLD_PX) {
            gesture.current.dragged = true;
            suppressClickUntil.current = Date.now() + CLICK_SUPPRESSION_MS;
            clearLongPress();
        }
    };

    const finishGesture = () => {
        clearLongPress();
        gesture.current = null;
    };

    const handleClick = (event) => {
        if (Date.now() < suppressClickUntil.current) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        onSelect?.(item);
    };

    return (
        <button
            type="button"
            className="media-card"
            aria-label={`${item.title}${item.type === 'live' ? ', live channel' : ''}`}
            onClick={handleClick}
            onContextMenu={(event) => {
                event.preventDefault();
                handleQuickPlay();
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishGesture}
            onPointerCancel={finishGesture}
            onLostPointerCapture={finishGesture}
        >
            <div className="media-card-img-wrap">
                <img
                    className="media-card-img"
                    src={item.poster}
                    alt=""
                    loading="lazy"
                    draggable="false"
                    onError={(event) => {
                        event.currentTarget.src = 'https://via.placeholder.com/400x600?text=No+Image';
                    }}
                />
                {item.type === 'live' && (
                    <div className="media-card-live-badge">
                        <span className="live-dot" /> LIVE
                    </div>
                )}
                {progress !== null && (
                    <div className="media-card-progress" style={{ width: `${Math.min(progress, 100)}%` }} />
                )}
            </div>
            <div className="media-card-title">{item.title}</div>
            <div className="media-card-meta">{item.genre} {item.year ? `· ${item.year}` : ''}</div>
        </button>
    );
}
