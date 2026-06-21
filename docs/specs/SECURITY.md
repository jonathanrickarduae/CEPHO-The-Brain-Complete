# Security Policy

## Supported Versions

| Version              | Supported |
| :------------------- | :-------- |
| Latest (main branch) | ✅ Yes    |
| Older versions       | ❌ No     |

---

## Reporting a Vulnerability

If you discover a security vulnerability in CEPHO.AI, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email: security@cepho.ai

Include in your report:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested remediation

We will acknowledge your report within 48 hours and aim to resolve critical vulnerabilities within 7 days.

---

## Security Standards

### Authentication

All API endpoints are protected by Supabase JWT authentication. Tokens expire after 1 hour. Refresh tokens are stored in httpOnly cookies and expire after 7 days. There is no anonymous access to any protected resource.

### Authorisation

All database queries are scoped to the authenticated user's ID. Row-Level Security (RLS) is enforced at the database level in Supabase, meaning even if application-level checks are bypassed, the database will reject unauthorised queries.

### Secrets Management

All secrets and API keys are stored as environment variables in Render's encrypted secrets store. No secrets are committed to the repository. The CI/CD pipeline uses TruffleHog to scan for accidental secret commits on every push.

### Data Encryption

All data in transit is encrypted via TLS 1.3. All data at rest is encrypted by Supabase (AES-256). S3 buckets use server-side encryption (SSE-S3).

### Rate Limiting

All API endpoints are rate-limited. AI endpoints are limited to 100 requests per user per hour. Authentication endpoints are limited to 10 attempts per IP per 15 minutes.

### CSRF Protection

All state-changing requests (POST, PUT, DELETE) require a valid CSRF token. Tokens are issued via the `/api/csrf-token` endpoint and must be included in the `X-CSRF-Token` header.

### Dependency Management

Dependencies are audited monthly using `pnpm audit`. Critical vulnerabilities must be patched within 7 days. High vulnerabilities must be patched within 30 days.

---

## Security Checklist (Pre-Deploy)

Before every production deployment, verify:

- [ ] `pnpm audit --audit-level=critical` passes with zero critical vulnerabilities
- [ ] TruffleHog scan shows no detected secrets
- [ ] All environment variables are set in Render (not hardcoded)
- [ ] MOCK_ADMIN_USER bypass is not present in `server/_core/context.ts`
- [ ] Hardcoded PIN is not present in `client/src/pages/LandingPage.tsx`
- [ ] RLS policies are active on all Supabase tables
- [ ] Session secret is at least 32 characters and randomly generated
- [ ] CSRF secret is at least 32 characters and randomly generated

---

## Incident Response

If a security incident is detected:

1. **Immediately** rotate all API keys and secrets via Render dashboard
2. **Immediately** revoke all active Supabase sessions
3. Assess the scope of the breach (which data, which users, what time window)
4. Notify affected users within 72 hours (GDPR requirement)
5. Document the incident in `docs/incidents/YYYY-MM-DD-incident.md`
6. Conduct a post-mortem within 5 business days
7. Implement preventive measures and update this policy
