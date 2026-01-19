---
Phase: 1.5
Risk Level: None
Effort Estimate: 20 minutes
Non-breaking: Yes
---

## 6.1 Token Expiry Handling

### Purpose

To ensure the application proactively and reliably refreshes OAuth access tokens before they expire, preventing API call failures and providing a seamless user experience.

### Scope

This task involves reviewing and documenting the existing token refresh logic to confirm its appropriateness. No code changes are anticipated unless the logic is found to be flawed.

### Current State

- The application stores OAuth tokens (e.g., from Google) along with their expiry times.
- A mechanism is in place to refresh the access token using the refresh token.
- The current logic attempts to refresh the token when it is within a **5-minute buffer** of its expiry time.

### Recommended Approach

1.  **Review Refresh Logic:** Locate the code responsible for checking token expiry and triggering the refresh flow.
2.  **Confirm Buffer Time:** Validate that the 5-minute buffer is an appropriate duration. This is generally a safe value, as it allows ample time for the refresh API call to complete before the old token becomes invalid.
3.  **Document the Flow:** Create a sequence diagram or a written description of the token refresh flow in the project's technical documentation. This should include:
    - The check for the token's expiry.
    - The call to the OAuth provider's refresh endpoint.
    - The process for updating the stored access token and its new expiry time.
    - The handling of errors if the refresh token itself is invalid.

#### Illustrative Logic

```typescript
// getToken.ts (illustrative / not yet enforced)

async function getAccessToken(userId: string): Promise<string> {
  const token = await db.oauthToken.findFirst({ where: { userId } });

  if (!token) {
    throw new Error("User has no token");
  }

  const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
  const isTokenExpiringSoon = token.expiresAt.getTime() - Date.now() < FIVE_MINUTES_IN_MS;

  if (isTokenExpiringSoon) {
    const refreshedToken = await refreshGoogleToken(token.refreshToken);
    await db.oauthToken.update({
      where: { id: token.id },
      data: {
        accessToken: refreshedToken.access_token,
        expiresAt: new Date(Date.now() + refreshedToken.expires_in * 1000),
      },
    });
    return refreshedToken.access_token;
  }

  return token.accessToken;
}
```

### Non-breaking Confirmation

This is primarily a documentation and verification task. As long as the existing logic is sound, no code changes are needed, making it non-breaking.

### Phase Boundary Notes

- **Phase 1.5:** Verify and document the existing token refresh mechanism.
- **Phase 2 Follow-ups:** None. This robust handling is a prerequisite for the new integrations planned in Phase 2.

---

Ready for GitHub commit: Yes
