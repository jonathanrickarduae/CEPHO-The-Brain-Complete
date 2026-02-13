import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "mix";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // If defaultTheme is explicitly set to dark, use it unless user has explicitly changed it
    if (defaultTheme === "dark" && switchable) {
      const stored = localStorage.getItem("theme");
      // Only use stored theme if it exists AND is different from default
      if (stored && stored !== defaultTheme && (stored === "light" || stored === "dark" || stored === "mix")) {
        return stored;
      }
      return defaultTheme;
    }
    
    if (switchable) {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark" || stored === "mix") {
        return stored;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes first
    root.classList.remove("dark", "light", "mix");
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "mix") {
      root.classList.add("mix");
    } else if (theme === "light") {
      root.classList.add("light");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
