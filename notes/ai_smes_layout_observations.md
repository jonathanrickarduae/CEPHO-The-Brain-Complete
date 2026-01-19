# AI-SMEs Page Layout Observations

## Current State (19 January 2026)

### Left Sidebar Structure:
1. **Recent Chats** section - Shows Phil Knight, Marcus Macro, Victor Sterling with dates
2. **Browse By Type** section - Shows All Experts (320), AI SMEs (56), categories

### Issues Identified:
1. **Spacing between Recent Chats and Browse By Type** - Need to add visual separation
2. **SME names in cards** - Names are visible but could be clearer
3. **Chat button styling** - Needs to be white/more visible

### Component Location:
- Main page: `/client/src/pages/AISMEsPage.tsx`
- Expert cards rendered in grid layout
- Sidebar with Recent Chats and Browse By Type filters

### Fixes Needed:
1. Add margin/padding between "Recent Chats" and "Browse By Type" sections
2. Ensure SME names display in white when selected
3. Style chat buttons consistently
