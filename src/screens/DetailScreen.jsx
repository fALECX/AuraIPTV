import { MOCK_CATEGORIES } from '../data/mockData';
import './DetailScreen.css';

const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const PlayFill = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
);
const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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

export default function DetailScreen({ item, onPlay, onBack }) {
    if (!item) return null;

    // Pull random related items from same category or movies
    const related = MOCK_CATEGORIES.find(c => c.items.some(i => i.id === item.id))?.items.filter(i => i.id !== item.id) ?? MOCK_CATEGORIES[1].items.slice(0, 5);

    return (
        <div className="detail-screen page-enter">
            {/* Hero */}
            <div className="detail-hero">
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
                    <button className="detail-icon-btn"><PlusIcon /></button>
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

                {/* Related */}
                <div className="detail-section-title">You May Also Like</div>
                <div className="detail-related">
                    {related.slice(0, 6).map(r => (
                        <div className="related-card" key={r.id} onClick={() => { }}>
                            <img className="related-card-img" src={r.poster} alt={r.title} loading="lazy" />
                            <div className="related-card-title">{r.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
