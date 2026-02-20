# CEPHO.AI Design System

Based on Project Genesis - The Gold Standard

## Color Palette

### Background Colors
- **Primary Background**: `bg-gray-900` - Main page background
- **Card Background**: `bg-gray-800` - Card and container background
- **Elevated Background**: `bg-gray-750` - Slightly elevated elements
- **Border Color**: `border-gray-700` - Standard borders

### Brand Colors
- **Primary (Purple)**: `bg-purple-600`, `text-purple-500`, `border-purple-700`
- **Secondary (Indigo)**: `bg-indigo-600`, `text-indigo-500`
- **Accent (Blue)**: `bg-blue-600`, `text-blue-500`

### Status Colors
- **Success (Green)**: `bg-green-600`, `text-green-500`, `bg-green-500/20`
- **Warning (Yellow)**: `bg-yellow-600`, `text-yellow-500`, `bg-yellow-500/20`
- **Error (Red)**: `bg-red-600`, `text-red-500`, `bg-red-500/20`
- **Info (Blue)**: `bg-blue-600`, `text-blue-500`, `bg-blue-500/20`

### Text Colors
- **Primary Text**: `text-white` - Headings and important text
- **Secondary Text**: `text-gray-300` - Body text
- **Muted Text**: `text-gray-400` - Less important text
- **Disabled Text**: `text-gray-500` - Disabled or placeholder text

## Typography

### Headings
- **H1**: `text-3xl font-bold text-white` - Page titles
- **H2**: `text-2xl font-bold text-white` - Section titles
- **H3**: `text-xl font-semibold text-white` - Subsection titles
- **H4**: `text-lg font-semibold text-white` - Card titles

### Body Text
- **Large**: `text-base text-gray-300` - Standard body text
- **Medium**: `text-sm text-gray-400` - Secondary information
- **Small**: `text-xs text-gray-500` - Captions and labels

## Components

### Cards
```tsx
<Card className="bg-gray-800 border-gray-700">
  <CardHeader>
    <CardTitle className="text-white">Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Gradient Cards (Featured)
```tsx
<Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
  {/* Content */}
</Card>
```

### Buttons

#### Primary Button
```tsx
<Button className="bg-purple-600 hover:bg-purple-700">
  Primary Action
</Button>
```

#### Secondary Button
```tsx
<Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">
  Secondary Action
</Button>
```

#### Destructive Button
```tsx
<Button variant="destructive">
  Delete
</Button>
```

### Badges

#### Status Badges
```tsx
<Badge className="bg-green-600">Active</Badge>
<Badge className="bg-yellow-600">Pending</Badge>
<Badge className="bg-red-600">Error</Badge>
<Badge className="bg-blue-600">Info</Badge>
```

#### Transparent Badges (with background)
```tsx
<Badge className="bg-green-500/20 text-green-300">Success</Badge>
<Badge className="bg-yellow-500/20 text-yellow-300">Warning</Badge>
```

### Icons
- **Size**: Use `h-4 w-4` for inline icons, `h-5 w-5` for section headers, `h-8 w-8` for large icons
- **Color**: Match text color or use brand colors for emphasis
- **Spacing**: Use `gap-2` or `gap-3` between icon and text

## Layout Patterns

### Page Header
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
      <Icon className="h-8 w-8 text-purple-500" />
      Page Title
    </h1>
    <p className="text-gray-400 mt-1">
      Page description
    </p>
  </div>
  <Button variant="outline" className="border-gray-700">
    Action
  </Button>
</div>
```

### Stats Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <Card className="bg-gray-800 border-gray-700">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-8 w-8 text-blue-500" />
        <div>
          <p className="text-2xl font-bold text-white">42</p>
          <p className="text-sm text-gray-400">Label</p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

### Content Section
```tsx
<Card className="bg-gray-800 border-gray-700">
  <CardHeader>
    <CardTitle className="text-white flex items-center gap-2">
      <Icon className="h-5 w-5 text-purple-500" />
      Section Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
</Card>
```

## Spacing

### Container Spacing
- **Page Padding**: `p-6` or `p-8`
- **Section Spacing**: `space-y-6` between major sections
- **Card Spacing**: `space-y-4` within cards
- **Element Spacing**: `gap-2`, `gap-3`, or `gap-4` for flex/grid

### Responsive Spacing
- Use `md:` prefix for medium screens and up
- Use `lg:` prefix for large screens and up

## Animations

### Loading States
```tsx
<RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
```

### Transitions
- Use `transition-all` for smooth state changes
- Use `hover:` prefix for hover effects
- Keep animations subtle and purposeful

## Accessibility

### Focus States
- All interactive elements should have visible focus states
- Use `focus:ring-2 focus:ring-purple-500` for custom focus rings

### Color Contrast
- Ensure text has sufficient contrast against backgrounds
- Use white text on dark backgrounds
- Use dark text on light backgrounds

### Semantic HTML
- Use proper heading hierarchy (h1 -> h2 -> h3)
- Use semantic elements (nav, main, article, section)
- Use aria labels for icon-only buttons

## Best Practices

1. **Consistency**: Always use the design system components and patterns
2. **Hierarchy**: Use size, color, and spacing to create visual hierarchy
3. **Feedback**: Provide visual feedback for user actions (loading states, success/error messages)
4. **Responsiveness**: Design mobile-first, enhance for larger screens
5. **Performance**: Minimize animations, optimize images, lazy load components
6. **Accessibility**: Follow WCAG guidelines, test with screen readers

## Examples from Project Genesis

### Dashboard Layout
- Clean grid layout with stats cards
- Gradient featured cards for important sections
- Consistent spacing and alignment
- Clear visual hierarchy

### Forms
- Clear labels with proper spacing
- Validation feedback inline
- Submit buttons prominently placed
- Cancel/secondary actions less prominent

### Lists
- Consistent item height and spacing
- Hover states for interactive items
- Status indicators clearly visible
- Actions aligned to the right

## Migration Checklist

When updating a page to match the design system:

- [ ] Update background colors (bg-gray-900, bg-gray-800)
- [ ] Update text colors (text-white, text-gray-300, text-gray-400)
- [ ] Update border colors (border-gray-700)
- [ ] Update button styles (bg-purple-600, variant="outline")
- [ ] Update badge styles (consistent colors and backgrounds)
- [ ] Update card styles (bg-gray-800 border-gray-700)
- [ ] Update spacing (space-y-6, gap-4, p-6)
- [ ] Update typography (text-3xl font-bold, etc.)
- [ ] Add icons where appropriate
- [ ] Test responsive layout
- [ ] Test accessibility (keyboard navigation, screen reader)
