import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useWebSocketQueue } from './useWebSocketQueue';
import { logger } from '../utils/logger';

const WS_URL = 'ws://localhost:8765';
const PING_INTERVAL = 30000; // 30 seconds
const MAX_QUEUE_SIZE = 1000; // Maximum number of messages to keep in memory
const BATCH_SIZE = 50; // Number of messages to process in each batch
const MAX_RETRIES = 5; // Maximum number of retry attempts for failed messages

export const useTikTokLive = (username) => {
  const [gifts, setGifts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalGifts: 0,
    totalDiamonds: 0,
    failedGifts: 0,
    lastGiftTime: null,
  });
  
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const pingInterval = useRef(null);
  const lastPingTime = useRef(0);
  const processedGiftIds = useRef(new Set());
  
  // Enhanced WebSocket queue with dead-letter queue support
  const {
    enqueue: enqueueGift,
    flush: flushQueuedGifts,
    deadLetterQueue,
    retryDeadLetters,
    clearDeadLetterQueue,
    stats: queueStats,
    isProcessing,
    retryCount,
  } = useWebSocketQueue(
    async (giftBatch) => {
      // Process batch of gifts when connection is restored
      const validGifts = giftBatch.filter(gift => {
        // Skip if we've already processed this gift
        if (processedGiftIds.current.has(gift.id)) {
          return false;
        }
        processedGiftIds.current.add(gift.id);
        return true;
      });
      
      if (validGifts.length === 0) {
        return;
      }
      
      // Update gifts state
      setGifts(prev => {
        const newGifts = [...validGifts, ...prev].slice(0, 100);
        return newGifts;
      });
      
      // Update stats
      setStats(prev => {
        const newDiamonds = validGifts.reduce((sum, gift) => sum + (gift.diamondValue || 0), 0);
        return {
          ...prev,
          totalGifts: prev.totalGifts + validGifts.length,
          totalDiamonds: prev.totalDiamonds + newDiamonds,
          lastGiftTime: new Date().toISOString(),
        };
      });
      
      return Promise.resolve();
    },
    {
      batchSize: BATCH_SIZE,
      maxQueueSize: MAX_QUEUE_SIZE,
      maxRetries: MAX_RETRIES,
      onDeadLetter: (failedGifts, error) => {
        logger.error(`Failed to process ${failedGifts.length} gifts after ${MAX_RETRIES} attempts`, error);
        setStats(prev => ({
          ...prev,
          failedGifts: prev.failedGifts + failedGifts.length,
        }));
      },
    }
  );

  /**
   * Create a gift event object from WebSocket data
   * @param {Object} data - Raw gift data from WebSocket
   * @returns {Object} Processed gift event
   */
  const createGiftEvent = (data) => {
    if (!data?.gift?.name) {
      logger.warn('Invalid gift data received:', data);
      return null;
    }
    
    const giftValue = calculateGiftValue(data.gift.name, data.gift.repeat_count);
    const giftId = data.msg_id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: giftId,
      username: data.user?.username || 'Anonymous',
      displayName: data.user?.nickname || data.user?.username || 'Anonymous',
      giftName: data.gift.name,
      giftId: data.gift.id,
      giftValue,
      diamondValue: Math.floor(giftValue / 100),
      timestamp: new Date().toISOString(),
      tier: calculateGiftTier(giftValue),
      repeatCount: data.gift.repeat_count || 1,
      effect: data.effect || { type: 'default', intensity: 1 },
      isStreaking: data.gift.is_streaking || false,
      rawData: data // Keep original data for reference
    };
  };

  /**
   * Handle reconnection with exponential backoff
   */
  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= 5) {
      const errorMsg = 'Failed to connect after multiple attempts. Please check your connection and refresh the page.';
      logger.error(errorMsg);
      setError(errorMsg);
      setConnectionStatus('error');
      return;
    }

    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts.current) + Math.random() * 1000, maxDelay);
    
    reconnectAttempts.current += 1;
    
    logger.warn(`Reconnecting in ${Math.round(delay/1000)}s (attempt ${reconnectAttempts.current}/5)`);
    setConnectionStatus(`reconnecting-${reconnectAttempts.current}`);
    
    const reconnectTimer = setTimeout(() => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        connect();
      }
    }, delay);
    
    // Cleanup timer on unmount
    return () => clearTimeout(reconnectTimer);
  }, [connect]);

  /**
   * Establish WebSocket connection to TikTok Live backend
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      logger.debug('WebSocket already connected');
      return;
    }
    
    if (!username) {
      logger.warn('Cannot connect: username is required');
      return;
    }

    logger.info(`Connecting to WebSocket server at ${WS_URL}`);
    setConnectionStatus('connecting');
    setError(null);
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        logger.info('✅ Connected to TikTok Gift Engine backend');
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        setError(null);

        // Start ping interval
        pingInterval.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const pingData = { 
              type: 'ping', 
              timestamp: Date.now(),
              clientId: `web-${Math.random().toString(36).substr(2, 9)}`
            };
            ws.send(JSON.stringify(pingData));
            lastPingTime.current = Date.now();
            
            // Log ping for debugging
            logger.debug('Ping sent', pingData);
          }
        }, PING_INTERVAL);

        // Send authentication message
        const authMessage = {
          type: 'authenticate',
          username: username,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          capabilities: ['gifts', 'comments', 'viewers']
        };
        
        ws.send(JSON.stringify(authMessage));
        logger.debug('Authentication sent', authMessage);

        // Process any queued gifts
        if (queueStats.queueSize > 0) {
          logger.info(`Processing ${queueStats.queueSize} queued gifts`);
          flushQueuedGifts();
        }
      };

      ws.onmessage = (event) => {
        try {
          let data;
          
          try {
            data = JSON.parse(event.data);
          } catch (parseError) {
            logger.error('Failed to parse WebSocket message:', parseError, event.data);
            return;
          }
          
          // Handle pong response
          if (data.type === 'pong') {
            const latency = Date.now() - data.timestamp;
            logger.debug(`Pong received - latency: ${latency}ms`);
            return;
          }
          
          // Handle authentication response
          if (data.type === 'auth_response') {
            if (data.success) {
              logger.info('Successfully authenticated with backend');
              setConnectionStatus('authenticated');
            } else {
              logger.error('Authentication failed:', data.error);
              setError(`Authentication failed: ${data.error || 'Unknown error'}`);
              setConnectionStatus('error');
              ws.close(4000, 'Authentication failed');
            }
            return;
          }

        // Handle gift events
        if (data.event === 'gift_received') {
          const giftEvent = createGiftEvent(data);
          if (!giftEvent) return; // Skip invalid gift events
          
          // Log gift received
          logger.info(`🎁 Gift received: ${giftEvent.giftName} x${giftEvent.repeatCount} from ${giftEvent.displayName}`);
          
          // If connected, process immediately; otherwise, add to queue
          if (connectionStatus === 'authenticated' || connectionStatus === 'connected') {
            // Add to processed set to prevent duplicates
            processedGiftIds.current.add(giftEvent.id);
            
            // Update gifts state
            setGifts(prev => {
              const newGifts = [giftEvent, ...prev].slice(0, 100);
              return newGifts;
            });
            
            // Update stats
            setStats(prev => ({
              ...prev,
              totalGifts: prev.totalGifts + 1,
              totalDiamonds: prev.totalDiamonds + giftEvent.diamondValue,
              lastGiftTime: new Date().toISOString()
            }));
            
            // Trigger any visual effects or notifications
            handleGiftEffect(giftEvent);
          } else {
            // Queue the gift for later processing
            enqueueGift(giftEvent, 1); // Priority 1 for normal gifts
          }
        } 
        // Handle stream status updates
        else if (data.event === 'stream_connected') {
          logger.info('Stream connected:', data);
          setConnectionStatus('stream_active');
          setError(null);
        } 
        // Handle stream end
        else if (data.event === 'stream_ended') {
          logger.info('Stream ended:', data);
          setConnectionStatus('stream_ended');
        } 
        // Handle viewer count updates
        else if (data.event === 'viewer_count') {
          // Update viewer count in stats
          setStats(prev => ({
            ...prev,
            viewerCount: data.count,
            viewerCountUpdated: new Date().toISOString()
          }));
        }
          logger.info(`Connected to ${data.user}'s TikTok Live stream`);
        } else if (data.event === 'comment') {
          logger.debug(`Comment from ${data.user}: ${data.message}`);
        }
      } catch (err) {
        logger.error('Error processing message', err);
      }
    };

    ws.onerror = (error) => {
      const errorMsg = `WebSocket error: ${error.message || 'Unknown error'}`;
      logger.error(errorMsg, error);
      setError(errorMsg);
      setConnectionStatus('error');
      
      // Attempt to reconnect on error
      if (reconnectAttempts.current < 5) {
        handleReconnect();
      }
    };

    ws.onclose = (event) => {
      const closeMsg = `WebSocket connection closed - Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`;
      
      if (event.code === 1000) {
        logger.info('WebSocket connection closed normally');
        setConnectionStatus('disconnected');
      } else if (event.code === 4000) {
        logger.error('Authentication failed, not reconnecting');
        setConnectionStatus('auth_failed');
        setError('Authentication failed. Please check your credentials and try again.');
      } else {
        logger.warn(closeMsg);
        setConnectionStatus('reconnecting');
        setError('Connection lost. Attempting to reconnect...');
        handleReconnect();
      }
      
      // Clean up ping interval
      clearInterval(pingInterval.current);
    };

      // Cleanup function for the WebSocket connection
      return () => {
        logger.info('Cleaning up WebSocket connection');
        
        // Close WebSocket if it's open
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'Component unmounting');
        }
        
        // Clear any active intervals
        clearInterval(pingInterval.current);
        
        // Process any remaining queued gifts before unmounting
        if (queueStats.queueSize > 0) {
          logger.info(`Processing ${queueStats.queueSize} remaining gifts before unmount`);
          flushQueuedGifts();
        }
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

  /**
   * Calculate gift tier based on value
   * @param {number} value - Gift value in coins
   * @returns {number} Tier level (0-3)
   */
  const calculateGiftTier = (value) => {
    if (!value || isNaN(value)) return 0;
    
    if (value >= 50000) return 3; // Legendary (Gold)
    if (value >= 5000) return 2;  // Epic (Purple)
    if (value >= 500) return 1;   // Rare (Blue)
    return 0;                     // Common (Gray)
  };
  
  /**
   * Handle gift visual effects and notifications
   * @param {Object} gift - The gift event
   */
  const handleGiftEffect = (gift) => {
    const { effect, giftName, displayName, repeatCount, tier } = gift;
    
    // Log the effect for debugging
    logger.debug(`Playing effect for ${giftName} (Tier ${tier}):`, effect);
    
    // Trigger haptic feedback on mobile if available
    if (navigator.vibrate) {
      const pattern = tier > 1 ? [100, 50, 100] : [100];
      navigator.vibrate(pattern);
    }
    
    // You can dispatch a custom event or call a global function here
    // to trigger visual effects in your UI components
    const event = new CustomEvent('giftEffect', { 
      detail: { 
        ...gift,
        timestamp: new Date().toISOString()
      } 
    });
    window.dispatchEvent(event);
  };
  
  /**
   * Format gift value for display
   * @param {number} value - Gift value in coins
   * @returns {string} Formatted string (e.g., "1.2K", "5.5M")
   */
  const formatGiftValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  /**
   * Calculate gift value in coins based on gift name and repeat count
   * @param {string} giftName - Name of the gift
   * @param {number} repeatCount - Number of times the gift was sent
   * @returns {number} Total value in coins
   */
  const calculateGiftValue = (giftName, repeatCount = 1) => {
    if (!giftName) return 0;
    
    // Default gift values (in coins)
    const giftValues = {
      // Common gifts (Tier 0)
      'Rose': 1,
      'Heart': 5,
      'Thumbs Up': 10,
      'Like': 10,
      'Lollipop': 15,
      'Ice Cream': 20,
      
      // Uncommon gifts (Tier 1)
      'Cupcake': 50,
      'Pizza': 50,
      'Hamburger': 100,
      'Cake': 100,
      'Doughnut': 150,
      'Coffee': 200,
      
      // Rare gifts (Tier 2)
      'Diamond': 500,
      'Ring': 1000,
      'Rocket': 1000,
      'Dragon': 2000,
      'Super Car': 5000,
      'Private Jet': 10000,
      
      // Legendary gifts (Tier 3)
      'Galaxy': 5000,
      'Universe': 10000,
      'TikTok Trophy': 50000,
      'Golden Mic': 100000,
      'Diamond Crown': 500000,
      'TikTok King': 1000000,
      
      // Additional common gifts
      'Coins': 10,
      'Mermaid': 25,
      'Disco Ball': 10,
      'Money Rain': 5,
      'Confetti': 1,
      'I Love You': 1
    };
    
    const baseValue = giftValues[giftName] || 1;
    const count = Math.max(1, parseInt(repeatCount) || 1);
    return baseValue * count;
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

  // Expose connection status and reconnect method
  const isConnected = connectionStatus === 'authenticated' || connectionStatus === 'stream_active';
  const isConnecting = connectionStatus.startsWith('connecting') || connectionStatus.startsWith('reconnecting');
  
  /**
   * Manually reconnect to the WebSocket server
   */
  const reconnect = useCallback(() => {
    logger.info('Manual reconnection requested');
    reconnectAttempts.current = 0;
    setError(null);
    setConnectionStatus('reconnecting');
    connect();
  }, [connect]);
  
  /**
   * Clear all gifts from the display
   */
  const clearGifts = useCallback(() => {
    setGifts([]);
    logger.info('Cleared all gifts from display');
  }, []);
  
  /**
   * Retry processing failed gifts from the dead-letter queue
   */
  const retryFailedGifts = useCallback(() => {
    if (deadLetterQueue.length > 0) {
      logger.info(`Retrying ${deadLetterQueue.length} failed gifts`);
      retryDeadLetters();
    }
  }, [deadLetterQueue.length, retryDeadLetters]);

  // Calculate user leaderboard with badges
  const leaderboard = useMemo(() => {
    const userGifts = {};
    
    // Process all gifts to calculate user totals
    gifts.forEach(gift => {
      if (!userGifts[gift.userId]) {
        userGifts[gift.userId] = {
          username: gift.displayName || gift.userId,
          totalGifts: 0,
          totalValue: 0,
          gifts: []
        };
      }
      
      userGifts[gift.userId].totalGifts += gift.repeatCount || 1;
      userGifts[gift.userId].totalValue += gift.diamondValue || 0;
      userGifts[gift.userId].gifts.push(gift);
    });
    
    // Convert to array and sort by total value (descending)
    return Object.entries(userGifts)
      .map(([userId, userData]) => ({
        userId,
        username: userData.username,
        totalGifts: userData.totalGifts,
        totalValue: userData.totalValue,
        gifts: userData.gifts,
        // Add badges based on total value
        badges: [
          userData.totalValue >= 1000 && '👑 Legendary',
          userData.totalValue >= 500 && '🥇 Gold',
          userData.totalValue >= 100 && '🥈 Silver',
          userData.totalValue >= 10 && '🥉 Bronze'
        ].filter(Boolean)
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

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
};
    
const baseValue = giftValues[giftName] || 1;
const count = Math.max(1, parseInt(repeatCount) || 1);
return baseValue * count;
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

// Expose connection status and reconnect method
const isConnected = connectionStatus === 'authenticated' || connectionStatus === 'stream_active';
const isConnecting = connectionStatus.startsWith('connecting') || connectionStatus.startsWith('reconnecting');
  
/**
 * Manually reconnect to the WebSocket server
 */
const reconnect = useCallback(() => {
logger.info('Manual reconnection requested');
reconnectAttempts.current = 0;
setError(null);
setConnectionStatus('reconnecting');
connect();
}, [connect]);
  
/**
 * Clear all gifts from the display
 */
const clearGifts = useCallback(() => {
setGifts([]);
logger.info('Cleared all gifts from display');
}, []);
  
/**
 * Retry processing failed gifts from the dead-letter queue
 */
const retryFailedGifts = useCallback(() => {
if (deadLetterQueue.length > 0) {
logger.info(`Retrying ${deadLetterQueue.length} failed gifts`);
retryDeadLetters();
}
}, [deadLetterQueue.length, retryDeadLetters]);

// Calculate user leaderboard with badges
const leaderboard = useMemo(() => {
const userGifts = {};
      
// Process all gifts to calculate user totals
gifts.forEach(gift => {
if (!userGifts[gift.userId]) {
userGifts[gift.userId] = {
username: gift.displayName || gift.userId,
totalGifts: 0,
totalValue: 0,
gifts: []
};
}
      
userGifts[gift.userId].totalGifts += gift.repeatCount || 1;
userGifts[gift.userId].totalValue += gift.diamondValue || 0;
userGifts[gift.userId].gifts.push(gift);
});
      
// Convert to array and sort by total value (descending)
return Object.entries(userGifts)
.map(([userId, userData]) => ({
userId,
username: userData.username,
totalGifts: userData.totalGifts,
totalValue: userData.totalValue,
gifts: userData.gifts,
// Add badges based on total value
badges: [
userData.totalValue >= 1000 && '',
userData.totalValue >= 500 && '',
userData.totalValue >= 100 && '',
userData.totalValue >= 10 && ''
].filter(Boolean)
}))
.sort((a, b) => b.totalValue - a.totalValue);

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

return {
// State
gifts,
leaderboard,
stats,
error,
queueStats,
deadLetterQueue,
      
// Connection status
isConnected,
isConnecting,
connectionStatus,
      
// Methods
reconnect,
clearGifts,
retryFailedGifts,
clearDeadLetterQueue,
      
// For debugging/info
retryCount,
isProcessing,
      
// Utility functions
calculateGiftValue,
calculateGiftTier,
formatGiftValue
};
