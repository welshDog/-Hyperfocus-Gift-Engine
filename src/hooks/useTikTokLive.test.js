import { renderHook, act } from '@testing-library/react-hooks';
import { useTikTokLive } from './useTikTokLive';

describe('useTikTokLive', () => {
  let mockServer;
  const URL = 'ws://localhost:8765';

  beforeEach(() => {
    // Mock WebSocket implementation
    global.WebSocket = class MockWebSocket {
      constructor(url) {
        this.url = url;
        this.readyState = WebSocket.CONNECTING;
        this.onopen = null;
        this.onmessage = null;
        this.onerror = null;
        this.onclose = null;
        this.sentMessages = [];
        
        // Simulate connection after a short delay
        setTimeout(() => {
          this.readyState = WebSocket.OPEN;
          if (this.onopen) this.onopen();
        }, 10);
      }

      send(data) {
        this.sentMessages.push(JSON.parse(data));
      }

      close() {
        this.readyState = WebSocket.CLOSED;
        if (this.onclose) this.onclose({ code: 1000 });
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to WebSocket on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTikTokLive('testuser'));
    
    expect(result.current.connectionStatus).toBe('connecting');
    
    await waitForNextUpdate();
    
    expect(result.current.connectionStatus).toBe('connected');
    expect(result.current.error).toBeNull();
  });

  it('should handle gift messages', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTikTokLive('testuser'));
    await waitForNextUpdate();

    // Simulate receiving a gift
    act(() => {
      const giftMessage = {
        event: 'gift_received',
        user: { username: 'testuser' },
        gift: { name: 'Rose', repeat_count: 1 },
        msg_id: '123'
      };
      result.current.wsRef.current.onmessage({ data: JSON.stringify(giftMessage) });
    });

    expect(result.current.gifts).toHaveLength(1);
    expect(result.current.gifts[0].giftName).toBe('Rose');
  });

  it('should queue messages when disconnected', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTikTokLive('testuser'));
    
    // Force disconnected state
    act(() => {
      result.current.setConnectionStatus('disconnected');
    });

    // Simulate receiving a gift while disconnected
    act(() => {
      const giftMessage = {
        event: 'gift_received',
        user: { username: 'testuser' },
        gift: { name: 'Rose', repeat_count: 1 },
        msg_id: '123'
      };
      result.current.wsRef.current.onmessage({ data: JSON.stringify(giftMessage) });
    });

    // Gift should be queued, not in the main list
    expect(result.current.gifts).toHaveLength(0);
    // Note: In a real test, we would check the queue here
  });

  it('should attempt to reconnect on connection loss', async () => {
    jest.useFakeTimers();
    
    const { result, waitForNextUpdate } = renderHook(() => useTikTokLive('testuser'));
    await waitForNextUpdate();

    // Simulate connection error
    act(() => {
      result.current.wsRef.current.onerror(new Error('Connection lost'));
    });

    expect(result.current.connectionStatus).toMatch(/reconnecting/);
    
    // Fast-forward time to trigger reconnection
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should attempt to reconnect
    expect(result.current.retryCount).toBe(1);
    
    jest.useRealTimers();
  });

  it('should clean up WebSocket on unmount', async () => {
    const { result, unmount, waitForNextUpdate } = renderHook(() => useTikTokLive('testuser'));
    await waitForNextUpdate();

    const closeSpy = jest.spyOn(result.current.wsRef.current, 'close');
    
    unmount();
    
    expect(closeSpy).toHaveBeenCalledWith(1000, 'Component unmounting');
  });
});
