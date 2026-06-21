import { 
  Accessibility, Eye, Volume2, Type, 
  Contrast, Zap, RotateCcw
} from 'lucide-react';
import { useAccessibilityPreferences } from '@/hooks/useAccessibility';

export function AccessibilitySettingsPanel() {
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

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-cyan-400" />
          Accessibility Settings
        </h3>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-foreground/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Reduced Motion */}
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="font-medium text-white">Reduced Motion</div>
              <div className="text-sm text-foreground/60">Minimize animations and transitions</div>
            </div>
          </div>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`w-12 h-6 rounded-full transition-colors ${
              reducedMotion ? 'bg-cyan-500' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Contrast className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="font-medium text-white">High Contrast</div>
              <div className="text-sm text-foreground/60">Increase color contrast for better visibility</div>
            </div>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-12 h-6 rounded-full transition-colors ${
              highContrast ? 'bg-cyan-500' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                highContrast ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Screen Reader Mode */}
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-white">Screen Reader Mode</div>
              <div className="text-sm text-foreground/60">Optimize for screen reader compatibility</div>
            </div>
          </div>
          <button
            onClick={() => setScreenReaderMode(!screenReaderMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              screenReaderMode ? 'bg-cyan-500' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                screenReaderMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Font Size */}
        <div className="p-4 bg-gray-900 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Type className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="font-medium text-white">Font Size</div>
              <div className="text-sm text-foreground/60">Adjust text size throughout the app</div>
            </div>
          </div>
          <div className="flex gap-2">
            {(['normal', 'large', 'larger'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  fontSize === size
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-foreground/70 hover:bg-gray-700'
                }`}
              >
                {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Larger'}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-gray-900 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <div className="font-medium text-white">Preview</div>
              <div className="text-sm text-foreground/60">See how your settings affect the interface</div>
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${
            highContrast ? 'bg-black border-white' : 'bg-gray-800 border-gray-700'
          }`}>
            <p className={`${
              highContrast ? 'text-white' : 'text-foreground/80'
            } ${
              fontSize === 'normal' ? 'text-base' :
              fontSize === 'large' ? 'text-lg' : 'text-xl'
            }`}>
              This is a preview of how text will appear with your current accessibility settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
