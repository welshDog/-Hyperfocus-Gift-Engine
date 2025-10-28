import { renderHook, act } from '@testing-library/react';
import { useWebSocketQueue } from '../useWebSocketQueue';

// Mock timers for testing timeouts
jest.useFakeTimers();

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  jest.useRealTimers();
});

describe('useWebSocketQueue', () => {
  const mockOnFlush = jest.fn();
  const mockOnDeadLetter = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should initialize with empty queues', () => {
    const { result } = renderHook(() => useWebSocketQueue(() => {}));
    
    expect(result.current.queue).toEqual([]);
    expect(result.current.deadLetterQueue).toEqual([]);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.retryCount).toBe(0);
    expect(result.current.queueSize).toBe(0);
    expect(result.current.deadLetterCount).toBe(0);
    expect(result.current.isQueueFull).toBe(false);
  });

  it('should enqueue messages', () => {
    const { result } = renderHook(() => useWebSocketQueue(mockOnFlush));
    
    act(() => {
      result.current.enqueue({ id: '1', data: 'test1' });
      result.current.enqueue({ id: '2', data: 'test2' });
    });
    
    expect(result.current.queueSize).toBe(2);
    expect(result.current.queue[0].id).toBe('1');
    expect(result.current.queue[1].id).toBe('2');
  });

  it('should process messages in batches', async () => {
    mockOnFlush.mockResolvedValueOnce();
    
    const { result } = renderHook(() => 
      useWebSocketQueue(mockOnFlush, { batchSize: 2 })
    );
    
    // Add 3 messages
    act(() => {
      result.current.enqueue({ id: '1', data: 'test1' });
      result.current.enqueue({ id: '2', data: 'test2' });
      result.current.enqueue({ id: '3', data: 'test3' });
    });
    
    // Process first batch
    await act(async () => {
      await result.current.flush();
    });
    
    expect(mockOnFlush).toHaveBeenCalledTimes(1);
    expect(mockOnFlush.mock.calls[0][0]).toHaveLength(2);
    expect(result.current.queueSize).toBe(1);
    expect(result.current.stats.processed).toBe(2);
  });

  it('should retry failed messages with exponential backoff', async () => {
    const error = new Error('Test error');
    mockOnFlush
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce();
    
    const { result } = renderHook(() => 
      useWebSocketQueue(mockOnFlush, { 
        batchSize: 1,
        maxRetries: 3,
        onDeadLetter: mockOnDeadLetter 
      })
    );
    
    // Add a message
    act(() => {
      result.current.enqueue({ id: '1', data: 'test' });
    });
    
    // First attempt (fails)
    await act(async () => {
      await result.current.flush();
    });
    
    expect(mockOnFlush).toHaveBeenCalledTimes(1);
    expect(result.current.retryCount).toBe(1);
    
    // Fast-forward time for retry
    act(() => {
      jest.advanceTimersByTime(2000); // 2 seconds
    });
    
    // Second attempt (fails)
    await act(async () => {
      jest.runAllTimers();
    });
    
    expect(mockOnFlush).toHaveBeenCalledTimes(2);
    expect(result.current.retryCount).toBe(2);
    
    // Third attempt (succeeds)
    await act(async () => {
      jest.advanceTimersByTime(4000); // 4 seconds
      jest.runAllTimers();
    });
    
    expect(mockOnFlush).toHaveBeenCalledTimes(3);
    expect(result.current.retryCount).toBe(0);
    expect(result.current.queueSize).toBe(0);
    expect(mockOnDeadLetter).not.toHaveBeenCalled();
  });

  it('should move messages to dead-letter queue after max retries', async () => {
    const error = new Error('Permanent failure');
    mockOnFlush.mockRejectedValue(error);
    
    const { result } = renderHook(() => 
      useWebSocketQueue(mockOnFlush, { 
        batchSize: 1,
        maxRetries: 2,
        onDeadLetter: mockOnDeadLetter 
      })
    );
    
    // Add a message
    act(() => {
      result.current.enqueue({ id: '1', data: 'test' });
    });
    
    // Process with retries (will fail all attempts)
    await act(async () => {
      await result.current.flush();
      jest.runAllTimers(); // First retry
      jest.runAllTimers(); // Second retry (max reached)
    });
    
    expect(mockOnFlush).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(result.current.deadLetterCount).toBe(1);
    expect(mockOnDeadLetter).toHaveBeenCalledTimes(1);
    expect(result.current.queueSize).toBe(0);
  });

  it('should handle message priorities', async () => {
    mockOnFlush.mockResolvedValue();
    
    const { result } = renderHook(() => 
      useWebSocketQueue(mockOnFlush, { batchSize: 3 })
    );
    
    // Add messages with different priorities
    act(() => {
      result.current.enqueue({ id: '1', data: 'low' }, 1);
      result.current.enqueue({ id: '2', data: 'high' }, 10);
      result.current.enqueue({ id: '3', data: 'medium' }, 5);
    });
    
    // Process batch
    await act(async () => {
      await result.current.flush();
    });
    
    // Should be processed in priority order: high (2), medium (3), low (1)
    expect(mockOnFlush.mock.calls[0][0].map(m => m.id)).toEqual(['2', '3', '1']);
  });

  it('should prevent duplicate messages', () => {
    const { result } = renderHook(() => useWebSocketQueue(mockOnFlush));
    
    act(() => {
      result.current.enqueue({ id: '1', data: 'test' });
      result.current.enqueue({ id: '1', data: 'test' }); // Duplicate
      result.current.enqueue({ id: '2', data: 'test2' });
    });
    
    expect(result.current.queueSize).toBe(2);
    expect(result.current.queue.map(m => m.id)).toEqual(['1', '2']);
  });

  it('should not exceed max queue size', () => {
    const { result } = renderHook(() => 
      useWebSocketQueue(mockOnFlush, { maxQueueSize: 2 })
    );
    
    act(() => {
      result.current.enqueue({ id: '1', data: 'test1' });
      result.current.enqueue({ id: '2', data: 'test2' });
      result.current.enqueue({ id: '3', data: 'test3' }); // Should be dropped
    });
    
    expect(result.current.queueSize).toBe(2);
    expect(result.current.isQueueFull).toBe(true);
    expect(result.current.queue.map(m => m.id)).toEqual(['1', '2']);
  });

  it('should retry dead letters', async () => {
    const { result } = renderHook(() => 
      useWebSocketQueue(mockOnFlush, { onDeadLetter: mockOnDeadLetter })
    );
    
    // Manually add to dead letter queue
    const deadLetter = { id: 'dl1', data: 'dead' };
    act(() => {
      result.current.moveToDeadLetterQueue([deadLetter], new Error('Test'));
    });
    
    expect(result.current.deadLetterCount).toBe(1);
    
    // Retry the dead letter
    act(() => {
      result.current.retryDeadLetters(['dl1']);
    });
    
    expect(result.current.deadLetterCount).toBe(0);
    expect(result.current.queueSize).toBe(1);
    expect(result.current.queue[0].id).toBe('dl1');
    expect(result.current.queue[0]._priority).toBe(1); // Priority should be increased
  });

  it('should clear dead letter queue', () => {
    const { result } = renderHook(() => useWebSocketQueue(mockOnFlush));
    
    // Add to dead letter queue
    act(() => {
      result.current.moveToDeadLetterQueue(
        [{ id: '1', data: 'test' }], 
        new Error('Test')
      );
    });
    
    expect(result.current.deadLetterCount).toBe(1);
    
    // Clear dead letter queue
    act(() => {
      result.current.clearDeadLetterQueue();
    });
    
    expect(result.current.deadLetterCount).toBe(0);
  });
});
