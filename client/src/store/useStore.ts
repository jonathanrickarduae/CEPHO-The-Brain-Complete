/**
 * Global Zustand Store
 * Centralized state management for CEPHO.AI
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// User preferences interface
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es' | 'fr' | 'de';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
  };
}

// UI state interface
interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
  toast: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  } | null;
}

// Store interface
interface StoreState {
  // User preferences
  preferences: UserPreferences;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  
  // UI state
  ui: UIState;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveModal: (modal: string | null) => void;
  setLoading: (key: string, loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
  
  // Cache for optimistic updates
  cache: {
    [key: string]: any;
  };
  setCache: (key: string, value: any) => void;
  clearCache: (key?: string) => void;
  
  // Recent activity tracking
  recentActivity: Array<{
    id: string;
    type: string;
    timestamp: number;
    data: any;
  }>;
  addActivity: (activity: { type: string; data: any }) => void;
  clearActivity: () => void;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'auto',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  dashboard: {
    layout: 'grid',
    widgets: ['overview', 'recent-activity', 'quick-actions'],
  },
};

// Default UI state
const defaultUIState: UIState = {
  sidebarOpen: true,
  activeModal: null,
  loading: {
    global: false,
  },
  toast: null,
};

// Create store with persistence
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // User preferences
      preferences: defaultPreferences,
      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          },
        })),
      
      // UI state
      ui: defaultUIState,
      setSidebarOpen: (open) =>
        set((state) => ({
          ui: {
            ...state.ui,
            sidebarOpen: open,
          },
        })),
      toggleSidebar: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            sidebarOpen: !state.ui.sidebarOpen,
          },
        })),
      setActiveModal: (modal) =>
        set((state) => ({
          ui: {
            ...state.ui,
            activeModal: modal,
          },
        })),
      setLoading: (key, loading) =>
        set((state) => ({
          ui: {
            ...state.ui,
            loading: {
              ...state.ui.loading,
              [key]: loading,
            },
          },
        })),
      setGlobalLoading: (loading) =>
        set((state) => ({
          ui: {
            ...state.ui,
            loading: {
              ...state.ui.loading,
              global: loading,
            },
          },
        })),
      showToast: (message, type) =>
        set((state) => ({
          ui: {
            ...state.ui,
            toast: {
              message,
              type,
              visible: true,
            },
          },
        })),
      hideToast: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            toast: state.ui.toast ? { ...state.ui.toast, visible: false } : null,
          },
        })),
      
      // Cache
      cache: {},
      setCache: (key, value) =>
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: value,
          },
        })),
      clearCache: (key) =>
        set((state) => {
          if (key) {
            const { [key]: _, ...rest } = state.cache;
            return { cache: rest };
          }
          return { cache: {} };
        }),
      
      // Recent activity
      recentActivity: [],
      addActivity: (activity) =>
        set((state) => ({
          recentActivity: [
            {
              id: `${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
              ...activity,
            },
            ...state.recentActivity.slice(0, 49), // Keep last 50 activities
          ],
        })),
      clearActivity: () => set({ recentActivity: [] }),
    }),
    {
      name: 'cepho-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist preferences and some UI state
      partialize: (state) => ({
        preferences: state.preferences,
        ui: {
          sidebarOpen: state.ui.sidebarOpen,
        },
      }),
    }
  )
);

// Selectors for better performance
export const selectPreferences = (state: StoreState) => state.preferences;
export const selectTheme = (state: StoreState) => state.preferences.theme;
export const selectLanguage = (state: StoreState) => state.preferences.language;
export const selectSidebarOpen = (state: StoreState) => state.ui.sidebarOpen;
export const selectActiveModal = (state: StoreState) => state.ui.activeModal;
export const selectLoading = (key: string) => (state: StoreState) => state.ui.loading[key] || false;
export const selectGlobalLoading = (state: StoreState) => state.ui.loading.global;
export const selectToast = (state: StoreState) => state.ui.toast;
export const selectCache = (key: string) => (state: StoreState) => state.cache[key];
export const selectRecentActivity = (state: StoreState) => state.recentActivity;
