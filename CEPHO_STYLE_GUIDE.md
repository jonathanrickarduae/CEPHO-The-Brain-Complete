# CEPHO Design System & Style Guide

**Version:** 1.0  
**Last Updated:** January 17, 2026  
**Platform:** The Brain (CEPHO.AI)

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Icons & Imagery](#icons--imagery)
7. [Motion & Animation](#motion--animation)
8. [Accessibility](#accessibility)
9. [Dark Theme Implementation](#dark-theme-implementation)

---

## Brand Identity

### Brand Name
**CEPHO** - From the Greek word for "brain" (κεφάλι/kephali). Where intelligence begins.

### Brand Personality
- **Professional** - Slick, sophisticated, enterprise-ready
- **Intelligent** - AI-powered, data-driven, insightful
- **Efficient** - Time-saving, productivity-focused
- **Trustworthy** - Secure, reliable, transparent

### Design Principles
1. **Clarity over complexity** - Every element serves a purpose
2. **Dark-first design** - Optimized for extended use and reduced eye strain
3. **Pink neon accents** - Distinctive brand color for CTAs and highlights
4. **No gamification** - Professional interface without childish elements
5. **Voice-first consideration** - Designed for hands-free interaction

---

## Color Palette

### Primary Colors (Dark Theme)

| Color Name | OKLCH Value | Hex Equivalent | Usage |
|------------|-------------|----------------|-------|
| Background | `oklch(0.08 0 0)` | #0d0d0d | Main background |
| Foreground | `oklch(0.98 0 0)` | #fafafa | Primary text |
| Card | `oklch(0.12 0 0)` | #1a1a1a | Card backgrounds |
| Card Foreground | `oklch(0.98 0 0)` | #fafafa | Card text |

### Accent Colors

| Color Name | OKLCH Value | Hex Equivalent | Usage |
|------------|-------------|----------------|-------|
| Primary (Pink) | `oklch(0.65 0.25 330)` | #e91e8c | Primary buttons, CTAs |
| Primary Hover | `oklch(0.55 0.25 330)` | #c4177a | Button hover states |
| Primary Foreground | `oklch(0.98 0 0)` | #fafafa | Text on primary |
| Accent | `oklch(0.25 0 0)` | #333333 | Subtle highlights |
| Accent Foreground | `oklch(0.98 0 0)` | #fafafa | Text on accent |

### Semantic Colors

| Color Name | OKLCH Value | Usage |
|------------|-------------|-------|
| Destructive | `oklch(0.55 0.22 25)` | Error states, delete actions |
| Warning (Amber) | `oklch(0.75 0.15 85)` | Warnings, urgent items |
| Success (Green) | `oklch(0.65 0.2 145)` | Success states, completed |
| Info (Blue) | `oklch(0.65 0.15 250)` | Informational messages |

### Text Colors

| Color Name | OKLCH Value | Usage |
|------------|-------------|-------|
| Foreground | `oklch(0.98 0 0)` | Primary text - white |
| Muted Foreground | `oklch(0.85 0 0)` | Secondary text - light gray |
| Placeholder | `oklch(0.70 0 0)` | Input placeholders |

### Border Colors

| Color Name | OKLCH Value | Usage |
|------------|-------------|-------|
| Border | `oklch(0.25 0 0)` | Default borders |
| Input Border | `oklch(0.25 0 0)` | Form input borders |
| Ring | `oklch(0.65 0.25 330)` | Focus rings (pink) |

---

## Typography

### Font Family
- **Primary:** Inter, system-ui, sans-serif
- **Monospace:** JetBrains Mono, monospace (for code)

### Font Sizes

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 0.75rem (12px) | 1rem | Captions, labels |
| sm | 0.875rem (14px) | 1.25rem | Secondary text |
| base | 1rem (16px) | 1.5rem | Body text |
| lg | 1.125rem (18px) | 1.75rem | Emphasized text |
| xl | 1.25rem (20px) | 1.75rem | Subheadings |
| 2xl | 1.5rem (24px) | 2rem | Section headings |
| 3xl | 1.875rem (30px) | 2.25rem | Page titles |
| 4xl | 2.25rem (36px) | 2.5rem | Hero text |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Normal | 400 | Body text |
| Medium | 500 | Emphasized text |
| Semibold | 600 | Subheadings |
| Bold | 700 | Headings, CTAs |

---

## Spacing & Layout

### Spacing Scale

| Name | Value | Usage |
|------|-------|-------|
| 0 | 0 | No spacing |
| 1 | 0.25rem (4px) | Tight spacing |
| 2 | 0.5rem (8px) | Small spacing |
| 3 | 0.75rem (12px) | Default gap |
| 4 | 1rem (16px) | Standard spacing |
| 5 | 1.25rem (20px) | Medium spacing |
| 6 | 1.5rem (24px) | Large spacing |
| 8 | 2rem (32px) | Section spacing |
| 10 | 2.5rem (40px) | Large sections |
| 12 | 3rem (48px) | Page sections |

### Border Radius

| Name | Value | Usage |
|------|-------|-------|
| sm | 0.25rem | Small elements |
| md | 0.375rem | Buttons, inputs |
| lg | 0.5rem | Cards |
| xl | 0.75rem | Large cards |
| 2xl | 1rem | Modals |
| full | 9999px | Circular elements |

### Shadows

| Name | Value | Usage |
|------|-------|-------|
| sm | `0 1px 2px rgba(0,0,0,0.3)` | Subtle elevation |
| md | `0 4px 6px rgba(0,0,0,0.4)` | Cards |
| lg | `0 10px 15px rgba(0,0,0,0.5)` | Modals, dropdowns |
| glow | `0 0 20px rgba(233,30,140,0.3)` | Pink glow effect |

---

## Components

### Buttons

#### Primary Button
- Background: Primary pink (`oklch(0.65 0.25 330)`)
- Text: White
- Hover: Darker pink (`oklch(0.55 0.25 330)`)
- Border radius: md (0.375rem)
- Padding: 0.5rem 1rem

#### Secondary Button
- Background: Transparent
- Border: 1px solid border color
- Text: Foreground
- Hover: Accent background

#### Ghost Button
- Background: Transparent
- Text: Muted foreground
- Hover: Accent background

### Cards

- Background: Card color (`oklch(0.12 0 0)`)
- Border: 1px solid border color
- Border radius: lg (0.5rem)
- Padding: 1.5rem
- Shadow: md on hover

### Inputs

- Background: Background color
- Border: 1px solid input border
- Border radius: md
- Padding: 0.5rem 0.75rem
- Focus: Pink ring (2px)
- Placeholder: Muted foreground

### Sidebar

- Background: Same as main background (`oklch(0.08 0 0)`)
- Width: 280px (desktop), full width (mobile)
- Border right: 1px solid border color
- Navigation items: Full width, rounded on hover

---

## Icons & Imagery

### Icon Style
- Use Lucide React icons
- Size: 16px (sm), 20px (md), 24px (lg)
- Color: Inherit from text color
- Stroke width: 2px

### Brain Logo
- Animated glowing brain visualization
- Cyan/teal glow effect
- Used in header and onboarding

### Avatar Style
- Circular with border
- Fallback: Initials on colored background
- Size: 32px (sm), 40px (md), 48px (lg)

---

## Motion & Animation

### Transition Durations

| Name | Duration | Usage |
|------|----------|-------|
| fast | 150ms | Hover states |
| normal | 200ms | Most transitions |
| slow | 300ms | Page transitions |

### Easing Functions
- Default: `ease-in-out`
- Enter: `ease-out`
- Exit: `ease-in`

### Animation Guidelines
- Respect `prefers-reduced-motion`
- Keep animations subtle and purposeful
- No distracting or playful animations
- Loading states: Pulse or shimmer

---

## Accessibility

### Color Contrast
- Text on background: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Clear visual distinction

### Focus States
- Visible focus ring on all interactive elements
- Ring color: Primary pink
- Ring width: 2px
- Ring offset: 2px

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Escape to close modals
- Arrow keys for navigation

### Screen Readers
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images
- ARIA labels for icons
- Live regions for dynamic content

---

## Dark Theme Implementation

### CSS Variables (index.css)

```css
:root {
  --background: oklch(0.08 0 0);
  --foreground: oklch(0.98 0 0);
  --card: oklch(0.12 0 0);
  --card-foreground: oklch(0.98 0 0);
  --popover: oklch(0.12 0 0);
  --popover-foreground: oklch(0.98 0 0);
  --primary: oklch(0.65 0.25 330);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.20 0 0);
  --secondary-foreground: oklch(0.98 0 0);
  --muted: oklch(0.20 0 0);
  --muted-foreground: oklch(0.85 0 0);
  --accent: oklch(0.25 0 0);
  --accent-foreground: oklch(0.98 0 0);
  --destructive: oklch(0.55 0.22 25);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(0.25 0 0);
  --input: oklch(0.25 0 0);
  --ring: oklch(0.65 0.25 330);
  --sidebar-background: oklch(0.08 0 0);
  --sidebar-foreground: oklch(0.98 0 0);
}
```

### Gray Text Overrides

All gray text classes are overridden for dark theme readability:

```css
.text-gray-300 { color: oklch(0.95 0 0) !important; }
.text-gray-400 { color: oklch(0.90 0 0) !important; }
.text-gray-500 { color: oklch(0.85 0 0) !important; }
```

---

## File Structure

```
client/src/
├── index.css              # Global styles & CSS variables
├── styles/
│   └── design-system.css  # Utility classes & overrides
├── components/
│   └── ui/                # shadcn/ui components
└── pages/                 # Page components
```

---

## Usage Guidelines

### Do's
- Use semantic color variables (e.g., `text-foreground`, `bg-card`)
- Maintain consistent spacing using the scale
- Use the pink accent sparingly for emphasis
- Ensure all text is readable on dark backgrounds
- Test with keyboard navigation

### Don'ts
- Don't use hardcoded gray colors (use CSS variables)
- Don't add gamification elements (streaks, badges, emojis)
- Don't use light backgrounds in the main UI
- Don't create animations that can't be disabled
- Don't use low-contrast text colors

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 17, 2026 | Initial style guide |

---

*This document is maintained as part of the CEPHO.AI platform. For updates, refer to the project repository.*
