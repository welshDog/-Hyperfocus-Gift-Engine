
// App.js - Main Mobile Hyperfocus Gift Engine App
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated,
  PanResponder,
  Vibration
} from 'react-native';
import { Canvas } from 'react-native-wgpu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HapticFeedback from 'react-native-haptic-feedback';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MobileVisualEngine from './MobileHyperfocusEngine';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HyperfocusMobileApp() {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [giftCount, setGiftCount] = useState(0);
  const [activeEffects, setActiveEffects] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [username, setUsername] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastGiftUser, setLastGiftUser] = useState('');

  // Refs
  const visualEngineRef = useRef(null);
  const canvasRef = useRef(null);
  const websocketRef = useRef(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  // Initialize app
  useEffect(() => {
    initializeApp();
    setupWebSocketConnection();
    setupGestureHandlers();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const initializeApp = async () => {
    console.log("🚀 Initializing Hyperfocus Mobile App...");

    try {
      // Load saved username
      const savedUsername = await AsyncStorage.getItem('tiktok_username');
      if (savedUsername) {
        setUsername(savedUsername);
      }

      // Initialize visual engine when canvas is ready
      if (canvasRef.current) {
        visualEngineRef.current = new MobileVisualEngine(canvasRef.current, {
          mobileOptimized: true,
          maxParticles: 2500,
          adaptiveFrameRate: true
        });

        console.log("✅ Visual engine initialized");
      }

      // Initial haptic feedback
      HapticFeedback.trigger('impactLight');

    } catch (error) {
      console.error("❌ App initialization error:", error);
      Alert.alert("Initialization Error", "Failed to start the app. Please restart.");
    }
  };

  const setupWebSocketConnection = () => {
    console.log("🔌 Setting up WebSocket connection...");

    try {
      // Connect to our Python gift listener (modify URL as needed)
      websocketRef.current = new WebSocket('ws://localhost:8765');

      websocketRef.current.onopen = () => {
        console.log("✅ Connected to TikTok Live stream!");
        setIsConnected(true);
        HapticFeedback.trigger('impactMedium');
        showConnectionNotification(true);
      };

      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      websocketRef.current.onclose = () => {
        console.log("❌ Disconnected from TikTok Live");
        setIsConnected(false);
        showConnectionNotification(false);

        // Auto-reconnect after 5 seconds
        setTimeout(() => {
          if (!isConnected) {
            setupWebSocketConnection();
          }
        }, 5000);
      };

      websocketRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        Alert.alert("Connection Error", "Failed to connect to TikTok Live. Check your connection.");
      };

    } catch (error) {
      console.error("❌ WebSocket setup error:", error);
    }
  };

  const handleWebSocketMessage = (data) => {
    console.log("📨 Received message:", data.event);

    switch (data.event) {
      case 'gift_received':
        handleMobileGift(data);
        break;
      case 'stream_connected':
        setIsStreaming(true);
        break;
      case 'comment':
        handleComment(data);
        break;
      default:
        console.log("ℹ️ Unknown event:", data.event);
    }
  };

  const handleMobileGift = (giftData) => {
    console.log(`🎁 Mobile gift: ${giftData.gift.name} from ${giftData.user.username}`);

    // Update statistics
    setGiftCount(prev => prev + giftData.gift.repeat_count);
    setLastGiftUser(giftData.user.username);

    // Trigger visual effect
    if (visualEngineRef.current) {
      visualEngineRef.current.handleMobileGift(giftData);
      setActiveEffects(visualEngineRef.current.activeEffects.length);
    }

    // Mobile-specific enhancements
    showGiftNotification(giftData);
    triggerCelebrationHaptic(giftData.effect.intensity);

    // Flash screen edge for visual feedback
    flashScreenEdge(giftData.effect.color);
  };

  const handleComment = (commentData) => {
    console.log(`💬 Comment from ${commentData.user}: ${commentData.message}`);
    // Could add comment-triggered effects here
  };

  const showGiftNotification = (giftData) => {
    // Create floating notification
    const message = `${giftData.user.username} sent ${giftData.gift.repeat_count}x ${giftData.gift.name}!`;

    // You could implement a toast notification here
    console.log(`🔔 Notification: ${message}`);

    // Temporary vibration pattern for gift
    const pattern = [100, 200, 100];
    Vibration.vibrate(pattern);
  };

  const triggerCelebrationHaptic = (intensity) => {
    const hapticOptions = { enableVibrateFallback: true };

    switch (intensity) {
      case 1:
      case 2:
        HapticFeedback.trigger('impactLight', hapticOptions);
        break;
      case 3:
      case 4:
        HapticFeedback.trigger('impactMedium', hapticOptions);
        break;
      case 5:
      case 6:
        HapticFeedback.trigger('impactHeavy', hapticOptions);
        break;
      default:
        HapticFeedback.trigger('notificationSuccess', hapticOptions);
    }
  };

  const flashScreenEdge = (color) => {
    // Create screen edge flash effect (implement with overlay)
    console.log(`✨ Flashing screen edge with ${color}`);
  };

  const showConnectionNotification = (connected) => {
    const message = connected ? "Connected to TikTok Live! 🎉" : "Disconnected from TikTok Live 😔";
    // Implement toast or alert here
    console.log(message);
  };

  // Gesture handlers
  const setupGestureHandlers = () => {
    // This would set up pinch, pan, and rotate gestures
    // Implementation would use react-native-gesture-handler
    console.log("👆 Setting up gesture handlers");
  };

  // Test functions for development
  const testMobileEffect = (effectType) => {
    console.log(`🧪 Testing ${effectType} effect on mobile...`);

    if (visualEngineRef.current) {
      visualEngineRef.current.testMobileEffect(effectType);
      setActiveEffects(visualEngineRef.current.activeEffects.length);

      // Simulate gift notification
      const testGiftData = {
        gift: { name: effectType, repeat_count: 1 },
        user: { username: 'mobile_tester' },
        effect: visualEngineRef.current.getMobileEffectConfig(effectType)
      };

      showGiftNotification(testGiftData);
      triggerCelebrationHaptic(5);
    }
  };

  const toggleControls = () => {
    const toValue = showControls ? 0 : 1;

    Animated.timing(controlsOpacity, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setShowControls(!showControls);
    HapticFeedback.trigger('impactLight');
  };

  const saveUsername = async (newUsername) => {
    try {
      await AsyncStorage.setItem('tiktok_username', newUsername);
      setUsername(newUsername);
      Alert.alert("Success", `Username saved: ${newUsername}`);
    } catch (error) {
      Alert.alert("Error", "Failed to save username");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#000011" 
        translucent={true}
      />

      {/* Main Canvas - Full screen */}
      <View style={styles.canvasContainer}>
        <Canvas
          ref={canvasRef}
          style={styles.canvas}
        />
      </View>

      {/* Connection Status Indicator */}
      <View style={[styles.statusIndicator, isConnected ? styles.connected : styles.disconnected]}>
        <Icon 
          name={isConnected ? "wifi" : "wifi-off"} 
          size={16} 
          color="white" 
        />
        <Text style={styles.statusText}>
          {isConnected ? "LIVE" : "OFFLINE"}
        </Text>
      </View>

      {/* Stats Overlay */}
      <View style={styles.statsOverlay}>
        <Text style={styles.statText}>Gifts: {giftCount}</Text>
        <Text style={styles.statText}>Effects: {activeEffects}</Text>
        {lastGiftUser ? (
          <Text style={styles.lastGiftText}>Latest: {lastGiftUser}</Text>
        ) : null}
      </View>

      {/* Control Panel */}
      <Animated.View 
        style={[styles.controlPanel, { opacity: controlsOpacity }]}
        pointerEvents={showControls ? "auto" : "none"}
      >
        {/* Test Effect Buttons */}
        <View style={styles.testButtonRow}>
          <TouchableOpacity 
            style={[styles.testButton, styles.roseButton]}
            onPress={() => testMobileEffect('Rose')}
            activeOpacity={0.7}
          >
            <Text style={styles.testButtonText}>🌹</Text>
            <Text style={styles.testButtonLabel}>Rose</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, styles.heartButton]}
            onPress={() => testMobileEffect('Heart')}
            activeOpacity={0.7}
          >
            <Text style={styles.testButtonText}>💖</Text>
            <Text style={styles.testButtonLabel}>Heart</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, styles.universeButton]}
            onPress={() => testMobileEffect('Universe')}
            activeOpacity={0.7}
          >
            <Text style={styles.testButtonText}>🌌</Text>
            <Text style={styles.testButtonLabel}>Universe</Text>
          </TouchableOpacity>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlButtonRow}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => Alert.alert("Settings", "Settings panel coming soon!")}
          >
            <Icon name="settings" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => Alert.alert("Share", "Share functionality coming soon!")}
          >
            <Icon name="share" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => Alert.alert("Record", "Screen recording coming soon!")}
          >
            <Icon name="videocam" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Toggle Controls Button */}
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={toggleControls}
        activeOpacity={0.7}
      >
        <Icon 
          name={showControls ? "visibility-off" : "visibility"} 
          size={20} 
          color="white" 
        />
      </TouchableOpacity>

      {/* Hyperfocus Branding */}
      <View style={styles.brandingOverlay}>
        <Text style={styles.brandingText}>Hyperfocus Zone ♾️</Text>
        <Text style={styles.brandingSubtext}>Mobile BROski$ Engine</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000011',
  },
  canvasContainer: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  statusIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  statsOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    alignItems: 'flex-end',
  },
  statText: {
    color: '#8A2BE2',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 2,
  },
  lastGiftText: {
    color: '#FFD700',
    fontSize: 12,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 17, 0.85)',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#8A2BE2',
  },
  testButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  testButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  roseButton: {
    backgroundColor: '#FF69B4',
  },
  heartButton: {
    backgroundColor: '#FF0080',
  },
  universeButton: {
    backgroundColor: '#8A2BE2',
  },
  testButtonText: {
    fontSize: 24,
    marginBottom: 2,
  },
  testButtonLabel: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  controlButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    borderWidth: 1,
    borderColor: '#8A2BE2',
  },
  toggleButton: {
    position: 'absolute',
    top: 100,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(138, 43, 226, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  brandingOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  brandingText: {
    color: '#8A2BE2',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  brandingSubtext: {
    color: '#00CED1',
    fontSize: 12,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
