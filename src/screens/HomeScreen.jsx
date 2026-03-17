import { useState, useEffect, useRef, useMemo } from 'react';
import { FEATURED, MOCK_CATEGORIES } from '../data/mockData';
import './Skeleton.css';
import { xtreamApi } from '../services/xtream';
import './HomeScreen.css';
import { toast } from '../components/Toast';
import { getStoredProfiles, saveStoredProfiles } from '../utils/storage';
import { getContinueWatchingItems } from '../utils/watchProgress';
import ConfirmModal from '../components/ConfirmModal';
import InlineEditModal from '../components/InlineEditModal';

const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const PlayFill = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
);
const HomeIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);
const TvIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" />
    </svg>
);
const FilmIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" />
    </svg>
);
const SettingsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);
const SeriesIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" ry="2" />
        <line x1="12" y1="7" x2="12" y2="17" />
    </svg>
);
const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const HeartIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);
const ClockIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

function MediaCard({ item, onSelect, onPlay, showProgress = false }) {
    const progress = showProgress && item.watchPosition ? (item.watchPosition / (item.duration || 3600)) * 100 : null;
    const longPressTimeout = useRef(null);

    const handleQuickPlay = () => {
        if (onPlay && item.type !== 'series') {
            onPlay(item);
        }
    };

    return (
        <div
            className="media-card"
            onClick={() => onSelect(item)}
            onContextMenu={(e) => {
                e.preventDefault();
                handleQuickPlay();
            }}
            onTouchStart={(e) => {
                longPressTimeout.current = setTimeout(() => {
                    handleQuickPlay();
                }, 500);
            }}
            onTouchEnd={() => {
                if (longPressTimeout.current) {
                    clearTimeout(longPressTimeout.current);
                }
            }}
        >
            <div className="media-card-img-wrap">
                <img className="media-card-img" src={item.poster} alt={item.title} loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x600?text=No+Image' }} />
                {item.type === 'live' && (
                    <div className="media-card-live-badge">
                        <span className="live-dot" /> LIVE
                    </div>
                )}
                {progress !== null && (
                    <div className="media-card-progress" style={{ width: `${Math.min(progress, 100)}%` }} />
                )}
            </div>
            <div className="media-card-title">{item.title}</div>
            <div className="media-card-meta">{item.genre} {item.year ? `· ${item.year}` : ''}</div>
        </div>
    );
}

const mapLive = (s) => ({
    id: `live_${s.stream_id}`,
    stream_id: s.stream_id,
    title: s.name,
    genre: 'Live TV',
    type: 'live',
    poster: s.stream_icon || 'https://via.placeholder.com/400x600?text=Live+TV',
    hero: s.stream_icon,
    desc: 'Live TV Channel',
    added: parseInt(s.added) || 0,
    rating: 0
});

const mapVod = (v) => ({
    id: `vod_${v.stream_id}`,
    stream_id: v.stream_id,
    title: v.name,
    genre: 'Movie',
    rating: parseFloat(v.rating) || 0,
    year: v.year || '',
    type: 'movie',
    poster: v.stream_icon || 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
    hero: v.stream_icon,
    desc: v.name,
    added: parseInt(v.added) || 0,
    extension: v.container_extension || 'mp4'
});

const mapSeries = (s) => ({
    id: `series_${s.series_id}`,
    stream_id: s.series_id,
    title: s.name,
    genre: 'Series',
    rating: parseFloat(s.rating) || 0,
    year: s.year || '',
    type: 'series',
    poster: s.cover || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    hero: s.cover,
    desc: s.name,
    added: parseInt(s.last_modified) || parseInt(s.added) || 0,
    extension: s.container_extension || 'mp4'
});

export default function HomeScreen({ onSelectItem, onPlay, activeTab, setActiveTab, credentials, selectedCategoryIds, setSelectedCategoryIds, onLogout, onUpdateCredentials }) {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [streamCategories, setStreamCategories] = useState([]);
    const [streams, setStreams] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [history, setHistory] = useState([]);

    // Search & Filter State
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [sortOrder, setSortOrder] = useState('default');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    const [showChannelInput, setShowChannelInput] = useState(false);
    const [channelNumber, setChannelNumber] = useState('');

    // Settings modal state
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
    const [editField, setEditField] = useState(null); // { field, label, value }

    const rawData = useRef({ live: [], vod: [], series: [] });

    // Load initial home data & Favorites
    useEffect(() => {
        let mounted = true;

        const favKey = credentials ? `aura_favs_${credentials.username}` : 'aura_favs_guest';
        setFavorites(JSON.parse(localStorage.getItem(favKey) || '[]'));

        const histKey = credentials ? `aura_hist_${credentials.username}` : 'aura_hist_guest';
        setHistory(JSON.parse(localStorage.getItem(histKey) || '[]'));

        // Load search history
        try {
            const searchHist = localStorage.getItem('aura_search_history');
            setSearchHistory(searchHist ? JSON.parse(searchHist) : []);
        } catch { }

        const updateState = (live, vods, series) => {
            if (!mounted) return;
            const liveArr = Array.isArray(live) ? live : [];
            const vodArr = Array.isArray(vods) ? vods : [];
            const seriesArr = Array.isArray(series) ? series : [];

            rawData.current = { live: liveArr, vod: vodArr, series: seriesArr };

            const homeCats = [];
            if (liveArr.length > 0) homeCats.push({ id: 'live', title: 'Top Live Channels', items: liveArr.slice(0, 30).map(mapLive) });
            if (vodArr.length > 0) homeCats.push({ id: 'movies', title: 'Top Movies', items: vodArr.slice(0, 30).map(mapVod) });
            if (seriesArr.length > 0) homeCats.push({ id: 'series', title: 'Top Series', items: seriesArr.slice(0, 30).map(mapSeries) });

            if (homeCats.length > 0) setCategories(homeCats);
            setLoading(false);
        };

        const loadHome = async () => {
            try {
                const [live, vods, series] = await Promise.all([
                    xtreamApi.getLiveStreams(null, (newData) => updateState(newData, rawData.current.vod, rawData.current.series)),
                    xtreamApi.getVodStreams(null, (newData) => updateState(rawData.current.live, newData, rawData.current.series)),
                    xtreamApi.getSeries(null, (newData) => updateState(rawData.current.live, rawData.current.vod, newData))
                ]);
                updateState(live, vods, series);
            } catch (err) {
                console.error(err);
                if (mounted) {
                    setCategories(MOCK_CATEGORIES);
                    setLoading(false);
                }
            }
        };
        loadHome();
        return () => { mounted = false; };
    }, []);

    // Load sub-tab categories
    useEffect(() => {
        if (activeTab === 'home' || activeTab === 'settings') return;

        const updateCats = (cats, rawList) => {
            if (!Array.isArray(rawList)) rawList = [];
            const counts = {};
            rawList.forEach(item => {
                if (item.category_id) counts[item.category_id] = (counts[item.category_id] || 0) + 1;
            });
            const categoriesWithCounts = cats.map(c => ({ ...c, count: counts[c.category_id] || 0 }));
            setStreamCategories([
                { category_id: 'all', category_name: 'All', count: rawList.length },
                ...categoriesWithCounts
            ]);
            const initial = activeTab === 'live' ? rawList.slice(0, 50).map(mapLive)
                : activeTab === 'movies' ? rawList.slice(0, 50).map(mapVod)
                    : rawList.slice(0, 50).map(mapSeries);
            setStreams(initial);
        };

        const loadCategories = async () => {
            setLoading(true);
            try {
                let cats = [], rawList = [];
                if (activeTab === 'live') {
                    [cats, rawList] = await Promise.all([
                        xtreamApi.getLiveCategories((newData) => updateCats(newData, rawList)),
                        xtreamApi.getLiveStreams(null, (newData) => updateCats(cats, newData))
                    ]);
                } else if (activeTab === 'movies') {
                    [cats, rawList] = await Promise.all([
                        xtreamApi.getVodCategories((newData) => updateCats(newData, rawList)),
                        xtreamApi.getVodStreams(null, (newData) => updateCats(cats, newData))
                    ]);
                } else if (activeTab === 'series') {
                    [cats, rawList] = await Promise.all([
                        xtreamApi.getSeriesCategories((newData) => updateCats(newData, rawList)),
                        xtreamApi.getSeries(null, (newData) => updateCats(cats, newData))
                    ]);
                }
                updateCats(cats, rawList);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        loadCategories();
    }, [activeTab]);

    // Filter by category (local)
    useEffect(() => {
        if (!rawData.current || (activeTab === 'home' || activeTab === 'settings')) return;
        setLoading(true);
        try {
            let localData = [], mapFn = null;
            if (activeTab === 'live') { localData = rawData.current.live; mapFn = mapLive; }
            else if (activeTab === 'movies') { localData = rawData.current.vod; mapFn = mapVod; }
            else if (activeTab === 'series') { localData = rawData.current.series; mapFn = mapSeries; }

            const filtered = selectedCategoryIds.length === 0
                ? localData.slice(0, 150)
                : localData.filter(item => selectedCategoryIds.includes(String(item.category_id)));

            setStreams(filtered.map(mapFn));
        } catch (e) {
            console.error('Error filtering:', e);
        } finally {
            setLoading(false);
        }
    }, [selectedCategoryIds, activeTab]);

    const sortedStreams = useMemo(() => {
        let result = [...streams];
        switch (sortOrder) {
            case 'az': return result.sort((a, b) => a.title.localeCompare(b.title));
            case 'za': return result.sort((a, b) => b.title.localeCompare(a.title));
            case 'newest': return result.sort((a, b) => b.added - a.added);
            case 'oldest': return result.sort((a, b) => a.added - b.added);
            case 'rating': return result.sort((a, b) => b.rating - a.rating);
            default: return result;
        }
    }, [streams, sortOrder]);

    const currentCategoryName = useMemo(() => {
        if (selectedCategoryIds.length === 0) return 'All';
        if (selectedCategoryIds.length === 1) {
            const cat = streamCategories.find(c => c.category_id === selectedCategoryIds[0]);
            return cat ? cat.category_name : 'Custom';
        }
        return `Multi (${selectedCategoryIds.length})`;
    }, [streamCategories, selectedCategoryIds]);

    // Debounced Search
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) { setSearchResults([]); return; }
        const timer = setTimeout(() => {
            const query = searchQuery.toLowerCase();
            const { live, vod, series } = rawData.current;
            setSearchResults([
                ...live.filter(i => (i.name || '').toLowerCase().includes(query)).slice(0, 20).map(mapLive),
                ...vod.filter(i => (i.name || '').toLowerCase().includes(query)).slice(0, 30).map(mapVod),
                ...series.filter(i => (i.name || '').toLowerCase().includes(query)).slice(0, 20).map(mapSeries),
            ]);
            // Save to search history
            const currentHist = JSON.parse(localStorage.getItem('aura_search_history') || '[]');
            const filtered = currentHist.filter(h => h.toLowerCase() !== query);
            const updated = [searchQuery, ...filtered].slice(0, 10);
            localStorage.setItem('aura_search_history', JSON.stringify(updated));
            setSearchHistory(updated);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleClearCache = async () => {
        try {
            // Clear IndexedDB
            const req = indexedDB.open('AuraIPTVCache', 1);
            req.onsuccess = (e) => {
                const db = e.target.result;
                const tx = db.transaction('api_cache', 'readwrite');
                tx.objectStore('api_cache').clear();
            };
            // Also clear in-memory cache
            xtreamApi.cache?.clear?.();
            toast.success('Cache cleared successfully');
        } catch {
            toast.error('Failed to clear cache');
        }
        setShowClearCacheConfirm(false);
    };

    const handleChannelInput = (num) => {
        if (num === 'clear') {
            setChannelNumber('');
            return;
        }
        const newNum = channelNumber + num;
        if (newNum.length > 4) return; // Max 4 digits
        setChannelNumber(newNum);

        // Find and play the channel
        const channelIndex = parseInt(newNum) - 1;
        const allStreams = rawData.current.live || [];
        if (channelIndex >= 0 && channelIndex < allStreams.length) {
            const channel = mapLive(allStreams[channelIndex]);
            setShowChannelInput(false);
            setChannelNumber('');
            onPlay(channel);
        }
    };

    const handleSaveField = async (value) => {
        if (!editField) return;
        onUpdateCredentials(editField.field, value);
        // Persist to saved profiles using the same storage API as SetupScreen
        const profiles = await getStoredProfiles();
        const updated = profiles.map(p =>
            p.username === credentials?.username
                ? { ...p, [editField.field]: value }
                : p
        );
        await saveStoredProfiles(updated);
        toast.success(`${editField.label} updated`);
        setEditField(null);
    };

    return (
        <div className="home-screen page-enter">
            <div className="home-topbar">
                <div className="home-topbar-logo">
                    <div className="home-topbar-logo-mark">
                        <svg viewBox="0 0 32 32" fill="none">
                            <polygon points="13,10 24,16 13,22" fill="white" />
                        </svg>
                    </div>
                    <span className="home-topbar-logo-name">Aura</span>
                </div>
                <div className="home-topbar-actions">
                    <button className="topbar-icon-btn" aria-label="Search" onClick={() => setIsSearchActive(true)}>
                        <SearchIcon />
                    </button>
                </div>
            </div>

            {isSearchActive ? (
                <div className="search-overlay">
                    <div className="search-input-wrapper">
                        <div className="search-field-container">
                            <span className="search-icon-inside"><SearchIcon /></span>
                            <input
                                autoFocus
                                className="search-input-field"
                                type="text"
                                placeholder="Search channels, movies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="search-close-btn" onClick={() => { setIsSearchActive(false); setSearchQuery(''); }}>
                            <XIcon />
                        </button>
                    </div>

                    <div className="search-results">
                        {searchQuery.length >= 2 ? (
                            searchResults.length > 0 ? (
                                searchResults.map(item => (
                                    <MediaCard key={item.id} item={item} onSelect={onSelectItem} onPlay={onPlay} />
                                ))
                            ) : (
                                <div className="no-results">No results found for "{searchQuery}"</div>
                            )
                        ) : (
                            <>
                                {searchHistory.length > 0 && (
                                    <div className="search-history-section">
                                        <div className="search-history-header">
                                            <span>Recent Searches</span>
                                            <button onClick={() => { localStorage.removeItem('aura_search_history'); setSearchHistory([]); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12 }}>Clear</button>
                                        </div>
                                        {searchHistory.map((term, idx) => (
                                            <div key={idx} className="search-history-item" onClick={() => setSearchQuery(term)}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                <span>{term}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="no-results">Type at least 2 characters to search...</div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {activeTab === 'home' && (
                        <div className="home-greeting">
                            <h2>Good Evening</h2>
                            <p>What would you like to watch?</p>
                        </div>
                    )}

                    {(activeTab === 'live' || activeTab === 'movies' || activeTab === 'series') && (
                        <div className="filter-bar">
                            {activeTab === 'live' && (
                                <button className="filter-btn" onClick={() => setShowChannelInput(true)}>
                                    <span># Channel</span>
                                </button>
                            )}
                            <button className="filter-btn" onClick={() => setIsCategoryModalOpen(true)}>
                                <span>Category: {currentCategoryName}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                            <button className="filter-btn" onClick={() => setIsSortModalOpen(true)}>
                                <span>Sort: {sortOrder.toUpperCase()}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="home-scroll" style={{ overflow: 'hidden' }}>
                            <div className="category-section">
                                <div className="skeleton skeleton-title" />
                                <div className="category-slider">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-card" />)}
                                </div>
                            </div>
                            <div className="category-section">
                                <div className="skeleton skeleton-title" />
                                <div className="category-slider">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-card" />)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="home-scroll">
                            {activeTab === 'home' ? (
                                <>
                                    {/* Continue Watching - shows items with progress */}
                                    {(() => {
                                        const continueWatching = getContinueWatchingItems(history, 10);
                                        return continueWatching.length > 0 ? (
                                            <div className="category-section">
                                                <div className="category-header">
                                                    <span className="category-title">Continue Watching</span>
                                                </div>
                                                <div className="category-slider">
                                                    {continueWatching.map(item => (
                                                        <MediaCard key={`continue-${item.id}`} item={item} onSelect={onSelectItem} onPlay={onPlay} showProgress={true} />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* Recently Watched */}
                                    <div className="category-section">
                                        <div className="category-header">
                                            <span className="category-title">Recently Watched</span>
                                            {history.length > 0 && (
                                                <span className="category-see-all" onClick={() => {
                                                    const histKey = credentials ? `aura_hist_${credentials.username}` : 'aura_hist_guest';
                                                    localStorage.removeItem(histKey);
                                                    setHistory([]);
                                                    toast.success('Watch history cleared');
                                                }}>Clear</span>
                                            )}
                                        </div>
                                        {history.length > 0 ? (
                                            <div className="category-slider">
                                                {history.map(item => (
                                                    <MediaCard key={`hist-${item.id}`} item={item} onSelect={onSelectItem} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-section-placeholder">
                                                <ClockIcon />
                                                <span>No recently watched content</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* My Favorites */}
                                    <div className="category-section">
                                        <div className="category-header">
                                            <span className="category-title">My Favorites</span>
                                        </div>
                                        {favorites.length > 0 ? (
                                            <div className="category-slider">
                                                {favorites.map(item => (
                                                    <MediaCard key={item.id} item={item} onSelect={onSelectItem} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-section-placeholder">
                                                <HeartIcon />
                                                <span>No favorites yet — tap the heart on any title</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="featured-hero" onClick={() => onSelectItem(FEATURED)}>
                                        <img className="featured-hero-img" src={FEATURED.hero} alt={FEATURED.title} />
                                        <div className="featured-hero-gradient" />
                                        <div className="featured-hero-badge">✦ Featured</div>
                                        <div className="featured-hero-content">
                                            <div>
                                                <div className="featured-hero-title">{FEATURED.title}</div>
                                                <div className="featured-hero-meta">{FEATURED.genre} · {FEATURED.year} · ⭐ {FEATURED.rating}</div>
                                            </div>
                                            <button className="featured-hero-play" onClick={e => { e.stopPropagation(); onPlay(FEATURED); }}>
                                                <PlayFill />
                                            </button>
                                        </div>
                                    </div>
                                    {categories.map(cat => (
                                        <div key={cat.id} className="category-section">
                                            <div className="category-header">
                                                <span className="category-title">{cat.title}</span>
                                                <span className="category-see-all" onClick={() => { setActiveTab(cat.id === 'movies' ? 'movies' : cat.id === 'series' ? 'series' : 'live'); setSelectedCategoryIds([]); }}>See all →</span>
                                            </div>
                                            <div className="category-slider">
                                                {cat.items.map(item => (
                                                    <MediaCard key={item.id} item={item} onSelect={onSelectItem} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : activeTab === 'settings' ? (
                                <div className="settings-view page-enter">
                                    <div className="settings-header">
                                        <h2>Settings</h2>
                                    </div>

                                    <div className="settings-group">
                                        <div className="settings-item" onClick={() => setEditField({ field: 'username', label: 'Account Name', value: credentials?.username || '' })}>
                                            <div className="settings-item-label">Account Name</div>
                                            <div className="settings-item-value">{credentials?.username} <span style={{ opacity: 0.5, fontSize: 12 }}>✎</span></div>
                                        </div>
                                        <div className="settings-item" onClick={() => setEditField({ field: 'url', label: 'Server URL', value: credentials?.url || '' })}>
                                            <div className="settings-item-label">Server URL</div>
                                            <div className="settings-item-value" style={{ fontSize: 12, maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {credentials?.url} <span style={{ opacity: 0.5 }}>✎</span>
                                            </div>
                                        </div>
                                        <div className="settings-item">
                                            <div className="settings-item-label">Account Status</div>
                                            <div className="settings-item-value" style={{ color: '#10b981' }}>Active</div>
                                        </div>
                                    </div>

                                    <div className="settings-group">
                                        <div className="settings-item">
                                            <div className="settings-item-label">App Theme</div>
                                            <div className="settings-item-value">Night Mode</div>
                                        </div>
                                        <div className="settings-item">
                                            <div className="settings-item-label">Stream Quality</div>
                                            <div className="settings-item-value">Auto</div>
                                        </div>
                                        <div className="settings-item" onClick={() => setShowClearCacheConfirm(true)}>
                                            <div className="settings-item-label">Clear App Cache</div>
                                            <div className="settings-item-value" style={{ fontSize: 16 }}>›</div>
                                        </div>
                                    </div>

                                    <div className="settings-group">
                                        <div className="settings-item" onClick={() => setShowLogoutConfirm(true)}>
                                            <div className="settings-item-label" style={{ color: '#ef4444' }}>Log Out & Switch Profile</div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 40, opacity: 0.5, fontSize: 12, textAlign: 'center' }}>
                                        Aura IPTV v1.0.0<br />
                                        Premium UI Edition
                                    </div>
                                </div>
                            ) : (
                                <div className={`category-grid grid-${activeTab}`}>
                                    {sortedStreams.length > 0 ? (
                                        sortedStreams.map(item => (
                                            <MediaCard key={item.id} item={item} onSelect={onSelectItem} />
                                        ))
                                    ) : (
                                        <div className="no-results">No content available in this category</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <nav className="bottom-nav">
                {[
                    { id: 'home', label: 'Home', Icon: HomeIcon },
                    { id: 'live', label: 'Live TV', Icon: TvIcon },
                    { id: 'movies', label: 'Movies', Icon: FilmIcon },
                    { id: 'series', label: 'Series', Icon: SeriesIcon },
                    { id: 'settings', label: 'Settings', Icon: SettingsIcon },
                ].map(({ id, label, Icon }) => (
                    <div key={id} className={`nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
                        <Icon active={activeTab === id} />
                        <span className="nav-item-label">{label}</span>
                    </div>
                ))}
            </nav>

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="filter-overlay-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
                    <div className="filter-overlay-content category-modal" onClick={e => e.stopPropagation()}>
                        <div className="filter-overlay-header">
                            <h3>Select Category</h3>
                            <button className="filter-overlay-close" onClick={() => setIsCategoryModalOpen(false)}><XIcon /></button>
                        </div>
                        <div className="filter-overlay-list" style={{ paddingBottom: '70px' }}>
                            {streamCategories.map(cat => {
                                const isAll = cat.category_id === 'all';
                                const isActive = isAll ? selectedCategoryIds.length === 0 : selectedCategoryIds.includes(cat.category_id);
                                return (
                                    <div
                                        key={cat.category_id}
                                        className={`filter-overlay-item ${isActive ? 'active' : ''}`}
                                        onClick={() => {
                                            if (isAll) setSelectedCategoryIds([]);
                                            else setSelectedCategoryIds(prev =>
                                                prev.includes(cat.category_id)
                                                    ? prev.filter(id => id !== cat.category_id)
                                                    : [...prev, cat.category_id]
                                            );
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>{cat.category_name}</span>
                                            {cat.count !== undefined && <span style={{ opacity: 0.5, fontSize: '0.85em', marginLeft: 8 }}>({cat.count})</span>}
                                        </div>
                                        {isActive && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'var(--bg-panel)', borderTop: '1px solid var(--glass-border)' }}>
                            <button className="btn-primary" onClick={() => setIsCategoryModalOpen(false)} style={{ width: '100%', padding: '14px', borderRadius: '12px' }}>
                                View {streams.length > 0 ? streams.length : ''} titles
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Channel Number Input Modal */}
            {showChannelInput && (
                <div className="filter-overlay-backdrop" onClick={() => { setShowChannelInput(false); setChannelNumber(''); }}>
                    <div className="channel-input-modal" onClick={e => e.stopPropagation()}>
                        <div className="channel-input-display">{channelNumber || '0'}</div>
                        <div className="channel-input-grid">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'go'].map(key => (
                                <button
                                    key={key}
                                    className={`channel-input-btn ${key === 'clear' ? 'clear' : ''} ${key === 'go' ? 'go' : ''}`}
                                    onClick={() => {
                                        if (key === 'go') {
                                            handleChannelInput('');
                                        } else if (key === 'clear') {
                                            setChannelNumber('');
                                        } else {
                                            handleChannelInput(key);
                                        }
                                    }}
                                >
                                    {key === 'clear' ? 'C' : key === 'go' ? '▶' : key}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sort Modal */}
            {isSortModalOpen && (
                <div className="filter-overlay-backdrop" onClick={() => setIsSortModalOpen(false)}>
                    <div className="filter-overlay-content sort-modal" onClick={e => e.stopPropagation()}>
                        <div className="filter-overlay-header">
                            <h3>Sort By</h3>
                            <button className="filter-overlay-close" onClick={() => setIsSortModalOpen(false)}><XIcon /></button>
                        </div>
                        <div className="filter-overlay-list">
                            {[
                                { id: 'default', label: 'Default' },
                                { id: 'az', label: 'A-Z (Alphabetical)' },
                                { id: 'za', label: 'Z-A (Alphabetical)' },
                                { id: 'newest', label: 'Newest Added' },
                                { id: 'oldest', label: 'Oldest Added' },
                                { id: 'rating', label: 'Highest Rated' },
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    className={`filter-overlay-item ${sortOrder === opt.id ? 'active' : ''}`}
                                    onClick={() => { setSortOrder(opt.id); setIsSortModalOpen(false); }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation */}
            {showLogoutConfirm && (
                <ConfirmModal
                    title="Log Out?"
                    message="You'll be returned to the profile selection screen."
                    confirmLabel="Log Out"
                    onConfirm={() => { setShowLogoutConfirm(false); onLogout(); }}
                    onCancel={() => setShowLogoutConfirm(false)}
                    danger
                />
            )}

            {/* Clear Cache Confirmation */}
            {showClearCacheConfirm && (
                <ConfirmModal
                    title="Clear App Cache?"
                    message="This will remove all cached stream data. The app will re-download content on the next launch."
                    confirmLabel="Clear Cache"
                    onConfirm={handleClearCache}
                    onCancel={() => setShowClearCacheConfirm(false)}
                />
            )}

            {/* Inline edit modal */}
            {editField && (
                <InlineEditModal
                    title={`Edit ${editField.label}`}
                    initialValue={editField.value}
                    placeholder={editField.label}
                    onSave={handleSaveField}
                    onCancel={() => setEditField(null)}
                />
            )}
        </div>
    );
}
