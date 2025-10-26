import React, { useMemo } from 'react'

function Leaderboard({ compact = false, gifts = [] }) {
  const leaderboard = useMemo(() => {
    // Calculate leaderboard from real gifts
    const userTotals = gifts.reduce((acc, gift) => {
      const username = gift.username || 'Anonymous'
      if (!acc[username]) {
        acc[username] = { totalGifts: 0, totalValue: 0, username, nickname: username }
      }
      acc[username].totalGifts += 1
      acc[username].totalValue += gift.giftValue
      return acc
    }, {})

    return Object.values(userTotals)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, compact ? 3 : 10)
  }, [gifts, compact])

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
              </div>
              <div className="user-stats">
                <span className="gift-count">{user.totalGifts}</span>
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
              </div>

              <div className="user-stats">
                <div className="stat">
                  <span className="stat-value">{user.totalGifts}</span>
                  <span className="stat-label">Gifts</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{formatValue(user.totalValue)}</span>
                  <span className="stat-label">Coins</span>
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
