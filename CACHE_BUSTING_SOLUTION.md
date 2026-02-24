# Mobile Browser Cache Busting Solution

## Problem
Mobile browsers (especially Safari on iOS and Chrome on Android) aggressively cache web applications, causing white screens or stale content after deployments.

## Solution Implemented

### 1. **HTTP Cache-Control Headers**
**File**: `server/index.ts`

```typescript
// HTML files - Never cache
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');

// JS/CSS with hash - Cache forever (immutable)
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

// Images - Cache for 1 week
res.setHeader('Cache-Control', 'public, max-age=604800');
```

### 2. **HTML Meta Tags**
**File**: `client/index.html`

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

### 3. **Service Worker Versioning**
**File**: `client/public/sw.js`

```javascript
// Update this timestamp on each deployment
const CACHE_VERSION = 'the-brain-v1-' + '20260224-001';
const CACHE_NAME = CACHE_VERSION;
```

**How it works:**
- Each deployment gets a new cache version
- Old caches are automatically deleted
- Forces browsers to fetch fresh content

### 4. **App Version Checking**
**File**: `client/src/utils/cacheBuster.ts`

```typescript
export const APP_VERSION = '1.0.0-20260224-001';

export function checkAppVersion() {
  const storedVersion = localStorage.getItem('app_version');
  
  if (storedVersion && storedVersion !== APP_VERSION) {
    // Version changed - force cache clear and reload
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
    
    window.location.reload();
  }
}
```

**How it works:**
- Checks version on every app load
- Compares with stored version in localStorage
- If different, clears all caches and forces reload
- Preserves auth tokens during clear

### 5. **Automatic Version Check**
**File**: `client/src/main.tsx`

```typescript
import { checkAppVersion } from "./utils/cacheBuster";

// Check app version on startup
checkAppVersion();
```

## How to Use

### For Each Deployment

1. **Update Service Worker Version**
   ```javascript
   // client/public/sw.js
   const CACHE_VERSION = 'the-brain-v1-' + '20260224-002'; // Increment
   ```

2. **Update App Version**
   ```typescript
   // client/src/utils/cacheBuster.ts
   export const APP_VERSION = '1.0.0-20260224-002'; // Increment
   ```

3. **Commit and Deploy**
   ```bash
   git add -A
   git commit -m "chore: bump cache version"
   git push origin main
   ```

### Version Format
```
YYYYMMDD-NNN
20260224-001 = February 24, 2026, deployment #1
20260224-002 = February 24, 2026, deployment #2
```

## What Happens on User's Device

### First Load After Deployment
1. App loads with new version number
2. `checkAppVersion()` runs
3. Detects version mismatch
4. Clears all browser caches
5. Unregisters old service worker
6. Forces hard reload
7. Fresh content loads

### Subsequent Loads
1. Version matches stored version
2. No cache clear needed
3. App loads normally

## Testing

### Desktop
1. Open DevTools → Application → Storage
2. Clear all data
3. Reload page
4. Check console for version logs

### Mobile (iOS Safari)
1. Settings → Safari → Advanced → Website Data
2. Remove CEPHO.AI data
3. Close Safari completely
4. Reopen and navigate to app

### Mobile (Android Chrome)
1. Settings → Privacy → Clear browsing data
2. Select "Cached images and files"
3. Clear for CEPHO.AI
4. Reopen Chrome and navigate to app

## Console Logs to Monitor

```
[Cache Buster] Version changed from 1.0.0-20260224-001 to 1.0.0-20260224-002
[Cache Buster] Forcing cache clear and reload
[SW] Current cache: the-brain-v1-20260224-002
[SW] Deleting old cache: the-brain-v1-20260224-001
[SW] Service worker activated, claiming clients
```

## Troubleshooting

### White Screen Persists
1. Check browser console for errors
2. Verify version numbers match in:
   - `sw.js` (CACHE_VERSION)
   - `cacheBuster.ts` (APP_VERSION)
3. Manually clear browser data
4. Check network tab for 304 responses (cached)

### Service Worker Not Updating
1. Open DevTools → Application → Service Workers
2. Click "Unregister"
3. Check "Update on reload"
4. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Mobile Still Caching
1. Close app completely (swipe away)
2. Clear Safari/Chrome data
3. Restart device
4. Reopen app

## Best Practices

1. **Always increment version** on deployment
2. **Use timestamp format** for easy tracking
3. **Test on real devices** before announcing updates
4. **Monitor console logs** for cache behavior
5. **Keep versions in sync** (sw.js and cacheBuster.ts)

## Future Enhancements

1. **Automatic version bumping** in CI/CD pipeline
2. **Version API endpoint** to check for updates
3. **Update notification** to users
4. **Graceful update** without hard reload
5. **Version history** tracking

## Files Modified

- `client/index.html` - Added cache-control meta tags
- `client/public/sw.js` - Added version-based cache names
- `client/src/utils/cacheBuster.ts` - Created version checking utility
- `client/src/main.tsx` - Added version check on startup
- `server/index.ts` - Already had proper cache headers

## Deployment Checklist

- [ ] Update CACHE_VERSION in sw.js
- [ ] Update APP_VERSION in cacheBuster.ts
- [ ] Commit changes
- [ ] Push to GitHub
- [ ] Wait for Render deployment (3 minutes)
- [ ] Test on desktop browser
- [ ] Test on mobile browser (iOS/Android)
- [ ] Verify console logs show new version
- [ ] Confirm no white screen issues

---

**Last Updated**: February 24, 2026  
**Current Version**: 1.0.0-20260224-001
