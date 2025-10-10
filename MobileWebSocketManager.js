
// MobileWebSocketManager.js - Optimized WebSocket handling for mobile
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, NetInfo } from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';

export class MobileWebSocketManager {
    constructor(options = {}) {
        this.options = {
            url: 'ws://localhost:8765',
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            heartbeatInterval: 30000,
            ...options
        };

        this.websocket = null;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.heartbeatTimer = null;
        this.listeners = new Map();

        // Mobile-specific properties
        this.networkType = 'unknown';
        this.isBackground = false;
        this.lastActivity = Date.now();

        this.setupNetworkListener();
        this.setupAppStateHandling();
    }

    setupNetworkListener() {
        // Monitor network changes on mobile
        NetInfo.addEventListener(state => {
            const previousType = this.networkType;
            this.networkType = state.type;

            console.log(`📶 Network changed: ${previousType} → ${this.networkType}`);

            if (state.isConnected && previousType === 'none') {
                // Network restored - attempt reconnection
                console.log("🔄 Network restored, attempting reconnection...");
                this.reconnect();
            } else if (!state.isConnected) {
                // Network lost
                console.log("❌ Network lost");
                this.handleNetworkLoss();
            }
        });
    }

    setupAppStateHandling() {
        // Handle app going to background/foreground
        // This would typically use AppState from react-native
        console.log("📱 Setting up app state handling");
    }

    async connect(username = '') {
        if (this.isConnecting || (this.websocket && this.websocket.readyState === WebSocket.OPEN)) {
            console.log("⚠️ Already connecting or connected");
            return;
        }

        this.isConnecting = true;

        try {
            console.log(`🔌 Connecting to mobile WebSocket: ${this.options.url}`);

            // Save username for reconnection
            if (username) {
                await AsyncStorage.setItem('mobile_username', username);
            } else {
                username = await AsyncStorage.getItem('mobile_username') || '';
            }

            this.websocket = new WebSocket(this.options.url);
            this.setupWebSocketHandlers();

            // Connection timeout for mobile
            setTimeout(() => {
                if (this.isConnecting) {
                    console.log("⏰ Mobile connection timeout");
                    this.websocket?.close();
                    this.handleConnectionFailure();
                }
            }, 10000);

        } catch (error) {
            console.error("❌ Mobile WebSocket connection error:", error);
            this.handleConnectionFailure();
        }
    }

    setupWebSocketHandlers() {
        if (!this.websocket) return;

        this.websocket.onopen = () => {
            console.log("✅ Mobile WebSocket connected!");
            this.isConnecting = false;
            this.reconnectAttempts = 0;

            // Mobile success feedback
            HapticFeedback.trigger('notificationSuccess');
            this.emit('connected', { timestamp: Date.now() });

            // Start mobile heartbeat
            this.startHeartbeat();
        };

        this.websocket.onmessage = (event) => {
            this.lastActivity = Date.now();

            try {
                const data = JSON.parse(event.data);
                console.log(`📨 Mobile received: ${data.event}`);

                // Mobile-specific message handling
                this.handleMobileMessage(data);

            } catch (error) {
                console.error("❌ Mobile message parsing error:", error);
            }
        };

        this.websocket.onclose = (event) => {
            console.log(`❌ Mobile WebSocket closed: ${event.code} - ${event.reason}`);
            this.isConnecting = false;
            this.stopHeartbeat();

            this.emit('disconnected', { 
                code: event.code, 
                reason: event.reason,
                timestamp: Date.now()
            });

            // Auto-reconnect logic for mobile
            if (!this.isBackground && this.reconnectAttempts < this.options.maxReconnectAttempts) {
                this.scheduleReconnect();
            }
        };

        this.websocket.onerror = (error) => {
            console.error("❌ Mobile WebSocket error:", error);
            this.emit('error', { error, timestamp: Date.now() });
        };
    }

    handleMobileMessage(data) {
        // Mobile-specific message processing
        switch (data.event) {
            case 'gift_received':
                this.handleMobileGift(data);
                break;
            case 'stream_connected':
                this.handleStreamConnected(data);
                break;
            case 'comment':
                this.handleComment(data);
                break;
            case 'heartbeat_pong':
                console.log("💓 Mobile heartbeat acknowledged");
                break;
            default:
                this.emit('message', data);
        }
    }

    handleMobileGift(giftData) {
        console.log(`🎁 Mobile gift handler: ${giftData.gift.name}`);

        // Mobile optimization: reduce data if on cellular
        if (this.networkType === 'cellular') {
            giftData = this.optimizeForCellular(giftData);
        }

        // Mobile haptic feedback
        this.triggerGiftHaptic(giftData.effect.intensity);

        // Emit to listeners
        this.emit('gift_received', giftData);
    }

    handleStreamConnected(data) {
        console.log(`🎥 Mobile stream connected: ${data.user}`);
        this.emit('stream_connected', data);

        // Mobile notification
        HapticFeedback.trigger('impactMedium');
    }

    handleComment(data) {
        console.log(`💬 Mobile comment: ${data.user}`);
        this.emit('comment', data);
    }

    optimizeForCellular(giftData) {
        // Reduce particle counts for cellular connections
        if (giftData.effect && giftData.effect.particles > 1000) {
            giftData.effect.particles = Math.floor(giftData.effect.particles * 0.6);
            console.log(`📶 Reduced particles for cellular: ${giftData.effect.particles}`);
        }

        return giftData;
    }

    triggerGiftHaptic(intensity) {
        const hapticOptions = { 
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false 
        };

        switch (intensity) {
            case 1:
            case 2:
                HapticFeedback.trigger('impactLight', hapticOptions);
                break;
            case 3:
            case 4:
                HapticFeedback.trigger('impactMedium', hapticOptions);
                break;
            default:
                HapticFeedback.trigger('impactHeavy', hapticOptions);
        }
    }

    startHeartbeat() {
        this.stopHeartbeat();

        this.heartbeatTimer = setInterval(() => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                const timeSinceActivity = Date.now() - this.lastActivity;

                if (timeSinceActivity > this.options.heartbeatInterval * 2) {
                    console.log("💔 Mobile heartbeat timeout - reconnecting");
                    this.reconnect();
                } else {
                    this.send({ event: 'heartbeat_ping', timestamp: Date.now() });
                }
            }
        }, this.options.heartbeatInterval);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(this.options.reconnectInterval * this.reconnectAttempts, 30000);

        console.log(`🔄 Mobile reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

        setTimeout(() => {
            if (!this.isBackground) {
                this.reconnect();
            }
        }, delay);
    }

    async reconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        const username = await AsyncStorage.getItem('mobile_username') || '';
        await this.connect(username);
    }

    handleNetworkLoss() {
        this.emit('network_lost', { timestamp: Date.now() });

        if (this.websocket) {
            this.websocket.close();
        }
    }

    handleConnectionFailure() {
        this.isConnecting = false;

        Alert.alert(
            "Connection Failed",
            `Unable to connect to TikTok Live. Attempt ${this.reconnectAttempts + 1}/${this.options.maxReconnectAttempts}`,
            [
                { text: "Retry", onPress: () => this.reconnect() },
                { text: "Settings", onPress: () => this.emit('show_settings') },
                { text: "Cancel", style: "cancel" }
            ]
        );
    }

    send(data) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            try {
                this.websocket.send(JSON.stringify(data));
                return true;
            } catch (error) {
                console.error("❌ Mobile send error:", error);
                return false;
            }
        } else {
            console.warn("⚠️ Cannot send - mobile WebSocket not connected");
            return false;
        }
    }

    // Test method for mobile debugging
    sendTestGift(giftType = 'Heart') {
        const testData = {
            event: 'test_gift',
            gift: { name: giftType, repeat_count: 1 },
            user: { username: 'mobile_tester' },
            timestamp: Date.now()
        };

        console.log(`🧪 Sending mobile test gift: ${giftType}`);
        return this.send(testData);
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Mobile event callback error for ${event}:`, error);
                }
            });
        }
    }

    // Mobile lifecycle methods
    onAppBackground() {
        console.log("📱 App going to background");
        this.isBackground = true;

        // Reduce activity when in background
        this.stopHeartbeat();

        // Optional: Close connection to save battery
        // this.disconnect();
    }

    onAppForeground() {
        console.log("📱 App coming to foreground");
        this.isBackground = false;

        // Reconnect if needed
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            this.reconnect();
        } else {
            this.startHeartbeat();
        }
    }

    disconnect() {
        console.log("🔌 Disconnecting mobile WebSocket");

        this.stopHeartbeat();

        if (this.websocket) {
            this.websocket.close(1000, 'User disconnected');
            this.websocket = null;
        }

        this.isConnecting = false;
        this.reconnectAttempts = 0;
    }

    // Mobile status methods
    isConnected() {
        return this.websocket && this.websocket.readyState === WebSocket.OPEN;
    }

    getConnectionState() {
        if (!this.websocket) return 'disconnected';

        switch (this.websocket.readyState) {
            case WebSocket.CONNECTING: return 'connecting';
            case WebSocket.OPEN: return 'connected';
            case WebSocket.CLOSING: return 'closing';
            case WebSocket.CLOSED: return 'closed';
            default: return 'unknown';
        }
    }

    getMobileStats() {
        return {
            connectionState: this.getConnectionState(),
            reconnectAttempts: this.reconnectAttempts,
            networkType: this.networkType,
            isBackground: this.isBackground,
            lastActivity: this.lastActivity,
            uptime: this.websocket ? Date.now() - this.lastActivity : 0
        };
    }
}

export default MobileWebSocketManager;
