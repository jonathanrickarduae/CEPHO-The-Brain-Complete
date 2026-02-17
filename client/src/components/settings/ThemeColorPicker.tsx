import React, { useState, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';

interface ColorOption {
  name: string;
  light: string;
  dark: string;
  label: string;
}

const COLOR_PRESETS: ColorOption[] = [
  {
    name: 'magenta',
    light: 'oklch(0.55 0.28 320)',
    dark: 'oklch(0.65 0.28 320)',
    label: 'Magenta',
  },
  {
    name: 'cyan',
    light: 'oklch(0.65 0.2 190)',
    dark: 'oklch(0.85 0.2 190)',
    label: 'Cyan',
  },
  {
    name: 'purple',
    light: 'oklch(0.5 0.25 290)',
    dark: 'oklch(0.6 0.25 290)',
    label: 'Purple',
  },
  {
    name: 'blue',
    light: 'oklch(0.55 0.2 260)',
    dark: 'oklch(0.65 0.2 260)',
    label: 'Blue',
  },
  {
    name: 'green',
    light: 'oklch(0.55 0.2 145)',
    dark: 'oklch(0.7 0.2 145)',
    label: 'Green',
  },
  {
    name: 'orange',
    light: 'oklch(0.6 0.2 40)',
    dark: 'oklch(0.7 0.2 40)',
    label: 'Orange',
  },
];

export function ThemeColorPicker() {
  const { isDark } = useTheme();
  const [selectedColor, setSelectedColor] = useState<string>('magenta');

  const applyColor = useCallback((color: ColorOption) => {
    const colorValue = isDark ? color.dark : color.light;
    document.documentElement.style.setProperty('--primary', colorValue);
    localStorage.setItem('cepho_primary_color', color.name);
    setSelectedColor(color.name);
  }, [isDark]);

  // Load saved color on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('cepho_primary_color');
    if (saved) {
      setSelectedColor(saved);
      const color = COLOR_PRESETS.find(c => c.name === saved);
      if (color) {
        applyColor(color);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Primary Color</h3>
        <p className="text-sm text-muted-foreground mb-4">Customize the primary accent color</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {COLOR_PRESETS.map((color) => {
          const colorValue = isDark ? color.dark : color.light;
          // Extract hex-like representation for display
          const isSelected = selectedColor === color.name;

          return (
            <button
              key={color.name}
              onClick={() => applyColor(color)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                isSelected ? 'border-foreground ring-2 ring-primary' : 'border-border'
              }`}
            >
              <div
                className="w-full h-12 rounded mb-2"
                style={{ backgroundColor: `oklch(${colorValue})` }}
              />
              <div className="text-sm font-medium">{color.label}</div>
              {isSelected && (
                <div className="text-xs text-primary font-semibold mt-1">✓ Active</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-card rounded-lg border border-border">
        <h4 className="font-medium text-sm mb-3">Custom Color</h4>
        <div className="flex gap-2">
          <input
            type="color"
            defaultValue="#FF00FF"
            onChange={(e) => {
              document.documentElement.style.setProperty('--primary', e.target.value);
              localStorage.setItem('cepho_primary_color', 'custom');
              setSelectedColor('custom');
            }}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            placeholder="Enter oklch() or hex color"
            onChange={(e) => {
              try {
                document.documentElement.style.setProperty('--primary', e.target.value);
                localStorage.setItem('cepho_primary_color', 'custom');
                setSelectedColor('custom');
              } catch (error) {
                console.error('Invalid color value:', error);
              }
            }}
            className="flex-1 px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Supports hex (#FF00FF), rgb(255, 0, 255), or oklch(0.65 0.28 320)
        </p>
      </div>

      <div className="mt-6 p-4 bg-card rounded-lg border border-border">
        <h4 className="font-medium text-sm mb-2">Preview</h4>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium">
            Primary Button
          </button>
          <button className="px-4 py-2 rounded border border-primary text-primary text-sm font-medium">
            Primary Outline
          </button>
        </div>
      </div>
    </div>
  );
}
