import { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Shield, Bug, ArrowRight, Bell, ExternalLink } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights?: string[];
  features?: { title: string; description: string; icon?: string }[];
  improvements?: string[];
  fixes?: string[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.5.0',
    date: 'January 11, 2026',
    title: 'UX Enhancement Update',
    highlights: [
      'Cambridge University partnership announced',
      '12 new UX enhancements for better experience',
    ],
    features: [
      {
        title: 'Contextual Tooltips',
        description: 'First-time user guidance with helpful tooltips throughout the app',
        icon: '💡',
      },
      {
        title: 'Progress Indicators',
        description: 'Track your Chief of Staff training progress with visual indicators',
        icon: '📊',
      },
      {
        title: 'Quick-Switch Conversations',
        description: 'Easily switch between recent conversations with the new dropdown',
        icon: '💬',
      },
      {
        title: 'Page Transitions',
        description: 'Smooth animations when navigating between pages',
        icon: '✨',
      },
      {
        title: 'Status Pulses',
        description: 'Real-time status indicators on sidebar icons',
        icon: '🔔',
      },
      {
        title: 'Dark/Light Mode',
        description: 'Choose your preferred theme with the new toggle',
        icon: '🌙',
      },
    ],
    improvements: [
      'Swipe gestures for mobile approve/reject actions',
      'Pull-to-refresh on Dashboard and Review Queue',
      'Collapsible sections on Statistics and Settings',
      'Daily streak counter on Dashboard',
      'Celebration animations for achievements',
    ],
    fixes: [
      'Fixed mood check timing edge cases',
      'Improved voice input reliability',
      'Better error handling for API calls',
    ],
  },
  {
    version: '2.4.0',
    date: 'January 10, 2026',
    title: 'Security & Governance Update',
    highlights: [
      '2FA email verification for Vault access',
      'Omni/Governed mode for enterprise compliance',
    ],
    features: [
      {
        title: 'Vault Security Gate',
        description: 'Two-factor authentication protects your sensitive data',
        icon: '🔐',
      },
      {
        title: 'Governance Mode',
        description: 'Enterprise compliance with feature restrictions',
        icon: '🏢',
      },
    ],
    improvements: [
      'Enhanced audit logging',
      'Better mobile responsiveness',
      'Improved Chief of Staff streaming',
    ],
  },
  {
    version: '2.3.0',
    date: 'January 9, 2026',
    title: 'Commercialization Intelligence',
    highlights: [
      'Competitive analysis dashboard',
      'Go Live Wizard for launch preparation',
    ],
    features: [
      {
        title: 'Competitive Position Tracking',
        description: 'Monitor your market position against competitors',
        icon: '📈',
      },
      {
        title: 'Go Live Wizard',
        description: 'Step-by-step guide to prepare for launch',
        icon: '🚀',
      },
    ],
  },
];

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const [selectedVersion, setSelectedVersion] = useState(changelog[0].version);

  if (!isOpen) return null;

  const currentEntry = changelog.find(e => e.version === selectedVersion) || changelog[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">What's New</h2>
              <p className="text-sm text-muted-foreground">Latest updates and improvements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-700 overflow-x-auto">
          {changelog.map((entry) => (
            <button
              key={entry.version}
              onClick={() => setSelectedVersion(entry.version)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedVersion === entry.version
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-800 text-muted-foreground hover:text-foreground'
              }`}
            >
              v{entry.version}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Version header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{currentEntry.date}</span>
              <span>•</span>
              <span>Version {currentEntry.version}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{currentEntry.title}</h3>
          </div>

          {/* Highlights */}
          {currentEntry.highlights && (
            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20">
              <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Highlights
              </h4>
              <ul className="space-y-2">
                {currentEntry.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground">
                    <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          {currentEntry.features && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                New Features
              </h4>
              <div className="grid gap-3">
                {currentEntry.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg"
                  >
                    <span className="text-2xl">{feature.icon || '✨'}</span>
                    <div>
                      <h5 className="font-medium text-foreground">{feature.title}</h5>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {currentEntry.improvements && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Improvements
              </h4>
              <ul className="space-y-2">
                {currentEntry.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-green-400">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bug fixes */}
          {currentEntry.fixes && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Bug className="w-4 h-4 text-orange-400" />
                Bug Fixes
              </h4>
              <ul className="space-y-2">
                {currentEntry.fixes.map((fix, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-orange-400">•</span>
                    {fix}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800/50">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-4 h-4" />
            Get notified of updates
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing changelog visibility
export function useChangelog() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('brain_last_seen_changelog');
    const currentVersion = changelog[0].version;

    if (lastSeenVersion !== currentVersion) {
      setHasNewUpdates(true);
      // Auto-show for new users or after updates
      const hasSeenOnboarding = localStorage.getItem('brain_onboarding_complete');
      if (hasSeenOnboarding && !lastSeenVersion) {
        // Don't auto-show for first-time users
      } else if (lastSeenVersion && lastSeenVersion !== currentVersion) {
        // Auto-show after update
        setTimeout(() => setIsOpen(true), 1000);
      }
    }
  }, []);

  const open = () => {
    setIsOpen(true);
    setHasNewUpdates(false);
    localStorage.setItem('brain_last_seen_changelog', changelog[0].version);
  };

  const close = () => {
    setIsOpen(false);
    localStorage.setItem('brain_last_seen_changelog', changelog[0].version);
  };

  return { isOpen, hasNewUpdates, open, close };
}

// What's New button for header/sidebar
interface WhatsNewButtonProps {
  hasUpdates?: boolean;
  onClick: () => void;
}

export function WhatsNewButton({ hasUpdates, onClick }: WhatsNewButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-gray-800 rounded-lg transition-colors"
    >
      <Sparkles className="w-4 h-4" />
      <span>What's New</span>
      {hasUpdates && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
      )}
    </button>
  );
}
