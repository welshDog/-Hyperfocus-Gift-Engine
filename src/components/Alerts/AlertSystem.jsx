import React, { useState, useEffect } from 'react'

function AlertSystem({ gifts = [] }) {
  const [recentAlerts, setRecentAlerts] = useState([])

  useEffect(() => {
    // Show alerts for recent gifts (last 3)
    const recentGifts = gifts.slice(0, 3)
    if (recentGifts.length > 0) {
      setRecentAlerts(recentGifts)

      // Auto-hide alerts after 4 seconds
      const timer = setTimeout(() => {
        setRecentAlerts([])
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [gifts])

  const getAnimationClass = (tier) => {
    switch (tier) {
      case 'small': return 'small';
      case 'medium': return 'medium';
      case 'large': return 'large';
      case 'epic': return 'epic';
      default: return '';
    }
  };

  const formatCurrency = (value) => {
    const usdValue = (value / 1000) * 1.0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(usdValue)
  }

  return (
    <div className="alert-system">
      <div className="alert-header">
        <h3>🎉 Live Alerts</h3>
        <div className="live-indicator">
          <div className="live-dot"></div>
          <span>Active</span>
        </div>
      </div>

      <div className="alerts-container">
        {recentAlerts.length > 0 ? (
          recentAlerts.map((gift, index) => (
            <div
              key={`${gift.id}-${index}`}
              className={`alert-item ${getAlertColor(gift.giftName).replace('from-', '').replace(' to-', '-')} ${getAnimationClass(gift.tier)}`}
            >
              <div className="alert-content">
                <div className="alert-user">
                  <span className="username">{gift.username}</span>
                  {userXP[gift.username] && userXP[gift.username].badges.length > 0 && (
                    <span className="badges">
                      {userXP[gift.username].badges.slice(0, 2).map(badge => (
                        <span key={badge} className={`badge ${badge.toLowerCase().replace(' ', '-')}`}>🏆</span>
                      ))}
                    </span>
                  )}
                  <span className="sent-text">sent</span>
                </div>
                <div className="alert-gift">
                  <span className="gift-name">{gift.giftName}</span>
                  {gift.repeatCount > 1 && (
                    <span className="gift-count">×{gift.repeatCount}</span>
                  )}
                </div>
                <div className="alert-value">
                  {formatCurrency(gift.giftValue)}
                </div>
              </div>
              <div className="alert-effect">
                <span className="effect-indicator">✨</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-alerts">
            <span>🎁 Waiting for gifts...</span>
            <span>Be the first to send one!</span>
          </div>
        )}
      </div>

      <div className="alert-stats">
        <div className="stat">
          <span className="stat-number">{recentAlerts.length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat">
          <span className="stat-number">{gifts.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>
    </div>
  )
}

export default AlertSystem
