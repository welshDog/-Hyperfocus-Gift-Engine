import React, { useMemo } from 'react'

function Leaderboard({ compact = false, gifts = [], userXP = {}, userCoins = {} }) {
  const leaderboard = useMemo(() => {
    // Calculate leaderboard based on XP and include coin data
    const users = Object.entries(userXP).map(([username, data]) => ({
      username,
      nickname: username,
      xp: data.xp,
      badges: data.badges,
      coins: userCoins[username]?.coins || 0,
      totalGifts: gifts.filter(g => g.username === username).length,
      totalValue: gifts.filter(g => g.username === username).reduce((sum, g) => sum + g.giftValue, 0)
    }));

    return users
      .sort((a, b) => b.coins - a.coins) // Sort by coins instead of XP for leaderboard
      .slice(0, compact ? 3 : 50); // Top 50 for full view
  }, [gifts, userXP, userCoins, compact]);

  const formatValue = (value) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
    return value.toString()
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `#${rank + 1}`
    }
  }

  if (compact) {
    return (
      <div className="leaderboard-compact">
        <div className="leaderboard-header">
          <h3>🏆 Top Gifters</h3>
        </div>

        <div className="leaderboard-list">
          {leaderboard.slice(0, 3).map((user, index) => (
            <div key={user.username} className="leaderboard-item">
              <div className="user-info">
                <span className="rank">{getRankIcon(index)}</span>
                <span className="username">{user.username}</span>
                {user.badges.length > 0 && (
                  <span className={`badge ${user.badges[0].toLowerCase()}`}>🏆</span>
                )}
              </div>
              <div className="user-stats">
                <span className="stat-value">{user.coins.toLocaleString()}</span>
                <span className="stat-label">🪙</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h3>🏆 Gift Leaderboard</h3>
        <div className="live-indicator">
          <div className="live-dot"></div>
          <span>Live</span>
        </div>
      </div>

      <div className="leaderboard-list">
        {leaderboard.length > 0 ? (
          leaderboard.map((user, index) => (
            <div key={user.username} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
              <div className="rank-section">
                <span className="rank">{getRankIcon(index)}</span>
              </div>

              <div className="user-info">
                <span className="username">{user.username}</span>
                <span className="nickname">{user.nickname}</span>
                {user.badges.length > 0 && (
                  <div className="badges">
                    {user.badges.map(badge => (
                      <span key={badge} className={`badge ${badge.toLowerCase()}`}>🏆 {badge}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="user-stats">
                <div className="stat">
                  <span className="stat-value">{user.coins.toLocaleString()}</span>
                  <span className="stat-label">BROski$</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{user.xp}</span>
                  <span className="stat-label">XP</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <span>🎁 No gifts yet!</span>
            <span>Be the first to send a gift</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
