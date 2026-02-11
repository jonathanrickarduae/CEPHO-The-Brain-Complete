import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun, description: 'Always use light mode' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, description: 'Always use dark mode' },
    { value: 'system' as const, label: 'System', icon: Monitor, description: 'Follow system preference' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Theme Preference</h3>
        <p className="text-sm text-muted-foreground mb-4">Choose how you want the app to look</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {themes.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              theme === value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <Icon className="w-6 h-6 mb-2 mx-auto" />
            <div className="font-medium text-sm">{label}</div>
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
            {theme === value && (
              <div className="mt-2 text-xs font-semibold text-primary">✓ Selected</div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-card rounded-lg border border-border">
        <h4 className="font-medium text-sm mb-2">Preview</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-background border border-border"></div>
            <span className="text-muted-foreground">Background</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-foreground"></div>
            <span className="text-muted-foreground">Text</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary"></div>
            <span className="text-muted-foreground">Primary</span>
          </div>
        </div>
      </div>
    </div>
  );
}
