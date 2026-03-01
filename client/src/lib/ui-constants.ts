/**
 * CEPHO UI Constants
 *
 * Centralised style tokens for consistent button, badge, and status styles.
 * Import and use these instead of writing inline Tailwind strings.
 */

/** Primary CTA button — hot pink gradient */
export const BTN_PRIMARY =
  "bg-gradient-to-r from-primary to-pink-600 text-white hover:opacity-90 shadow-sm";

/** Secondary / outline button */
export const BTN_SECONDARY =
  "border border-border bg-transparent hover:bg-accent text-foreground";

/** Ghost button — no border */
export const BTN_GHOST =
  "bg-transparent hover:bg-accent text-foreground";

/** Destructive / danger button */
export const BTN_DANGER =
  "bg-destructive text-destructive-foreground hover:bg-destructive/90";

/** Success button */
export const BTN_SUCCESS =
  "bg-green-600 text-white hover:bg-green-700";

/** Icon-only button wrapper */
export const BTN_ICON =
  "p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground";

// ── Status badge colours ───────────────────────────────────────────────────

export const BADGE_ACTIVE   = "bg-green-500/15 text-green-400 border border-green-500/30";
export const BADGE_PENDING  = "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30";
export const BADGE_INACTIVE = "bg-muted text-muted-foreground border border-border";
export const BADGE_ERROR    = "bg-red-500/15 text-red-400 border border-red-500/30";
export const BADGE_INFO     = "bg-blue-500/15 text-blue-400 border border-blue-500/30";
export const BADGE_PRIMARY  = "bg-primary/15 text-primary border border-primary/30";

// ── Card styles ────────────────────────────────────────────────────────────

/** Standard card */
export const CARD_BASE =
  "rounded-xl border border-border bg-card shadow-sm";

/** Highlighted / featured card */
export const CARD_FEATURED =
  "rounded-xl border border-primary/30 bg-primary/5 shadow-sm";

/** Danger / alert card */
export const CARD_DANGER =
  "rounded-xl border border-destructive/30 bg-destructive/5 shadow-sm";

// ── Icon accent backgrounds ────────────────────────────────────────────────

export const ICON_PINK   = "bg-pink-500/15 text-pink-400";
export const ICON_CYAN   = "bg-cyan-500/15 text-cyan-400";
export const ICON_PURPLE = "bg-purple-500/15 text-purple-400";
export const ICON_GREEN  = "bg-green-500/15 text-green-400";
export const ICON_ORANGE = "bg-orange-500/15 text-orange-400";
export const ICON_BLUE   = "bg-blue-500/15 text-blue-400";
export const ICON_YELLOW = "bg-yellow-500/15 text-yellow-400";

// ── Spacing ────────────────────────────────────────────────────────────────

/** Standard page content spacing */
export const PAGE_CONTENT_CLASS = "space-y-4 sm:space-y-6";

/** Standard section gap */
export const SECTION_GAP = "space-y-3";
