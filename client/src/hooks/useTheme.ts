/**
 * useTheme — Theme management hook
 *
 * Reads/writes theme preference from:
 * 1. DB (via trpc.theme.get / trpc.theme.set) — persists across devices
 * 2. localStorage — instant local restore on page load
 *
 * Supports: "light" | "dark" | "system"
 */
import { useState, useEffect, useCallback } from "react";
import { trpc } from "../lib/trpc";

export type Theme = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "cepho_theme_preference";

function applyThemeToDOM(t: Theme, setIsDark: (v: boolean) => void) {
  const htmlElement = document.documentElement;
  htmlElement.style.transition = "background-color 0.3s ease, color 0.3s ease";
  if (t === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      htmlElement.classList.add("dark");
      htmlElement.classList.remove("light");
      setIsDark(true);
    } else {
      htmlElement.classList.remove("dark");
      htmlElement.classList.add("light");
      setIsDark(false);
    }
  } else if (t === "dark") {
    htmlElement.classList.add("dark");
    htmlElement.classList.remove("light");
    setIsDark(true);
  } else {
    htmlElement.classList.remove("dark");
    htmlElement.classList.add("light");
    setIsDark(false);
  }
}

export function useTheme() {
  // Router returns { theme: string } — NOT { themePreference: string }
  const { data: userTheme } = trpc.theme.get.useQuery();
  // Router accepts { theme: "light" | "dark" | "system" }
  const { mutate: saveTheme } = trpc.theme.set.useMutation();

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system")
      return stored;
    return "dark";
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  });

  // Update theme — persists to localStorage + DB + DOM
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      // Persist to DB — router accepts { theme: "light" | "dark" | "system" }
      saveTheme({ theme: newTheme });
      applyThemeToDOM(newTheme, setIsDark);
    },
    [saveTheme]
  );

  // Load theme from DB on mount — router returns { theme: string }
  useEffect(() => {
    if (userTheme?.theme) {
      const t = userTheme.theme as Theme;
      if (t === "light" || t === "dark" || t === "system") {
        setThemeState(t);
        localStorage.setItem(THEME_STORAGE_KEY, t);
        applyThemeToDOM(t, setIsDark);
      }
    }
  }, [userTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      const htmlElement = document.documentElement;
      if (e.matches) {
        htmlElement.classList.add("dark");
        htmlElement.classList.remove("light");
      } else {
        htmlElement.classList.remove("dark");
        htmlElement.classList.add("light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return {
    theme,
    setTheme,
    isDark,
    toggleTheme: () => {
      if (theme === "light") setTheme("dark");
      else if (theme === "dark") setTheme("system");
      else setTheme("light");
    },
  };
}
