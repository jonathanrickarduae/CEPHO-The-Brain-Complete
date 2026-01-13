import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

const THEME_STORAGE_KEY = 'cepho_theme_preference';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get from localStorage or default to 'auto'
    if (typeof window === 'undefined') return 'auto';
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    return stored || 'auto';
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  });

  // Update theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    // Apply theme to document
    const htmlElement = document.documentElement;
    
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        htmlElement.classList.add('dark');
        setIsDark(true);
      } else {
        htmlElement.classList.remove('dark');
        setIsDark(false);
      }
    } else if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
      setIsDark(true);
    } else {
      htmlElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

  return {
    theme,
    setTheme,
    isDark,
    toggleTheme: () => {
      if (theme === 'light') setTheme('dark');
      else if (theme === 'dark') setTheme('auto');
      else setTheme('light');
    },
  };
}
