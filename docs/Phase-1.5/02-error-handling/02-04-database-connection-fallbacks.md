---
Phase: 1.5
Risk Level: None
Effort Estimate: 20 minutes
Non-breaking: Yes
---

## 2.4 Database Connection Fallbacks

### Purpose

To ensure the application handles database unavailability gracefully by providing consistent and informative error messages, preventing crashes or unhandled exceptions.

### Scope

This task involves reviewing all database-dependent services and API endpoints to verify that they have a consistent pattern for handling cases where the database connection is not available.

### Current State

- The codebase contains several checks for database availability, typically in the form of `if (!db) { ... }`.
- While the checks exist, the error handling within these blocks is inconsistent. Some throw a generic error, while others might fail silently.

### Recommended Approach

1.  **Global Search:** Perform a global search for `if (!db)` or similar patterns where the database client is accessed.
2.  **Standardize Error:** For every instance, ensure that if the database is not available, a standardized `TRPCError` is thrown with a `SERVICE_UNAVAILABLE` code.
3.  **User-Facing Message:** The client-side should map this specific error code to a user-friendly message, such as "Our services are temporarily unavailable. Please try again in a few moments."

#### Illustrative Code Snippet (Database client initialization)

```typescript
// server/db.ts (illustrative / not yet enforced)
import { PrismaClient } from "@prisma/client";

let db: PrismaClient;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  if (!global.db) {
    global.db = new PrismaClient();
  }
  db = global.db;
}

// A helper function to ensure the DB is available before use
export function getDbClient() {
  if (!db) {
    // This should only happen if the initial connection fails
    throw new Error("Database client is not initialized.");
  }
  return db;
}

// In a tRPC router:
// const db = getDbClient(); // This will throw if db is not available
```

### Non-breaking Confirmation

This change is non-breaking. It standardizes existing error-handling patterns and does not introduce new logic or change application behavior under normal operating conditions.

### Phase Boundary Notes

- **Phase 1.5:** Ensure all database connection checks result in a consistent, user-friendly error.
- **Phase 2 Follow-ups:** Consider implementing a more robust health check endpoint that actively monitors database connectivity and can be used by a load balancer or container orchestrator.

---

Ready for GitHub commit: Yes
