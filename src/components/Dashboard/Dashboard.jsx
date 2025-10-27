import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTikTokLive } from '../../hooks/useTikTokLive';
import GiftCounter from '../Counter/GiftCounter';
import Leaderboard from '../Leaderboard/Leaderboard';
import AlertSystem from '../Alerts/AlertSystem';
import AnalyticsDashboard from '../Analytics/AnalyticsDashboard';
import GiftGoalTracker from '../GiftGoalTracker/GiftGoalTracker';
import TapBattle from '../TapBattle/TapBattle';
import BROskiShop from '../BROskiShop/BROskiShop';

const Dashboard = () => {
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [currentUser, setCurrentUser] = useState('Anonymous');
  const [isListening, setIsListening] = useState(false);
  const [view, setView] = useState('overview');

  // Connect to TikTok Live
  const { gifts, isConnected, error, clearGifts, userXP, userCoins } = useTikTokLive(
    isListening ? tiktokUsername : null
  );

  const handleStartListening = useCallback(() => {
    if (tiktokUsername.trim()) {
      setIsListening(true);
    }
  }, [tiktokUsername]);

  const handleStopListening = useCallback(() => {
    setIsListening(false);
    clearGifts();
  }, [clearGifts]);

  const handlePurchase = useCallback((item, username) => {
    console.log(`🛒 Purchase: ${username} bought ${item.name} for ${item.cost} BROski$`);
    // In a real app, this would trigger a backend purchase
    alert(`🎉 Successfully purchased ${item.name}!`);
  }, []);

  const handleBadgeEarned = useCallback((badgeName, xpBonus) => {
    console.log(`🏆 Badge earned: ${badgeName} (+${xpBonus} XP)`);
    alert(`🏆 New Badge Unlocked: ${badgeName}!`);
  }, []);

  // Check if current time is peak hour
  const now = useMemo(() => new Date(), []);
  const currentHour = now.getHours();
  const isPeakHour = useMemo(() =>
    (currentHour >= 19 && currentHour <= 23) || (currentHour >= 12 && currentHour <= 14),
    [currentHour]
  );

  // Calculate total coins from gifts
  const totalCoins = useMemo(() =>
    gifts.reduce((sum, gift) => sum + gift.giftValue, 0),
    [gifts]
  );

  const navigationItems = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'leaderboard', label: '🏆 Leaderboard', icon: '🏆' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'shop', label: '🛒 Shop', icon: '🛒' },
  ];

  const renderMainContent = () => {
    switch (view) {
      case 'overview':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gradient mb-6">Dashboard Overview</h2>
            </motion.div>

            <div className="dashboard-grid">
              <GiftCounter totalCoins={totalCoins} giftCount={gifts.length} />
              <TapBattle gifts={gifts} userXP={userXP} onBadgeEarned={handleBadgeEarned} />
              <AlertSystem gifts={gifts} userXP={userXP} />
              <GiftGoalTracker gifts={gifts} />
              <Leaderboard gifts={gifts} userXP={userXP} userCoins={userCoins} />
              <AnalyticsDashboard gifts={gifts} />
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gradient">Leaderboard</h2>
            <Leaderboard gifts={gifts} userXP={userXP} userCoins={userCoins} />
          </motion.div>
        );

      case 'analytics':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gradient">Analytics Dashboard</h2>
            <AnalyticsDashboard gifts={gifts} />
          </motion.div>
        );

      case 'shop':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gradient">BROski$ Shop</h2>
            <BROskiShop
              userCoins={userCoins}
              currentUser={currentUser}
              onPurchase={handlePurchase}
              isPeakHour={isPeakHour}
              setCurrentUser={setCurrentUser}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      {/* Connection Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="connection-panel"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              🎁 Hyperfocus Gift Engine
            </h1>
            <p className="text-slate-300 text-lg">
              🪙 Earn BROski$ Coins • ⚔️ Battle Challenges • 🏆 Unlock Badges
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter TikTok username"
                value={tiktokUsername}
                onChange={(e) => setTiktokUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartListening()}
                className="input"
                aria-label="TikTok username input"
              />
              <button
                onClick={handleStartListening}
                disabled={!tiktokUsername.trim() || isListening}
                className={`btn-primary ${(!tiktokUsername.trim() || isListening) ? 'btn-disabled' : ''}`}
              >
                {isListening ? 'Listening...' : 'Connect'}
              </button>
              <button
                onClick={handleStopListening}
                disabled={!isListening}
                className={`btn-secondary ${!isListening ? 'btn-disabled' : ''}`}
              >
                Stop
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-2 mb-6 overflow-x-auto"
      >
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
              view === item.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </motion.div>

      {/* Main Content */}
      {renderMainContent()}
    </div>
  );
};

export default Dashboard;
