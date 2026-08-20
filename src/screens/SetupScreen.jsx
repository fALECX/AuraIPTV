import { useState, useEffect, useCallback, useRef } from 'react';
import './SetupScreen.css';
import { xtreamApi } from '../services/xtream';
import { toast } from '../components/Toast';
import { addProfile, deleteProfile as removeProfile, getDecryptedProfile, getLastUsedProfile, getStoredProfiles, migrateToEncrypted, setLastUsedProfile } from '../utils/storage';

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

export default function SetupScreen({ onConnect, autoLogin = true }) {
    const [url, setUrl] = useState(import.meta.env.VITE_XTREAM_URL || '');
    const [username, setUsername] = useState(import.meta.env.VITE_XTREAM_USER || '');
    const [password, setPassword] = useState(import.meta.env.VITE_XTREAM_PASS || '');
    const [loading, setLoading] = useState(false);

    // Profiles state
    const [profiles, setProfiles] = useState([]);
    const autoLoginAttempted = useRef(false);

    const connectWithCredentials = useCallback(async (creds) => {
        if (!creds?.url || !creds?.username || !creds?.password) return false;

        setLoading(true);
        try {
            const res = creds.url === 'demo'
                ? { success: true }
                : await xtreamApi.authenticate(creds.url, creds.username, creds.password);
            if (!res.success) {
                toast.error(res.error || 'Connection Failed');
                return false;
            }

            await addProfile(creds);
            await setLastUsedProfile(creds);
            onConnect(creds);
            return true;
        } catch (_err) {
            toast.error('Error connecting to provider');
            return false;
        } finally {
            setLoading(false);
        }
    }, [onConnect]);

    // Load profiles with migration on startup
    useEffect(() => {
        let cancelled = false;
        const loadProfiles = async () => {
            await migrateToEncrypted(); // Migrate if needed
            const stored = await getStoredProfiles();
            if (cancelled) return;
            setProfiles(stored);

            if (autoLogin && !autoLoginAttempted.current) {
                autoLoginAttempted.current = true;
                const lastUsed = await getLastUsedProfile(stored);
                if (lastUsed && !cancelled) {
                    const decrypted = await getDecryptedProfile(lastUsed);
                    setUrl(decrypted.url);
                    setUsername(decrypted.username);
                    setPassword(decrypted.password || '');
                    await connectWithCredentials(decrypted);
                }
            }
        };
        loadProfiles();
        return () => { cancelled = true; };
    }, [autoLogin, connectWithCredentials]);

    const deleteProfile = async (e, index) => {
        e.stopPropagation();
        await removeProfile(index);
        const updated = await getStoredProfiles();
        setProfiles(updated);
    };

    const selectProfile = async (p) => {
        // Decrypt the profile to get the password
        const decrypted = await getDecryptedProfile(p);
        setUrl(decrypted.url);
        setUsername(decrypted.username);
        setPassword(decrypted.password || '');
        await connectWithCredentials(decrypted);
    };

    const handleConnect = async (e) => {
        if (e) e.preventDefault();
        if (!url || !username || !password) return;

        await connectWithCredentials({ url, username, password });
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
                    onClick={() => connectWithCredentials({ url: 'demo', username: 'demo', password: 'demo' })}
                >
                    Try with Demo Content
                </button>

                <div className="setup-footer">
                    <p>Your data is stored <strong>locally</strong> and never shared.</p>
                </div>
            </form>

            <div className="setup-disclaimer glass-light">
                <p>
                    <strong>Legal Disclaimer:</strong> Aura is a technical media player and does not provide, host, or broadcast any content.
                    Users are responsible for providing their own media through third-party services.
                    Aura does not endorse or promote the streaming of copyrighted material without permission.
                </p>
                <div className="setup-legal-links">
                    <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    <span className="dot">•</span>
                    <span>Version {import.meta.env.VITE_APP_VERSION}</span>
                </div>
            </div>
        </div>
    );
}

