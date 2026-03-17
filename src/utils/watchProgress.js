/**
 * Utility functions for managing watch progress
 */

export const getWatchProgress = (item) => {
    if (!item || item.type === 'live') return null;

    const key = `aura_pos_${item.id}`;
    const saved = localStorage.getItem(key);

    if (!saved) return null;

    const position = parseFloat(saved);
    if (isNaN(position) || position < 10) return null; // Less than 10 seconds doesn't count

    return position;
};

export const getWatchProgressPercentage = (item, duration) => {
    if (!item || !duration || item.type === 'live') return null;

    const position = getWatchProgress(item);
    if (!position) return null;

    const percentage = (position / duration) * 100;
    // Only return if between 5% and 95% (not just started, not finished)
    if (percentage < 5 || percentage > 95) return null;

    return percentage;
};

export const clearWatchProgress = (item) => {
    if (!item) return;
    const key = `aura_pos_${item.id}`;
    localStorage.removeItem(key);
};

export const getContinueWatchingItems = (history, maxItems = 10) => {
    if (!history || !Array.isArray(history)) return [];

    const itemsWithProgress = history
        .filter(item => item && item.type !== 'live') // Live TV doesn't have progress
        .map(item => {
            const position = getWatchProgress(item);
            return {
                ...item,
                watchPosition: position,
            };
        })
        .filter(item => item.watchPosition !== null) // Only items with progress
        .sort((a, b) => b.watchPosition - a.watchPosition) // Most recently watched first
        .slice(0, maxItems);

    return itemsWithProgress;
};
