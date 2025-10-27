import React, { useState } from 'react';

function BROskiShop({ userCoins = {}, currentUser = '', onPurchase, isPeakHour = false, setCurrentUser }) {
  const [selectedCategory, setSelectedCategory] = useState('perks');

  const shopItems = {
    perks: [
      { id: 'song-request', name: '🎵 Song Request', cost: 50, description: 'Request any song during stream', icon: '🎵' },
      { id: 'shoutout', name: '📢 Personal Shoutout', cost: 100, description: 'Get a personalized shoutout on stream', icon: '📢' },
      { id: 'emoji-spam', name: '😍 Emoji Spam', cost: 25, description: 'Trigger emoji explosion in chat', icon: '😍' },
      { id: 'name-color', name: '🌈 Custom Name Color', cost: 75, description: 'Change your chat name color', icon: '🌈' }
    ],
    games: [
      { id: 'challenge-creator', name: '🎮 Challenge Creator', cost: 200, description: 'Create a custom challenge for the stream', icon: '🎮' },
      { id: 'poll-power', name: '📊 Poll Power', cost: 150, description: 'Start a community poll', icon: '📊' },
      { id: 'game-choice', name: '🎯 Game Choice', cost: 300, description: 'Choose the next game/activity', icon: '🎯' },
      { id: 'mini-game-boost', name: '⚡ Mini-Game Boost', cost: 100, description: 'Double XP for next mini-game', icon: '⚡' }
    ],
    cosmetics: [
      { id: 'special-badge', name: '🏆 Special Badge', cost: 500, description: 'Exclusive "VIP" badge for 24 hours', icon: '🏆' },
      { id: 'chat-theme', name: '🎨 Chat Theme', cost: 250, description: 'Custom chat theme for your messages', icon: '🎨' },
      { id: 'stream-overlay', name: '📺 Stream Overlay', cost: 1000, description: 'Custom overlay during stream', icon: '📺' },
      { id: 'exclusive-emoji', name: '⭐ Exclusive Emoji', cost: 150, description: 'Unlock exclusive emoji pack', icon: '⭐' }
    ]
  };

  const currentUserCoins = userCoins[currentUser]?.coins || 0;

  const handlePurchase = (item) => {
    if (currentUserCoins >= item.cost && onPurchase) {
      onPurchase(item, currentUser);
    }
  };

  const getAffordabilityColor = (cost) => {
    if (currentUserCoins >= cost) return '#10b981'; // green
    if (currentUserCoins >= cost * 0.5) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="broski-shop">
      {isPeakHour && <div className="peak-hour-indicator">⚡ 2x COINS!</div>}
      <div className="shop-header">
        <h3>🪙 BROski$ Shop</h3>
        <div className="user-coins">
          <span className="coin-icon">🪙</span>
          <span className="coin-amount">{currentUserCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* User Selector for Demo */}
      <div className="user-selector">
        <select
          value={currentUser}
          onChange={(e) => setCurrentUser && setCurrentUser(e.target.value)}
          className="user-select"
        >
          <option value="Anonymous">Anonymous</option>
          {Object.keys(userCoins).map(username => (
            <option key={username} value={username}>{username}</option>
          ))}
        </select>
      </div>

      <div className="shop-categories">
        {Object.keys(shopItems).map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="shop-items">
        {shopItems[selectedCategory].map(item => (
          <div key={item.id} className="shop-item">
            <div className="item-header">
              <div className="item-icon">{item.icon}</div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-description">{item.description}</div>
              </div>
            </div>

            <div className="item-footer">
              <div className="item-cost" style={{ color: getAffordabilityColor(item.cost) }}>
                <span className="coin-icon">🪙</span>
                {item.cost}
              </div>
              <button
                className={`purchase-btn ${currentUserCoins >= item.cost ? 'affordable' : 'unaffordable'}`}
                onClick={() => handlePurchase(item)}
                disabled={currentUserCoins < item.cost}
              >
                {currentUserCoins >= item.cost ? 'Purchase' : 'Need More'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="shop-info">
        <div className="info-item">
          <span className="info-icon">⚡</span>
          <span className="info-text">Peak Hours (12-2PM, 7-11PM): 2x Coins!</span>
        </div>
        <div className="info-item">
          <span className="info-icon">🎁</span>
          <span className="info-text">Earn coins by sending gifts and completing challenges</span>
        </div>
        <div className="info-item">
          <span className="info-icon">👥</span>
          <span className="info-text">Invite friends for bonus referral coins</span>
        </div>
      </div>
    </div>
  );
}

export default BROskiShop;
