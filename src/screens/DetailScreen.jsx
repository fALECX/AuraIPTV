import { useState, useEffect } from 'react';
import './DetailScreen.css';
import './Skeleton.css';
import { xtreamApi } from '../services/xtream';
import { toast } from '../components/Toast';
import { getWatchProgressDetails } from '../utils/watchProgress';

const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const PlayFill = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
);
const HeartIcon = ({ filled }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);
const ShareIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
);

const EpisodeProgress = ({ episode }) => {
    const progress = getWatchProgressDetails({
        id: episode.id,
        type: 'series',
        duration: episode.info?.duration,
    });
    if (!progress) return null;

    return (
        <>
            {progress.watched && <span className="episode-watched-badge" aria-label="Watched">&#10003;</span>}
            <div className="episode-progress-track" aria-label={`${Math.round(progress.percentage)}% watched`}>
                <div className="episode-progress-fill" style={{ width: `${progress.percentage}%` }} />
            </div>
        </>
    );
};

const EpisodeStatus = ({ episode }) => {
    const progress = getWatchProgressDetails({
        id: episode.id,
        type: 'series',
        duration: episode.info?.duration,
    });
    if (!progress) return null;
    return <span className={`episode-status ${progress.watched ? 'watched' : ''}`}>{progress.watched ? 'Watched' : `${Math.round(progress.percentage)}% watched`}</span>;
};

export default function DetailScreen({ item, onPlay, onBack, onSelectItem, credentials }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [seriesInfo, setSeriesInfo] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [related, setRelated] = useState([]);

    const favKey = credentials ? `aura_favs_${credentials.username}` : 'aura_favs_guest';

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem(favKey) || '[]');
        setIsFavorite(favs.some(f => f.id === item.id));
    }, [item.id, favKey]);

    useEffect(() => {
        if (item.type !== 'series') return;
        const fetchInfo = async () => {
            setLoadingInfo(true);
            try {
                const info = await xtreamApi.getSeriesInfo(item.stream_id);
                setSeriesInfo(info);
                if (info?.episodes) {
                    const seasons = info.seasons?.length > 0
                        ? info.seasons.map(s => s.season_number)
                        : Object.keys(info.episodes);
                    if (seasons.length > 0) setSelectedSeason(seasons[0]);
                }
            } catch (e) {
                console.error('Failed to load series info:', e);
            } finally {
                setLoadingInfo(false);
            }
        };
        fetchInfo();
    }, [item.id, item.type, item.stream_id]);

    // Load related content (same type, cached data)
    useEffect(() => {
        const buildRelated = async () => {
            try {
                let raw = [];
                if (item.type === 'live') raw = await xtreamApi.getLiveStreams();
                else if (item.type === 'movie') raw = await xtreamApi.getVodStreams();
                else if (item.type === 'series') raw = await xtreamApi.getSeries();
                if (!Array.isArray(raw)) return;

                // Filter by same category, exclude current item
                const sameCategory = raw
                    .filter(r => {
                        const id = r.stream_id || r.series_id;
                        if (!id || String(id) === String(item.stream_id)) return false;
                        return r.category_id === raw.find(x => (x.stream_id || x.series_id) == item.stream_id)?.category_id;
                    })
                    .slice(0, 12);

                if (sameCategory.length === 0) {
                    // Fallback: random items of same type
                    const shuffled = raw.filter(r => (r.stream_id || r.series_id) != item.stream_id).slice(0, 12);
                    sameCategory.push(...shuffled);
                }

                const mapped = sameCategory.slice(0, 10).map(r => {
                    if (item.type === 'live') return { id: `live_${r.stream_id}`, stream_id: r.stream_id, title: r.name, poster: r.stream_icon, type: 'live', genre: 'Live TV', rating: 0, year: '' };
                    if (item.type === 'movie') return { id: `vod_${r.stream_id}`, stream_id: r.stream_id, title: r.name, poster: r.stream_icon, type: 'movie', genre: 'Movie', rating: parseFloat(r.rating) || 0, year: r.year || '', extension: r.container_extension || 'mp4' };
                    return { id: `series_${r.series_id}`, stream_id: r.series_id, title: r.name, poster: r.cover, type: 'series', genre: 'Series', rating: parseFloat(r.rating) || 0, year: r.year || '' };
                });
                setRelated(mapped);
            } catch { /* silently skip related */ }
        };
        buildRelated();
    }, [item.id, item.type, item.stream_id]);

    const toggleFavorite = () => {
        const favs = JSON.parse(localStorage.getItem(favKey) || '[]');
        let updated;
        if (isFavorite) {
            updated = favs.filter(f => f.id !== item.id);
            toast.info('Removed from favorites');
        } else {
            updated = [...favs, item];
            toast.success('Added to favorites');
        }
        localStorage.setItem(favKey, JSON.stringify(updated));
        setIsFavorite(!isFavorite);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: item.title, text: item.desc, url: window.location.href });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(item.title).then(() => toast.success('Title copied to clipboard'));
        } else {
            toast.info('Sharing not supported on this device');
        }
    };

    // Get all episodes in current season (for auto-next)
    const currentEpisodes = seriesInfo?.episodes?.[selectedSeason] || [];

    const handlePlayEpisode = (ep, episodeIndex) => {
        const nextEp = episodeIndex != null && currentEpisodes[episodeIndex + 1];
        const playItem = {
            ...item,
            id: ep.id,
            stream_id: ep.id,
            title: `${item.title} - S${ep.season}E${ep.episode_num}`,
            duration: ep.info?.duration || item.duration,
            extension: ep.container_extension || 'mp4',
        };
        const onPlayNext = nextEp ? () => handlePlayEpisode(nextEp, episodeIndex + 1) : null;
        onPlay(playItem, item, onPlayNext);
    };

    if (!item) return null;

    return (
        <div className="detail-screen page-enter">
            {/* Hero */}
            <div className="detail-hero" style={{ overflow: 'hidden' }}>
                <div className="detail-hero-bg-blur" style={{ backgroundImage: `url(${item.hero || item.poster})` }} />
                <img className="detail-hero-img" src={item.hero || item.poster} alt={item.title} />
                <div className="detail-hero-gradient" />
                <button className="detail-back-btn" onClick={onBack}><BackIcon /></button>
                <div className="detail-badge">⭐ {item.rating}</div>
            </div>

            {/* Content */}
            <div className="detail-content">
                <div className="detail-genre-row">
                    <span className="detail-genre-tag">{item.genre}</span>
                    <span className="detail-dot">•</span>
                    <span className="detail-meta-text">{item.year}</span>
                    {item.duration && <><span className="detail-dot">•</span><span className="detail-meta-text">{item.duration}</span></>}
                    {item.type === 'live' && <><span className="detail-dot">•</span><span className="detail-meta-text" style={{ color: '#ef4444', fontWeight: 600 }}>● LIVE</span></>}
                </div>

                <h1 className="detail-title">{item.title}</h1>
                <p className="detail-desc">{item.desc}</p>

                {/* Action Buttons */}
                <div className="detail-actions">
                    <button className="btn-primary" onClick={() => {
                        if (item.type === 'series' && seriesInfo?.episodes) {
                            const episodes = seriesInfo.episodes[selectedSeason] || Object.values(seriesInfo.episodes)[0];
                            if (episodes?.length > 0) {
                                handlePlayEpisode(episodes[0], 0);
                                return;
                            }
                        }
                        onPlay(item);
                    }}>
                        <PlayFill />
                        {item.type === 'live' ? 'Watch Live' : (item.type === 'series' ? 'Watch S1:E1' : 'Play Now')}
                    </button>
                    <button className={`detail-icon-btn ${isFavorite ? 'active' : ''}`} onClick={toggleFavorite}>
                        <HeartIcon filled={isFavorite} />
                    </button>
                    <button className="detail-icon-btn" onClick={handleShare}><ShareIcon /></button>
                </div>

                {/* Series Episodes Browser */}
                {item.type === 'series' && (
                    <div className="detail-series-browser">
                        <div className="detail-section-title">Seasons</div>
                        {loadingInfo ? (
                            <div className="skeleton-row" style={{ display: 'flex', gap: 12 }}>
                                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ width: 80, height: 36, borderRadius: 20 }} />)}
                            </div>
                        ) : (
                            <div className="season-selector">
                                {seriesInfo?.seasons?.length > 0 ? (
                                    seriesInfo.seasons.map(s => (
                                        <button key={s.season_number} className={`season-pill ${selectedSeason == s.season_number ? 'active' : ''}`} onClick={() => setSelectedSeason(s.season_number)}>
                                            Season {s.season_number}
                                        </button>
                                    ))
                                ) : Object.keys(seriesInfo?.episodes || {}).length > 0 ? (
                                    Object.keys(seriesInfo.episodes).sort((a, b) => parseInt(a) - parseInt(b)).map(sNum => (
                                        <button key={sNum} className={`season-pill ${selectedSeason == sNum ? 'active' : ''}`} onClick={() => setSelectedSeason(sNum)}>
                                            Season {sNum}
                                        </button>
                                    ))
                                ) : !loadingInfo && <div className="no-data-text">No seasons found</div>}
                            </div>
                        )}

                        <div className="detail-section-title" style={{ marginTop: 24 }}>Episodes</div>
                        <div className="episodes-list">
                            {loadingInfo ? (
                                [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, width: '100%', borderRadius: 16, marginBottom: 12 }} />)
                            ) : currentEpisodes.length > 0 ? (
                                currentEpisodes.map((ep, idx) => (
                                    <div key={ep.id} className="episode-card" onClick={() => handlePlayEpisode(ep, idx)}>
                                        <div className="episode-thumb-wrap">
                                            <img className="episode-thumb" src={ep.info?.movie_image || item.poster} alt={ep.title} />
                                            <div className="episode-play-overlay"><PlayFill /></div>
                                            <EpisodeProgress episode={ep} />
                                        </div>
                                        <div className="episode-info">
                                            <div className="episode-title">{ep.title || `Episode ${ep.episode_num}`}</div>
                                            <EpisodeStatus episode={ep} />
                                            <div className="episode-meta">Episode {ep.episode_num} {ep.info?.duration ? `• ${ep.info.duration}` : ''}</div>
                                        </div>
                                    </div>
                                ))
                            ) : !loadingInfo && <div className="no-data-text">No episodes found for this season</div>}
                        </div>
                    </div>
                )}

                {/* Related Content */}
                {related.length > 0 && (
                    <div style={{ marginTop: 28 }}>
                        <div className="detail-section-title">More Like This</div>
                        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
                            {related.map(r => (
                                <div key={r.id} style={{ flexShrink: 0, width: 90, cursor: 'pointer', scrollSnapAlign: 'start' }}
                                    onClick={() => onSelectItem?.(r)}>
                                    <img
                                        src={r.poster || 'https://via.placeholder.com/90x135?text='}
                                        alt={r.title}
                                        style={{ width: '100%', aspectRatio: r.type === 'live' ? '1/1' : '2/3', borderRadius: 10, objectFit: 'cover', background: 'rgba(255,255,255,0.06)' }}
                                        onError={e => { e.target.src = 'https://via.placeholder.com/90x135?text='; }}
                                    />
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ height: 40 }} />
            </div>
        </div>
    );
}
