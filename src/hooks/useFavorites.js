import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing favorites
 * Handles loading, adding, removing favorites with localStorage persistence
 */
export function useFavorites(credentials = null) {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const getStorageKey = useCallback(() => {
        return credentials
            ? `aura_favs_${credentials.username}`
            : 'aura_favs_guest';
    }, [credentials]);

    // Load favorites on mount or when credentials change
    useEffect(() => {
        const loadFavorites = () => {
            setLoading(true);
            try {
                const key = getStorageKey();
                const stored = localStorage.getItem(key);
                setFavorites(stored ? JSON.parse(stored) : []);
            } catch (error) {
                console.error('Failed to load favorites:', error);
                setFavorites([]);
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, [getStorageKey]);

    const addFavorite = useCallback((item) => {
        setFavorites(prev => {
            // Don't add if already exists
            if (prev.some(f => f.id === item.id)) return prev;

            const updated = [...prev, item];
            localStorage.setItem(getStorageKey(), JSON.stringify(updated));
            return updated;
        });
    }, [getStorageKey]);

    const removeFavorite = useCallback((itemId) => {
        setFavorites(prev => {
            const updated = prev.filter(f => f.id !== itemId);
            localStorage.setItem(getStorageKey(), JSON.stringify(updated));
            return updated;
        });
    }, [getStorageKey]);

    const toggleFavorite = useCallback((item) => {
        const isFavorite = favorites.some(f => f.id === item.id);
        if (isFavorite) {
            removeFavorite(item.id);
        } else {
            addFavorite(item);
        }
        return !isFavorite;
    }, [favorites, addFavorite, removeFavorite]);

    const isFavorite = useCallback((itemId) => {
        return favorites.some(f => f.id === itemId);
    }, [favorites]);

    const clearFavorites = useCallback(() => {
        setFavorites([]);
        localStorage.removeItem(getStorageKey());
    }, [getStorageKey]);

    return {
        favorites,
        loading,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearFavorites,
    };
}

export default useFavorites;
