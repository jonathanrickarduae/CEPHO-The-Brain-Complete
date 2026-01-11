import { useState } from 'react';
import { 
  Accessibility, Eye, Volume2, Type, Sun, Moon, 
  Contrast, Zap, RotateCcw, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useAccessibilityPreferences } from '@/hooks/useAccessibility';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const {
    reducedMotion,
    highContrast,
    fontSize,
    screenReaderMode,
    setReducedMotion,
    setHighContrast,
    setFontSize,
    setScreenReaderMode,
    resetToDefaults,
  } = useAccessibilityPreferences();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-white/10 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Accessibility className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Accessibility</h2>
                <p className="text-xs text-muted-foreground">Customize your experience</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Motion Section */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Motion & Animation
            </h3>
            
            <div className="space-y-4">
              <SettingRow
                icon={Zap}
                title="Reduce Motion"
                description="Minimize animations and transitions"
                checked={reducedMotion}
                onChange={setReducedMotion}
              />
            </div>
          </section>

          {/* Visual Section */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Visual
            </h3>
            
            <div className="space-y-4">
              <SettingRow
                icon={Contrast}
                title="High Contrast"
                description="Increase contrast for better visibility"
                checked={highContrast}
                onChange={setHighContrast}
              />

              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <Type className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Font Size</p>
                    <p className="text-xs text-muted-foreground">Adjust text size</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {(['normal', 'large', 'larger'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                        fontSize === size
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                      )}
                    >
                      {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Screen Reader Section */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Screen Reader
            </h3>
            
            <div className="space-y-4">
              <SettingRow
                icon={Volume2}
                title="Screen Reader Mode"
                description="Optimize for screen reader navigation"
                checked={screenReaderMode}
                onChange={setScreenReaderMode}
              />
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Keyboard Navigation
            </h3>
            
            <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-3">
              <ShortcutRow keys={['Tab']} description="Navigate between elements" />
              <ShortcutRow keys={['Shift', 'Tab']} description="Navigate backwards" />
              <ShortcutRow keys={['Enter']} description="Activate focused element" />
              <ShortcutRow keys={['Esc']} description="Close dialogs and menus" />
              <ShortcutRow keys={['?']} description="Show all keyboard shortcuts" />
            </div>
          </section>

          {/* Reset */}
          <div className="pt-4 border-t border-white/10">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={resetToDefaults}
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Setting row component
interface SettingRowProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingRow({ icon: Icon, title, description, checked, onChange }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// Keyboard shortcut display
interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="px-2 py-1 text-xs bg-secondary rounded border border-white/10 font-mono">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="text-muted-foreground mx-1">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

// Skip link component
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
    >
      Skip to main content
    </a>
  );
}

// Focus indicator component
export function FocusIndicator({ children }: { children: React.ReactNode }) {
  return (
    <div className="focus-ring rounded-lg">
      {children}
    </div>
  );
}
