import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing a WebSocket message queue with configurable batching and dead-letter queue
 * @param {Function} onFlush - Callback function to process a batch of messages
 * @param {Object} options - Configuration options
 * @param {number} [options.batchSize=50] - Number of messages to process in each batch
 * @param {number} [options.maxQueueSize=1000] - Maximum number of messages to keep in the queue
 * @param {number} [options.maxRetries=5] - Maximum number of retry attempts for failed batches
 * @param {Function} [options.onDeadLetter] - Callback when messages are moved to dead-letter queue
 * @returns {Object} Queue management functions and state
 */
export const useWebSocketQueue = (onFlush, {
  batchSize = 50,
  maxQueueSize = 1000,
  maxRetries = 5,
  onDeadLetter = () => {}
} = {}) => {
  const [queue, setQueue] = useState([]);
  const [deadLetterQueue, setDeadLetterQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState({
    processed: 0,
    failed: 0,
    deadLettered: 0,
    lastProcessed: null
  });

  // Keep track of processed message IDs to prevent duplicates
  const processedIds = useRef(new Set());
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Add a message to the queue if it hasn't been processed before
   * @param {Object} message - The message to enqueue
   * @param {string} message.id - Unique identifier for the message
   * @param {number} [priority=0] - Message priority (higher numbers processed first)
   */
  const enqueue = useCallback((message, priority = 0) => {
    if (!message?.id) {
      console.warn('Message must have an id property');
      return;
    }

    setQueue(prev => {
      // Skip if message is already in queue or was processed
      if (processedIds.current.has(message.id) || 
          prev.some(item => item.id === message.id)) {
        return prev;
      }

      // Add priority and timestamp for sorting
      const prioritizedMessage = {
        ...message,
        _priority: priority,
        _enqueuedAt: Date.now()
      };

      // Add to queue and sort by priority (descending) and enqueue time (ascending)
      const newQueue = [...prev, prioritizedMessage]
        .sort((a, b) => b._priority - a._priority || a._enqueuedAt - b._enqueuedAt)
        .slice(0, maxQueueSize);

      return newQueue;
    });
  }, [maxQueueSize]);

  /**
   * Move messages to dead-letter queue
   * @param {Array} messages - Messages to move to dead-letter queue
   * @param {Error} error - The error that caused the failure
   */
  const moveToDeadLetterQueue = useCallback((messages, error) => {
    if (!messages?.length) return;

    const timestamp = Date.now();
    const deadLetters = messages.map(msg => ({
      ...msg,
      _error: error?.message || 'Unknown error',
      _failedAt: timestamp,
      _retryCount: retryCount
    }));

    setDeadLetterQueue(prev => [...prev, ...deadLetters]);
    setStats(prev => ({
      ...prev,
      deadLettered: prev.deadLettered + deadLetters.length,
      failed: prev.failed + deadLetters.length
    }));

    // Notify about dead-lettered messages
    onDeadLetter(deadLetters, error);
  }, [onDeadLetter, retryCount]);

  /**
   * Process the next batch of messages
   */
  const flush = useCallback(async () => {
    if (!queue.length || isProcessing || !isMounted.current) return;

    setIsProcessing(true);
    const batch = queue.slice(0, batchSize);
    const batchIds = new Set(batch.map(msg => msg.id));

    try {
      await onFlush(batch);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Add processed IDs to prevent requeuing
        batch.forEach(msg => processedIds.current.add(msg.id));
        
        // Remove processed batch from queue
        setQueue(prev => prev.filter(msg => !batchIds.has(msg.id)));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          processed: prev.processed + batch.length,
          lastProcessed: new Date().toISOString()
        }));
        
        // Reset retry count on success
        setRetryCount(0);
      }
    } catch (error) {
      console.error('Failed to process batch:', error);
      
      if (isMounted.current) {
        const nextRetryCount = retryCount + 1;
        
        if (nextRetryCount >= maxRetries) {
          // Max retries reached, move to dead-letter queue
          console.warn(`Max retries (${maxRetries}) reached, moving to dead-letter queue`);
          moveToDeadLetterQueue(batch, error);
          setQueue(prev => prev.filter(msg => !batchIds.has(msg.id)));
          setRetryCount(0);
        } else {
          // Schedule retry with exponential backoff
          const backoffTime = Math.min(1000 * Math.pow(2, nextRetryCount), 30000);
          console.log(`Retrying in ${backoffTime}ms (attempt ${nextRetryCount}/${maxRetries})`);
          
          setTimeout(() => {
            if (isMounted.current) {
              setRetryCount(nextRetryCount);
              flush();
            }
          }, backoffTime);
        }
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  }, [queue, onFlush, isProcessing, retryCount, maxRetries, batchSize, moveToDeadLetterQueue]);

  /**
   * Clear the dead-letter queue
   */
  const clearDeadLetterQueue = useCallback(() => {
    setDeadLetterQueue([]);
  }, []);

  /**
   * Retry messages from dead-letter queue
   * @param {Array} messageIds - Optional array of message IDs to retry (all if not provided)
   */
  const retryDeadLetters = useCallback((messageIds) => {
    setDeadLetterQueue(prev => {
      const toRetry = messageIds 
        ? prev.filter(msg => messageIds.includes(msg.id))
        : [...prev];
      
      // Remove from dead-letter queue and add back to main queue
      const remaining = prev.filter(msg => !toRetry.some(m => m.id === msg.id));
      
      // Add back to main queue with higher priority
      toRetry.forEach(msg => enqueue({
        ...msg,
        _priority: (msg._priority || 0) + 1 // Increase priority for retries
      }));

      return remaining;
    });
  }, [enqueue]);

  return {
    // State
    queue,
    deadLetterQueue,
    isProcessing,
    retryCount,
    stats,
    
    // Actions
    enqueue,
    flush,
    clearDeadLetterQueue,
    retryDeadLetters,
    
    // Status
    queueSize: queue.length,
    deadLetterCount: deadLetterQueue.length,
    isQueueFull: queue.length >= maxQueueSize
  };
};