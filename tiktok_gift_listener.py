
# tiktok_gift_listener.py
import asyncio
import json
import websockets
import logging
from TikTokLive import TikTokLiveClient
from TikTokLive.types import CommentEvent, ConnectEvent, DisconnectEvent, GiftEvent

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HyperfocusGiftEngine:
    def __init__(self, username, websocket_port=8765):
        self.username = username
        self.websocket_port = websocket_port
        self.connected_clients = set()
        self.client = TikTokLiveClient(unique_id=username)

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

    async def broadcast_to_clients(self, data):
        if self.connected_clients:
            message = json.dumps(data)
            disconnected = set()

            for client in self.connected_clients:
                try:
                    await client.send(message)
                except websockets.exceptions.ConnectionClosed:
                    disconnected.add(client)

            # Remove disconnected clients
            self.connected_clients -= disconnected

    async def websocket_handler(self, websocket, path):
        logger.info(f"WebSocket client connected from {websocket.remote_address}")
        self.connected_clients.add(websocket)

        try:
            await websocket.wait_closed()
        finally:
            self.connected_clients.remove(websocket)
            logger.info(f"WebSocket client disconnected")

    async def start_server(self):
        # Start WebSocket server
        websocket_server = await websockets.serve(
            self.websocket_handler, 
            "localhost", 
            self.websocket_port
        )
        logger.info(f"WebSocket server started on ws://localhost:{self.websocket_port}")

        # Configure TikTok client event handlers
        self.client.add_listener("connect", self.on_connect)
        self.client.add_listener("gift", self.on_gift)
        self.client.add_listener("comment", self.on_comment)

        # Start TikTok Live connection
        logger.info(f"Connecting to @{self.username}'s live stream...")
        await self.client.start()

# Usage example
if __name__ == "__main__":
    # Replace with the TikTok username you want to monitor
    USERNAME = "your_tiktok_username"  # Change this!

    engine = HyperfocusGiftEngine(USERNAME)

    try:
        asyncio.run(engine.start_server())
    except KeyboardInterrupt:
        logger.info("Shutting down Hyperfocus Gift Engine...")
