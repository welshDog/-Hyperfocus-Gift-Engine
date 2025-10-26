import { useState, useEffect, useCallback } from 'react';

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

  // Clear gifts history
  const clearGifts = useCallback(() => {
    setGifts([]);
  }, []);

  return {
    gifts,
    isConnected,
    error,
    clearGifts
  };
};
