/** Utilities for persisted playback progress and watched state. */

const itemForProgress = (item) => item?.resumeItem || item;
const positionKey = (item) => item?.id ? `aura_pos_${item.id}` : null;
const durationKey = (item) => item?.id ? `aura_duration_${item.id}` : null;
const watchedKey = (item) => item?.id ? `aura_watched_${item.id}` : null;
const updatedKey = (item) => item?.id ? `aura_progress_updated_${item.id}` : null;

export const parseDurationSeconds = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value);
    if (typeof value !== 'string' || !value.trim()) return 0;
    if (/^\d+(\.\d+)?$/.test(value.trim())) return Number.parseFloat(value);

    const parts = value.split(':').map(part => Number.parseFloat(part));
    if (parts.some(Number.isNaN) || parts.length < 2 || parts.length > 3) return 0;
    return parts.reduce((total, part) => total * 60 + part, 0);
};

export const getWatchProgressDetails = (item) => {
    const progressItem = itemForProgress(item);
    if (!progressItem || progressItem.type === 'live') return null;

    const saved = localStorage.getItem(positionKey(progressItem));
    const position = Number.parseFloat(saved);
    const storedDuration = Number.parseFloat(localStorage.getItem(durationKey(progressItem)));
    const duration = storedDuration > 0 ? storedDuration : parseDurationSeconds(progressItem.duration);
    const explicitlyWatched = localStorage.getItem(watchedKey(progressItem)) === 'true';
    const percentage = explicitlyWatched
        ? 100
        : (duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0);
    const watched = explicitlyWatched || percentage >= 90;

    if ((!Number.isFinite(position) || position < 10) && !watched) return null;

    return {
        position: Number.isFinite(position) ? Math.max(0, position) : 0,
        duration,
        percentage,
        watched,
        updatedAt: Number.parseInt(localStorage.getItem(updatedKey(progressItem)), 10) || item?.lastWatchedAt || 0,
    };
};

export const getWatchProgress = (item) => getWatchProgressDetails(item)?.position ?? null;

export const getWatchProgressPercentage = (item, duration) => {
    const details = getWatchProgressDetails({ ...item, duration: duration || item?.duration });
    if (!details || details.percentage < 5 || details.percentage > 95) return null;
    return details.percentage;
};

export const saveWatchProgress = (item, position, duration = 0) => {
    if (!item?.id || item.type === 'live') return;
    const safePosition = Math.max(0, Number(position) || 0);
    const safeDuration = Math.max(0, Number(duration) || parseDurationSeconds(item.duration));
    localStorage.setItem(positionKey(item), String(safePosition));
    if (safeDuration > 0) localStorage.setItem(durationKey(item), String(safeDuration));
    localStorage.setItem(updatedKey(item), String(Date.now()));
    if (safeDuration > 0 && safePosition / safeDuration >= 0.9) {
        localStorage.setItem(watchedKey(item), 'true');
    }
};

export const markAsWatched = (item, duration = 0) => {
    if (!item?.id || item.type === 'live') return;
    localStorage.setItem(watchedKey(item), 'true');
    localStorage.setItem(updatedKey(item), String(Date.now()));
    const safeDuration = Math.max(0, Number(duration) || parseDurationSeconds(item.duration));
    if (safeDuration > 0) localStorage.setItem(durationKey(item), String(safeDuration));
};

export const clearWatchProgress = (item) => {
    const progressItem = itemForProgress(item);
    if (!progressItem) return;
    [positionKey(progressItem), durationKey(progressItem), updatedKey(progressItem)].forEach(key => {
        if (key) localStorage.removeItem(key);
    });
};

export const getContinueWatchingItems = (history, maxItems = 10) => {
    if (!Array.isArray(history)) return [];

    return history
        .filter(item => item && item.type !== 'live')
        .map(item => {
            const details = getWatchProgressDetails(item);
            return details && !details.watched ? {
                ...item,
                watchPosition: details.position,
                watchDuration: details.duration,
                progressPercentage: details.percentage,
                watched: details.watched,
                progressUpdatedAt: details.updatedAt,
            } : null;
        })
        .filter(Boolean)
        .sort((a, b) => (b.progressUpdatedAt || b.lastWatchedAt || 0) - (a.progressUpdatedAt || a.lastWatchedAt || 0))
        .slice(0, maxItems);
};

export const getHistoryForTab = (history, activeTab, maxItems = 10) => {
    const type = activeTab === 'movies' ? 'movie' : activeTab;
    if (!['live', 'movie', 'series'].includes(type) || !Array.isArray(history)) return [];

    return history
        .filter(item => item?.type === type)
        .map(item => {
            const details = getWatchProgressDetails(item);
            return details ? {
                ...item,
                watchPosition: details.position,
                watchDuration: details.duration,
                progressPercentage: details.percentage,
                watched: details.watched,
            } : item;
        })
        .slice(0, maxItems);
};

export const hasBeenWatched = (item) => getWatchProgressDetails(item)?.watched === true;
