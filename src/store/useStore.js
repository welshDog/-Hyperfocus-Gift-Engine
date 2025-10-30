import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Define the store's initial state and actions
const store = (set, get) => ({
  // App state
  isInitialized: false,
  isConnected: false,
  error: null,
  
  // Stream state
  isStreamActive: false,
  viewerCount: 0,
  gifts: [],
  
  // User preferences
  userPreferences: {
    darkMode: true,
    motionReduced: false,
    notificationEnabled: true,
    volume: 0.7,
  },
  
  // Actions
  initialize: () => set({ isInitialized: true }),
  setConnected: (status) => set({ isConnected: status }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Stream actions
  startStream: () => set({ isStreamActive: true }),
  stopStream: () => set({ isStreamActive: false }),
  updateViewerCount: (count) => set({ viewerCount: count }),
  
  // Gift handling
  addGift: (gift) => set((state) => ({
    gifts: [...state.gifts, { ...gift, id: Date.now(), timestamp: new Date().toISOString() }]
  })),
  clearGifts: () => set({ gifts: [] }),
  
  // User preferences actions
  toggleDarkMode: () => set((state) => ({
    userPreferences: {
      ...state.userPreferences,
      darkMode: !state.userPreferences.darkMode
    }
  })),
  
  toggleMotionReduced: () => set((state) => ({
    userPreferences: {
      ...state.userPreferences,
      motionReduced: !state.userPreferences.motionReduced
    }
  })),
  
  updateVolume: (volume) => set((state) => ({
    userPreferences: {
      ...state.userPreferences,
      volume: Math.max(0, Math.min(1, volume)) // Clamp between 0 and 1
    }
  })),
  
  // Reset store to initial state
  reset: () => set({
    isInitialized: false,
    isConnected: false,
    error: null,
    isStreamActive: false,
    viewerCount: 0,
    gifts: [],
    userPreferences: {
      darkMode: true,
      motionReduced: false,
      notificationEnabled: true,
      volume: 0.7,
    }
  })
});

// Create the store with devtools and persistence
const useStore = create(
  devtools(
    persist(
      store,
      {
        name: 'hyperfocus-store', // name for localStorage key
        partialize: (state) => ({
          // Only persist user preferences
          userPreferences: state.userPreferences,
        }),
      }
    ),
    { name: 'HyperfocusStore' } // Devtools name
  )
);

export default useStore;
