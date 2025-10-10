
// hyperfocus_visual_engine.js
import * as THREE from 'three';
import { WebGPURenderer } from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class HyperfocusVisualEngine {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        // Initialize WebGPU renderer - 2025 performance boost!
        this.renderer = new WebGPURenderer({ 
            antialias: true,
            powerPreference: 'high-performance',
            forceWebGL: false // Force WebGPU when available
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Controls for testing (remove for stream overlay)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // Active effects array
        this.activeEffects = [];
        this.constellationPoints = [];

        this.setupScene();
        this.animate();
    }

    setupScene() {
        // Set up the neurodivergent-friendly space environment
        this.scene.background = new THREE.Color(0x000011); // Deep space blue

        // Add some ambient cosmic lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Directional light for depth
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Position camera for optimal viewing
        this.camera.position.set(0, 0, 10);

        // Create base constellation grid
        this.createConstellationBase();
    }

    createConstellationBase() {
        // Create a subtle grid of potential constellation points
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < 200; i++) {
            // Random positions in 3D space
            positions.push(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10
            );

            // Soft blue-white colors
            colors.push(0.5, 0.7, 1.0);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.3
        });

        this.baseStars = new THREE.Points(geometry, material);
        this.scene.add(this.baseStars);
    }

    // Gift Effect Handlers - The magic happens here! ✨

    createShootingStar(config) {
        console.log("🌟 Creating Shooting Star Effect!");

        const group = new THREE.Group();
        const particleCount = config.particles;

        // Create the main shooting star trail
        const trailGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];

        for (let i = 0; i < particleCount; i++) {
            // Create a curved trail
            const t = i / particleCount;
            positions.push(
                -10 + t * 20, // X: left to right
                Math.sin(t * Math.PI) * 3, // Y: arc motion
                Math.random() * 2 - 1 // Z: slight depth variation
            );

            // Color based on config
            const color = new THREE.Color(config.color);
            colors.push(color.r, color.g, color.b);

            // Size decreases along trail
            sizes.push(Math.random() * 0.1 + 0.05);
        }

        trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        trailGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const trailMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const trail = new THREE.Points(trailGeometry, trailMaterial);
        group.add(trail);

        // Animation properties
        group.userData = {
            type: 'shooting_star',
            startTime: Date.now(),
            duration: 3000,
            config: config
        };

        this.scene.add(group);
        this.activeEffects.push(group);

        return group;
    }

    createDopamineBurst(config) {
        console.log("💖 Creating Dopamine Burst Effect!");

        const group = new THREE.Group();
        const particleCount = config.particles;

        // Create burst particles
        const burstGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            // Start from center
            positions.push(0, 0, 0);

            // Bright, happy colors
            const color = new THREE.Color(config.color);
            colors.push(color.r, color.g, color.b);

            // Random outward velocities
            velocities.push(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            );
        }

        burstGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        burstGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        burstGeometry.userData = { velocities: velocities };

        const burstMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });

        const burst = new THREE.Points(burstGeometry, burstMaterial);
        group.add(burst);

        // Animation properties
        group.userData = {
            type: 'dopamine_burst',
            startTime: Date.now(),
            duration: 4000,
            config: config,
            particles: burst
        };

        this.scene.add(group);
        this.activeEffects.push(group);

        return group;
    }

    createHyperfocusSupernova(config) {
        console.log("🌌 Creating HYPERFOCUS SUPERNOVA!");

        const group = new THREE.Group();
        const particleCount = config.particles;

        // Massive explosion with multiple rings
        for (let ring = 0; ring < 3; ring++) {
            const ringGeometry = new THREE.BufferGeometry();
            const positions = [];
            const colors = [];

            const ringRadius = (ring + 1) * 2;
            const ringParticles = Math.floor(particleCount / 3);

            for (let i = 0; i < ringParticles; i++) {
                const angle = (i / ringParticles) * Math.PI * 2;
                const radius = ringRadius + Math.random() * 2;

                positions.push(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    (Math.random() - 0.5) * 4
                );

                // Purple/blue cosmic colors
                const color = new THREE.Color(config.color);
                color.multiplyScalar(0.5 + ring * 0.3);
                colors.push(color.r, color.g, color.b);
            }

            ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            ringGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const ringMaterial = new THREE.PointsMaterial({
                size: 0.08,
                vertexColors: true,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });

            const ringPoints = new THREE.Points(ringGeometry, ringMaterial);
            group.add(ringPoints);
        }

        // Animation properties
        group.userData = {
            type: 'hyperfocus_supernova',
            startTime: Date.now(),
            duration: 6000,
            config: config
        };

        this.scene.add(group);
        this.activeEffects.push(group);

        return group;
    }

    // Main gift handler - routes to appropriate effect
    handleGift(giftData) {
        const effect = giftData.effect;
        console.log(`🎁 Handling gift: ${giftData.gift.name} with ${effect.particles} particles!`);

        let visualEffect;

        switch (effect.type) {
            case 'shooting_star':
                visualEffect = this.createShootingStar(effect);
                break;
            case 'dopamine_burst':
                visualEffect = this.createDopamineBurst(effect);
                break;
            case 'hyperfocus_supernova':
                visualEffect = this.createHyperfocusSupernova(effect);
                break;
            case 'focus_coin_shower':
                visualEffect = this.createShootingStar({...effect, color: '#FFD700'});
                break;
            case 'constellation_builder':
                visualEffect = this.createHyperfocusSupernova({...effect, color: '#00CED1'});
                break;
            default:
                visualEffect = this.createDopamineBurst({...effect, particles: 200});
        }

        // Play sound effect (implement with Web Audio API)
        this.playSoundEffect(effect.sound);

        return visualEffect;
    }

    playSoundEffect(soundName) {
        // TODO: Implement Web Audio API sound effects
        console.log(`🔊 Playing sound: ${soundName}`);
    }

    // Animation loop - keeps everything moving
    animate() {
        requestAnimationFrame(() => this.animate());

        const currentTime = Date.now();

        // Update active effects
        this.activeEffects = this.activeEffects.filter(effect => {
            const userData = effect.userData;
            const elapsed = currentTime - userData.startTime;
            const progress = elapsed / userData.duration;

            if (progress >= 1.0) {
                // Effect finished - remove from scene
                this.scene.remove(effect);
                return false;
            }

            // Update effect based on type
            this.updateEffect(effect, progress);
            return true;
        });

        // Rotate base constellation slowly
        if (this.baseStars) {
            this.baseStars.rotation.y += 0.001;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    updateEffect(effect, progress) {
        const userData = effect.userData;

        switch (userData.type) {
            case 'shooting_star':
                effect.position.x = -10 + progress * 20;
                effect.material?.opacity && (effect.material.opacity = 1 - progress);
                break;

            case 'dopamine_burst':
                if (userData.particles) {
                    const positions = userData.particles.geometry.attributes.position.array;
                    const velocities = userData.particles.geometry.userData.velocities;

                    for (let i = 0; i < velocities.length; i += 3) {
                        positions[i] += velocities[i] * progress * 10;     // X
                        positions[i + 1] += velocities[i + 1] * progress * 10; // Y
                        positions[i + 2] += velocities[i + 2] * progress * 10; // Z
                    }

                    userData.particles.geometry.attributes.position.needsUpdate = true;
                    userData.particles.material.opacity = 1 - progress * 0.5;
                }
                break;

            case 'hyperfocus_supernova':
                effect.scale.setScalar(1 + progress * 3);
                effect.rotation.z = progress * Math.PI * 2;
                break;
        }
    }

    // Handle window resize
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Export for use in main HTML
window.HyperfocusVisualEngine = HyperfocusVisualEngine;
