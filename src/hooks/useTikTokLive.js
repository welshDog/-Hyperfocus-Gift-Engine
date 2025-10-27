import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useWebSocketQueue } from './useWebSocketQueue';
import { logger } from '../utils/logger';

const WS_URL = 'ws://localhost:8765';
const PING_INTERVAL = 30000; // 30 seconds

export const useTikTokLive = (username) => {
  const [gifts, setGifts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const pingInterval = useRef(null);
  const lastPingTime = useRef(0);
  
  // WebSocket queue for handling offline messages
  const { enqueue: enqueueGift, flush: flushQueuedGifts, retryCount } = useWebSocketQueue(
    useCallback(async (giftBatch) => {
      // Process batch of gifts when connection is restored
      setGifts(prev => [...giftBatch, ...prev].slice(0, 100));
      return Promise.resolve();
    }, [])

  const createGiftEvent = (data) => {
    const giftValue = calculateGiftValue(data.gift.name, data.gift.repeat_count);
    return {
      id: `${data.msg_id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: data.user?.username || 'Anonymous',
      giftName: data.gift.name,
      giftValue,
      diamondValue: Math.floor(giftValue / 100),
      timestamp: new Date(),
      tier: calculateGiftTier(giftValue),
      repeatCount: data.gift.repeat_count || 1,
      effect: data.effect
    };
  };

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= 5) {
      setError('Failed to connect after multiple attempts. Please refresh the page.');
      setConnectionStatus('error');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current += 1;
    
    logger.warn(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/5)`);
    setConnectionStatus(`reconnecting-${reconnectAttempts.current}`);
    
    setTimeout(() => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        connect();
      }
    }, delay);
  }, [connect]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (!username) return;

    setConnectionStatus('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      logger.info('Connected to TikTok Gift Engine backend');
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      setError(null);

      // Start ping interval
      pingInterval.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          lastPingTime.current = Date.now();
        }
      }, PING_INTERVAL);

      // Send username to backend
      ws.send(JSON.stringify({
        type: 'connect',
        username: username
      }));

      // Process any queued gifts
      flushQueuedGifts();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle pong response
        if (data.type === 'pong') {
          const latency = Date.now() - data.timestamp;
          logger.debug(`Ping latency: ${latency}ms`);
          return;
        }

        // Handle gift events
        if (data.event === 'gift_received') {
          const giftEvent = createGiftEvent(data);
          if (connectionStatus === 'connected') {
            setGifts(prev => [giftEvent, ...prev].slice(0, 100));
          } else {
            enqueueGift(giftEvent);
          }
        } else if (data.event === 'stream_connected') {
          logger.info(`Connected to ${data.user}'s TikTok Live stream`);
        } else if (data.event === 'comment') {
          logger.debug(`Comment from ${data.user}: ${data.message}`);
        }
      } catch (err) {
        logger.error('Error processing message', err);
      }
    };

    ws.onerror = (error) => {
      logger.error('WebSocket error', { error });
      setConnectionStatus('error');
      setError('Connection error. Attempting to reconnect...');
      handleReconnect();
    };

    ws.onclose = (event) => {
      logger.warn(`WebSocket closed: ${event.code} ${event.reason}`);
      clearInterval(pingInterval.current);
      
      if (event.code !== 1000) { // Don't reconnect on normal closure
        handleReconnect();
      } else {
        setConnectionStatus('disconnected');
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component unmounting');
      }
      clearInterval(pingInterval.current);
    };
  }, [username, enqueueGift, flushQueuedGifts, handleReconnect, connectionStatus]);

  // Initial connection
  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        clearInterval(pingInterval.current);
      }
    };
  }, [connect]);

  // Check for connection health
  useEffect(() => {
    const checkConnectionHealth = () => {
      if (connectionStatus === 'connected' && Date.now() - lastPingTime.current > PING_INTERVAL * 1.5) {
        logger.warn('No ping response, reconnecting...');
        handleReconnect();
      }
    };

    const healthCheckInterval = setInterval(checkConnectionHealth, 5000);
    return () => clearInterval(healthCheckInterval);
  }, [connectionStatus, handleReconnect]);

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

  // Expose connection status and reconnect method
  const isConnected = connectionStatus === 'connected';
  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  const clearGifts = useCallback(() => {
    setGifts([]);
  }, []);

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

  return {
    gifts,
    isConnected,
    connectionStatus,
    error,
    clearGifts,
    userXP,
    userCoins,
    reconnect,
    retryCount
  };
};
