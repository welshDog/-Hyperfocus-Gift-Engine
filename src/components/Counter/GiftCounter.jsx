import React from 'react'

function GiftCounter({ compact = false, totalCoins = 0, giftCount = 0 }) {
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
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

  if (compact) {
    return (
      <div className="gift-counter-compact">
        <div className="counter-value">
          {formatNumber(giftCount)}
        </div>
        <div className="counter-label">
          {formatCurrency(totalCoins)}
        </div>
      </div>
    )
  }

  return (
    <div className="gift-counter">
      <div className="counter-header">
        <h3>🎁 Live Gift Counter</h3>
        <div className="live-indicator">
          <div className="live-dot"></div>
          <span>Real-time</span>
        </div>
      </div>

      <div className="counter-stats">
        <div className="stat-item">
          <div className="stat-value">
            {formatNumber(giftCount)}
          </div>
          <div className="stat-label">Total Gifts</div>
        </div>

        <div className="stat-item">
          <div className="stat-value">
            {formatNumber(totalCoins)}
          </div>
          <div className="stat-label">Total Coins</div>
        </div>

        <div className="stat-item">
          <div className="stat-value">
            {formatCurrency(totalCoins)}
          </div>
          <div className="stat-label">Est. Value</div>
        </div>
      </div>

      <div className="counter-footer">
        <div className="activity-info">
          <span>Recent Activity</span>
          <span className="activity-count">
            {Math.min(giftCount, 10)} in last hour
          </span>
        </div>
      </div>
    </div>
  )
}

export default GiftCounter
