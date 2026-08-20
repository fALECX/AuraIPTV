import { useState, useEffect, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen';
import PlayerScreen from './screens/PlayerScreen';
import DetailScreen from './screens/DetailScreen';
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import MiniPlayer from './components/MiniPlayer';
import './index.css';

export default function App() {
  const [screen, setScreen] = useState('setup'); // 'setup' | 'home' | 'detail' | 'player'
  const [selectedItem, setSelectedItem] = useState(null);
  const [playingItem, setPlayingItem] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // Persistent across navigation
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [playNextFn, setPlayNextFn] = useState(null);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [allowStartupAutoLogin, setAllowStartupAutoLogin] = useState(true);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const goHome = useCallback((creds) => {
    if (creds) setCredentials(creds);
    setAllowStartupAutoLogin(false);
    setScreen('home');
  }, []);

  const goDetail = (item) => {
    setSelectedItem(item);
    setScreen('detail');
  };

  const goPlayer = (item, parentItem = null, onPlayNext = null) => {
    if (item) {
      setPlayingItem(item);
      // Store next-episode callback (wrap in function so useState doesn't call it)
      setPlayNextFn(onPlayNext ? () => onPlayNext : null);
      // Only change selected item if we are not already in detail view (to preserve context)
      if (screen !== 'detail') {
        setSelectedItem(item);
      }
      // Save to watch history — store the series parent, not individual episode
      const historyItem = parentItem
        ? { ...parentItem, resumeItem: item, lastWatchedAt: Date.now() }
        : { ...item, lastWatchedAt: Date.now() };
      const histKey = credentials ? `aura_hist_${credentials.username}` : 'aura_hist_guest';
      let hist = JSON.parse(localStorage.getItem(histKey) || '[]');
      hist = hist.filter(h => h.id !== historyItem.id);
      hist.unshift(historyItem);
      if (hist.length > 20) hist = hist.slice(0, 20);
      localStorage.setItem(histKey, JSON.stringify(hist));
    }
    setScreen('player');
  };

  const goBack = useCallback(({ keepPlaying = true } = {}) => {
    if (screen === 'player') {
      // Show mini player when going back from player
      if (playingItem && keepPlaying) {
        setShowMiniPlayer(true);
      } else {
        setShowMiniPlayer(false);
      }
      setScreen('detail');
    }
    else if (screen === 'detail') setScreen('home');
    else setScreen('home');
  }, [playingItem, screen]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    let listener;
    CapacitorApp.addListener('backButton', () => {
      if (screen === 'player') goBack({ keepPlaying: false });
      else if (screen === 'detail') setScreen('home');
      else if (screen === 'home' && activeTab !== 'home') setActiveTab('home');
      else CapacitorApp.minimizeApp();
    }).then(handle => { listener = handle; });

    return () => { listener?.remove(); };
  }, [activeTab, goBack, screen]);

  const handleLogout = () => {
    setCredentials(null);
    setAllowStartupAutoLogin(false);
    setScreen('setup');
  };

  const handleUpdateCredentials = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <div className="orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9998,
            background: 'rgba(239,68,68,0.92)', color: '#fff',
            textAlign: 'center', padding: '10px 16px', fontSize: '13px', fontWeight: 600,
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            letterSpacing: '0.02em',
          }}>
            <span style={{ marginRight: 8 }}>📡</span>
            No internet — showing cached content
          </div>
        )}

        {screen === 'setup' && (
          <SetupScreen onConnect={goHome} autoLogin={allowStartupAutoLogin} key="setup" />
        )}
        {screen === 'home' && (
          <HomeScreen
            credentials={credentials}
            onSelectItem={goDetail}
            onPlay={goPlayer}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedCategoryIds={selectedCategoryIds}
            setSelectedCategoryIds={setSelectedCategoryIds}
            onLogout={handleLogout}
            onUpdateCredentials={handleUpdateCredentials}
            key="home"
          />
        )}
        {screen === 'detail' && (
          <DetailScreen
            item={selectedItem}
            onPlay={goPlayer}
            onBack={goBack}
            onSelectItem={goDetail}
            credentials={credentials}
            key="detail"
          />
        )}
        {screen === 'player' && (
          <PlayerScreen
            item={playingItem}
            onBack={goBack}
            onPlayNext={playNextFn}
            key="player"
          />
        )}
        <ToastContainer />
      </div>

      {/* Floating Mini Player */}
      {showMiniPlayer && playingItem && (
        <MiniPlayer
          item={playingItem}
          onExpand={() => {
            setShowMiniPlayer(false);
            setPlayingItem(current => current ? { ...current, autoResume: true } : current);
            setScreen('player');
          }}
          onClose={() => {
            setShowMiniPlayer(false);
            setPlayingItem(null);
          }}
          onPlayNext={playNextFn}
        />
      )}
    </ErrorBoundary>
  );
}
