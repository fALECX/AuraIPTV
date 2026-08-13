import { useState, useCallback } from 'react';

const SETTINGS_KEY = 'aura_player_settings';

const DEFAULT_SETTINGS = {
    playbackSpeed: 1,
    preferredQuality: 'original', // 'original' | 'transcoded'
    autoPlayNext: true,
    keepScreenOn: true,
};

export function usePlayerSettings() {
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    const updateSettings = useCallback((updates) => {
        setSettings(prev => {
            const newSettings = { ...prev, ...updates };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            return newSettings;
        });
    }, []);

    const resetSettings = useCallback(() => {
        localStorage.removeItem(SETTINGS_KEY);
        setSettings(DEFAULT_SETTINGS);
    }, []);

    return {
        settings,
        updateSettings,
        resetSettings,
    };
}

export default usePlayerSettings;
