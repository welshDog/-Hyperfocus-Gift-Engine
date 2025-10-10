# 5. Mobile Gesture Handler - Touch interactions for constellation control
mobile_gesture_handler = '''
// MobileGestureHandler.js - Advanced touch controls for mobile constellation interaction
import { PanGestureHandler, PinchGestureHandler, RotationGestureHandler, State } from 'react-native-gesture-handler';
import { Animated, Dimensions } from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export class MobileGestureHandler {
    constructor(visualEngine, options = {}) {
        this.visualEngine = visualEngine;
        this.options = {
            enablePinchZoom: true,
            enablePanRotation: true,
            enableRotateGesture: true,
            minZoom: 0.5,
            maxZoom: 3.0,
            sensitivity: 1.0,
            hapticFeedback: true,
            ...options
        };
        
        // Gesture state
        this.scale = 1.0;
        this.rotation = 0.0;
        this.panX = 0.0;
        this.panY = 0.0;
        this.velocity = { x: 0, y: 0 };
        
        // Animation values
        this.scaleValue = new Animated.Value(1);
        this.rotationValue = new Animated.Value(0);
        this.panXValue = new Animated.Value(0);
        this.panYValue = new Animated.Value(0);
        
        // Touch tracking
        this.lastTouch = { x: 0, y: 0, timestamp: 0 };
        this.touchCount = 0;
        this.gestureActive = false;
        
        // Performance optimization
        this.lastUpdateTime = 0;
        this.updateThrottle = 16; // 60fps max
        
        this.setupGestureHandlers();
    }
    
    setupGestureHandlers() {
        console.log("👆 Setting up mobile gesture handlers");
        
        // Initialize gesture recognition
        this.initializePinchHandler();
        this.initializePanHandler();
        this.initializeRotationHandler();
        this.initializeTapHandlers();
    }
    
    initializePinchHandler() {
        // Pinch-to-zoom constellation
        this.pinchRef = React.createRef();
        
        this.onPinchGestureEvent = Animated.event(
            [{ nativeEvent: { scale: this.scaleValue } }],
            {
                useNativeDriver: false,
                listener: this.handlePinchEvent.bind(this)
            }
        );
    }
    
    handlePinchEvent(event) {
        const { scale, velocity, state } = event.nativeEvent;
        
        if (!this.options.enablePinchZoom) return;
        
        const now = Date.now();
        if (now - this.lastUpdateTime < this.updateThrottle) return;
        this.lastUpdateTime = now;
        
        switch (state) {
            case State.BEGAN:
                console.log("🤏 Pinch gesture started");
                this.gestureActive = true;
                this.triggerHaptic('light');
                break;
                
            case State.ACTIVE:
                const newScale = Math.max(
                    this.options.minZoom,
                    Math.min(this.options.maxZoom, this.scale * scale)
                );
                
                if (Math.abs(newScale - this.scale) > 0.01) {
                    this.updateZoom(newScale);
                    
                    // Haptic feedback for zoom levels
                    if (newScale >= this.options.maxZoom * 0.95 || newScale <= this.options.minZoom * 1.05) {
                        this.triggerHaptic('medium');
                    }
                }
                break;
                
            case State.END:
            case State.CANCELLED:
                console.log(`🤏 Pinch gesture ended: scale=${this.scale.toFixed(2)}`);
                this.gestureActive = false;
                this.snapZoom();
                break;
        }
    }
    
    initializePanHandler() {
        // Pan to rotate constellation view
        this.panRef = React.createRef();
        
        this.onPanGestureEvent = Animated.event(
            [{ 
                nativeEvent: { 
                    translationX: this.panXValue,
                    translationY: this.panYValue
                } 
            }],
            {
                useNativeDriver: false,
                listener: this.handlePanEvent.bind(this)
            }
        );
    }
    
    handlePanEvent(event) {
        const { translationX, translationY, velocityX, velocityY, state } = event.nativeEvent;
        
        if (!this.options.enablePanRotation) return;
        
        const now = Date.now();
        if (now - this.lastUpdateTime < this.updateThrottle) return;
        this.lastUpdateTime = now;
        
        switch (state) {
            case State.BEGAN:
                console.log("👆 Pan gesture started");
                this.gestureActive = true;
                this.triggerHaptic('light');
                break;
                
            case State.ACTIVE:
                const sensitivity = this.options.sensitivity * 0.005; // Mobile sensitivity
                const deltaX = translationX * sensitivity;
                const deltaY = translationY * sensitivity;
                
                this.updateRotation(deltaX, deltaY);
                
                // Store velocity for momentum
                this.velocity = { x: velocityX, y: velocityY };
                break;
                
            case State.END:
                console.log("👆 Pan gesture ended with momentum");
                this.gestureActive = false;
                this.applyMomentum();
                break;
                
            case State.CANCELLED:
                console.log("👆 Pan gesture cancelled");
                this.gestureActive = false;
                break;
        }
    }
    
    initializeRotationHandler() {
        // Two-finger rotation
        this.rotationRef = React.createRef();
        
        this.onRotationGestureEvent = Animated.event(
            [{ nativeEvent: { rotation: this.rotationValue } }],
            {
                useNativeDriver: false,
                listener: this.handleRotationEvent.bind(this)
            }
        );
    }
    
    handleRotationEvent(event) {
        const { rotation, velocity, state } = event.nativeEvent;
        
        if (!this.options.enableRotateGesture) return;
        
        switch (state) {
            case State.BEGAN:
                console.log("🔄 Rotation gesture started");
                this.gestureActive = true;
                this.triggerHaptic('medium');
                break;
                
            case State.ACTIVE:
                const rotationDelta = rotation * 0.5; // Dampen rotation
                this.updateZRotation(this.rotation + rotationDelta);
                break;
                
            case State.END:
            case State.CANCELLED:
                console.log(`🔄 Rotation gesture ended: ${(this.rotation * 180 / Math.PI).toFixed(1)}°`);
                this.gestureActive = false;
                this.snapRotation();
                break;
        }
    }
    
    initializeTapHandlers() {
        // Single tap, double tap, long press
        console.log("👆 Setting up tap handlers");
        
        // These would be implemented with TapGestureHandler
        // Single tap: Test effect
        // Double tap: Reset view
        // Long press: Settings menu
        // Triple tap: Toggle controls
    }
    
    // Update visual engine based on gestures
    updateZoom(newScale) {
        this.scale = newScale;
        
        if (this.visualEngine && this.visualEngine.camera) {
            // Update camera FOV based on scale (inverted - smaller scale = larger FOV)
            const baseFOV = 75;
            const newFOV = baseFOV / newScale;
            const clampedFOV = Math.max(30, Math.min(120, newFOV));
            
            this.visualEngine.camera.fov = clampedFOV;
            
            console.log(`🔍 Mobile zoom: ${newScale.toFixed(2)}x (FOV: ${clampedFOV.toFixed(1)}°)`);
        }
    }
    
    updateRotation(deltaX, deltaY) {
        if (this.visualEngine && this.visualEngine.camera) {
            // Convert pan gestures to camera rotation
            this.visualEngine.camera.rotation.y += deltaX; // Horizontal pan = Y rotation
            this.visualEngine.camera.rotation.x += deltaY; // Vertical pan = X rotation
            
            // Clamp vertical rotation to prevent flipping
            this.visualEngine.camera.rotation.x = Math.max(
                -Math.PI / 2,
                Math.min(Math.PI / 2, this.visualEngine.camera.rotation.x)
            );
            
            console.log(`🔄 Camera rotation: X=${(this.visualEngine.camera.rotation.x * 180 / Math.PI).toFixed(1)}° Y=${(this.visualEngine.camera.rotation.y * 180 / Math.PI).toFixed(1)}°`);
        }
    }
    
    updateZRotation(newRotation) {
        this.rotation = newRotation;
        
        if (this.visualEngine && this.visualEngine.camera) {
            this.visualEngine.camera.rotation.z = newRotation;
        }
    }
    
    applyMomentum() {
        // Apply momentum after pan gesture ends
        const maxMomentum = 0.02;
        const dampening = 0.95;
        
        const momentumX = Math.max(-maxMomentum, Math.min(maxMomentum, this.velocity.x * 0.0001));
        const momentumY = Math.max(-maxMomentum, Math.min(maxMomentum, this.velocity.y * 0.0001));
        
        if (Math.abs(momentumX) > 0.001 || Math.abs(momentumY) > 0.001) {
            console.log(`⚡ Applying momentum: X=${momentumX.toFixed(3)}, Y=${momentumY.toFixed(3)}`);
            
            const applyMomentumFrame = () => {
                if (this.gestureActive) return; // Stop if new gesture started
                
                this.updateRotation(momentumX, momentumY);
                
                // Dampen momentum
                this.velocity.x *= dampening;
                this.velocity.y *= dampening;
                
                // Continue if still significant
                if (Math.abs(this.velocity.x) > 10 || Math.abs(this.velocity.y) > 10) {
                    requestAnimationFrame(applyMomentumFrame);
                }
            };
            
            requestAnimationFrame(applyMomentumFrame);
        }
    }
    
    snapZoom() {
        // Snap to nice zoom levels
        const snapLevels = [0.5, 1.0, 1.5, 2.0, 3.0];
        const threshold = 0.1;
        
        for (const level of snapLevels) {
            if (Math.abs(this.scale - level) < threshold) {
                console.log(`📐 Snapping zoom to ${level}x`);
                this.animateToZoom(level);
                this.triggerHaptic('light');
                return;
            }
        }
    }
    
    snapRotation() {
        // Snap to 90-degree increments
        const snapAngle = Math.PI / 2; // 90 degrees
        const snappedRotation = Math.round(this.rotation / snapAngle) * snapAngle;
        
        if (Math.abs(this.rotation - snappedRotation) < 0.2) {
            console.log(`📐 Snapping rotation to ${(snappedRotation * 180 / Math.PI).toFixed(0)}°`);
            this.animateToRotation(snappedRotation);
            this.triggerHaptic('medium');
        }
    }
    
    animateToZoom(targetScale, duration = 300) {
        Animated.timing(this.scaleValue, {
            toValue: targetScale,
            duration,
            useNativeDriver: false,
        }).start(() => {
            this.scale = targetScale;
            this.updateZoom(targetScale);
        });
    }
    
    animateToRotation(targetRotation, duration = 300) {
        Animated.timing(this.rotationValue, {
            toValue: targetRotation,
            duration,
            useNativeDriver: false,
        }).start(() => {
            this.rotation = targetRotation;
            this.updateZRotation(targetRotation);
        });
    }
    
    // Public methods for external control
    resetView(animated = true) {
        console.log("🔄 Resetting mobile view to defaults");
        
        if (animated) {
            this.animateToZoom(1.0);
            this.animateToRotation(0);
            
            // Reset camera rotation
            if (this.visualEngine && this.visualEngine.camera) {
                // Animate camera rotation reset (simplified)
                this.visualEngine.camera.rotation = { x: 0, y: 0, z: 0 };
            }
        } else {
            this.scale = 1.0;
            this.rotation = 0.0;
            this.updateZoom(1.0);
            this.updateZRotation(0);
        }
        
        this.triggerHaptic('heavy');
    }
    
    focusOnEffect(effectPosition, zoomLevel = 1.5) {
        // Focus camera on a specific effect
        console.log("🎯 Focusing on effect position");
        
        if (this.visualEngine && this.visualEngine.camera) {
            // Calculate camera position to focus on effect
            // This would involve more complex 3D math in a real implementation
            this.animateToZoom(zoomLevel);
        }
        
        this.triggerHaptic('medium');
    }
    
    enableGestureType(gestureType, enabled = true) {
        switch (gestureType) {
            case 'pinch':
                this.options.enablePinchZoom = enabled;
                break;
            case 'pan':
                this.options.enablePanRotation = enabled;
                break;
            case 'rotate':
                this.options.enableRotateGesture = enabled;
                break;
        }
        
        console.log(`👆 ${gestureType} gestures ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    setSensitivity(sensitivity) {
        this.options.sensitivity = Math.max(0.1, Math.min(3.0, sensitivity));
        console.log(`👆 Gesture sensitivity set to ${this.options.sensitivity.toFixed(1)}`);
    }
    
    triggerHaptic(intensity) {
        if (!this.options.hapticFeedback) return;
        
        const hapticOptions = { 
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false 
        };
        
        switch (intensity) {
            case 'light':
                HapticFeedback.trigger('impactLight', hapticOptions);
                break;
            case 'medium':
                HapticFeedback.trigger('impactMedium', hapticOptions);
                break;
            case 'heavy':
                HapticFeedback.trigger('impactHeavy', hapticOptions);
                break;
            default:
                HapticFeedback.trigger('impactMedium', hapticOptions);
        }
    }
    
    // Touch tracking for analytics
    trackTouch(touchEvent) {
        this.touchCount++;
        this.lastTouch = {
            x: touchEvent.locationX,
            y: touchEvent.locationY,
            timestamp: Date.now()
        };
    }
    
    getTouchStats() {
        return {
            totalTouches: this.touchCount,
            currentScale: this.scale,
            currentRotation: this.rotation * 180 / Math.PI, // In degrees
            lastTouchTime: this.lastTouch.timestamp,
            gestureActive: this.gestureActive
        };
    }
    
    // Accessibility features
    enableAccessibilityMode() {
        // Reduce sensitivity and add larger snap zones for accessibility
        this.options.sensitivity *= 0.5;
        this.options.hapticFeedback = true;
        
        console.log("♿ Accessibility mode enabled");
    }
    
    // Performance monitoring
    getPerformanceStats() {
        return {
            lastUpdateTime: this.lastUpdateTime,
            updateThrottle: this.updateThrottle,
            averageFrameTime: this.lastUpdateTime > 0 ? Date.now() - this.lastUpdateTime : 0
        };
    }
}

export default MobileGestureHandler;
'''

# Save mobile gesture handler
with open("MobileGestureHandler.js", "w") as f:
    f.write(mobile_gesture_handler)

print("👆 Mobile Gesture Handler created!")
print("📁 File: MobileGestureHandler.js")
print("🎮 Advanced touch controls with pinch, pan, rotate, and haptic feedback!")