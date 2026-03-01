import { useState, useEffect } from 'react';
import './SetupScreen.css';
import { xtreamApi } from '../services/xtream';

const GlobeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);
const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
const PlayIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5,3 19,12 5,21" />
    </svg>
);
const TrashIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

export default function SetupScreen({ onConnect }) {
    const [url, setUrl] = useState(import.meta.env.VITE_XTREAM_URL || '');
    const [username, setUsername] = useState(import.meta.env.VITE_XTREAM_USER || '');
    const [password, setPassword] = useState(import.meta.env.VITE_XTREAM_PASS || '');
    const [loading, setLoading] = useState(false);

    // Profiles state
    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('aura_profiles');
        if (stored) {
            try {
                setProfiles(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse profiles", e);
            }
        }
    }, []);

    const saveProfile = (newCreds) => {
        const existing = profiles.find(p => p.url === newCreds.url && p.username === newCreds.username);
        if (existing) return;

        const updated = [...profiles, { ...newCreds, name: newCreds.username || 'Account' }];
        setProfiles(updated);
        localStorage.setItem('aura_profiles', JSON.stringify(updated));
    };

    const deleteProfile = (e, index) => {
        e.stopPropagation();
        const updated = profiles.filter((_, i) => i !== index);
        setProfiles(updated);
        localStorage.setItem('aura_profiles', JSON.stringify(updated));
    };

    const selectProfile = (p) => {
        setUrl(p.url);
        setUsername(p.username);
        setPassword(p.password);
    };

    const handleConnect = async (e) => {
        if (e) e.preventDefault();
        if (!url || !username || !password) return;

        setLoading(true);
        try {
            const res = await xtreamApi.authenticate(url, username, password);
            if (res.success) {
                const creds = { url, username, password };
                saveProfile(creds);
                onConnect(creds);
            } else {
                alert(res.error || 'Connection Failed');
            }
        } catch (err) {
            alert('Error connecting to provider');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-screen page-enter">
            {/* Logo */}
            <div className="setup-logo">
                <div className="setup-logo-mark">
                    <svg viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                        <polygon points="13,10 24,16 13,22" fill="white" />
                        <circle cx="16" cy="16" r="4" fill="rgba(79,125,255,0.5)" />
                    </svg>
                </div>
                <span className="setup-logo-name">Aura</span>
                <span className="setup-logo-tagline">Premium Streaming</span>
            </div>

            {/* Profiles Selection */}
            {profiles.length > 0 && (
                <div className="setup-profiles-section">
                    <span className="setup-profiles-header">Saved Accounts</span>
                    <div className="profiles-list">
                        {profiles.map((p, i) => (
                            <div key={i} className="profile-item" onClick={() => selectProfile(p)}>
                                <div className="profile-avatar">
                                    <UserIcon />
                                </div>
                                <span className="profile-name">{p.username}</span>
                                <button className="profile-delete-btn" onClick={(e) => deleteProfile(e, i)}>
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Glass card */}
            <form className="setup-card glass-strong" onSubmit={handleConnect}>
                <h1 className="setup-card-heading">Welcome Back</h1>
                <p className="setup-card-subheading">Connect to your IPTV provider to start streaming</p>

                <div className="input-group">
                    <div className="labeled-input">
                        <label className="input-label">Provider URL</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><GlobeIcon /></span>
                            <input
                                className="input-field"
                                type="url"
                                placeholder="http://provider.com:8080"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                required
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="labeled-input">
                        <label className="input-label">Username</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><UserIcon /></span>
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="labeled-input">
                        <label className="input-label">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><LockIcon /></span>
                            <input
                                className="input-field"
                                type="password"
                                placeholder="Your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>
                </div>

                <button className="btn-primary" type="submit" disabled={loading || !url}>
                    {loading ? (
                        <>
                            <span className="spinner" />
                            Connecting…
                        </>
                    ) : (
                        <>
                            <PlayIcon />
                            Connect &amp; Stream
                        </>
                    )}
                </button>

                <div className="setup-divider"><span>or</span></div>

                <button
                    className="btn-ghost"
                    type="button"
                    style={{ width: '100%' }}
                    onClick={() => onConnect({ url: 'demo', username: 'demo', password: 'demo' })}
                >
                    Try with Demo Content
                </button>

                <p className="setup-footer">
                    Your data is stored <strong>locally</strong> and never shared.
                </p>
            </form>
        </div>
    );
}

