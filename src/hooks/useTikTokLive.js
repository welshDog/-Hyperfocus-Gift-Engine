import { useState, useEffect, useCallback, useMemo } from 'react';

export const useTikTokLive = (username) => {
  const [gifts, setGifts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (!username) return;

    // Connect to your Python WebSocket backend
    // Adjust port if your tiktok_gift_listener.py uses different port
    const websocket = new WebSocket('ws://localhost:8765');

    websocket.onopen = () => {
      console.log('✅ Connected to TikTok Gift Engine backend');
      setIsConnected(true);
      setError(null);

      // Send username to backend to start listening
      websocket.send(JSON.stringify({
        type: 'connect',
        username: username
      }));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle different event types from your Python backend
        if (data.event === 'gift_received') {
          const giftEvent = {
            id: Date.now() + Math.random(), // Unique ID
            username: data.user.username,
            giftName: data.gift.name,
            giftValue: calculateGiftValue(data.gift.name, data.gift.repeat_count), // In coins
            diamondValue: Math.floor(calculateGiftValue(data.gift.name, data.gift.repeat_count) / 100), // Convert to diamonds
            timestamp: new Date(),
            tier: calculateGiftTier(calculateGiftValue(data.gift.name, data.gift.repeat_count)),
            repeatCount: data.gift.repeat_count || 1,
            effect: data.effect
          };

          setGifts(prev => [giftEvent, ...prev].slice(0, 100)); // Keep last 100
        } else if (data.event === 'stream_connected') {
          console.log(`🎥 Connected to ${data.user}'s TikTok Live stream`);
        } else if (data.event === 'comment') {
          console.log(`💬 ${data.user}: ${data.message}`);
        }
      } catch (err) {
        console.error('Error parsing gift data:', err);
      }
    };

    websocket.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('Connection failed. Is the Python backend running?');
      setIsConnected(false);
    };

    websocket.onclose = () => {
      console.log('❌ Disconnected from TikTok backend');
      setIsConnected(false);
    };

    setWs(websocket);

    // Cleanup on unmount
    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [username]);

  // Calculate gift tier based on value (for visual effects)
  const calculateGiftTier = (coinValue) => {
    if (coinValue < 10) return 'small';
    if (coinValue < 100) return 'medium';
    if (coinValue < 1000) return 'large';
    return 'epic';
  };

  // Calculate gift value in coins
  const calculateGiftValue = (giftName, repeatCount = 1) => {
    const giftValues = {
      'Rose': 1,
      'Heart': 5,
      'Coins': 10,
      'Universe': 1000,
      'Galaxy': 500,
      'TikTok Universe': 1000,
      'Lion': 500,
      'Diamond Flight': 200,
      'Planet': 150,
      'Airplane': 50,
      'Mermaid': 25,
      'Disco Ball': 10,
      'Money Rain': 5,
      'Confetti': 1,
      'I Love You': 1
    };
    return (giftValues[giftName] || 1) * repeatCount;
  };

  // Calculate XP and badges from gifts
  const userXP = useMemo(() => {
    const userGifts = {};
    gifts.forEach(gift => {
      const username = gift.username || 'Anonymous';
      if (!userGifts[username]) {
        userGifts[username] = [];
      }
      userGifts[username].push(gift);
    });

    return Object.entries(userGifts).reduce((acc, [username, userGiftsArray]) => {
      const totalXP = userGiftsArray.reduce((sum, gift) => sum + gift.giftValue, 0);
      const badges = [];

      // XP-based badges
      if (totalXP >= 1000) badges.push('Legendary');
      if (totalXP >= 500) badges.push('Gold');
      if (totalXP >= 100) badges.push('Silver');
      if (totalXP >= 10) badges.push('Bronze');

      // Achievement badges
      if (userGiftsArray.length === 1) badges.push('First Gift');
      if (userGiftsArray.length >= 1000) badges.push('Mega Supporter');
      if (userGiftsArray.length >= 100) badges.push('Super Supporter');
      if (userGiftsArray.length >= 50) badges.push('Top Gifter');
      if (userGiftsArray.length >= 10) badges.push('Active Gifter');

      // Combo badges
      const recentGifts = userGiftsArray.filter(g => new Date() - g.timestamp < 30000); // Last 30s
      if (recentGifts.length >= 5) badges.push('Combo Master');

      // High value badges
      const maxGift = userGiftsArray.reduce((max, g) => g.giftValue > max.giftValue ? g : max, userGiftsArray[0]);
      if (maxGift && maxGift.giftValue >= 1000) badges.push('Big Spender');

      // Battle completion badges (simplified - in real app you'd track this separately)
      const giftCount = userGiftsArray.length;
      if (giftCount >= 200) badges.push('Epic Champion');
      else if (giftCount >= 100) badges.push('Diamond Warrior');
      else if (giftCount >= 50) badges.push('Gold Warrior');
      else if (giftCount >= 25) badges.push('Silver Warrior');
      else if (giftCount >= 10) badges.push('Bronze Warrior');

      acc[username] = { xp: totalXP, badges };
      return acc;
    }, {});
  }, [gifts]);

  // Calculate BROski$ Coins from gifts with multipliers
  const userCoins = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const isPeakHour = (currentHour >= 19 && currentHour <= 23) || (currentHour >= 12 && currentHour <= 14); // 12-2PM or 7-11PM
    const loyaltyMultiplier = isPeakHour ? 2 : 1;

    const userGiftCounts = {};
    gifts.forEach(gift => {
      const username = gift.username || 'Anonymous';
      if (!userGiftCounts[username]) {
        userGiftCounts[username] = { giftCount: 0, totalValue: 0, referrals: 0 };
      }
      userGiftCounts[username].giftCount += 1;
      userGiftCounts[username].totalValue += gift.giftValue;
    });

    return Object.entries(userGiftCounts).reduce((acc, [username, data]) => {
      // Base coins: 1 coin per gift + bonus for value
      let baseCoins = data.giftCount + Math.floor(data.totalValue / 100);

      // Loyalty multiplier during peak hours
      baseCoins *= loyaltyMultiplier;

      // Referral bonus (simplified - in real app would track invites)
      const referralBonus = data.referrals * 10;

      // Achievement bonuses
      let achievementBonus = 0;
      if (data.giftCount >= 100) achievementBonus += 100; // Century Club
      if (data.giftCount >= 50) achievementBonus += 50;  // Half Century
      if (data.giftCount >= 25) achievementBonus += 25;  // Quarter Century
      if (data.totalValue >= 5000) achievementBonus += 200; // High Roller

      const totalCoins = baseCoins + referralBonus + achievementBonus;

      acc[username] = {
        coins: totalCoins,
        baseCoins,
        loyaltyMultiplier,
        referralBonus,
        achievementBonus,
        giftCount: data.giftCount,
        totalValue: data.totalValue,
        isPeakHour
      };
      return acc;
    }, {});
  }, [gifts]);
  const clearGifts = useCallback(() => {
    setGifts([]);
  }, []);

  return {
    gifts,
    isConnected,
    error,
    userXP,
    userCoins,
    clearGifts
  };
};
