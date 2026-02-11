---
Phase: 1.5
Risk Level: Low
Effort Estimate: 45 minutes
Non-breaking: Yes
---

## 6.2 Error Message Sanitisation

### Purpose

To enhance application security by ensuring that no sensitive information (e.g., file paths, database query details, internal variable names) is ever exposed to the client in error messages.

### Scope

This task involves reviewing all error-handling paths to ensure that detailed, internal-facing errors are logged for debugging, while only generic, safe messages are sent to the user.

### Current State

- The application generally follows a good pattern of catching specific errors.
- However, in some edge cases, the `error.message` from a third-party library or a database client might be passed directly to the user-facing error message.
- This could potentially leak information about the application's internal structure or dependencies.

### Recommended Approach

1.  **Audit `catch` Blocks:** Review all `catch (error)` blocks in the tRPC API routers and other server-side logic.
2.  **Log, Don't Expose:** Enforce a strict policy: the original `error` object should always be logged for debugging purposes on the server, but it should *never* be sent to the client.
3.  **Use Safe Error Mappings:** As described in item `2.1 User-Facing Error Messages`, use a mapping of known error types to pre-defined, safe, user-friendly messages.
4.  **Default to Generic:** If an error is not of a known type, always fall back to a generic, non-informative message like "An unexpected error occurred."

#### Illustrative Code Snippet (Sanitisation pattern)

```typescript
// some-service.ts (illustrative / not yet enforced)

// ...
  try {
    // Some operation that might fail
    const result = await db.user.create({ data: userData });
    return result;
  } catch (error) {
    // Log the full, detailed error for debugging
    logger.error("Failed to create user", { 
      originalError: error,
      userInput: userData 
    });

    // Throw a new, safe error that does NOT contain the original error message
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'A user with this email already exists.'
        });
    }
    
    throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not create user due to a server issue.'
    });
  }
// ...
```

### Non-breaking Confirmation

This change is non-breaking. It improves security by changing the content of error messages, but it does not alter the application's logic or functionality.

### Phase Boundary Notes

- **Phase 1.5:** Ensure all error messages sent to the client are sanitized and do not leak internal details.
- **Phase 2 Follow-ups:** None. This is a fundamental security best practice that must be maintained.

---

Ready for GitHub commit: Yes
