
// MobileHyperfocusEngine.js - WebGPU engine optimized for mobile devices
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Canvas, useCanvasEffect } from 'react-native-wgpu';
import HapticFeedback from 'react-native-haptic-feedback';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export class MobileVisualEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = {
            mobileOptimized: true,
            maxParticles: Platform.OS === 'android' ? 2000 : 3000, // Adaptive based on platform
            qualityLevel: 'auto',
            adaptiveFrameRate: true,
            ...options
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.activeEffects = [];
        this.frameRate = 60;
        this.lastFrameTime = 0;

        this.initEngine();
    }

    async initEngine() {
        console.log("🚀 Initializing Mobile Hyperfocus Engine...");

        try {
            // Request WebGPU adapter with mobile optimization
            this.adapter = await navigator.gpu.requestAdapter({
                powerPreference: 'high-performance',
                forceFallbackAdapter: false
            });

            if (!this.adapter) {
                throw new Error('WebGPU not supported on this device');
            }

            console.log("✅ WebGPU adapter acquired:", this.adapter);

            // Get device with mobile-specific limits
            this.device = await this.adapter.requestDevice({
                requiredFeatures: [],
                requiredLimits: {
                    maxBufferSize: 268435456, // 256MB limit for mobile
                    maxTextureArrayLayers: 256
                }
            });

            this.setupMobileScene();
            this.startRenderLoop();

            console.log("🌟 Mobile Hyperfocus Engine ready!");

        } catch (error) {
            console.error("❌ Failed to initialize WebGPU:", error);
            // Fallback to Canvas 2D for older devices
            this.initCanvas2DFallback();
        }
    }

    setupMobileScene() {
        // Create mobile-optimized 3D scene
        this.scene = {
            objects: [],
            particles: [],
            lights: []
        };

        // Mobile-friendly camera setup
        this.camera = {
            position: { x: 0, y: 0, z: 10 },
            rotation: { x: 0, y: 0, z: 0 },
            fov: 75,
            aspect: screenWidth / screenHeight,
            near: 0.1,
            far: 1000
        };

        // Add base constellation points (reduced for mobile)
        this.createMobileConstellation();
    }

    createMobileConstellation() {
        console.log("⭐ Creating mobile constellation...");

        const starCount = this.options.mobileOptimized ? 100 : 200;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;

            // Distribute stars in mobile-friendly pattern
            positions[i3] = (Math.random() - 0.5) * 15;     // X
            positions[i3 + 1] = (Math.random() - 0.5) * 15; // Y  
            positions[i3 + 2] = (Math.random() - 0.5) * 8;  // Z (reduced depth)

            // Soft blue-white colors
            colors[i3] = 0.7 + Math.random() * 0.3;     // R
            colors[i3 + 1] = 0.8 + Math.random() * 0.2; // G
            colors[i3 + 2] = 1.0;                       // B
        }

        this.baseStars = {
            positions,
            colors,
            count: starCount,
            visible: true
        };

        console.log(`✅ Created ${starCount} constellation stars for mobile`);
    }

    // Mobile-optimized gift effect handlers
    handleMobileGift(giftData) {
        console.log(`🎁 Mobile gift received: ${giftData.gift.name}`);

        // Trigger haptic feedback first (instant response)
        this.triggerMobileHaptic(giftData.effect.intensity);

        // Create visual effect with mobile optimization
        let effect;
        switch (giftData.effect.type) {
            case 'shooting_star':
                effect = this.createMobileShootingStar(giftData.effect);
                break;
            case 'dopamine_burst':
                effect = this.createMobileDopamineBurst(giftData.effect);
                break;
            case 'hyperfocus_supernova':
                effect = this.createMobileSupernova(giftData.effect);
                break;
            default:
                effect = this.createMobileDopamineBurst({
                    ...giftData.effect,
                    particles: 300,
                    color: '#FF69B4'
                });
        }

        this.activeEffects.push(effect);
        this.optimizePerformance();

        return effect;
    }

    createMobileShootingStar(config) {
        console.log("🌟 Creating mobile shooting star!");

        const particleCount = Math.min(config.particles, 400); // Mobile limit
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const t = i / particleCount;

            // Create curved trail optimized for mobile viewing
            positions[i3] = -8 + t * 16;                    // X: screen-friendly range
            positions[i3 + 1] = Math.sin(t * Math.PI) * 2;  // Y: gentle arc
            positions[i3 + 2] = Math.random() * 2 - 1;      // Z: minimal depth

            // Velocity for animation
            velocities[i3] = 0.2;     // X movement
            velocities[i3 + 1] = 0.1; // Y movement  
            velocities[i3 + 2] = 0.0; // Z stable

            // Color from config
            const color = this.hexToRgb(config.color);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        return {
            type: 'shooting_star',
            positions,
            velocities,
            colors,
            particleCount,
            startTime: Date.now(),
            duration: 2500, // Shorter for mobile attention spans
            opacity: 1.0,
            mobile: true
        };
    }

    createMobileDopamineBurst(config) {
        console.log("💖 Creating mobile dopamine burst!");

        const particleCount = Math.min(config.particles, 600);
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Start from center
            positions[i3] = 0;     // X
            positions[i3 + 1] = 0; // Y
            positions[i3 + 2] = 0; // Z

            // Explosive outward velocities (mobile-optimized)
            const speed = 0.1 + Math.random() * 0.15;
            const angle = Math.random() * Math.PI * 2;
            const elevation = (Math.random() - 0.5) * Math.PI * 0.5;

            velocities[i3] = Math.cos(angle) * Math.cos(elevation) * speed;     // X
            velocities[i3 + 1] = Math.sin(angle) * Math.cos(elevation) * speed; // Y
            velocities[i3 + 2] = Math.sin(elevation) * speed * 0.3;             // Z (reduced)

            // Bright, happy colors
            const color = this.hexToRgb(config.color);
            colors[i3] = color.r * (0.8 + Math.random() * 0.2);
            colors[i3 + 1] = color.g * (0.8 + Math.random() * 0.2);
            colors[i3 + 2] = color.b * (0.8 + Math.random() * 0.2);
        }

        return {
            type: 'dopamine_burst',
            positions,
            velocities,
            colors,
            particleCount,
            startTime: Date.now(),
            duration: 3000,
            opacity: 1.0,
            mobile: true
        };
    }

    createMobileSupernova(config) {
        console.log("🌌 Creating mobile supernova!");

        const particleCount = Math.min(config.particles, 1000); // Reduced for mobile
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        // Create multiple rings with mobile optimization
        const ringCount = 3;
        const particlesPerRing = Math.floor(particleCount / ringCount);

        for (let ring = 0; ring < ringCount; ring++) {
            const ringRadius = (ring + 1) * 1.5; // Smaller radius for mobile screen

            for (let i = 0; i < particlesPerRing; i++) {
                const idx = ring * particlesPerRing + i;
                const i3 = idx * 3;

                const angle = (i / particlesPerRing) * Math.PI * 2;
                const radius = ringRadius + Math.random() * 0.5;

                positions[i3] = Math.cos(angle) * radius;
                positions[i3 + 1] = Math.sin(angle) * radius;
                positions[i3 + 2] = (Math.random() - 0.5) * 2; // Minimal Z depth

                // Purple/blue cosmic colors
                const color = this.hexToRgb(config.color);
                const intensity = 0.5 + ring * 0.2;
                colors[i3] = color.r * intensity;
                colors[i3 + 1] = color.g * intensity;
                colors[i3 + 2] = color.b * intensity;
            }
        }

        return {
            type: 'hyperfocus_supernova',
            positions,
            colors,
            particleCount,
            startTime: Date.now(),
            duration: 4000,
            rotation: 0,
            rotationSpeed: 0.02, // Slower for mobile
            scale: 1.0,
            mobile: true
        };
    }

    triggerMobileHaptic(intensity) {
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
            case 5:
                HapticFeedback.trigger('impactMedium', hapticOptions);
                break;
            default:
                HapticFeedback.trigger('impactHeavy', hapticOptions);
        }
    }

    optimizePerformance() {
        // Mobile performance optimization
        const currentEffectCount = this.activeEffects.length;
        const maxEffects = this.options.mobileOptimized ? 5 : 10;

        // Remove oldest effects if too many
        if (currentEffectCount > maxEffects) {
            const removeCount = currentEffectCount - maxEffects;
            this.activeEffects.splice(0, removeCount);
            console.log(`🔧 Removed ${removeCount} old effects for mobile performance`);
        }

        // Adaptive quality based on performance
        const currentTime = Date.now();
        const frameDelta = currentTime - this.lastFrameTime;

        if (frameDelta > 33) { // Running slower than 30fps
            this.reduceMobileQuality();
        } else if (frameDelta < 16) { // Running faster than 60fps
            this.increaseMobileQuality();
        }

        this.lastFrameTime = currentTime;
    }

    reduceMobileQuality() {
        // Reduce particle counts for struggling devices
        this.activeEffects.forEach(effect => {
            if (effect.mobile && effect.particleCount > 200) {
                effect.particleCount = Math.floor(effect.particleCount * 0.8);
            }
        });
        console.log("📱 Reduced quality for mobile performance");
    }

    increaseMobileQuality() {
        // Can afford higher quality
        if (this.options.maxParticles < 3000) {
            this.options.maxParticles += 100;
        }
    }

    startRenderLoop() {
        const render = () => {
            this.updateMobileEffects();
            this.renderMobileFrame();
            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
        console.log("🔄 Mobile render loop started");
    }

    updateMobileEffects() {
        const currentTime = Date.now();

        this.activeEffects = this.activeEffects.filter(effect => {
            const elapsed = currentTime - effect.startTime;
            const progress = elapsed / effect.duration;

            if (progress >= 1.0) {
                return false; // Remove completed effect
            }

            // Update effect based on type
            switch (effect.type) {
                case 'shooting_star':
                    this.updateShootingStar(effect, progress);
                    break;
                case 'dopamine_burst':
                    this.updateDopamineBurst(effect, progress);
                    break;
                case 'hyperfocus_supernova':
                    this.updateSupernova(effect, progress);
                    break;
            }

            return true;
        });
    }

    updateShootingStar(effect, progress) {
        // Move particles along trail
        for (let i = 0; i < effect.particleCount; i++) {
            const i3 = i * 3;
            effect.positions[i3] += effect.velocities[i3];     // X
            effect.positions[i3 + 1] += effect.velocities[i3 + 1]; // Y
        }

        // Fade out
        effect.opacity = 1 - progress * 0.7;
    }

    updateDopamineBurst(effect, progress) {
        // Expand particles outward
        for (let i = 0; i < effect.particleCount; i++) {
            const i3 = i * 3;
            effect.positions[i3] += effect.velocities[i3];     // X
            effect.positions[i3 + 1] += effect.velocities[i3 + 1]; // Y
            effect.positions[i3 + 2] += effect.velocities[i3 + 2]; // Z

            // Add gravity effect on mobile
            effect.velocities[i3 + 1] -= 0.002; // Gentle gravity
        }

        effect.opacity = 1 - progress * 0.3;
    }

    updateSupernova(effect, progress) {
        // Rotate rings
        effect.rotation += effect.rotationSpeed;

        // Scale up over time
        effect.scale = 1 + progress * 2;

        // Fade out towards end
        effect.opacity = progress < 0.7 ? 1.0 : 1 - (progress - 0.7) / 0.3;
    }

    renderMobileFrame() {
        // Mobile-optimized rendering (placeholder - actual WebGPU rendering would go here)
        // This would typically involve WebGPU buffer updates and draw calls
        // For now, we'll simulate the rendering process

        if (this.activeEffects.length > 0) {
            // Simulate GPU work
            const renderStart = performance.now();

            // Render base constellation
            this.renderBaseStars();

            // Render active effects
            this.activeEffects.forEach(effect => {
                this.renderEffect(effect);
            });

            const renderTime = performance.now() - renderStart;
            if (renderTime > 16) {
                console.log(`⚠️ Mobile render took ${renderTime.toFixed(1)}ms`);
            }
        }
    }

    renderBaseStars() {
        // Render constellation base with WebGPU (placeholder)
    }

    renderEffect(effect) {
        // Render individual effect with WebGPU (placeholder)
    }

    // Utility functions
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 1, g: 1, b: 1 };
    }

    initCanvas2DFallback() {
        console.log("📱 Initializing Canvas 2D fallback for older devices");
        // Fallback implementation for devices without WebGPU
        // This would use Canvas 2D API for basic effects
    }

    // Touch interaction methods
    handleTouch(event) {
        switch (event.type) {
            case 'pinch':
                this.handlePinchZoom(event.scale);
                break;
            case 'pan':
                this.handlePan(event.deltaX, event.deltaY);
                break;
            case 'rotate':
                this.handleRotate(event.rotation);
                break;
        }
    }

    handlePinchZoom(scale) {
        this.camera.fov = Math.max(30, Math.min(120, this.camera.fov / scale));
        console.log(`🔍 Mobile zoom: ${this.camera.fov.toFixed(1)}°`);
    }

    handlePan(deltaX, deltaY) {
        this.camera.position.x -= deltaX * 0.01;
        this.camera.position.y += deltaY * 0.01;
        console.log(`👆 Mobile pan: ${deltaX}, ${deltaY}`);
    }

    handleRotate(rotation) {
        this.camera.rotation.z = rotation * 0.01;
        console.log(`🔄 Mobile rotate: ${rotation.toFixed(1)}°`);
    }

    // Test methods for mobile debugging
    testMobileEffect(effectType) {
        const testGiftData = {
            gift: { name: effectType, repeat_count: 1 },
            user: { username: 'test_mobile_user' },
            effect: this.getMobileEffectConfig(effectType)
        };

        this.handleMobileGift(testGiftData);
    }

    getMobileEffectConfig(giftName) {
        const configs = {
            'Rose': {
                type: 'shooting_star',
                intensity: 3,
                color: '#FF69B4',
                particles: 400, // Mobile optimized
                sound: 'cosmic_chime'
            },
            'Heart': {
                type: 'dopamine_burst',
                intensity: 5,
                color: '#FF0080',
                particles: 600, // Mobile optimized
                sound: 'positive_affirmation'
            },
            'Universe': {
                type: 'hyperfocus_supernova',
                intensity: 8,
                color: '#8A2BE2',
                particles: 1000, // Mobile optimized
                sound: 'universe_explosion'
            }
        };

        return configs[giftName] || configs['Heart'];
    }
}

export default MobileVisualEngine;
