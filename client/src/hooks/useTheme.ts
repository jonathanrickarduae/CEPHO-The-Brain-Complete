import { useState, useEffect, useCallback } from 'react';
import { trpc } from '../lib/trpc';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'cepho_theme_preference';

export function useTheme() {
  const { data: userTheme } = trpc.theme.get.useQuery();
  const { mutate: saveTheme } = trpc.theme.set.useMutation();
  
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get from localStorage or default to 'system'
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    return stored || 'system';
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  });

  // Update theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    
    // Save to backend
    saveTheme({ themePreference: newTheme });

    // Apply theme to document
    const htmlElement = document.documentElement;
    htmlElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        htmlElement.classList.add('dark');
        htmlElement.classList.remove('light');
        setIsDark(true);
      } else {
        htmlElement.classList.remove('dark');
        htmlElement.classList.add('light');
        setIsDark(false);
      }
    } else if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
      setIsDark(true);
    } else {
      htmlElement.classList.remove('dark');
      htmlElement.classList.add('light');
      setIsDark(false);
    }
  }, [saveTheme]);

  // Load theme from backend on mount
  useEffect(() => {
    if (userTheme?.themePreference) {
      setTheme(userTheme.themePreference as Theme);
    }
  }, [userTheme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      const htmlElement = document.documentElement;
      if (e.matches) {
        htmlElement.classList.add('dark');
        htmlElement.classList.remove('light');
      } else {
        htmlElement.classList.remove('dark');
        htmlElement.classList.add('light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return {
    theme,
    setTheme,
    isDark,
    toggleTheme: () => {
      if (theme === 'light') setTheme('dark');
      else if (theme === 'dark') setTheme('system');
      else setTheme('light');
    },
  };
}
