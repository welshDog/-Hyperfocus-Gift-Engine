const WebSocket = require('ws');
const net = require('net');

// Function to check if a port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        server.close();
        resolve(true);
      })
      .listen(port);
  });
};

// Function to find an available port
const findAvailablePort = async (startPort, endPort = 9000) => {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(
    `No available ports found between ${startPort} and ${endPort}`
  );
};

// Create WebSocket server on an available port
const createServer = async () => {
  const PORT = await findAvailablePort(8765, 8800); // Try ports 8765-8800
  const wss = new WebSocket.Server({ port: PORT });

  wss.on('listening', () => {
    console.log(`WebSocket server started on ws://localhost:${PORT}`);
    console.log(`You can now connect to this server from your client.`);
  });

  return wss;
};

// Initialize the server
let wss;
createServer()
  .then((server) => {
    wss = server;
    setupEventHandlers();
  })
  .catch(console.error);

const gifts = [
  'Rose',
  'Heart',
  'Like',
  'Lollipop',
  'Ice Cream',
  'Cupcake',
  'Pizza',
  'Cake',
  'Coffee',
  'Diamond',
  'Rocket',
  'Dragon',
  'Galaxy',
  'Universe',
  'TikTok King',
];
const users = [
  'Alice',
  'Bob',
  'Charlie',
  'David',
  'Eve',
  'Frank',
  'Grace',
  'Heidi',
  'Ivan',
  'Judy',
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Setup WebSocket event handlers
const setupEventHandlers = () => {
  wss.on('connection', (ws) => {
    console.log('Client connected');

    const sendGift = () => {
      if (ws.readyState === WebSocket.OPEN) {
        const gift = {
          event: 'gift_received',
          giftId: Math.random().toString(36).substr(2, 9),
          giftName: getRandomElement(gifts),
          displayName: getRandomElement(users),
          userId: Math.random().toString(36).substr(2, 9),
          repeatCount: Math.floor(Math.random() * 5) + 1,
        };
        ws.send(JSON.stringify(gift));
      }
    };

    // Send a gift every 3-8 seconds
    const giftInterval = setInterval(sendGift, Math.random() * 5000 + 3000);

    // Send viewer count updates
    const sendViewerCount = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            event: 'viewer_count',
            count: Math.floor(Math.random() * 100) + 10,
          })
        );
      }
    };

    // Update viewer count every 10 seconds
    const viewerCountInterval = setInterval(sendViewerCount, 10000);

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.event === 'ping') {
          ws.send(JSON.stringify({ event: 'pong', timestamp: data.timestamp }));
        }
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clearInterval(giftInterval);
      clearInterval(viewerCountInterval);
    });
  });

  // Handle server errors
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });
};
