import { useState } from 'react';
import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen';
import PlayerScreen from './screens/PlayerScreen';
import DetailScreen from './screens/DetailScreen';
import './index.css';

export default function App() {
  const [screen, setScreen] = useState('setup'); // 'setup' | 'home' | 'detail' | 'player'
  const [selectedItem, setSelectedItem] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // Persistent across navigation

  const goHome = (creds) => {
    if (creds) setCredentials(creds);
    setScreen('home');
  };

  const goDetail = (item) => {
    setSelectedItem(item);
    setScreen('detail');
  };

  const goPlayer = (item) => {
    if (item) {
      setSelectedItem(item);
      // Save to watch history
      const histKey = credentials ? `aura_hist_${credentials.username}` : 'aura_hist_guest';
      let hist = JSON.parse(localStorage.getItem(histKey) || '[]');
      hist = hist.filter(h => h.id !== item.id);
      hist.unshift(item);
      if (hist.length > 20) hist = hist.slice(0, 20);
      localStorage.setItem(histKey, JSON.stringify(hist));
    }
    setScreen('player');
  };

  const goBack = () => {
    if (screen === 'player') setScreen('detail');
    else if (screen === 'detail') setScreen('home');
    else setScreen('home');
  };

  const handleLogout = () => {
    setCredentials(null);
    setScreen('setup');
  };

  const handleUpdateCredentials = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="app-shell">
      <div className="orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {screen === 'setup' && (
        <SetupScreen onConnect={goHome} key="setup" />
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
          credentials={credentials}
          key="detail"
        />
      )}
      {screen === 'player' && (
        <PlayerScreen
          item={selectedItem}
          onBack={goBack}
          key="player"
        />
      )}
    </div>
  );
}
