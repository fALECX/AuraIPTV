const parseUrl = (baseUrl) => {
    try {
        const url = new URL(baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`);
        return url.origin; // e.g., http://example.com:8080
    } catch (_error) {
        return baseUrl;
    }
};

// Simple IndexedDB wrapper for large data storage
class CacheDB {
    constructor() {
        this.dbName = 'AuraIPTVCache';
        this.storeName = 'api_cache';
    }

    async _getDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    }

    async get(key) {
        try {
            const db = await this._getDB();
            return new Promise((resolve) => {
                const transaction = db.transaction(this.storeName, 'readonly');
                const request = transaction.objectStore(this.storeName).get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null);
            });
        } catch (_error) { return null; }
    }

    async set(key, value) {
        try {
            const db = await this._getDB();
            const transaction = db.transaction(this.storeName, 'readwrite');
            transaction.objectStore(this.storeName).put(value, key);
        } catch (error) { console.error('Cache set error:', error); }
    }

    async clear() {
        try {
            const db = await this._getDB();
            const transaction = db.transaction(this.storeName, 'readwrite');
            transaction.objectStore(this.storeName).clear();
        } catch (_error) { }
    }
}

const cacheDB = new CacheDB();

class XtreamService {
    constructor() {
        this.baseUrl = '';
        this.username = '';
        this.password = '';
        this.userInfo = null;
        this.cache = new Map();
    }

    setCredentials(url, username, password) {
        this.baseUrl = parseUrl(url);
        this.username = username;
        this.password = password;
    }

    async authenticate(url, username, password) {
        const cleanUrl = parseUrl(url);
        const apiUrl = `${cleanUrl}/player_api.php?username=${username}&password=${password}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.user_info && data.user_info.auth === 1) {
                this.setCredentials(url, username, password);
                this.userInfo = data.user_info;
                // Note: We don't clear persistent cache on login, 
                // but we clear in-memory cache
                this.cache.clear();
                return { success: true, data };
            } else {
                return { success: false, error: 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Auth error:', error);
            return { success: false, error: 'Connection failed' };
        }
    }

    // Helper to make API calls with persistent caching
    async _fetchAction(action, extraParams = '', onUpdate = null) {
        if (!this.username) throw new Error('Not authenticated');

        const accountKey = `${this.baseUrl}_${this.username}`;
        const cacheKey = `${accountKey}_${action}${extraParams}`;

        // 1. Try In-Memory Cache (Live data or pending promise)
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            // If it's a resolved value and we have an update callback, trigger background refresh
            if (!(cached instanceof Promise) && onUpdate) {
                this._backgroundFetch(action, extraParams, cacheKey, onUpdate);
            }
            return cached;
        }

        // 2. Try Persistent Cache (IndexedDB)
        const persistentData = await cacheDB.get(cacheKey);
        if (persistentData) {
            // Save to memory cache so subsequent calls get it instantly
            this.cache.set(cacheKey, persistentData);

            // Background fetch to refresh the data
            if (onUpdate) {
                this._backgroundFetch(action, extraParams, cacheKey, onUpdate);
            } else {
                // Even without onUpdate, we refresh it silently
                this._backgroundFetch(action, extraParams, cacheKey, null);
            }
            return persistentData;
        }

        // 3. Normal Fetch (First time)
        const fetchPromise = this._executeFetch(action, extraParams, cacheKey);
        this.cache.set(cacheKey, fetchPromise);
        return fetchPromise;
    }

    async _executeFetch(action, extraParams, cacheKey) {
        const url = `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=${action}${extraParams}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API failed for ${action}`);
            const data = await response.json();

            // Save to persistent cache
            cacheDB.set(cacheKey, data);

            // Save to memory cache as resolved data
            this.cache.set(cacheKey, data);
            return data;
        } catch (error) {
            this.cache.delete(cacheKey);
            throw error;
        }
    }

    async _backgroundFetch(action, extraParams, cacheKey, onUpdate) {
        try {
            const data = await this._executeFetch(action, extraParams, cacheKey);
            if (onUpdate) onUpdate(data);
        } catch (_error) {
            console.warn('Background refresh failed:', action);
        }
    }

    // Categories
    async getLiveCategories(onUpdate = null) {
        return await this._fetchAction('get_live_categories', '', onUpdate);
    }

    async getVodCategories(onUpdate = null) {
        return await this._fetchAction('get_vod_categories', '', onUpdate);
    }

    async getSeriesCategories(onUpdate = null) {
        return await this._fetchAction('get_series_categories', '', onUpdate);
    }

    // Streams list
    async getLiveStreams(categoryId = null, onUpdate = null) {
        const params = categoryId ? `&category_id=${categoryId}` : '';
        return await this._fetchAction('get_live_streams', params, onUpdate);
    }

    async getVodStreams(categoryId = null, onUpdate = null) {
        const params = categoryId ? `&category_id=${categoryId}` : '';
        return await this._fetchAction('get_vod_streams', params, onUpdate);
    }

    async getSeries(categoryId = null, onUpdate = null) {
        const params = categoryId ? `&category_id=${categoryId}` : '';
        return await this._fetchAction('get_series', params, onUpdate);
    }

    // Individual info
    async getVodInfo(vodId, onUpdate = null) {
        return await this._fetchAction('get_vod_info', `&vod_id=${vodId}`, onUpdate);
    }

    async getSeriesInfo(seriesId, onUpdate = null) {
        return await this._fetchAction('get_series_info', `&series_id=${seriesId}`, onUpdate);
    }

    // Stream URLs Builder
    getLiveStreamUrl(streamId, extension = 'm3u8') {
        return `${this.baseUrl}/live/${this.username}/${this.password}/${streamId}.${extension}`;
    }

    getVodStreamUrl(streamId, extension = 'mp4') {
        return `${this.baseUrl}/movie/${this.username}/${this.password}/${streamId}.${extension}`;
    }

    getSeriesStreamUrl(streamId, extension = 'mp4') {
        return `${this.baseUrl}/series/${this.username}/${this.password}/${streamId}.${extension}`;
    }
}

export const xtreamApi = new XtreamService();
