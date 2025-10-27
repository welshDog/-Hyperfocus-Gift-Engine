import React from 'react';

const STATUS_EMOJIS = {
  connected: '🟢',
  connecting: '🟡',
  disconnected: '🔴',
  error: '❌'
};

const STATUS_MESSAGES = {
  connected: 'Connected',
  connecting: 'Connecting...',
  disconnected: 'Disconnected',
  error: 'Connection Error'
};

export const ConnectionStatus = ({ status, onReconnect, retryCount = 0 }) => {
  const statusText = STATUS_MESSAGES[status] || status;
  const statusEmoji = STATUS_EMOJIS[status] || '❓';
  const isReconnecting = status.startsWith('reconnecting-');
  const showReconnect = ['disconnected', 'error'].includes(status) || isReconnecting;

  return (
    <div className="connection-status" role="status" aria-live="polite">
      <span className="status-indicator" aria-hidden="true">
        {statusEmoji}
      </span>
      <span className="status-text">
        {isReconnecting ? `Reconnecting... (${retryCount}/5)` : statusText}
      </span>
      {showReconnect && (
        <button 
          onClick={onReconnect}
          disabled={isReconnecting}
          className="reconnect-button"
          aria-label="Reconnect to server"
        >
          {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
