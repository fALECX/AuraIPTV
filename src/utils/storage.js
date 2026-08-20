/**
 * Simple storage utilities for profile data
 * Uses plain localStorage for simplicity
 */

const PROFILES_KEY = 'aura_profiles';
const LAST_USED_PROFILE_KEY = 'aura_last_used_profile';

export const getProfileId = (profile) => {
    if (!profile?.url || !profile?.username) return null;
    return `${profile.url.trim()}::${profile.username.trim()}`;
};

/**
 * Get stored profiles
 * @returns {Promise<Array>} Array of profile objects
 */
export const getStoredProfiles = async () => {
    const stored = localStorage.getItem(PROFILES_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to parse profiles:', error);
        return [];
    }
};

/**
 * Save profiles to storage
 * @param {Array} profiles - Array of profile objects
 */
export const saveStoredProfiles = async (profiles) => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

/**
 * Add a new profile
 * @param {Object} newProfile - New profile to add
 */
export const addProfile = async (newProfile) => {
    const profiles = await getStoredProfiles();

    // Check if profile already exists
    const existing = profiles.find(p => p.url === newProfile.url && p.username === newProfile.username);
    if (existing) return;

    const updated = [...profiles, { ...newProfile, name: newProfile.username || 'Account' }];
    await saveStoredProfiles(updated);
};

/** Remember which account should be connected automatically on a cold start. */
export const setLastUsedProfile = async (profile) => {
    const id = getProfileId(profile);
    if (id) localStorage.setItem(LAST_USED_PROFILE_KEY, id);
};

/** Resolve the last-used account against the current saved profiles. */
export const getLastUsedProfile = async (profiles = null) => {
    const id = localStorage.getItem(LAST_USED_PROFILE_KEY);
    if (!id) return null;
    const availableProfiles = profiles || await getStoredProfiles();
    return availableProfiles.find(profile => getProfileId(profile) === id) || null;
};

/**
 * Delete a profile by index
 * @param {number} index - Index of profile to delete
 */
export const deleteProfile = async (index) => {
    const profiles = await getStoredProfiles();
    const removedProfile = profiles[index];
    const updated = profiles.filter((_, i) => i !== index);
    await saveStoredProfiles(updated);
    if (getProfileId(removedProfile) === localStorage.getItem(LAST_USED_PROFILE_KEY)) {
        localStorage.removeItem(LAST_USED_PROFILE_KEY);
    }
};

/**
 * Get profile for use in app (no decryption needed)
 * @param {Object} profile - Profile object
 * @returns {Object} Profile as-is
 */
export const getDecryptedProfile = async (profile) => {
    return profile;
};

/**
 * Migrate function (no-op for plain localStorage)
 */
export const migrateToEncrypted = async () => {
    // No migration needed for plain localStorage
};
