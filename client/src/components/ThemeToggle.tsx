import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('brain_theme') as Theme | null;
    if (saved) {
      setThemeState(saved);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    let resolved: 'light' | 'dark' = 'dark';
    
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }

    setResolvedTheme(resolved);

    // Remove both classes first
    root.classList.remove('light', 'dark');
    // Add the resolved theme class
    root.classList.add(resolved);

    // Update CSS variables for theme
    if (resolved === 'light') {
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '222.2 84% 4.9%');
      root.style.setProperty('--card', '0 0% 98%');
      root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--muted', '210 40% 96.1%');
      root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%');
      root.style.setProperty('--border', '214.3 31.8% 91.4%');
    } else {
      root.style.setProperty('--background', '222.2 84% 4.9%');
      root.style.setProperty('--foreground', '210 40% 98%');
      root.style.setProperty('--card', '222.2 84% 6%');
      root.style.setProperty('--card-foreground', '210 40% 98%');
      root.style.setProperty('--popover', '222.2 84% 6%');
      root.style.setProperty('--popover-foreground', '210 40% 98%');
      root.style.setProperty('--muted', '217.2 32.6% 17.5%');
      root.style.setProperty('--muted-foreground', '215 20.2% 65.1%');
      root.style.setProperty('--border', '217.2 32.6% 17.5%');
    }

    localStorage.setItem('brain_theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme toggle button
interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'dropdown';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const context = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);

  // Fallback if context is not available
  if (!context) {
    return (
      <button
        className={`p-2 rounded-lg hover:bg-gray-800 transition-colors ${className}`}
        title="Theme toggle"
      >
        <Moon className="w-5 h-5 text-muted-foreground" />
      </button>
    );
  }

  const { theme, resolvedTheme, setTheme } = context;

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={cycleTheme}
        className={`p-2 rounded-lg hover:bg-gray-800 transition-colors ${className}`}
        title={`Current theme: ${theme}`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-5 h-5 text-muted-foreground" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-500" />
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${className}`}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4 text-yellow-500" />
          )}
          <span className="text-sm capitalize">{theme}</span>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-36 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value as Theme);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors ${
                  theme === option.value ? 'bg-gray-800 text-primary' : 'text-foreground'
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Button variant
  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-800 rounded-lg ${className}`}>
      {[
        { value: 'light', icon: Sun },
        { value: 'dark', icon: Moon },
        { value: 'system', icon: Monitor },
      ].map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value as Theme)}
          className={`p-2 rounded-md transition-colors ${
            theme === option.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title={option.value}
        >
          <option.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

// Simplified toggle for settings page
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Appearance</label>
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: 'light', icon: Sun, label: 'Light' },
          { value: 'dark', icon: Moon, label: 'Dark' },
          { value: 'system', icon: Monitor, label: 'System' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value as Theme)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              theme === option.value
                ? 'border-primary bg-primary/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <option.icon className={`w-6 h-6 ${
              theme === option.value ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className={`text-sm ${
              theme === option.value ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
