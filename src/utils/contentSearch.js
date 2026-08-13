const SEARCH_LIMITS = {
    live: 20,
    movies: 30,
    series: 20,
};

const SEARCH_SCOPES = {
    live: ['live'],
    movies: ['movies'],
    series: ['series'],
    home: ['live', 'movies', 'series'],
    settings: ['live', 'movies', 'series'],
};

export const mapLive = (stream) => ({
    id: `live_${stream.stream_id}`,
    stream_id: stream.stream_id,
    title: stream.name,
    genre: 'Live TV',
    type: 'live',
    poster: stream.stream_icon || 'https://via.placeholder.com/400x600?text=Live+TV',
    hero: stream.stream_icon,
    desc: 'Live TV Channel',
    added: parseInt(stream.added, 10) || 0,
    rating: 0,
});

export const mapVod = (video) => ({
    id: `vod_${video.stream_id}`,
    stream_id: video.stream_id,
    title: video.name,
    genre: 'Movie',
    rating: parseFloat(video.rating) || 0,
    year: video.year || '',
    type: 'movie',
    poster: video.stream_icon || 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
    hero: video.stream_icon,
    desc: video.name,
    added: parseInt(video.added, 10) || 0,
    extension: video.container_extension || 'mp4',
});

export const mapSeries = (series) => ({
    id: `series_${series.series_id}`,
    stream_id: series.series_id,
    title: series.name,
    genre: 'Series',
    rating: parseFloat(series.rating) || 0,
    year: series.year || '',
    type: 'series',
    poster: series.cover || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    hero: series.cover,
    desc: series.name,
    added: parseInt(series.last_modified, 10) || parseInt(series.added, 10) || 0,
    extension: series.container_extension || 'mp4',
});

const CONTENT_CONFIG = {
    live: { source: 'live', mapper: mapLive },
    movies: { source: 'vod', mapper: mapVod },
    series: { source: 'series', mapper: mapSeries },
};

export function searchContentForTab(rawData, activeTab, searchQuery) {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (query.length < 2) return [];

    const scopes = SEARCH_SCOPES[activeTab] || SEARCH_SCOPES.home;

    return scopes.flatMap((scope) => {
        const { source, mapper } = CONTENT_CONFIG[scope];
        const items = Array.isArray(rawData?.[source]) ? rawData[source] : [];

        return items
            .filter((item) => (item.name || '').toLocaleLowerCase().includes(query))
            .slice(0, SEARCH_LIMITS[scope])
            .map(mapper);
    });
}

export function getSearchCopy(activeTab) {
    switch (activeTab) {
        case 'live': return { label: 'Live TV', placeholder: 'Search live channels…' };
        case 'movies': return { label: 'Movies', placeholder: 'Search movies…' };
        case 'series': return { label: 'Series', placeholder: 'Search series…' };
        default: return { label: 'All content', placeholder: 'Search channels, movies and series…' };
    }
}

export function createDemoRawData(categories) {
    const byId = Object.fromEntries((categories || []).map((category) => [category.id, category.items || []]));
    return {
        live: (byId.live || []).map((item) => ({
            stream_id: item.stream_id || item.id,
            name: item.title,
            stream_icon: item.poster,
            category_id: 'demo',
            added: '0',
        })),
        vod: (byId.movies || []).map((item) => ({
            stream_id: item.stream_id || item.id,
            name: item.title,
            stream_icon: item.poster,
            category_id: 'demo',
            container_extension: item.extension || 'mp4',
            rating: item.rating,
            year: item.year,
            added: '0',
        })),
        series: (byId.series || []).map((item) => ({
            series_id: item.stream_id || item.id,
            name: item.title,
            cover: item.poster,
            category_id: 'demo',
            rating: item.rating,
            year: item.year,
            last_modified: '0',
        })),
    };
}
