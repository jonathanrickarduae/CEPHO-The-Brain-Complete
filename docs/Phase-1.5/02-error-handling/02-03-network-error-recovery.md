---
Phase: 1.5
Risk Level: Low
Effort Estimate: 1 hour
Non-breaking: Yes
---

## 2.3 Network Error Recovery

### Purpose

To improve the application's resilience and user experience when network connectivity is lost or unstable by providing clear offline indicators and simple retry mechanisms.

### Scope

This task involves adding global listeners for network status and providing visual feedback. It does not include implementing a full offline mode with data synchronization, which is a significant Phase 2+ feature.

### Current State

- If the network connection is lost while a user is performing an action, the request fails, often with a generic error message.
- There is no clear indication to the user that the failure was due to a network issue.
- The user must manually retry the action once connectivity is restored.

### Recommended Approach

1.  **Global Network Status Listener:** Implement a global hook (e.g., `useOnlineStatus`) that listens to the browser's `online` and `offline` events.
2.  **Offline Indicator:** When the application goes offline, display a persistent, non-intrusive banner or indicator (e.g., a small toast or a header bar) to inform the user.
3.  **Disable Actions:** While offline, disable primary action buttons (e.g., "Save", "Submit") to prevent users from attempting actions that are guaranteed to fail.
4.  **Retry Logic Hints:** For failed mutations due to network errors, the error message should suggest retrying. While automatic retry logic (e.g., via `react-query`) is a Phase 2+ item, the UI can guide the user.

#### Illustrative Code Snippet (Online status hook)

```typescript
// use-online-status.ts (illustrative / not yet enforced)
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### Non-breaking Confirmation

This change is non-breaking. It is a UI/UX enhancement that adds a visual layer to inform users about their connectivity status. It does not change how data is fetched or submitted.

### Phase Boundary Notes

- **Phase 1.5:** Implement a basic offline indicator and disable actions during offline state.
- **Phase 2 Follow-ups:** Investigate implementing a full offline mode with request queuing and background synchronization for a more seamless experience.

---

Ready for GitHub commit: Yes
