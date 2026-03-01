import { useState, useEffect } from 'react';
import './DetailScreen.css';

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

    const favKey = credentials ? `aura_favs_${credentials.username}` : 'aura_favs_guest';

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem(favKey) || '[]');
        setIsFavorite(favs.some(f => f.id === item.id));
    }, [item.id, favKey]);

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
                    <button className="btn-primary" onClick={() => onPlay(item)}>
                        <PlayFill />
                        {item.type === 'live' ? 'Watch Live' : 'Play Now'}
                    </button>
                    <button
                        className={`detail-icon-btn ${isFavorite ? 'active' : ''}`}
                        onClick={toggleFavorite}
                    >
                        <HeartIcon filled={isFavorite} />
                    </button>
                    <button className="detail-icon-btn"><ShareIcon /></button>
                </div>

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

