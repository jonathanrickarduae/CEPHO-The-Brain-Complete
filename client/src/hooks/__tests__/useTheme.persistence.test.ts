import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTheme, type Theme } from '../useTheme';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('useTheme - Persistence Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists theme preference to localStorage', async () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    await waitFor(() => {
      expect(localStorage.getItem('cepho_theme_preference')).toBe('light');
    });
  });

  it('loads theme from localStorage on subsequent renders', async () => {
    localStorage.setItem('cepho_theme_preference', 'dark');

    const { result } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
    });
  });

  it('persists theme across multiple hook instances', async () => {
    const { result: result1 } = renderHook(() => useTheme());

    act(() => {
      result1.current.setTheme('light');
    });

    await waitFor(() => {
      expect(localStorage.getItem('cepho_theme_preference')).toBe('light');
    });

    // Simulate new page/component with new hook instance
    const { result: result2 } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result2.current.theme).toBe('light');
    });
  });

  it('maintains theme preference after page reload simulation', async () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    await waitFor(() => {
      expect(localStorage.getItem('cepho_theme_preference')).toBe('dark');
    });

    // Simulate page reload by clearing component but keeping localStorage
    const { result: reloadedResult } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(reloadedResult.current.theme).toBe('dark');
    });
  });

  it('defaults to system theme if localStorage is empty', async () => {
    localStorage.clear();

    const { result } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result.current.theme).toBe('system');
    });
  });

  it('applies theme class to document element for persistence', async () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    act(() => {
      result.current.setTheme('dark');
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });
  });

  it('cycles through all theme options correctly', async () => {
    const { result } = renderHook(() => useTheme());

    const themes: Theme[] = ['light', 'dark', 'system'];
    let currentIndex = 0;

    act(() => {
      result.current.toggleTheme();
    });

    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
    });

    act(() => {
      result.current.toggleTheme();
    });

    await waitFor(() => {
      expect(result.current.theme).toBe('system');
    });

    act(() => {
      result.current.toggleTheme();
    });

    await waitFor(() => {
      expect(result.current.theme).toBe('light');
    });
  });

  it('persists isDark state correctly with theme changes', async () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    await waitFor(() => {
      expect(result.current.isDark).toBe(false);
    });

    act(() => {
      result.current.setTheme('dark');
    });

    await waitFor(() => {
      expect(result.current.isDark).toBe(true);
    });
  });

  it('handles rapid theme changes without data loss', async () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
      result.current.setTheme('dark');
      result.current.setTheme('system');
    });

    await waitFor(() => {
      expect(result.current.theme).toBe('system');
      expect(localStorage.getItem('cepho_theme_preference')).toBe('system');
    });
  });

  it('maintains consistency between localStorage and component state', async () => {
    const { result } = renderHook(() => useTheme());

    const themesToTest: Theme[] = ['light', 'dark', 'system'];

    for (const theme of themesToTest) {
      act(() => {
        result.current.setTheme(theme);
      });

      await waitFor(() => {
        expect(result.current.theme).toBe(theme);
        expect(localStorage.getItem('cepho_theme_preference')).toBe(theme);
      });
    }
  });
});
