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

  const getAlertColor = (giftName) => {
    const colors = {
      'Rose': 'from-pink-500 to-purple-500',
      'Heart': 'from-red-500 to-pink-500',
      'Coins': 'from-yellow-500 to-orange-500',
      'Universe': 'from-purple-500 to-indigo-500',
      'Galaxy': 'from-cyan-500 to-blue-500',
      'TikTok Universe': 'from-purple-500 to-indigo-500',
      'Lion': 'from-yellow-500 to-amber-500',
      'Diamond Flight': 'from-gray-400 to-gray-600',
      'Planet': 'from-orange-500 to-red-500',
      'Airplane': 'from-blue-400 to-cyan-400',
      'Mermaid': 'from-teal-500 to-cyan-500',
      'Disco Ball': 'from-gray-400 to-gray-500',
      'Money Rain': 'from-green-500 to-emerald-500',
      'Confetti': 'from-pink-500 to-rose-500',
      'I Love You': 'from-pink-500 to-red-500'
    }
    return colors[giftName] || 'from-purple-500 to-pink-500'
  }

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
              className={`alert-item ${getAlertColor(gift.giftName).replace('from-', '').replace(' to-', '-')}`}
            >
              <div className="alert-content">
                <div className="alert-user">
                  <span className="username">{gift.username}</span>
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
