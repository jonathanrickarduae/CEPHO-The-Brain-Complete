# Theme Persistence Testing Guide

## Overview
This document outlines how to test theme persistence across sessions, devices, and browsers to ensure the theme preference system works reliably.

## Test Scenarios

### 1. Single Session Tests

#### 1.1 Theme Persistence Within Session
**Steps:**
1. Open the app in a browser
2. Click theme toggle to switch to "Light" mode
3. Verify light mode is applied (white background, dark text)
4. Refresh the page (F5 or Cmd+R)
5. Verify light mode is still active

**Expected Result:** Theme persists after page refresh

#### 1.2 Theme Toggle Cycling
**Steps:**
1. Open the app
2. Click theme toggle repeatedly (at least 5 times)
3. Verify each toggle cycles: Light → Dark → System → Light
4. Verify localStorage updates with each click

**Expected Result:** All themes cycle correctly without errors

#### 1.3 Rapid Theme Changes
**Steps:**
1. Open browser DevTools Console
2. Execute: `document.querySelector('[data-testid="theme-toggle"]')?.click(); document.querySelector('[data-testid="theme-toggle"]')?.click(); document.querySelector('[data-testid="theme-toggle"]')?.click();`
3. Verify no console errors
4. Verify final theme is correct

**Expected Result:** No errors, final state is correct

### 2. Cross-Session Tests

#### 2.1 Theme Persistence Across Browser Restarts
**Steps:**
1. Open the app
2. Set theme to "Dark"
3. Close the browser completely
4. Reopen the browser and navigate to the app
5. Verify dark mode is active

**Expected Result:** Theme persists across browser restart

#### 2.2 Theme Persistence Across Tab Switches
**Steps:**
1. Open the app in Tab A
2. Set theme to "Light"
3. Open the app in Tab B (new tab)
4. Verify Tab B also shows light mode
5. Switch back to Tab A
6. Verify Tab A still shows light mode

**Expected Result:** Theme is consistent across all tabs

#### 2.3 Theme Persistence with Multiple Windows
**Steps:**
1. Open the app in Window A
2. Set theme to "Dark"
3. Open the app in Window B (new window)
4. Verify Window B shows dark mode
5. Change theme in Window B to "Light"
6. Switch back to Window A
7. Verify Window A reflects the light mode change (if using localStorage sync)

**Expected Result:** Theme is synchronized across windows (or at least doesn't conflict)

### 3. Device Tests

#### 3.1 Theme Persistence on Mobile
**Steps:**
1. Open the app on a mobile device (iOS/Android)
2. Set theme to "Light"
3. Close the browser app
4. Reopen the browser and navigate back to the app
5. Verify light mode is active

**Expected Result:** Theme persists on mobile

#### 3.2 Theme Persistence with System Preference Changes
**Steps:**
1. Set system theme to "Dark" (in OS settings)
2. Open the app and set theme to "System"
3. Verify dark mode is applied
4. Change system theme to "Light" (in OS settings)
5. Verify app switches to light mode automatically

**Expected Result:** App respects system preference when set to "System"

#### 3.3 Theme Persistence Across Device Sync
**Steps:**
1. Set theme to "Light" on Device A
2. Log in with same account on Device B
3. Verify theme is "Light" on Device B (if backend sync is enabled)

**Expected Result:** Theme syncs across devices (if feature is implemented)

### 4. Browser Compatibility Tests

#### 4.1 Chrome/Edge
**Steps:**
1. Open app in Chrome
2. Set theme to "Dark"
3. Verify localStorage contains `cepho_theme_preference: dark`
4. Refresh page
5. Verify theme persists

**Expected Result:** Works correctly in Chrome/Edge

#### 4.2 Firefox
**Steps:**
1. Open app in Firefox
2. Set theme to "Light"
3. Verify localStorage contains `cepho_theme_preference: light`
4. Refresh page
5. Verify theme persists

**Expected Result:** Works correctly in Firefox

#### 4.3 Safari
**Steps:**
1. Open app in Safari
2. Set theme to "System"
3. Verify localStorage contains `cepho_theme_preference: system`
4. Refresh page
5. Verify theme persists

**Expected Result:** Works correctly in Safari

### 5. Edge Cases

#### 5.1 Corrupted localStorage
**Steps:**
1. Open DevTools Console
2. Execute: `localStorage.setItem('cepho_theme_preference', 'invalid_theme')`
3. Refresh page
4. Verify app defaults to "System" theme without crashing

**Expected Result:** App handles invalid theme gracefully

#### 5.2 localStorage Disabled
**Steps:**
1. Disable localStorage in browser settings (or use private/incognito mode)
2. Open the app
3. Try to change theme
4. Verify app still works (theme may not persist)

**Expected Result:** App doesn't crash, gracefully falls back

#### 5.3 Large localStorage
**Steps:**
1. Fill localStorage with large amounts of data
2. Try to set theme
3. Verify theme setting still works

**Expected Result:** Theme setting works even with full localStorage

### 6. Backend Sync Tests (if implemented)

#### 6.1 Theme Syncs to Backend
**Steps:**
1. Open DevTools Network tab
2. Set theme to "Light"
3. Verify API call to `theme.set` endpoint
4. Verify request contains `themePreference: "light"`

**Expected Result:** API call is made with correct data

#### 6.2 Theme Loads from Backend
**Steps:**
1. Open DevTools Network tab
2. Refresh page
3. Verify API call to `theme.get` endpoint
4. Verify response contains user's saved theme preference

**Expected Result:** Theme loads from backend on page load

#### 6.3 Backend Theme Overrides localStorage
**Steps:**
1. Set localStorage theme to "Dark"
2. Manually set backend theme to "Light" (via database)
3. Refresh page
4. Verify app loads "Light" theme from backend

**Expected Result:** Backend theme takes precedence

### 7. Performance Tests

#### 7.1 Theme Change Performance
**Steps:**
1. Open DevTools Performance tab
2. Click theme toggle
3. Record performance metrics
4. Verify theme change completes in < 300ms

**Expected Result:** Theme transitions smoothly in < 300ms

#### 7.2 Page Load with Theme
**Steps:**
1. Open DevTools Network tab
2. Hard refresh page (Cmd+Shift+R)
3. Verify page load time is not significantly impacted by theme loading

**Expected Result:** Theme loading doesn't significantly impact page load time

## Automated Test Suite

Run the persistence test suite with:

```bash
pnpm test -- useTheme.persistence.test.ts
```

This runs 11 automated tests covering:
- localStorage persistence
- Cross-instance loading
- Page reload simulation
- Default theme behavior
- DOM class application
- Theme cycling
- isDark state consistency
- Rapid changes
- State/storage consistency

## Manual Testing Checklist

- [ ] Single session theme persistence
- [ ] Theme toggle cycling
- [ ] Rapid theme changes
- [ ] Cross-browser restart persistence
- [ ] Multi-tab consistency
- [ ] Mobile persistence
- [ ] System preference detection
- [ ] Chrome compatibility
- [ ] Firefox compatibility
- [ ] Safari compatibility
- [ ] Invalid theme handling
- [ ] localStorage disabled handling
- [ ] Full localStorage handling
- [ ] Backend sync (if implemented)
- [ ] Theme change performance
- [ ] Page load performance

## Known Issues & Workarounds

### Issue: Theme flashes on page load
**Cause:** Theme loads after initial render
**Workaround:** Add theme to HTML inline script before React loads

### Issue: System theme not detected on some browsers
**Cause:** Browser doesn't support prefers-color-scheme
**Workaround:** Fallback to localStorage or default to dark mode

### Issue: Theme doesn't sync across tabs
**Cause:** localStorage events not properly handled
**Workaround:** Implement storage event listener for cross-tab sync

## Debugging

### Check localStorage
```javascript
console.log(localStorage.getItem('cepho_theme_preference'));
```

### Check DOM classes
```javascript
console.log(document.documentElement.classList);
```

### Check CSS variables
```javascript
console.log(getComputedStyle(document.documentElement).getPropertyValue('--background'));
```

### Check theme hook state
```javascript
// In React DevTools, inspect useTheme hook state
```

## Success Criteria

✅ Theme persists across page refreshes
✅ Theme persists across browser restarts
✅ Theme is consistent across all tabs
✅ Theme works on mobile devices
✅ System preference is respected when set to "System"
✅ App handles invalid themes gracefully
✅ Theme changes are smooth (< 300ms)
✅ Theme loads from backend on login
✅ All browsers (Chrome, Firefox, Safari) work correctly
✅ No console errors during theme switching
