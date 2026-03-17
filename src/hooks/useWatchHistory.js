import { useState, useEffect, useCallback } from 'react';

const MAX_HISTORY_ITEMS = 20;

/**
 * Custom hook for managing watch history
 * Handles loading, adding, removing history with localStorage persistence
 */
export function useWatchHistory(credentials = null) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const getStorageKey = useCallback(() => {
        return credentials
            ? `aura_hist_${credentials.username}`
            : 'aura_hist_guest';
    }, [credentials]);

    // Load history on mount or when credentials change
    useEffect(() => {
        const loadHistory = () => {
            setLoading(true);
            try {
                const key = getStorageKey();
                const stored = localStorage.getItem(key);
                setHistory(stored ? JSON.parse(stored) : []);
            } catch (error) {
                console.error('Failed to load history:', error);
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [getStorageKey]);

    const addToHistory = useCallback((item) => {
        setHistory(prev => {
            // Remove if already exists (to move to front)
            let updated = prev.filter(h => h.id !== item.id);

            // Add to front
            updated.unshift(item);

            // Limit to max items
            if (updated.length > MAX_HISTORY_ITEMS) {
                updated = updated.slice(0, MAX_HISTORY_ITEMS);
            }

            localStorage.setItem(getStorageKey(), JSON.stringify(updated));
            return updated;
        });
    }, [getStorageKey]);

    const removeFromHistory = useCallback((itemId) => {
        setHistory(prev => {
            const updated = prev.filter(h => h.id !== itemId);
            localStorage.setItem(getStorageKey(), JSON.stringify(updated));
            return updated;
        });
    }, [getStorageKey]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(getStorageKey());
    }, [getStorageKey]);

    const getLastWatched = useCallback(() => {
        return history[0] || null;
    }, [history]);

    const isInHistory = useCallback((itemId) => {
        return history.some(h => h.id === itemId);
    }, [history]);

    return {
        history,
        loading,
        addToHistory,
        removeFromHistory,
        clearHistory,
        getLastWatched,
        isInHistory,
    };
}

export default useWatchHistory;
