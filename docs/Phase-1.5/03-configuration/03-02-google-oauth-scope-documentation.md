---
Phase: 1.5
Risk Level: None
Effort Estimate: 10 minutes
Non-breaking: Yes
---

## 3.2 Google OAuth Scope Documentation

### Purpose

To provide clear documentation on the Google OAuth scopes currently in use and to outline the additional scopes that will be required for Phase 2 features. This aids in security audits and planning for the OAuth consent screen verification process.

### Scope

This is a documentation-only task. It involves creating a Markdown file that lists and describes the OAuth scopes. No code changes are required.

### Current State

- The application currently requests several scopes from Google during the OAuth flow.
- These scopes are defined in the codebase but are not centrally documented, making it difficult to quickly assess the application's access level to user data.

**Current Scopes in Use (Phase 1):**

| Scope | Purpose | Risk Level |
|---|---|---|
| `https://www.googleapis.com/auth/calendar.readonly` | Read access to user's primary calendar. | Medium |
| `https://www.googleapis.com/auth/calendar.events.readonly` | Read access to events on the user's calendars. | Medium |
| `https://www.googleapis.com/auth/gmail.readonly` | Read-only access to user's emails. | High |
| `https://www.googleapis.com/auth/userinfo.email` | Read user's primary email address. | Low |
| `https://www.googleapis.com/auth/userinfo.profile` | Read user's basic profile information (name, picture). | Low |

### Recommended Approach

1.  **Create a `SCOPES.md` file:** In the `docs/` directory, create a new file named `SCOPES.md`.
2.  **Document Current Scopes:** Add a table listing the Phase 1 scopes, their purpose, and why they are needed, as shown above.
3.  **Document Future Scopes:** Add a second table outlining the scopes that will be required for Phase 2, clearly marking them as "not yet requested."

### Phase Boundary Notes

- **Phase 1.5:** Document all existing and planned OAuth scopes.
- **Phase 2 Follow-ups:** The Phase 2 implementation will involve adding the new scopes to the OAuth client configuration. The documentation created here will be essential for the Google OAuth verification process, which will be required before Phase 2 can be released to the public.

**Planned Scopes (Phase 2):**

| Scope | Purpose | Rationale |
|---|---|---|
| `https://www.googleapis.com/auth/gmail.send` | To send emails on the user's behalf. | Required for two-way email sync feature. |
| `https://www.googleapis.com/auth/calendar.events` | Read/write access to calendar events. | Required for creating and modifying events. |

---

Ready for GitHub commit: Yes
