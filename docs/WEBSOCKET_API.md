# WebSocket API Documentation

This document outlines the WebSocket API contract between the Hyperfocus Gift Engine frontend and backend.

## Connection

- **URL**: `ws://your-backend-url/ws`
- **Protocol**: `hyperfocus-protocol-v1`

## Message Format

All messages are JSON-encoded strings with the following structure:

```typescript
interface BaseMessage {
  type: string;          // Message type
  payload: any;          // Message payload
  timestamp: string;     // ISO 8601 timestamp
  version: string;       // API version (e.g., "1.0.0")
}
```

## Message Types

### 1. Connection Management

#### `connection:init`

**Direction**: Client → Server  
**Description**: Initialize WebSocket connection with client information.

```typescript
{
  "type": "connection:init",
  "payload": {
    "clientId": string,          // Unique client identifier
    "streamId": string,          // Current stream ID
    "clientType": "host" | "viewer",
    "capabilities": string[],    // e.g., ["webgl", "webgpu", "notifications"]
    "version": string           // Client version
  },
  "timestamp": "2025-10-28T23:59:59.999Z"
}
```

#### `connection:ack`

**Direction**: Server → Client  
**Description**: Acknowledges successful connection initialization.

```typescript
{
  "type": "connection:ack",
  "payload": {
    "sessionId": string,         // Server-generated session ID
    "serverTime": string,        // Server time in ISO 8601
    "config": {
      "pingInterval": number,    // Heartbeat interval in ms
      "maxGiftsPerSecond": number,
      "features": string[]       // Enabled features for this session
    }
  },
  "timestamp": "2025-10-28T23:59:59.999Z"
}
```

### 2. Heartbeat

#### `heartbeat:ping`

**Direction**: Server → Client  
**Description**: Server heartbeat to check client connection.

```typescript
{
  "type": "heartbeat:ping",
  "payload": {
    "timestamp": string,         // Server time in ISO 8601
    "sequence": number          // Incremental sequence number
  },
  "timestamp": "2025-10-28T23:59:59.999Z"
}
```

#### `heartbeat:pong`

**Direction**: Client → Server  
**Description**: Client response to heartbeat ping.

```typescript
{
  "type": "heartbeat:pong",
  "payload": {
    "timestamp": string,         // Client time in ISO 8601
    "sequence": number,          // Echoed sequence number
    "stats": {
      "latency": number,         // Last measured latency in ms
      "memory": number,          // Client memory usage in MB
      "queueSize": number        // Client event queue size
    }
  },
  "timestamp": "2025-10-28T23:59:59.999Z"
}
```

### 3. Gift Events

#### `gift:received`

**Direction**: Server → Client  
**Description**: Notifies client about a new gift.

```typescript
{
  "type": "gift:received",
  "payload": {
    "giftId": string,            // Unique gift identifier
    "giftType": string,          // e.g., "rose", "diamond", "rocket"
    "quantity": number,          // Number of gifts in this batch
    "totalValue": number,        // Total value in platform currency
    "sender": {
      "userId": string,          // Sender's user ID
      "username": string,        // Sender's display name
      "avatar": string,          // URL to sender's avatar
      "isSubscriber": boolean,
      "isModerator": boolean
    },
    "animation": {
      "type": string,            // e.g., "particle", "3d-model", "video"
      "duration": number,        // Animation duration in ms
      "assetUrl": string,        // URL to animation asset (if any)
      "soundUrl": string         // URL to sound effect (if any)
    },
    "metadata": {
      "isStreak": boolean,       // If part of a gift streak
      "comboCount": number,      // Current combo count
      "rank": number,            // Rank of this gift in the stream
      "timestamp": string        // When the gift was sent (ISO 8601)
    }
  },
  "timestamp": "2025-10-28T23:59:59.999Z"
}
```

#### `gift:ack`

**Direction**: Client → Server  
**Description**: Acknowledges receipt of a gift.

```typescript
{
  "type": "gift:ack",
  "payload": {
    "giftId": string,            // The gift ID being acknowledged
    "receivedAt": string,        // When client processed the gift (ISO 8601)
    "rendered": boolean,         // Whether the gift was rendered
    "error": string | null       // Error message if rendering failed
  },
  "timestamp": "2025-10-28T23:59:59.999Z"
}
```

### 4. Stream Status

#### `stream:status`

**Direction**: Server → Client  
**Description**: Updates about stream status.

```typescript
{
  "type": "stream:status",
  "payload": {
    "isLive": boolean,
    "viewerCount": number,
    "startedAt": string | null,  // ISO 8601
    "currentGoal": {
      "type": string,            // e.g., "viewers", "gifts", "revenue"
      "target": number,
      "current": number,
      "description": string
    } | null
  },
  "timestamp": "2025-10-28T23:59:59.999Z"
}
```

## Error Handling

### `error`

**Direction**: Both  
**Description**: Error notification.

```typescript
{
  "type": "error",
  "payload": {
    "code": string,              // Error code (e.g., "RATE_LIMIT")
    "message": string,           // Human-readable message
    "details": any,              // Additional error details
    "retryable": boolean,        // Whether the client should retry
    "retryAfter": number | null  // Retry delay in ms (if applicable)
  },
  "timestamp": "2025-10-28T23:59:59.999Z"
}
```

## Example Message Flow

1. **Connection Initialization**
   ```
   Client → Server: connection:init
   Server → Client: connection:ack
   ```

2. **Heartbeat**
   ```
   Server → Client: heartbeat:ping
   Client → Server: heartbeat:pong
   ```

3. **Gift Processing**
   ```
   Server → Client: gift:received
   Client → Server: gift:ack
   ```

4. **Stream Updates**
   ```
   Server → Client: stream:status
   ```

## Best Practices

1. **Reconnection**: Clients should implement exponential backoff for reconnection attempts.
2. **Error Handling**: Always handle malformed messages gracefully.
3. **Rate Limiting**: Respect server rate limits and back off when requested.
4. **Versioning**: Include API version in all messages for backward compatibility.
5. **Heartbeats**: Respond to pings promptly to maintain connection.

## Version History

- **1.0.0 (2025-10-28)**: Initial version
