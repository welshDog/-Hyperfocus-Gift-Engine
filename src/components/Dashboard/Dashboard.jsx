import React, { useState } from 'react';
import { useTikTokLive } from '../../hooks/useTikTokLive';
import GiftCounter from '../Counter/GiftCounter';
import Leaderboard from '../Leaderboard/Leaderboard';
import AlertSystem from '../Alerts/AlertSystem';
import AnalyticsDashboard from '../Analytics/AnalyticsDashboard';
import GiftGoalTracker from '../GiftGoalTracker/GiftGoalTracker';
import TapBattle from '../TapBattle/TapBattle';

const Dashboard = () => {
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Connect to TikTok Live
  const { gifts, isConnected, error, clearGifts, userXP } = useTikTokLive(
    isListening ? tiktokUsername : null
  );

  const handleStartListening = () => {
    if (tiktokUsername.trim()) {
      setIsListening(true);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    clearGifts();
  };

  const handleBadgeEarned = (badgeName, xpBonus) => {
    // For now, just log it - in a real app, you'd want to persist this
    // or integrate with a backend system
    console.log(`🏆 Badge earned: ${badgeName} (+${xpBonus} XP)`);

    // You could show a toast notification here
    // Or update some global state for recent badges
  };

  // Calculate total coins from gifts
  const totalCoins = gifts.reduce((sum, gift) => sum + gift.giftValue, 0);

  return (
    <div className="dashboard">
      {/* Connection Panel */}
      <div className="connection-panel">
        <h1>🎁 Hyperfocus Gift Engine</h1>

        {!isListening ? (
          <div className="connect-form">
            <input
              type="text"
              placeholder="Enter TikTok username"
              value={tiktokUsername}
              onChange={(e) => setTiktokUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartListening()}
              aria-label="TikTok username input"
            />
            <button onClick={handleStartListening} disabled={!tiktokUsername.trim()}>
              Start Tracking
            </button>
          </div>
        ) : (
          <div className="status-bar">
            <span className={isConnected ? 'connected' : 'disconnected'}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <span>@{tiktokUsername}</span>
            <button onClick={handleStopListening}>Stop</button>
          </div>
        )}

        {error && <div className="error" role="alert">{error}</div>}
      </div>

      {/* Main Dashboard Content */}
      {isListening && (
        <div className="dashboard-grid">
          {/* Gift Counter */}
          <GiftCounter
            totalCoins={totalCoins}
            giftCount={gifts.length}
          />

          {/* Tap Battle Mini-Game */}
          <TapBattle gifts={gifts} userXP={userXP} onBadgeEarned={handleBadgeEarned} />

          {/* Alert System (Visual Effects) */}
          <AlertSystem gifts={gifts} userXP={userXP} />

          {/* Gift Goal Tracker */}
          <GiftGoalTracker gifts={gifts} />

          {/* Leaderboard */}
          <Leaderboard gifts={gifts} userXP={userXP} />

          {/* Analytics */}
          <AnalyticsDashboard gifts={gifts} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
