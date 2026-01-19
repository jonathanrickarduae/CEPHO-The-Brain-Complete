# Project Genesis Design Patterns

## Key Visual Elements

### Background
- Dark mode: `bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800`
- Creates depth without being flat black

### Action Cards (Primary)
- Gradient background: `bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10`
- Bold colored border: `border-2 border-cyan-500/50` (thicker border, more visible)
- Rounded corners: `rounded-2xl`
- Hover effect: `hover:border-cyan-500` (full color on hover)
- Icon container: `w-12 h-12 rounded-xl bg-cyan-500/20` with colored icon
- Icon animation: `group-hover:scale-110 transition-transform`
- Text: White title, gray-400 description

### Action Cards (Secondary)
- Gradient background: `bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10`
- Colored border: `border border-fuchsia-500/30`
- Hover: `hover:border-fuchsia-500/50`

### Action Cards (Tertiary)
- Background: `bg-white/5`
- Border: `border border-white/10`
- Hover: `hover:border-white/20`

### Sub-Blueprint Cards
- Smaller padding: `p-4`
- Gradient backgrounds with specific colors:
  - Pink/Purple: `from-pink-500/10 to-purple-500/10 border-pink-500/30`
  - Blue/Cyan: `from-blue-500/10 to-cyan-500/10 border-blue-500/30`
  - Emerald/Green: `from-emerald-500/10 to-green-500/10 border-emerald-500/30`
  - Amber/Orange: `from-amber-500/10 to-orange-500/10 border-amber-500/30`
- Rounded: `rounded-xl`

### Container Cards
- Background: `bg-white/5`
- Border: `border border-white/10`
- Rounded: `rounded-2xl`
- Padding: `p-6`

### List Items
- Background: `bg-white/5`
- Hover: `hover:bg-white/10`
- Rounded: `rounded-xl`
- Icon container: `w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20`

### Progress Bars
- Track: `bg-white/10 rounded-full`
- Fill: `bg-gradient-to-r from-cyan-500 to-fuchsia-500`

### Buttons
- Primary: `bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90`
- Secondary: `border-white/20 text-gray-300 hover:bg-white/5`

### Status Badges
- Approved: `bg-green-500/20 text-green-400 border-green-500/30`
- In Review: `bg-yellow-500/20 text-yellow-400 border-yellow-500/30`
- Needs Update: `bg-orange-500/20 text-orange-400 border-orange-500/30`
- Default: `bg-white/10 text-gray-400 border-white/20`

### Header
- Icon container: `w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500`
- Title: `text-2xl font-bold text-white`
- Subtitle: `text-gray-400`

## Color Palette
- Primary gradient: cyan-500 → fuchsia-500
- Accent colors: pink, blue, emerald, amber
- Background opacity: /5, /10, /20 for layering
- Border opacity: /10, /20, /30, /50 for hierarchy
- Text: white for headings, gray-400 for body, gray-500 for muted

## Light Mode Adaptations
For light mode, invert the approach:
- Background: Use light gradients or white
- Cards: Use subtle shadows instead of glows
- Text: Use gray-900 for headings, gray-600 for body
- Borders: Use gray-200/300 with colored accents
- Keep the gradient accents (cyan/fuchsia) for visual interest
