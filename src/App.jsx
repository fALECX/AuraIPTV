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

  const goHome = (creds) => {
    if (creds) setCredentials(creds);
    setScreen('home');
  };

  const goDetail = (item) => {
    setSelectedItem(item);
    setScreen('detail');
  };

  const goPlayer = (item) => {
    if (item) setSelectedItem(item);
    setScreen('player');
  };

  const goBack = () => {
    if (screen === 'player') setScreen('detail');
    else if (screen === 'detail') setScreen('home');
    else setScreen('home');
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
          key="home"
        />
      )}
      {screen === 'detail' && (
        <DetailScreen
          item={selectedItem}
          onPlay={goPlayer}
          onBack={goBack}
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
