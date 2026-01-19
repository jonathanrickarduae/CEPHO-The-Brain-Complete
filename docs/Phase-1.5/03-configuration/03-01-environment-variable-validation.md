---
Phase: 1.5
Risk Level: None
Effort Estimate: 15 minutes
Non-breaking: Yes
---

## 3.1 Environment Variable Validation

### Purpose

To prevent runtime errors and ensure application stability by validating the presence and format of all required environment variables at application startup.

### Scope

This task involves adding a validation step to the application's entry point to check for all necessary environment variables. It does not involve changing the values or sources of these variables.

### Current State

- The application reads environment variables from a `.env` file or the host environment.
- If a required variable is missing (e.g., `DATABASE_URL`), the application may crash later with an obscure error when that variable is first accessed.

**Current Environment Variables:**
- `appId`
- `cookieSecret`
- `databaseUrl`
- `oAuthServerUrl`
- `ownerOpenId`
- `isProduction`
- `forgeApiUrl`
- `forgeApiKey`
- `elevenLabsApiKey`
- `googleClientId`
- `googleClientSecret`

### Recommended Approach

1.  **Use a Validation Library:** Integrate a lightweight environment variable validation library like `t3-env` or `zod`.
2.  **Define Schema:** Create a schema that defines all required environment variables and their expected types (e.g., string, number).
3.  **Validate at Startup:** In the main server entry point (`server.ts` or similar), import and run the validator. If validation fails, the process should exit immediately with a clear error message indicating which variables are missing.

#### Illustrative Code Snippet (using `t3-env`)

```typescript
// env.mjs (illustrative / not yet enforced)
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    ELEVEN_LABS_API_KEY: z.string().min(1),
  },
  client: {
    // client-side env vars here
  },
  // If you're using Next.js, you'll need to destructure `process.env`
  runtimeEnv: process.env,
});
```

### Non-breaking Confirmation

This change is non-breaking. It improves the developer experience and production stability by failing fast. It has no impact on application logic under normal, correctly configured conditions.

### Phase Boundary Notes

- **Phase 1.5:** Implement environment variable validation at startup.
- **Phase 2 Follow-ups:** None. This provides a solid foundation for any new configuration variables added in Phase 2.

---

Ready for GitHub commit: Yes
