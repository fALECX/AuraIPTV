import { useState, useEffect, useCallback } from 'react';

const MAX_SEARCH_HISTORY = 10;
const SEARCH_HISTORY_KEY = 'aura_search_history';

export function useSearchHistory() {
    const [searchHistory, setSearchHistory] = useState([]);

    // Load search history on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
            setSearchHistory(stored ? JSON.parse(stored) : []);
        } catch {
            setSearchHistory([]);
        }
    }, []);

    const addToSearchHistory = useCallback((query) => {
        if (!query || query.trim().length < 2) return;

        setSearchHistory(prev => {
            // Remove if already exists
            const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
            // Add to front
            const updated = [query, ...filtered];
            // Limit to max items
            const limited = updated.slice(0, MAX_SEARCH_HISTORY);
            // Save to localStorage
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
            return limited;
        });
    }, []);

    const removeFromSearchHistory = useCallback((query) => {
        setSearchHistory(prev => {
            const updated = prev.filter(item => item !== query);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearSearchHistory = useCallback(() => {
        localStorage.removeItem(SEARCH_HISTORY_KEY);
        setSearchHistory([]);
    }, []);

    return {
        searchHistory,
        addToSearchHistory,
        removeFromSearchHistory,
        clearSearchHistory,
    };
}

export default useSearchHistory;
