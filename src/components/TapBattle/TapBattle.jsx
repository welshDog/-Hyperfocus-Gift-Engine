import React, { useState, useEffect, useMemo } from 'react';

function TapBattle({ gifts = [], userXP = {}, onBadgeEarned }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [victoryAnimation, setVictoryAnimation] = useState(false);

  // Battle configurations - gets harder each round
  const battleConfig = {
    1: { target: 10, name: 'Novice Battle', reward: 'Bronze Warrior', xpBonus: 50 },
    2: { target: 25, name: 'Apprentice Battle', reward: 'Silver Warrior', xpBonus: 100 },
    3: { target: 50, name: 'Expert Battle', reward: 'Gold Warrior', xpBonus: 200 },
    4: { target: 100, name: 'Master Battle', reward: 'Diamond Warrior', xpBonus: 500 },
    5: { target: 200, name: 'Legendary Battle', reward: 'Epic Champion', xpBonus: 1000 }
  };

  const currentBattle = battleConfig[currentRound] || battleConfig[5];

  // Calculate progress based on recent gifts
  useEffect(() => {
    const recentGifts = gifts.slice(-currentBattle.target); // Only count gifts from current round
    const newProgress = Math.min((recentGifts.length / currentBattle.target) * 100, 100);
    setProgress(newProgress);

    if (newProgress >= 100 && !isVictory) {
      handleVictory();
    }
  }, [gifts, currentBattle.target, isVictory]);

  const handleVictory = () => {
    setIsVictory(true);
    setVictoryAnimation(true);

    // Award badge and XP bonus
    if (onBadgeEarned) {
      onBadgeEarned(currentBattle.reward, currentBattle.xpBonus);
    }

    // Reset after animation
    setTimeout(() => {
      setVictoryAnimation(false);
      setTimeout(() => {
        setCurrentRound(prev => Math.min(prev + 1, 5));
        setProgress(0);
        setIsVictory(false);
      }, 500);
    }, 2000);
  };

  const getProgressColor = () => {
    if (progress < 25) return '#ef4444'; // red
    if (progress < 50) return '#f97316'; // orange
    if (progress < 75) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  return (
    <div className="tap-battle">
      <div className="battle-header">
        <h3>⚔️ Tap Battle Arena</h3>
        <div className="battle-info">
          <span className="round-name">{currentBattle.name}</span>
          <span className="round-number">Round {currentRound}</span>
        </div>
      </div>

      <div className="battle-arena">
        <div className="progress-container">
          <div className="progress-bar-background">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                backgroundColor: getProgressColor()
              }}
            ></div>
          </div>
          <div className="progress-text">
            <span className="progress-percentage">{Math.round(progress)}%</span>
            <span className="progress-target">{Math.round(progress / 100 * currentBattle.target)} / {currentBattle.target} gifts</span>
          </div>
        </div>

        {isVictory && (
          <div className={`victory-overlay ${victoryAnimation ? 'show' : ''}`}>
            <div className="victory-content">
              <div className="victory-icon">🏆</div>
              <div className="victory-text">VICTORY!</div>
              <div className="victory-reward">
                <span className="reward-badge">{currentBattle.reward}</span>
                <span className="reward-xp">+{currentBattle.xpBonus} XP</span>
              </div>
            </div>
          </div>
        )}

        <div className="battle-status">
          <div className="status-item">
            <span className="status-icon">🎯</span>
            <span className="status-text">Target: {currentBattle.target} gifts</span>
          </div>
          <div className="status-item">
            <span className="status-icon">🏅</span>
            <span className="status-text">Reward: {currentBattle.reward}</span>
          </div>
          <div className="status-item">
            <span className="status-icon">⚡</span>
            <span className="status-text">+{currentBattle.xpBonus} XP</span>
          </div>
        </div>
      </div>

      <div className="battle-encouragement">
        <span>💪 Send gifts to power up the battle!</span>
        <span>🌟 Unlock epic rewards and climb the ranks!</span>
      </div>
    </div>
  );
}

export default TapBattle;
