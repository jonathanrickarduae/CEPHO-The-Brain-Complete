---
Phase: 1.5
Risk Level: None
Effort Estimate: 20 minutes
Non-breaking: Yes
---

## 3.3 Integration Status Display

### Purpose

To provide users with clear and accurate feedback on the status of their third-party integrations (e.g., Google Calendar, Google Mail) directly within the application settings.

### Scope

This task involves a UI review of the `Settings > Integrations` page to ensure it correctly reflects the connection status of each integration and provides appropriate actions (e.g., "Connect", "Disconnect").

### Current State

- The integrations page lists available integrations.
- The status display is sometimes inconsistent. For example, a disconnected integration might not clearly show an error state or offer a reconnect option.
- There is no visual distinction between a successfully connected integration and one that has an expired token or has had its permissions revoked by the user.

### Recommended Approach

1.  **Define Statuses:** Formally define the possible states for an integration:
    - **Connected:** The integration is active and working correctly.
    - **Disconnected:** The user has not yet connected the integration.
    - **Error/Needs Re-authentication:** The integration was previously connected, but the token is now invalid (e.g., expired, revoked). The user needs to re-authenticate.
2.  **UI Audit:** Review the `Integrations` page UI to ensure it can represent all three states clearly.
3.  **Backend Check:** Ensure the backend API that provides the integration status can differentiate between these states. This may involve a simple token validation check.
4.  **Implement UI Logic:** Update the frontend component to display the correct status, icon, and action button based on the API response.

#### Illustrative UI States

- **Connected:** Shows a green checkmark, the connected account email, and a "Disconnect" button.
- **Disconnected:** Shows a greyed-out icon and a "Connect" button.
- **Error:** Shows a red warning icon, a message like "Re-authentication required," and a "Reconnect" button.

### Non-breaking Confirmation

This change is non-breaking. It is a UI/UX improvement that provides better feedback to the user. It does not change the underlying integration logic.

### Phase Boundary Notes

- **Phase 1.5:** Ensure the integration status display is accurate and consistent for all existing integrations.
- **Phase 2 Follow-ups:** This consistent status display will be used for all new integrations added in Phase 2 (e.g., Stripe, Notion).

---

Ready for GitHub commit: Yes
