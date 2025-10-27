import { useState, useCallback } from 'react';

const MAX_QUEUE_SIZE = 1000;
const BATCH_SIZE = 50;

export const useWebSocketQueue = (onFlush) => {
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const enqueue = useCallback((message) => {
    setQueue(prev => {
      // Prevent duplicates
      if (prev.some(item => item.id === message.id)) return prev;
      // Enforce max queue size
      return [message, ...prev].slice(0, MAX_QUEUE_SIZE);
    });  
  }, []);

  const flush = useCallback(async () => {
    if (queue.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const batch = queue.slice(0, BATCH_SIZE);
    
    try {
      await onFlush(batch);
      // Remove processed batch from queue on success
      setQueue(prev => prev.slice(batch.length));
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to flush queue:', error);
      setRetryCount(prev => {
        const nextCount = prev + 1;
        if (nextCount <= 5) {
          setTimeout(flush, Math.min(1000 * Math.pow(2, nextCount), 30000));
        }
        return nextCount;
      });
    } finally {
      setIsProcessing(false);
    }
  }, [queue, onFlush, isProcessing]);

  return { queue, enqueue, flush, isProcessing, retryCount };
};
