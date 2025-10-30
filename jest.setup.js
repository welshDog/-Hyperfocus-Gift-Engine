import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock WebSocket
class WebSocketMock {
  constructor(url) {
    this.url = url;
    this.onopen = jest.fn();
    this.onclose = jest.fn();
    this.onmessage = jest.fn();
    this.onerror = jest.fn();
    this.send = jest.fn();
    this.close = jest.fn();
  }
}

global.WebSocket = WebSocketMock;
