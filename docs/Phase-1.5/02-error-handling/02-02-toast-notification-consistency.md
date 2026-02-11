---
Phase: 1.5
Risk Level: None
Effort Estimate: 30 minutes
Non-breaking: Yes
---

## 2.2 Toast Notification Consistency

### Purpose

To create a consistent and predictable user experience by standardizing the use, appearance, and behavior of toast notifications for success, error, and informational messages.

### Scope

This task involves auditing all instances where toast notifications are triggered and ensuring they use a centralized service with consistent styling and duration.

### Current State

- Toast notifications are used throughout the app to provide feedback.
- However, there are inconsistencies in:
    - **Styling:** Different colors and icons are used for the same message type (e.g., some success toasts are green, others are blue).
    - **Duration:** Some toasts dismiss automatically, while others require manual closing.
    - **Positioning:** Most appear at the top-right, but some appear at the bottom.

### Recommended Approach

1.  **Centralize Toast Logic:** Create a single, reusable `useToast` hook or service that abstracts the underlying toast library (e.g., `react-hot-toast`, `sonner`).
2.  **Define Variants:** The service should expose simple methods for each notification type:
    - `toast.success(message)`
    - `toast.error(message)`
    - `toast.info(message)`
3.  **Standardize Styling:** Configure the toast library in a central location to use the design system's colors and icons for each variant.
4.  **Refactor Calls:** Replace all direct calls to the toast library with the new centralized service.

#### Illustrative Code Snippet (Centralized toast hook)

```typescript
// use-toast.ts (illustrative / not yet enforced)
import { toast as sonnerToast } from 'sonner';

// This hook centralizes all toast notifications to ensure consistency
export function useToast() {
  return {
    success: (message: string) => {
      sonnerToast.success(message, {
        // Standard styles and duration for success
        duration: 3000,
      });
    },
    error: (message: string) => {
      sonnerToast.error(message, {
        // Standard styles and duration for error
        duration: 5000,
      });
    },
    info: (message: string) => {
      sonnerToast.info(message, {
        // Standard styles and duration for info
        duration: 3000,
      });
    },
  };
}
```

### Non-breaking Confirmation

This change is non-breaking. It is a UI/UX and code quality improvement that standardizes the presentation of feedback to the user without altering application logic.

### Phase Boundary Notes

- **Phase 1.5:** Implement a consistent toast notification system.
- **Phase 2 Follow-ups:** None. This system should be used for all new user feedback in Phase 2.

---

Ready for GitHub commit: Yes
