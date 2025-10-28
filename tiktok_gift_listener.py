
#!/usr/bin/env python3
"""
TikTok Live Gift Listener with WebSocket Server

This script connects to a TikTok Live stream and forwards events to connected WebSocket clients.
It can be run with command-line arguments for the username and port.

Example usage:
    python tiktok_gift_listener.py username
    python tiktok_gift_listener.py username --port 9000
    python tiktok_gift_listener.py username --debug
"""

import asyncio
import json
import logging
import argparse
import signal
import sys
import websockets
from typing import Set, Optional, Dict, Any

from TikTokLive import TikTokLiveClient
from TikTokLive.events import CommentEvent, ConnectEvent, DisconnectEvent, GiftEvent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('tiktok_listener.log')
    ]
)
logger = logging.getLogger('TikTokLive')

class HyperfocusGiftEngine:
    async def initialize(self):
        """Initialize the TikTok client asynchronously"""
        try:
            self.client = await self._initialize_tiktok_client()
            return True
        except Exception as e:
            logger.error(f"Failed to initialize TikTok client: {e}")
            return False
            
    def __init__(self, username: str, websocket_port: int = 8765, debug: bool = False):
        """
        Initialize the TikTok Live gift listener
        
        Args:
            username: TikTok username to monitor (without @)
            websocket_port: Port for WebSocket server
            debug: Enable debug logging
        """
        if debug:
            logger.setLevel(logging.DEBUG)
            logger.debug("Debug mode enabled")
            
        self.username = username.lower().lstrip('@')
        self.websocket_port = websocket_port
        self.connected_clients: Set[websockets.WebSocketServerProtocol] = set()
        self.should_reconnect = True
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 5
        self.client = None
            
    async def _initialize_tiktok_client(self):
        """Initialize the TikTok client with proper error handling"""
        try:
            # Initialize with minimal configuration
            client = TikTokLiveClient(
                unique_id=f"@{self.username}",
                enable_websocket=True,
                request_retries=3,
                request_timeout=10,
                ws_ping_interval=10.0,
                ws_timeout=30.0
            )
            
            # Test the connection
            try:
                # This will raise an exception if the user is not live or doesn't exist
                await client.start()
                await client.stop()
                
                # Register event handlers if connection test succeeds
                self._register_event_handlers(client)
                return client
                
            except Exception as e:
                # Provide more helpful error messages for common issues
                if "User not found" in str(e) or "404" in str(e):
                    raise Exception(f"User @{self.username} not found or not currently live")
                elif "timed out" in str(e).lower():
                    raise Exception(f"Connection to @{self.username}'s live stream timed out. They might not be live.")
                raise
            
        except Exception as e:
            logger.error(f"Error initializing TikTok client: {str(e)}", exc_info=True)
            if hasattr(e, '__traceback__'):
                import traceback
                logger.error("\n" + "".join(traceback.format_tb(e.__traceback__)))
            raise Exception(f"Failed to initialize TikTok client: {str(e)}")
            
    def _register_event_handlers(self, client):
        """Register all event handlers"""
        client.add_listener("connect", self.on_connect)
        client.add_listener("gift", self.on_gift)
        client.add_listener("comment", self.on_comment)
        client.add_listener("disconnect", self.on_disconnect)
        client.add_listener("error", self.on_error)

        # Gift effect mappings - neurodivergent friendly
        self.gift_effects = {
            "Rose": {
                "type": "shooting_star",
                "intensity": 3,
                "color": "#FF69B4",
                "particles": 500,
                "sound": "cosmic_chime"
            },
            "Heart": {
                "type": "dopamine_burst", 
                "intensity": 5,
                "color": "#FF0080",
                "particles": 1000,
                "sound": "positive_affirmation"
            },
            "Coins": {
                "type": "focus_coin_shower",
                "intensity": 2,
                "color": "#FFD700",
                "particles": 300,
                "sound": "coin_collect"
            },
            "Universe": {
                "type": "hyperfocus_supernova",
                "intensity": 10,
                "color": "#8A2BE2",
                "particles": 5000,
                "sound": "universe_explosion"
            },
            "Galaxy": {
                "type": "constellation_builder",
                "intensity": 8,
                "color": "#00CED1",
                "particles": 3000,
                "sound": "cosmic_harmony"
            }
        }

    async def on_connect(self, event: ConnectEvent):
        logger.info(f"Connected to @{self.username}'s live stream!")
        await self.broadcast_to_clients({
            "event": "stream_connected",
            "user": self.username,
            "timestamp": event.timestamp
        })

    async def on_gift(self, event: GiftEvent):
        gift_name = event.gift.name
        user = event.user.unique_id
        repeat_count = getattr(event, 'repeat_count', 1)

        # Get effect configuration
        effect_config = self.gift_effects.get(gift_name, {
            "type": "default_sparkle",
            "intensity": 1,
            "color": "#FFFFFF",
            "particles": 100,
            "sound": "gentle_ping"
        })

        gift_data = {
            "event": "gift_received",
            "gift": {
                "name": gift_name,
                "id": event.gift.id,
                "repeat_count": repeat_count,
                "is_streaking": getattr(event, 'streaking', False)
            },
            "user": {
                "username": user,
                "nickname": event.user.nickname
            },
            "effect": effect_config,
            "timestamp": event.timestamp
        }

        logger.info(f"🎁 {user} sent {repeat_count}x {gift_name}!")

        # Broadcast to all connected WebSocket clients
        await self.broadcast_to_clients(gift_data)

    async def on_comment(self, event: CommentEvent):
        # Optional: Handle chat messages for additional interactions
        comment_data = {
            "event": "comment",
            "user": event.user.unique_id,
            "message": event.comment,
            "timestamp": event.timestamp
        }
        await self.broadcast_to_clients(comment_data)

    async def broadcast_to_clients(self, data: Dict[str, Any]):
        """Broadcast data to all connected WebSocket clients"""
        if not self.connected_clients:
            return
            
        message = json.dumps(data, default=str)  # Handle non-serializable data
        
        # Create tasks for sending to all clients
        send_tasks = []
        for client in list(self.connected_clients):  # Create a copy of the set
            try:
                send_tasks.append(asyncio.create_task(client.send(message)))
            except Exception as e:
                logger.error(f"Error queueing message for client: {e}")
                self.connected_clients.discard(client)
        
        # Wait for all sends to complete (with timeout)
        if send_tasks:
            done, pending = await asyncio.wait(
                send_tasks,
                timeout=5.0,
                return_when=asyncio.ALL_COMPLETED
            )
            
            # Handle any pending tasks
            for task in pending:
                task.cancel()
                
            # Check for errors
            for task in done:
                try:
                    await task  # This will re-raise any exceptions
                except Exception as e:
                    logger.error(f"Error sending message: {e}")
                    
    async def on_error(self, error: Exception):
        """Handle errors from the TikTok client"""
        logger.error(f"TikTok client error: {error}", exc_info=True)
        await self.broadcast_to_clients({
            "event": "error",
            "error": str(error),
            "type": error.__class__.__name__
        })

    async def websocket_handler(self, websocket, path):
        """Handle WebSocket connections"""
        self.connected_clients.add(websocket)
        client_ip = websocket.remote_address[0] if websocket.remote_address else 'unknown'
        logger.info(f"New WebSocket connection from {client_ip}. Total clients: {len(self.connected_clients)}")
        
        try:
            # Send initial connection info
            await websocket.send(json.dumps({
                "event": "connection_established",
                "data": {
                    "status": "connected",
                    "username": self.username,
                    "timestamp": asyncio.get_event_loop().time(),
                    "message": f"Connected to @{self.username}'s live stream"
                }
            }))
            
            # Keep the connection alive
            async for message in websocket:
                try:
                    # Handle incoming messages if needed
                    data = json.loads(message)
                    logger.debug(f"Received message from {client_ip}: {data}")
                    
                    # Example: Handle specific commands from client
                    if data.get("type") == "ping":
                        await websocket.send(json.dumps({
                            "event": "pong",
                            "data": {"timestamp": asyncio.get_event_loop().time()}
                        }))
                        
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON received from {client_ip}")
                except Exception as e:
                    logger.error(f"Error processing message from {client_ip}: {e}")
                    
        except websockets.exceptions.ConnectionClosed as e:
            logger.info(f"WebSocket connection closed: {e}")
        except Exception as e:
            logger.error(f"WebSocket error: {e}", exc_info=True)
        finally:
            self.connected_clients.remove(websocket)
            logger.info(f"WebSocket disconnected. Remaining clients: {len(self.connected_clients)}")
            
    async def shutdown(self):
        """Gracefully shut down the server and clean up resources"""
        logger.info("Shutting down Hyperfocus Gift Engine...")
        self.should_reconnect = False
        
        # Close all WebSocket connections
        if self.connected_clients:
            logger.info(f"Closing {len(self.connected_clients)} WebSocket connections...")
            close_tasks = [client.close() for client in self.connected_clients]
            if close_tasks:
                await asyncio.wait(close_tasks, timeout=5.0)
            self.connected_clients.clear()
        
        # Disconnect from TikTok Live
        if hasattr(self, 'client') and self.client:
            logger.info("Disconnecting from TikTok Live...")
            try:
                await self.client.stop()
            except Exception as e:
                logger.error(f"Error disconnecting from TikTok: {e}")
        
        logger.info("Shutdown complete")

    async def start(self):
        """Start the WebSocket server and TikTok client"""
        # Set up signal handlers for graceful shutdown
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, lambda: asyncio.create_task(self.shutdown()))
        
        # Start WebSocket server
        try:
            async with websockets.serve(
                self.websocket_handler,
                "0.0.0.0",  # Listen on all interfaces
                self.websocket_port,
                ping_interval=30,
                ping_timeout=10,
                close_timeout=5,
                max_size=2**25  # 32MB max message size
            ) as server:
                logger.info(f"WebSocket server started on ws://0.0.0.0:{self.websocket_port}")
                
                # Start TikTok client with reconnection logic
                while self.should_reconnect and self.reconnect_attempts < self.max_reconnect_attempts:
                    try:
                        logger.info(f"Connecting to @{self.username}'s live stream (attempt {self.reconnect_attempts + 1}/{self.max_reconnect_attempts})...")
                        await self.client.start()
                        
                        # If we get here, the connection was successful
                        self.reconnect_attempts = 0
                        
                        # Keep the server running until shutdown
                        while self.should_reconnect:
                            await asyncio.sleep(1)
                            
                    except Exception as e:
                        self.reconnect_attempts += 1
                        wait_time = min(2 ** self.reconnect_attempts, 30)  # Exponential backoff, max 30 seconds
                        logger.error(f"Connection error (attempt {self.reconnect_attempts}/{self.max_reconnect_attempts}): {e}")
                        
                        if self.reconnect_attempts < self.max_reconnect_attempts:
                            logger.info(f"Reconnecting in {wait_time} seconds...")
                            await asyncio.sleep(wait_time)
                        else:
                            logger.error("Max reconnection attempts reached. Giving up.")
                            break
                
        except asyncio.CancelledError:
            logger.info("Server shutdown requested")
        except Exception as e:
            logger.error(f"Server error: {e}", exc_info=True)
        finally:
            await self.shutdown()

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='TikTok Live Gift Listener')
    parser.add_argument('username', nargs='?', default=None, help='TikTok username (without @)')
    parser.add_argument('--port', type=int, default=8765, help='WebSocket server port (default: 8765)')
    parser.add_argument('--debug', action='store_true', help='Enable debug logging')
    return parser.parse_args()

async def main():
    """Main entry point"""
    args = parse_arguments()
    
    # Get username from command line or prompt
    username = args.username
    if not username:
        username = input("Enter TikTok username (without @): ").strip()
    
    if not username:
        print("Error: No username provided")
        sys.exit(1)
    
    # Create the engine
    engine = HyperfocusGiftEngine(
        username=username,
        websocket_port=args.port,
        debug=args.debug
    )
    
    # Initialize the TikTok client
    success = await engine.initialize()
    if not success:
        logger.error("Failed to initialize TikTok client. Make sure the username is correct and the user is live.")
        sys.exit(1)
    
    try:
        await engine.start()
    except asyncio.CancelledError:
        logger.info("Shutdown requested")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
    finally:
        await engine.shutdown()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)
2