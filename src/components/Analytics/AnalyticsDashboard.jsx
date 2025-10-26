import React, { useState, useMemo } from 'react'

function AnalyticsDashboard({ gifts = [] }) {
  const [timeframe, setTimeframe] = useState('24h')

  const analytics = useMemo(() => {
    if (gifts.length === 0) {
      return {
        totalGifts: 0,
        totalValue: 0,
        uniqueUsers: 0,
        averageValue: 0,
        hourlyRate: 0,
        topGift: null,
        recentActivity: []
      }
    }

    // Calculate analytics from real gifts
    const totalGifts = gifts.length
    const totalValue = gifts.reduce((sum, gift) => sum + gift.giftValue, 0)
    const uniqueUsers = new Set(gifts.map(gift => gift.username)).size
    const averageValue = totalGifts > 0 ? totalValue / totalGifts : 0

    // Calculate top gift
    const giftCounts = gifts.reduce((acc, gift) => {
      acc[gift.giftName] = (acc[gift.giftName] || 0) + 1
      return acc
    }, {})
    const topGift = Object.entries(giftCounts)
      .sort(([,a], [,b]) => b - a)[0]

    // Recent activity (last 5 gifts)
    const recentActivity = gifts.slice(0, 5).map(gift => ({
      time: gift.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: gift.username,
      gift: gift.giftName,
      value: gift.giftValue
    }))

    // Calculate hourly rate based on timeframe
    const timeframeHours = { '1h': 1, '24h': 24, '7d': 168 }[timeframe] || 24
    const hourlyRate = totalValue / timeframeHours

    return {
      totalGifts,
      totalValue,
      uniqueUsers,
      averageValue,
      hourlyRate,
      topGift: topGift ? { name: topGift[0], count: topGift[1] } : null,
      recentActivity
    }
  }, [gifts, timeframe])

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return Math.round(num).toString()
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
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h3>📈 Live Analytics</h3>
        <div className="timeframe-selector">
          {['1h', '24h', '7d'].map((tf) => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-stats">
        <div className="stat-card">
          <div className="stat-value">{formatNumber(analytics.totalGifts)}</div>
          <div className="stat-label">Total Gifts</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{formatCurrency(analytics.totalValue)}</div>
          <div className="stat-label">Total Value</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{analytics.uniqueUsers}</div>
          <div className="stat-label">Unique Gifters</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{formatCurrency(analytics.hourlyRate)}</div>
          <div className="stat-label">Per Hour</div>
        </div>
      </div>

      <div className="analytics-sections">
        <div className="analytics-section">
          <h4>🎯 Top Gift Type</h4>
          {analytics.topGift ? (
            <div className="top-gift">
              <span className="gift-name">{analytics.topGift.name}</span>
              <span className="gift-count">{analytics.topGift.count} times</span>
            </div>
          ) : (
            <div className="no-data">No gifts yet</div>
          )}
        </div>

        <div className="analytics-section">
          <h4>⚡ Recent Activity</h4>
          {analytics.recentActivity.length > 0 ? (
            <div className="activity-list">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-time">{activity.time}</div>
                  <div className="activity-details">
                    <span className="activity-user">{activity.user}</span>
                    <span className="activity-gift">{activity.gift}</span>
                  </div>
                  <div className="activity-value">{formatCurrency(activity.value)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
