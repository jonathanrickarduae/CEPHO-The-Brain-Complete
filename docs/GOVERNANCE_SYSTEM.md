# CEPHO Governance Mode System

## Overview

The Governance Mode System provides enterprise-grade security controls for API and integration usage within the CEPHO platform. It allows organizations to enforce strict policies on which external services can be accessed, ensuring compliance with corporate security requirements.

## Architecture

### Components

1. **Governance Mode Toggle** (Frontend)
   - Location: Nexus Dashboard header
   - Visual indicator of current security posture
   - Two modes: EVERYTHING and GOVERNED

2. **API Key Management UI** (Frontend)
   - Location: Settings → Integrations page
   - Interface for adding, approving, and managing API keys
   - Real-time status tracking

3. **Governance Service** (Backend)
   - Enforcement logic for API access control
   - Mode management (get/set user preferences)
   - Integration approval workflow
   - Audit logging

4. **Database Schema**
   - `governance_settings`: User mode preferences
   - `approved_integrations`: Approved API keys and services
   - `integration_usage_logs`: Audit trail

## Modes

### EVERYTHING Mode
- **Security Level:** Low
- **Use Case:** Development, testing, personal use
- **Behavior:** All APIs and integrations are available
- **Visual:** Amber/orange shield icon

### GOVERNED Mode
- **Security Level:** High
- **Use Case:** Production, enterprise deployment
- **Behavior:** Only approved APIs can be used
- **Visual:** Green/emerald shield check icon

## Supported Services

The system supports governance for:

- **AI Services:** Microsoft Copilot, OpenAI GPT-4
- **Voice/Video:** ElevenLabs, Synthesia
- **Email:** Microsoft Outlook, Gmail
- **Productivity:** Google Workspace, Slack, Asana
- **Custom:** Any service with API key authentication

## Usage

### For End Users

1. **Check Current Mode:**
   - Look at the Nexus dashboard header
   - Shield icon shows current mode

2. **Request API Access:**
   - Go to Settings → Integrations
   - Click "Add API Key"
   - Select service and enter API key
   - Wait for Chief of Staff approval

### For Administrators (Chief of Staff)

1. **Manage Governance Mode:**
   ```
   - Navigate to Nexus dashboard
   - Click governance toggle to switch modes
   - EVERYTHING: All APIs available
   - GOVERNED: Only approved APIs work
   ```

2. **Approve API Keys:**
   ```
   - Go to Settings → Integrations
   - Scroll to "API Key Management"
   - Review pending integrations (amber badges)
   - Click checkmark to approve
   - Click X to revoke approval
   ```

3. **Audit Usage:**
   ```
   - All API calls are logged in database
   - Query `integration_usage_logs` table
   - Review: user, service, action, success, timestamp
   ```

## API Reference

### Governance Service

```typescript
// Get user's current mode
getGovernanceMode(userId: string): Promise<GovernanceMode>

// Set governance mode
setGovernanceMode(userId: string, mode: 'everything' | 'governed'): Promise<void>

// Check if service is allowed
checkIntegrationAllowed(userId: string, serviceName: string): Promise<IntegrationCheck>

// Log API usage
logIntegrationUsage(userId, integrationId, serviceName, action, success, errorMessage?, metadata?): Promise<void>

// Get approved integrations
getApprovedIntegrations(userId: string): Promise<ApprovedIntegration[]>

// Add new integration
addIntegration(userId, serviceName, serviceType, apiKey, description): Promise<void>

// Approve integration
approveIntegration(integrationId: string, approvedBy: string): Promise<void>

// Revoke approval
revokeIntegration(integrationId: string): Promise<void>

// Delete integration
deleteIntegration(integrationId: string): Promise<void>
```

### Integration Example

```typescript
import { checkIntegrationAllowed, logIntegrationUsage } from './governance.service';

async function callExternalAPI(userId: string, serviceName: string, data: any) {
  // Check if allowed
  const allowed = await checkIntegrationAllowed(userId, serviceName);
  
  if (!allowed.allowed) {
    await logIntegrationUsage(userId, 'api-call', serviceName, 'call', false, allowed.reason);
    throw new Error(allowed.reason);
  }

  // Make API call
  try {
    const result = await externalAPI.call(data);
    await logIntegrationUsage(userId, 'api-call', serviceName, 'call', true);
    return result;
  } catch (error) {
    await logIntegrationUsage(userId, 'api-call', serviceName, 'call', false, error.message);
    throw error;
  }
}
```

## Security Considerations

### API Key Storage
- **Current:** API keys stored in database (plaintext)
- **TODO:** Encrypt API keys before storage
- **Recommendation:** Use environment variables for system-wide keys

### Access Control
- Only Chief of Staff role can approve integrations
- All users can view their own approved integrations
- Audit logs are immutable (insert-only)

### Compliance
- All API usage is logged with timestamps
- Logs include: user, service, action, success/failure
- Retention policy: TBD (recommend 90 days minimum)

## Database Schema

### governance_settings
```sql
CREATE TABLE governance_settings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  mode VARCHAR(20) NOT NULL DEFAULT 'everything',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### approved_integrations
```sql
CREATE TABLE approved_integrations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  service_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  api_key TEXT NOT NULL,
  description TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### integration_usage_logs
```sql
CREATE TABLE integration_usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  integration_id VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Roadmap

### Phase 1 (Complete)
- ✅ Governance mode toggle
- ✅ API key management UI
- ✅ Enforcement service
- ✅ Audit logging
- ✅ Microsoft Copilot integration

### Phase 2 (Planned)
- [ ] API key encryption
- [ ] Role-based access control (RBAC)
- [ ] Audit log viewer UI
- [ ] Compliance reports
- [ ] Integration usage analytics

### Phase 3 (Future)
- [ ] Multi-tenant support
- [ ] Custom approval workflows
- [ ] Integration marketplace
- [ ] Automated compliance checks
- [ ] SSO integration

## Support

For questions or issues with the Governance Mode System:
1. Check this documentation
2. Review audit logs for error messages
3. Contact Chief of Staff for approval requests
4. Submit feedback via help.manus.im
