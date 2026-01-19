---
Phase: 1.5
Risk Level: Low
Effort Estimate: 1.5 hours
Non-breaking: Yes
---

## 2.1 User-Facing Error Messages

### Purpose

To improve the user experience by ensuring that when an error occurs, the user is presented with a clear, user-friendly message instead of a technical error code or a generic failure notice.

### Scope

This task involves reviewing all `try...catch` blocks and `throw new Error()` statements to ensure that caught errors are mapped to user-friendly messages. It does not involve creating new error types, but rather improving the presentation of existing ones.

### Current State

- **280 `catch`/`throw` patterns** have been identified.
- Most errors are correctly caught and logged to the console for debugging.
- However, the error messages surfaced to the user are often generic (e.g., "An error occurred") or, in some cases, expose technical details (e.g., "Database connection failed").

### Recommended Approach

1.  **Audit Error Boundaries:** Review all React Error Boundaries and top-level `try...catch` blocks in API handlers.
2.  **Create an Error Message Map:** Define a simple mapping from technical error types or codes to user-friendly, non-technical messages.
3.  **Implement Mapping:** In the `catch` blocks that interact with the UI, use the mapping to display the appropriate message to the user, typically via a toast notification or an inline error component.
4.  **Default Fallback:** Ensure a generic but friendly default message is used for any unmapped or unexpected errors (e.g., "Something went wrong. Please try again or contact support if the issue persists.").

#### Illustrative Code Snippet (tRPC API handler)

```typescript
// some-trpc-router.ts (illustrative / not yet enforced)
import { TRPCError } from '@trpc/server';

// ...

  someMutation: publicProcedure
    .input(someInputSchema)
    .mutation(async ({ input }) => {
      try {
        await someService.doSomething(input);
      } catch (error) {
        // Log the technical error for debugging
        console.error("Mutation failed:", error);

        // Throw a user-friendly error to the client
        if (error instanceof CustomError && error.code === 'DUPLICATE_ENTRY') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'An item with this name already exists. Please choose a different name.',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not complete the action. Please try again later.',
        });
      }
    }),
```

### Non-breaking Confirmation

This change is non-breaking. It only modifies the text content of error messages displayed to the user and does not affect the logic of how errors are handled, logged, or thrown.

### Phase Boundary Notes

- **Phase 1.5:** Ensure all user-facing errors are clear, concise, and non-technical.
- **Phase 2 Follow-ups:** Consider implementing internationalization (i18n) for error messages to support multiple languages.

---

Ready for GitHub commit: Yes
