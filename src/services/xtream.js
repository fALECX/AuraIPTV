const parseUrl = (baseUrl) => {
    try {
        const url = new URL(baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`);
        return url.origin; // e.g., http://example.com:8080
    } catch (e) {
        return baseUrl;
    }
};

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
                this.cache.clear(); // Clear cache when logging in
                return { success: true, data };
            } else {
                return { success: false, error: 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Auth error:', error);
            return { success: false, error: 'Connection failed' };
        }
    }

    // Helper to make API calls with caching
    async _fetchAction(action, extraParams = '') {
        if (!this.username) throw new Error('Not authenticated');

        const cacheKey = `${action}${extraParams}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const url = `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=${action}${extraParams}`;

        const fetchPromise = fetch(url).then(async response => {
            if (!response.ok) throw new Error(`API failed for ${action}`);
            const data = await response.json();
            return data;
        }).catch(error => {
            this.cache.delete(cacheKey); // clear failed promises from cache
            throw error;
        });

        this.cache.set(cacheKey, fetchPromise);
        return fetchPromise;
    }

    // Categories
    async getLiveCategories() {
        return await this._fetchAction('get_live_categories');
    }

    async getVodCategories() {
        return await this._fetchAction('get_vod_categories');
    }

    async getSeriesCategories() {
        return await this._fetchAction('get_series_categories');
    }

    // Streams list
    async getLiveStreams(categoryId = null) {
        const params = categoryId ? `&category_id=${categoryId}` : '';
        return await this._fetchAction('get_live_streams', params);
    }

    async getVodStreams(categoryId = null) {
        const params = categoryId ? `&category_id=${categoryId}` : '';
        return await this._fetchAction('get_vod_streams', params);
    }

    async getSeries(categoryId = null) {
        const params = categoryId ? `&category_id=${categoryId}` : '';
        return await this._fetchAction('get_series', params);
    }

    // Individual info
    async getVodInfo(vodId) {
        return await this._fetchAction('get_vod_info', `&vod_id=${vodId}`);
    }

    async getSeriesInfo(seriesId) {
        return await this._fetchAction('get_series_info', `&series_id=${seriesId}`);
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
