import { useState, useEffect } from 'react';
import './DetailScreen.css';
import './Skeleton.css';
import { xtreamApi } from '../services/xtream';

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

const MOCK_CAST = [
    { name: 'Timothée C.', avatar: 'https://i.pravatar.cc/60?img=12' },
    { name: 'Zendaya', avatar: 'https://i.pravatar.cc/60?img=47' },
    { name: 'Austin B.', avatar: 'https://i.pravatar.cc/60?img=5' },
    { name: 'Javier B.', avatar: 'https://i.pravatar.cc/60?img=7' },
];

export default function DetailScreen({ item, onPlay, onBack, credentials }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [seriesInfo, setSeriesInfo] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(false);

    const favKey = credentials ? `aura_favs_${credentials.username}` : 'aura_favs_guest';

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem(favKey) || '[]');
        setIsFavorite(favs.some(f => f.id === item.id));
    }, [item.id, favKey]);

    useEffect(() => {
        if (item.type === 'series') {
            const fetchInfo = async () => {
                setLoadingInfo(true);
                try {
                    const info = await xtreamApi.getSeriesInfo(item.stream_id);
                    setSeriesInfo(info);
                    // Default to season 1 or first available
                    if (info && info.episodes) {
                        const seasons = info.seasons && info.seasons.length > 0
                            ? info.seasons.map(s => s.season_number)
                            : Object.keys(info.episodes);

                        if (seasons.length > 0) {
                            setSelectedSeason(seasons[0]);
                        }
                    }
                } catch (e) {
                    console.error("Failed to load series info:", e);
                } finally {
                    setLoadingInfo(false);
                }
            };
            fetchInfo();
        }
    }, [item.id, item.type]);

    const toggleFavorite = () => {
        const favs = JSON.parse(localStorage.getItem(favKey) || '[]');
        let updated;
        if (isFavorite) {
            updated = favs.filter(f => f.id !== item.id);
        } else {
            updated = [...favs, item];
        }
        localStorage.setItem(favKey, JSON.stringify(updated));
        setIsFavorite(!isFavorite);
    };

    const handlePlayEpisode = (ep) => {
        onPlay({
            ...item,
            id: ep.id,
            stream_id: ep.id, // Xtream series uses episode id as stream id
            title: `${item.title} - S${ep.season}E${ep.episode_num}`,
            duration: ep.info?.duration || item.duration,
            extension: ep.container_extension || 'mp4'
        }, item); // Pass 'item' as parentItem for history
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
                            if (episodes && episodes.length > 0) {
                                handlePlayEpisode(episodes[0]);
                                return;
                            }
                        }
                        onPlay(item);
                    }}>
                        <PlayFill />
                        {item.type === 'live' ? 'Watch Live' : (item.type === 'series' ? 'Watch S1:E1' : 'Play Now')}
                    </button>
                    <button
                        className={`detail-icon-btn ${isFavorite ? 'active' : ''}`}
                        onClick={toggleFavorite}
                    >
                        <HeartIcon filled={isFavorite} />
                    </button>
                    <button className="detail-icon-btn" onClick={() => {
                        if (navigator.share) {
                            navigator.share({ title: item.title, text: item.desc, url: window.location.href });
                        } else {
                            alert('Share not supported on this device');
                        }
                    }}><ShareIcon /></button>
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
                                {seriesInfo?.seasons && seriesInfo.seasons.length > 0 ? (
                                    seriesInfo.seasons.map(s => (
                                        <button
                                            key={s.season_number}
                                            className={`season-pill ${selectedSeason == s.season_number ? 'active' : ''}`}
                                            onClick={() => setSelectedSeason(s.season_number)}
                                        >
                                            Season {s.season_number}
                                        </button>
                                    ))
                                ) : (
                                    Object.keys(seriesInfo?.episodes || {}).length > 0 ? (
                                        Object.keys(seriesInfo.episodes).sort((a, b) => parseInt(a) - parseInt(b)).map(sNum => (
                                            <button
                                                key={sNum}
                                                className={`season-pill ${selectedSeason == sNum ? 'active' : ''}`}
                                                onClick={() => setSelectedSeason(sNum)}
                                            >
                                                Season {sNum}
                                            </button>
                                        ))
                                    ) : !loadingInfo && <div className="no-data-text">No seasons found</div>
                                )}
                            </div>
                        )}

                        <div className="detail-section-title" style={{ marginTop: 24 }}>Episodes</div>
                        <div className="episodes-list">
                            {loadingInfo ? (
                                [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, width: '100%', borderRadius: 16, marginBottom: 12 }} />)
                            ) : (
                                seriesInfo?.episodes?.[selectedSeason]?.length > 0 ? (
                                    seriesInfo.episodes[selectedSeason].map(ep => (
                                        <div key={ep.id} className="episode-card" onClick={() => handlePlayEpisode(ep)}>
                                            <div className="episode-thumb-wrap">
                                                <img className="episode-thumb" src={ep.info?.movie_image || item.poster} alt={ep.title} />
                                                <div className="episode-play-overlay"><PlayFill /></div>
                                            </div>
                                            <div className="episode-info">
                                                <div className="episode-title">{ep.title || `Episode ${ep.episode_num}`}</div>
                                                <div className="episode-meta">Episode {ep.episode_num} {ep.info?.duration ? `• ${ep.info.duration}` : ''}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : !loadingInfo && <div className="no-data-text">No episodes found for this season</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Cast */}
                {item.type !== 'live' && (
                    <>
                        <div className="detail-section-title">Cast</div>
                        <div className="detail-cast">
                            {MOCK_CAST.map(c => (
                                <div className="cast-pill" key={c.name}>
                                    <img className="cast-avatar" src={c.avatar} alt={c.name} />
                                    <span className="cast-name">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Related Section Omitted for brevity or could be added back if needed */}
            </div>
        </div>
    );
}

