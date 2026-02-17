import React, { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * ThemeInitializer - Prevents theme flash on page load
 * 
 * This component should be placed at the root of your app to ensure
 * the theme is applied before the page renders, preventing a flash
 * of unstyled content (FOUC) when switching themes.
 */
export function ThemeInitializer() {
  const { theme } = useTheme();

  useEffect(() => {
    // Add fade-in animation class when theme is loaded
    const html = document.documentElement;
    html.style.opacity = '0';
    html.style.transition = 'opacity 0.3s ease-in';

    // Trigger reflow to ensure transition is applied
    void html.offsetHeight;

    // Fade in after theme is applied
    setTimeout(() => {
      html.style.opacity = '1';
    }, 50);

    return () => {
      html.style.opacity = '1';
      html.style.transition = '';
    };
  }, [theme]);

  return null;
}

/**
 * Alternative: Add this to your HTML head to prevent flash:
 * 
 * <script>
 *   const theme = localStorage.getItem('cepho_theme_preference') || 'system';
 *   const html = document.documentElement;
 *   
 *   if (theme === 'system') {
 *     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
 *     if (prefersDark) html.classList.add('dark');
 *   } else if (theme === 'dark') {
 *     html.classList.add('dark');
 *   } else {
 *     html.classList.add('light');
 *   }
 * </script>
 */
