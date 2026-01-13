# Cepho UI/UX Review Checklist for SME Team

This checklist covers all critical UI/UX elements across the Cepho application. Please review each section and provide feedback on consistency, clarity, and user experience.

---

## 1. BRANDING & VISUAL IDENTITY

### Logo & Typography
- [ ] Cepho logo appears correctly on all pages (landing, login, sidebar)
- [ ] "CEPHO" text uses consistent pink color (#EC4899 or primary color)
- [ ] Tagline "From the Greek for brain. Where intelligence begins." is visible on intro screen
- [ ] Font hierarchy is consistent (headings, subheadings, body text)
- [ ] Font sizes are readable on mobile and desktop

### Color Scheme
- [ ] Primary color (pink/fuchsia) is used consistently for CTAs and accents
- [ ] Background colors follow Manus design language (dark theme by default)
- [ ] Text contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] Semantic colors used: primary, secondary, muted-foreground, card, border
- [ ] No hard-coded color values (all use Tailwind semantic tokens)

### Dark Mode
- [ ] All text is visible on dark backgrounds
- [ ] No white text on light backgrounds causing contrast issues
- [ ] Cards and containers have proper border/background separation
- [ ] Icons are visible and properly colored
- [ ] Hover states are clearly visible

---

## 2. NAVIGATION & LAYOUT

### Sidebar Navigation
- [ ] All menu items are visible and properly labeled
- [ ] Icons are consistent and recognizable
- [ ] Active state is clearly indicated
- [ ] Hover states provide visual feedback
- [ ] Mobile menu collapses properly
- [ ] Menu items: The Nexus, The Signal, AI-SMEs, Chief of Staff, Project Genesis, Library, Workflow, The Vault, Evening Review

### Header & Top Navigation
- [ ] Logo/branding is visible in header
- [ ] User profile/settings accessible
- [ ] Search functionality (if present) is intuitive
- [ ] Mobile hamburger menu works correctly

### Page Layout
- [ ] Content is properly centered and has appropriate max-width
- [ ] Padding and margins are consistent across pages
- [ ] Responsive design works on mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- [ ] No horizontal scrolling on mobile
- [ ] Touch targets are at least 44x44px on mobile

---

## 3. CORE PAGES

### Landing Page / Intro Screen
- [ ] Cepho branding is prominent
- [ ] Tagline and brand story are clearly visible
- [ ] Animated brain visualization works smoothly
- [ ] "Next" button is visible and clickable
- [ ] Onboarding flow is clear (6 steps)
- [ ] Mobile layout is readable

### Dashboard (The Nexus)
- [ ] "Message Chief of Staff" input field is visible
- [ ] Voice Capture label and mic icon are present
- [ ] Favorite Contacts section displays correctly
- [ ] 6 command boxes are properly laid out
- [ ] Mood indicator (number + circle) is visible
- [ ] All buttons are clickable and functional
- [ ] No overlapping elements

### Chief of Staff Role Page
- [ ] Header uses Manus design language (clean, professional)
- [ ] Maturity level card displays all 5 levels
- [ ] Training progress bar is visible
- [ ] Tabs (Responsibilities, Boundaries, Communication) work correctly
- [ ] Responsibility items show autonomy levels (Ask, Inform, Autonomous)
- [ ] Boundaries are clearly labeled with icons
- [ ] Save button is prominent and functional

### The Signal (Daily Brief)
- [ ] Tab navigation works (Overview, Schedule, Intelligence, Action Engine)
- [ ] Content is organized and readable
- [ ] Action buttons are clearly visible
- [ ] Clickable items trigger appropriate navigation
- [ ] Export options (PDF, Video, Podcast) are accessible

### AI-SMEs (Expert Directory)
- [ ] Expert grid displays properly (responsive columns)
- [ ] Expert cards show avatar, name, role, and bio
- [ ] Search/filter functionality works
- [ ] Tab toggle between "AI Experts" and "Corporate Partners" works
- [ ] Chat button navigates to conversation
- [ ] Star/favorite button works
- [ ] Celebrity avatars (Jay-Z, Ryan Reynolds, Jessica Alba) display correctly

### Central Hub
- [ ] Integration cards are displayed with proper icons
- [ ] Gmail, Outlook, Google Drive, OneDrive, Dropbox, WhatsApp, Notta, Grammarly are listed
- [ ] Connection status is visible (0/10 connected)
- [ ] Each integration has a clear CTA button

### Project Genesis
- [ ] Wizard flow is intuitive
- [ ] Form inputs are properly labeled
- [ ] Dropdown/select fields work correctly
- [ ] Progress indicator shows current step
- [ ] "Next" and "Back" buttons are functional

### Library
- [ ] Project folders are displayed as cards
- [ ] Folder names are clear and descriptive
- [ ] Grid/list view toggle works
- [ ] Colored badges for project types are consistent
- [ ] Clicking a project opens its details

### Workflow
- [ ] Project cards display status (blocked, at-risk, on-track)
- [ ] Progress bars are visible and accurate
- [ ] Task counts are displayed
- [ ] Grid/list view toggle works
- [ ] Colored badges match Library design

### The Vault
- [ ] Integration health dashboard is visible
- [ ] Connection status for each integration is shown
- [ ] Security indicators are present
- [ ] Content is properly laid out and readable

---

## 4. COMPONENTS & INTERACTIONS

### Buttons
- [ ] Primary buttons use consistent styling
- [ ] Secondary buttons are visually distinct
- [ ] Hover states provide feedback
- [ ] Disabled states are clearly indicated
- [ ] Button text is clear and action-oriented
- [ ] Button sizes are appropriate for their context

### Forms & Inputs
- [ ] Input fields have clear labels
- [ ] Placeholder text is helpful
- [ ] Focus states are visible (focus ring)
- [ ] Error states are clearly indicated with red text
- [ ] Success states show confirmation
- [ ] Text input fields are properly sized
- [ ] Textarea fields expand as needed

### Modals & Dialogs
- [ ] Modal overlays are semi-transparent
- [ ] Close button (X) is visible and functional
- [ ] Modal content is readable and centered
- [ ] Buttons inside modals are clearly labeled
- [ ] Escape key closes modals (if applicable)

### Tabs
- [ ] Active tab is clearly highlighted
- [ ] Tab content switches smoothly
- [ ] Tab labels are clear and descriptive
- [ ] Tabs are keyboard accessible

### Cards
- [ ] Card borders are visible and consistent
- [ ] Card backgrounds are distinct from page background
- [ ] Hover states provide feedback
- [ ] Content inside cards is properly spaced
- [ ] Cards are responsive on mobile

### Badges & Labels
- [ ] Badge colors match their meaning (success, warning, error, info)
- [ ] Text inside badges is readable
- [ ] Badges are appropriately sized

---

## 5. TYPOGRAPHY & READABILITY

### Headings
- [ ] H1 (page titles) are prominent and readable
- [ ] H2 (section titles) are visually distinct
- [ ] H3 (subsection titles) are properly sized
- [ ] Heading hierarchy is logical and consistent

### Body Text
- [ ] Default text size is readable (16px or larger on mobile)
- [ ] Line height provides comfortable reading (1.5-1.75)
- [ ] Line length is not too long (max 75-80 characters)
- [ ] Text color has sufficient contrast with background

### Links
- [ ] Links are visually distinct from regular text
- [ ] Link color is consistent (typically primary color)
- [ ] Hover states show underline or color change
- [ ] Visited links (if applicable) are visually different

---

## 6. ICONS & IMAGERY

### Icons
- [ ] All icons are from Lucide React library (consistent style)
- [ ] Icon sizes are appropriate for their context
- [ ] Icon colors match their semantic meaning
- [ ] Icons are properly aligned with text
- [ ] Icons have proper spacing around them

### Images & Avatars
- [ ] Avatar images display correctly (circular, proper size)
- [ ] Placeholder avatars appear when images are missing
- [ ] Images are properly sized (no distortion)
- [ ] Images load quickly (optimized)

---

## 7. RESPONSIVE DESIGN

### Mobile (< 768px)
- [ ] Layout stacks vertically
- [ ] Touch targets are at least 44x44px
- [ ] Sidebar collapses to hamburger menu
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling
- [ ] Forms are easy to fill on mobile

### Tablet (768-1024px)
- [ ] Layout adapts appropriately
- [ ] Sidebar may be visible or collapsible
- [ ] Content is properly centered
- [ ] Touch targets are appropriately sized

### Desktop (> 1024px)
- [ ] Sidebar is visible by default
- [ ] Content has appropriate max-width
- [ ] Multi-column layouts work
- [ ] Hover states are functional

---

## 8. ACCESSIBILITY

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus states are clearly visible
- [ ] Modals trap focus appropriately
- [ ] Escape key closes modals

### Screen Reader Support
- [ ] Headings are properly marked up (H1, H2, H3)
- [ ] Images have alt text
- [ ] Form labels are associated with inputs
- [ ] Buttons have descriptive text
- [ ] ARIA labels are used where appropriate

### Color Contrast
- [ ] Normal text has 4.5:1 contrast ratio
- [ ] Large text (18pt+) has 3:1 contrast ratio
- [ ] UI components have 3:1 contrast ratio
- [ ] Color is not the only way to convey information

---

## 9. PERFORMANCE & LOADING

### Page Load
- [ ] Pages load quickly (< 3 seconds)
- [ ] Loading states are shown for async operations
- [ ] Skeleton loaders appear while content loads
- [ ] No blank screens or flash of unstyled content

### Interactions
- [ ] Buttons respond immediately to clicks
- [ ] Form submissions provide feedback
- [ ] Animations are smooth (60fps)
- [ ] No janky scrolling or layout shifts

---

## 10. CONSISTENCY ACROSS PAGES

### Design Language
- [ ] All pages use the same color palette
- [ ] Typography is consistent across pages
- [ ] Spacing and padding follow a consistent grid
- [ ] Border styles are consistent
- [ ] Component styling is uniform

### Navigation
- [ ] Sidebar appears on all pages (except login/landing)
- [ ] Breadcrumbs or back buttons are present when needed
- [ ] Navigation is always accessible
- [ ] Current page is highlighted in navigation

### Branding
- [ ] Cepho branding is visible on all pages
- [ ] Logo is clickable and returns to home
- [ ] Tagline appears consistently
- [ ] Brand colors are used consistently

---

## 11. SPECIFIC FEATURE CHECKS

### Voice Capture
- [ ] Mic icon is visible on Dashboard
- [ ] Voice input works (if implemented)
- [ ] Recording indicator shows status
- [ ] Transcription displays correctly

### Favorites System
- [ ] Star icon appears on expert cards
- [ ] Favorites list displays on Dashboard
- [ ] Adding/removing favorites works
- [ ] Favorite count is accurate

### Chat Interface
- [ ] Message input is visible and functional
- [ ] Messages display in conversation thread
- [ ] Avatar images show for each speaker
- [ ] Timestamps are visible (if applicable)
- [ ] Typing indicators appear (if applicable)

### Expert Directory
- [ ] Expert cards display all information
- [ ] Search functionality works
- [ ] Filter by category/expertise works
- [ ] Corporate Partners tab works
- [ ] Chat/Video buttons are functional

---

## 12. ERROR HANDLING & EDGE CASES

### Error States
- [ ] Error messages are clear and actionable
- [ ] Error messages are visible and readable
- [ ] Error colors are consistent (typically red)
- [ ] Retry buttons are present when appropriate

### Empty States
- [ ] Empty state messages are helpful
- [ ] CTAs are provided to populate content
- [ ] Empty state illustrations are appropriate

### Loading States
- [ ] Loading indicators are visible
- [ ] Loading messages explain what's happening
- [ ] Skeleton loaders match content layout
- [ ] Loading states don't block interaction (where appropriate)

---

## 13. MANUS DESIGN LANGUAGE COMPLIANCE

### Color Tokens
- [ ] Primary color used for main CTAs
- [ ] Secondary color used for alternative actions
- [ ] Foreground/background provide proper contrast
- [ ] Muted colors used for secondary text
- [ ] Border colors are consistent

### Spacing
- [ ] Consistent use of spacing scale (4px, 8px, 12px, 16px, 24px, 32px)
- [ ] Padding inside components is consistent
- [ ] Margins between components are consistent
- [ ] Whitespace is used effectively

### Borders & Shadows
- [ ] Border radius is consistent (typically 6-8px for cards)
- [ ] Border colors use semantic tokens
- [ ] Shadows are subtle and consistent
- [ ] No excessive shadows or borders

### Typography Scale
- [ ] Heading sizes follow a consistent scale
- [ ] Body text size is readable
- [ ] Small text is still readable
- [ ] Font weights are used appropriately

---

## 14. FINAL SIGN-OFF

### Overall Assessment
- [ ] App feels cohesive and professional
- [ ] Design language is consistent throughout
- [ ] User experience is intuitive
- [ ] No major usability issues
- [ ] Performance is acceptable
- [ ] Accessibility is adequate

### Recommended Actions (if any)
- [ ] List any issues found
- [ ] Prioritize fixes (Critical, High, Medium, Low)
- [ ] Assign ownership for each issue

---

## Notes & Comments

**Reviewer Name:** _______________  
**Review Date:** _______________  
**Overall Rating:** ☐ Excellent ☐ Good ☐ Fair ☐ Needs Work  

**Key Findings:**
1. 
2. 
3. 

**Recommended Improvements:**
1. 
2. 
3. 

---

**Last Updated:** January 13, 2026  
**Version:** 1.0
