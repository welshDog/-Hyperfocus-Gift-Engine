import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWebSocketQueue } from './useWebSocketQueue';

const WS_URL = 'ws://localhost:8765';
const PING_INTERVAL = 30000;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000;

const logger = {
  info: (...args) => console.info('[TikTokLive]', ...args),
  error: (...args) => console.error('[TikTokLive]', ...args),
  debug: (...args) => console.debug('[TikTokLive]', ...args)
};

export const useTikTokLive = ({ username }) => {
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const pingInterval = useRef(null);
  const lastPingTime = useRef(0);
  const processedGiftIds = useRef(new Set());
  const isMounted = useRef(true);

  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [stats, setStats] = useState({
    totalGifts: 0,
    totalDiamonds: 0,
    viewerCount: 0
  });

  const {
    queue: deadLetterQueue,
    enqueue: enqueueGift,
    flush: flushQueuedGifts,
    retryDeadLetters,
    clearDeadLetterQueue,
    isProcessing,
    retryCount,
    queueSize
  } = useWebSocketQueue(
    async (batch) => {
      const validGifts = batch.filter(gift => !processedGiftIds.current.has(gift.id));
      if (validGifts.length === 0) return;
      
      validGifts.forEach(gift => processedGiftIds.current.add(gift.id));
      
      setGifts(prev => [...validGifts, ...prev].slice(0, 100));
      
      const diamondValue = validGifts.reduce((sum, g) => sum + (g.diamondValue || 0), 0);
      setStats(prev => ({
        totalGifts: prev.totalGifts + validGifts.length,
        totalDiamonds: prev.totalDiamonds + diamondValue,
        viewerCount: prev.viewerCount
      }));
    },
    { batchSize: 10, maxQueueSize: 1000, maxRetries: 3 }
  );

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (wsRef.current) wsRef.current.close(1000, 'Component unmounting');
      clearInterval(pingInterval.current);
    };
  }, []);

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      logger.error('Max reconnection attempts reached');
      setError('Failed to reconnect');
      setConnectionStatus('error');
      return;
    }

    const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current++), 30000);
    logger.info(`Reconnecting in ${delay}ms`);
    
    setTimeout(() => isMounted.current && connect(), delay);
  }, []);

  const connect = useCallback(() => {
    if (!username) {
      setError('No username provided');
      return;
    }

    if (wsRef.current) wsRef.current.close();

    setConnectionStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        logger.info('Connecting to TikTok Live...');
        ws.send(JSON.stringify({
          event: 'authenticate',
          username,
          timestamp: Date.now()
        }));
        
        pingInterval.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'ping', timestamp: Date.now() }));
            lastPingTime.current = Date.now();
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.event === 'authenticated') {
            setConnectionStatus('connected');
            reconnectAttempts.current = 0;
            return;
          }
          
          if (data.event === 'pong') {
            logger.debug(`Ping: ${Date.now() - data.timestamp}ms`);
            return;
          }
          
          if (data.event === 'gift_received') {
            const gift = createGiftEvent(data);
            if (!gift) return;
            
            logger.info(`Gift: ${gift.giftName} x${gift.repeatCount}`);
            enqueueGift(gift, 1);
          }
          
          if (data.event === 'viewer_count') {
            setStats(prev => ({ ...prev, viewerCount: data.count }));
          }
          
        } catch (err) {
          logger.error('Message error:', err);
        }
      };

      ws.onerror = (error) => {
        logger.error('WebSocket error:', error);
        setError('Connection error');
        setConnectionStatus('error');
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) handleReconnect();
      };

      ws.onclose = (event) => {
        if (event.code === 1000) {
          setConnectionStatus('disconnected');
        } else {
          setConnectionStatus('reconnecting');
          handleReconnect();
        }
        clearInterval(pingInterval.current);
      };
      
    } catch (error) {
      logger.error('Connection failed:', error);
      setError('Failed to connect');
      handleReconnect();
    }
  }, [username, enqueueGift, handleReconnect]);

  const createGiftEvent = (data) => {
    if (!data?.giftId || !data?.userId) {
      logger.warn('Invalid gift data:', data);
      return null;
    }

    const giftName = data.giftName || 'Gift';
    const repeatCount = data.repeatCount || 1;
    const diamondValue = calculateGiftValue(giftName, repeatCount);
    
    return {
      id: `${data.giftId}-${data.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      giftId: data.giftId,
      giftName,
      displayName: data.displayName || 'Anonymous',
      userId: data.userId,
      repeatCount,
      diamondValue,
      tier: calculateGiftTier(diamondValue),
      timestamp: new Date().toISOString()
    };
  };

  const calculateGiftTier = (value) => {
    if (!value || isNaN(value)) return 0;
    if (value >= 50000) return 3;
    if (value >= 5000) return 2;
    if (value >= 500) return 1;
    return 0;
  };

  const calculateGiftValue = (giftName, repeatCount = 1) => {
    const giftValues = {
      // Common
      'Rose': 1, 'Heart': 5, 'Like': 10, 'Lollipop': 15, 'Ice Cream': 20,
      // Uncommon
      'Cupcake': 50, 'Pizza': 50, 'Cake': 100, 'Coffee': 200,
      // Rare
      'Diamond': 500, 'Rocket': 1000, 'Dragon': 2000,
      // Legendary
      'Galaxy': 5000, 'Universe': 10000, 'TikTok King': 1000000
    };
    
    return (giftValues[giftName] || 1) * (repeatCount || 1);
  };

  const formatGiftValue = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const leaderboard = useMemo(() => {
    const userTotals = {};
    
    gifts.forEach(gift => {
      if (!userTotals[gift.userId]) {
        userTotals[gift.userId] = {
          username: gift.displayName,
          totalGifts: 0,
          totalValue: 0
        };
      }
      userTotals[gift.userId].totalGifts += gift.repeatCount || 1;
      userTotals[gift.userId].totalValue += gift.diamondValue || 0;
    });
    
    return Object.entries(userTotals)
      .map(([userId, data]) => ({
        userId,
        ...data,
        badges: [
          data.totalValue >= 1000 && '👑',
          data.totalValue >= 500 && '🥇',
          data.totalValue >= 100 && '🥈'
        ].filter(Boolean)
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [gifts]);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  const clearGifts = useCallback(() => setGifts([]), []);
  
  const retryFailedGifts = useCallback(() => {
    if (deadLetterQueue.length > 0) retryDeadLetters();
  }, [deadLetterQueue.length, retryDeadLetters]);

  return {
    // State
    gifts,
    leaderboard,
    stats,
    error,
    queueStats: {
      queueSize,
      deadLetterCount: deadLetterQueue.length,
      isProcessing,
      retryCount
    },
    
    // Connection
    isConnected: ['connected', 'authenticated'].includes(connectionStatus),
    isConnecting: connectionStatus.startsWith('connecting') || connectionStatus.startsWith('reconnecting'),
    connectionStatus,
    
    // Methods
    reconnect,
    clearGifts,
    retryFailedGifts,
    clearDeadLetterQueue,
    enqueueGift,
    flushQueuedGifts,
    
    // Utils
    calculateGiftValue,
    calculateGiftTier,
    formatGiftValue
  };
};
