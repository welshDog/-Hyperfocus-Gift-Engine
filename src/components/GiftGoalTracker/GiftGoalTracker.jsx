import React, { useMemo } from 'react';

function GiftGoalTracker({ gifts = [] }) {
  const goals = [
    { id: 'universe-goal', giftName: 'Universe', target: 10, reward: 'Supernova Effect' },
    { id: 'rose-goal', giftName: 'Rose', target: 25, reward: 'Rose Garden Visual' },
    { id: 'heart-goal', giftName: 'Heart', target: 15, reward: 'Heart Storm' },
    { id: 'coins-goal', giftName: 'Coins', target: 50, reward: 'Coin Rain' }
  ];

  const goalProgress = useMemo(() => {
    return goals.map(goal => {
      const count = gifts.filter(g => g.giftName === goal.giftName).length;
      return { ...goal, count, progress: count / goal.target };
    });
  }, [gifts]);

  return (
    <div className="gift-goal-tracker">
      <div className="goal-header">
        <h3>🎯 Community Goals</h3>
        <span>Unlock special effects together!</span>
      </div>

      <div className="goals-list">
        {goalProgress.map(goal => (
          <div key={goal.id} className="goal-item">
            <div className="goal-info">
              <span className="goal-name">{goal.giftName}</span>
              <span className="goal-reward">{goal.reward}</span>
            </div>
            <div className="goal-progress">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${goal.progress >= 1 ? 'complete' : ''}`}
                  style={{ width: `${Math.min(goal.progress * 100, 100)}%` }}
                ></div>
              </div>
              <span className="progress-text">{goal.count}/{goal.target}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GiftGoalTracker;
