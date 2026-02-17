/**
 * CEPHO Design System
 * 
 * Centralized design tokens and utilities for consistent UI across the platform.
 * 
 * Design Language:
 * - Primary: CEPHO Pink (#E91E8C)
 * - Background: Near black (#0D0D0D)
 * - Text: White (#FFFFFF) with muted variants
 * - Accents: Pink gradients and glows
 */

// =============================================================================
// COLOR TOKENS
// =============================================================================

export const COLORS = {
  // Brand Colors
  primary: "#E91E8C",
  primaryLight: "#F472B6",
  primaryDark: "#BE185D",
  
  // Background Colors
  background: "#0D0D0D",
  backgroundLight: "#1A1A1A",
  backgroundCard: "#111111",
  backgroundHover: "#1F1F1F",
  
  // Text Colors
  text: "#FFFFFF",
  textMuted: "#A1A1AA",
  textDim: "#71717A",
  
  // Border Colors
  border: "#27272A",
  borderLight: "#3F3F46",
  borderAccent: "rgba(233, 30, 140, 0.3)",
  
  // Status Colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  
  // Gradient Definitions
  gradients: {
    primary: "linear-gradient(135deg, #E91E8C 0%, #BE185D 100%)",
    card: "linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%)",
    glow: "radial-gradient(circle at center, rgba(233, 30, 140, 0.15) 0%, transparent 70%)",
    header: "linear-gradient(135deg, #E91E8C 0%, #7C3AED 100%)"
  }
} as const;

// =============================================================================
// SPACING TOKENS
// =============================================================================

export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px"
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const TYPOGRAPHY = {
  fontFamily: {
    primary: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace"
  },
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem"  // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const RADIUS = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "9999px"
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const SHADOWS = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
  glow: "0 0 20px rgba(233, 30, 140, 0.3)",
  glowStrong: "0 0 40px rgba(233, 30, 140, 0.5)"
} as const;

// =============================================================================
// ANIMATION
// =============================================================================

export const ANIMATION = {
  duration: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms"
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
  }
} as const;

// =============================================================================
// COMPONENT STYLES
// =============================================================================

export const COMPONENT_STYLES = {
  // Card styles
  card: {
    default: "bg-gray-900/50 border border-gray-800 rounded-xl",
    hover: "hover:border-[#E91E8C]/30 transition-all duration-300",
    active: "border-[#E91E8C]/50 shadow-[0_0_20px_rgba(233,30,140,0.2)]"
  },
  
  // Button styles
  button: {
    primary: "bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white",
    secondary: "bg-gray-800 hover:bg-gray-700 text-white",
    outline: "border border-gray-700 hover:border-[#E91E8C]/50 text-white",
    ghost: "hover:bg-gray-800 text-white"
  },
  
  // Input styles
  input: {
    default: "bg-gray-900 border border-gray-800 text-white placeholder:text-gray-500 focus:border-[#E91E8C]/50 focus:ring-1 focus:ring-[#E91E8C]/30"
  },
  
  // Badge styles
  badge: {
    default: "bg-gray-800 text-gray-300 border border-gray-700",
    primary: "bg-[#E91E8C]/20 text-[#E91E8C] border border-[#E91E8C]/30",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    error: "bg-red-500/20 text-red-400 border border-red-500/30"
  },
  
  // Section styles
  section: {
    header: "flex items-center gap-3 mb-6",
    title: "text-xl font-bold text-white",
    subtitle: "text-sm text-muted-foreground"
  }
} as const;

// =============================================================================
// ICON WRAPPER STYLES
// =============================================================================

export const ICON_WRAPPER = {
  sm: "p-1.5 rounded-lg",
  md: "p-2 rounded-xl",
  lg: "p-3 rounded-2xl",
  gradient: "bg-gradient-to-br from-[#E91E8C]/20 to-purple-500/20 border border-[#E91E8C]/30"
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get status color based on score
 */
export function getStatusColor(score: number): string {
  if (score >= 90) return COLORS.success;
  if (score >= 75) return COLORS.info;
  if (score >= 60) return COLORS.warning;
  return COLORS.error;
}

/**
 * Get status badge class based on status
 */
export function getStatusBadgeClass(status: "excellent" | "good" | "adequate" | "needs_work" | "critical"): string {
  switch (status) {
    case "excellent": return COMPONENT_STYLES.badge.success;
    case "good": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "adequate": return COMPONENT_STYLES.badge.warning;
    case "needs_work": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "critical": return COMPONENT_STYLES.badge.error;
    default: return COMPONENT_STYLES.badge.default;
  }
}

/**
 * Get score status label
 */
export function getScoreStatus(score: number): "excellent" | "good" | "adequate" | "needs_work" | "critical" {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "adequate";
  if (score >= 40) return "needs_work";
  return "critical";
}

/**
 * Format change value with color
 */
export function formatChange(change: number): { text: string; color: string } {
  if (change > 0) return { text: `+${change}`, color: COLORS.success };
  if (change < 0) return { text: `${change}`, color: COLORS.error };
  return { text: "0", color: COLORS.textMuted };
}

// =============================================================================
// CEPHO LOGO SVG
// =============================================================================

export const CEPHO_LOGO_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E91E8C"/>
      <stop offset="100%" style="stop-color:#BE185D"/>
    </linearGradient>
  </defs>
  <path fill="url(#brainGradient)" d="M50 10c-22 0-40 18-40 40s18 40 40 40 40-18 40-40-18-40-40-40zm0 8c17.7 0 32 14.3 32 32 0 17.7-14.3 32-32 32-17.7 0-32-14.3-32-32 0-17.7 14.3-32 32-32zm-8 16c-6.6 0-12 5.4-12 12s5.4 12 12 12c2.2 0 4.2-.6 6-1.6v9.6h4v-9.6c1.8 1 3.8 1.6 6 1.6 6.6 0 12-5.4 12-12s-5.4-12-12-12c-2.2 0-4.2.6-6 1.6v-9.6h-4v9.6c-1.8-1-3.8-1.6-6-1.6zm0 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm16 0c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8z"/>
</svg>`;

export default {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  SHADOWS,
  ANIMATION,
  COMPONENT_STYLES,
  ICON_WRAPPER,
  getStatusColor,
  getStatusBadgeClass,
  getScoreStatus,
  formatChange,
  CEPHO_LOGO_SVG
};
