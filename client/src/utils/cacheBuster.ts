// Cache Buster Utility
// Forces mobile browsers to reload fresh content

export const APP_VERSION = '1.0.0-20260224-002';

/**
 * Check if app version has changed and force reload if needed
 */
export function checkAppVersion() {
  const storedVersion = localStorage.getItem('app_version');
  
  if (storedVersion && storedVersion !== APP_VERSION) {
    console.log('[Cache Buster] Version changed from', storedVersion, 'to', APP_VERSION);
    console.log('[Cache Buster] Forcing cache clear and reload');
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    // Clear service worker cache
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }
    
    // Update stored version
    localStorage.setItem('app_version', APP_VERSION);
    
    // Force hard reload
    window.location.reload();
    return true;
  }
  
  // Store version if first time
  if (!storedVersion) {
    localStorage.setItem('app_version', APP_VERSION);
  }
  
  return false;
}

/**
 * Force clear all caches and reload
 */
export function forceCacheClear() {
  console.log('[Cache Buster] Forcing cache clear');
  
  // Clear localStorage except auth
  const authToken = localStorage.getItem('cepho_auth_token');
  const email = localStorage.getItem('cepho_email');
  const remember = localStorage.getItem('cepho_remember');
  
  localStorage.clear();
  
  if (authToken) localStorage.setItem('cepho_auth_token', authToken);
  if (email) localStorage.setItem('cepho_email', email);
  if (remember) localStorage.setItem('cepho_remember', remember);
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
  
  // Clear service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
  
  // Force hard reload
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

/**
 * Add version query string to URLs for cache busting
 */
export function addVersionToUrl(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${APP_VERSION}`;
}
