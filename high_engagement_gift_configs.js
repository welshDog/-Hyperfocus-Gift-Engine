
// Updated Gift Configurations - HIGH ENGAGEMENT EDITION
// Based on 2025 TikTok Live engagement research

const HIGH_ENGAGEMENT_GIFT_CONFIGS = {
    // TIER 1: ULTIMATE VIRAL MOMENTS ($200+)
    "TikTok Universe": {
        type: "ultimate_universe",
        intensity: 10,
        color: "#8A2BE2",
        particles: 5000,
        duration: 8000,
        sound: "universe_explosion",
        tier: "ultimate",
        price: 562.48,
        description: "Ultimate Universe Explosion",
        specialEffect: "constellation_birth",
        hapticPattern: "supernova"
    },

    "Lion": {
        type: "majestic_roar",
        intensity: 9,
        color: "#FFD700",
        particles: 3500,
        duration: 6000,
        sound: "lion_roar",
        tier: "premium",
        price: 398.95,
        description: "Golden Lion Majesty",
        specialEffect: "mane_shimmer",
        hapticPattern: "powerful_roar"
    },

    "Diamond Flight": {
        type: "diamond_cascade",
        intensity: 9,
        color: "#E0E0E0",
        particles: 4000,
        duration: 7000,
        sound: "crystal_chimes",
        tier: "premium",
        price: 239.40,
        description: "Prismatic Diamond Shower",
        specialEffect: "rainbow_refraction",
        hapticPattern: "crystalline"
    },

    "Planet": {
        type: "planetary_orbit",
        intensity: 8,
        color: "#FF6B35",
        particles: 3000,
        duration: 6000,
        sound: "cosmic_resonance",
        tier: "premium", 
        price: 199.50,
        description: "Orbital Planet System",
        specialEffect: "gravity_field",
        hapticPattern: "orbital"
    },

    // TIER 2: SWEET SPOT REGULARS ($10-100)
    "Airplane": {
        type: "jet_flyover",
        intensity: 7,
        color: "#87CEEB",
        particles: 1500,
        duration: 4000,
        sound: "jet_engine",
        tier: "regular",
        price: 79.78,
        description: "Supersonic Flyover",
        specialEffect: "contrail_formation",
        hapticPattern: "flyby"
    },

    "Mermaid": {
        type: "underwater_magic",
        intensity: 6,
        color: "#20B2AA",
        particles: 2000,
        duration: 5000,
        sound: "ocean_waves",
        tier: "regular",
        price: 39.74,
        description: "Mystical Underwater Scene",
        specialEffect: "bubble_stream",
        hapticPattern: "waves"
    },

    "Disco Ball": {
        type: "disco_fever",
        intensity: 6,
        color: "#C0C0C0",
        particles: 1200,
        duration: 4000,
        sound: "disco_funk",
        tier: "regular",
        price: 13.30,
        description: "Retro Disco Party",
        specialEffect: "rainbow_beams",
        hapticPattern: "disco_beat"
    },

    "Money Rain": {
        type: "cash_cascade",
        intensity: 5,
        color: "#32CD32",
        particles: 800,
        duration: 3500,
        sound: "cash_register",
        tier: "regular",
        price: 6.65,
        description: "Golden Money Shower",
        specialEffect: "coin_bounce",
        hapticPattern: "cash_drop"
    },

    // TIER 3: HIGH FREQUENCY TRIGGERS (<$2)
    "Confetti": {
        type: "celebration_burst",
        intensity: 4,
        color: "#FF69B4",
        particles: 600,
        duration: 3000,
        sound: "party_horn",
        tier: "frequent",
        price: 1.33,
        description: "Celebration Confetti Blast",
        specialEffect: "multicolor_explosion",
        hapticPattern: "celebration"
    },

    "I Love You": {
        type: "love_explosion",
        intensity: 3,
        color: "#FF1493",
        particles: 400,
        duration: 2500,
        sound: "heart_flutter",
        tier: "frequent", 
        price: 0.65,
        description: "Heartfelt Love Burst",
        specialEffect: "floating_hearts",
        hapticPattern: "heartbeat"
    },

    // CLASSIC ORIGINALS (Updated for comparison)
    "Rose": {
        type: "shooting_star",
        intensity: 3,
        color: "#FF69B4",
        particles: 500,
        duration: 3000,
        sound: "cosmic_chime",
        tier: "classic",
        price: 0.01,
        description: "Classic Rose Trail",
        specialEffect: "petal_scatter",
        hapticPattern: "gentle"
    },

    "Heart": {
        type: "dopamine_burst",
        intensity: 5,
        color: "#FF0080",
        particles: 1000,
        duration: 4000,
        sound: "positive_affirmation", 
        tier: "classic",
        price: 0.07,
        description: "Dopamine Love Explosion",
        specialEffect: "heart_cascade",
        hapticPattern: "burst"
    }
};

// Engagement-based gift selection weights
const ENGAGEMENT_WEIGHTS = {
    "ultimate": 0.05,    // 5% - Rare viral moments
    "premium": 0.25,     // 25% - Major supporters  
    "regular": 0.50,     // 50% - Sweet spot for engagement
    "frequent": 0.15,    // 15% - Volume builders
    "classic": 0.05      // 5% - Nostalgic/comparison
};

// Neurodivergent optimization mappings
const NEURODIVERGENT_OPTIMIZED = {
    ADHD: ["Airplane", "Disco Ball", "Confetti", "Money Rain"],
    AUTISM: ["Planet", "Diamond Flight", "Mermaid", "TikTok Universe"],
    DYSLEXIA: ["Lion", "Heart", "Rose", "I Love You"],
    SENSORY_FRIENDLY: ["Mermaid", "Planet", "I Love You", "Rose"],
    HIGH_ENERGY: ["TikTok Universe", "Lion", "Disco Ball", "Confetti"]
};

// Effect complexity based on device performance
const PERFORMANCE_TIERS = {
    HIGH_END: ["TikTok Universe", "Lion", "Diamond Flight", "Planet"],
    MID_RANGE: ["Airplane", "Mermaid", "Disco Ball", "Money Rain"],
    LOW_END: ["Confetti", "I Love You", "Rose", "Heart"]
};

export { HIGH_ENGAGEMENT_GIFT_CONFIGS, ENGAGEMENT_WEIGHTS, NEURODIVERGENT_OPTIMIZED, PERFORMANCE_TIERS };
