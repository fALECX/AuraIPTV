import { useState } from 'react';
import { MOCK_CATEGORIES, FEATURED } from '../data/mockData';
import './HomeScreen.css';

const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const BellIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
const SettingsIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);
const StarIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

function MediaCard({ item, onSelect }) {
    return (
        <div className="media-card" onClick={() => onSelect(item)}>
            <div className="media-card-img-wrap">
                <img className="media-card-img" src={item.poster} alt={item.title} loading="lazy" />
                {item.type === 'live' && (
                    <div className="media-card-live-badge">
                        <span className="live-dot" />
                        LIVE
                    </div>
                )}
            </div>
            <div className="media-card-title">{item.title}</div>
            <div className="media-card-meta">{item.genre} · {item.year}</div>
        </div>
    );
}

export default function HomeScreen({ onSelectItem, onPlay }) {
    const [activeNav, setActiveNav] = useState('home');

    return (
        <div className="home-screen page-enter">
            {/* Top Bar */}
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
                    <button className="topbar-icon-btn" aria-label="Search">
                        <SearchIcon />
                    </button>
                    <button className="topbar-icon-btn" aria-label="Notifications">
                        <BellIcon />
                    </button>
                </div>
            </div>

            {/* Greeting */}
            <div className="home-greeting">
                <h2>Good Evening 👋</h2>
                <p>What would you like to watch?</p>
            </div>

            {/* Featured Hero */}
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

            {/* Category Sliders */}
            <div className="home-scroll">
                {MOCK_CATEGORIES.map(cat => (
                    <div key={cat.id} className="category-section">
                        <div className="category-header">
                            <span className="category-title">{cat.title}</span>
                            <span className="category-see-all">See all →</span>
                        </div>
                        <div className="category-slider">
                            {cat.items.map(item => (
                                <MediaCard key={item.id} item={item} onSelect={onSelectItem} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                {[
                    { id: 'home', label: 'Home', Icon: HomeIcon },
                    { id: 'live', label: 'Live TV', Icon: TvIcon },
                    { id: 'movies', label: 'Movies', Icon: FilmIcon },
                    { id: 'settings', label: 'Settings', Icon: SettingsIcon },
                ].map(({ id, label, Icon }) => (
                    <div
                        key={id}
                        className={`nav-item ${activeNav === id ? 'active' : ''}`}
                        onClick={() => setActiveNav(id)}
                    >
                        <Icon active={activeNav === id} />
                        <span className="nav-item-label">{label}</span>
                    </div>
                ))}
            </nav>
        </div>
    );
}
