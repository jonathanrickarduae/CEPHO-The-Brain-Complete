# CEPHO Penetration Testing Plan (OWASP Checklist)

**Version:** 2.0  
**Date:** 2026-03-03  
**Standard:** OWASP Testing Guide v4.2 / OWASP Top 10 2021  
**Scope:** cepho.ai (production) + staging environment  
**Frequency:** Quarterly (Jan, Apr, Jul, Oct) + after every major release

---

## 1. Objectives

- Identify and classify security vulnerabilities in the application and infrastructure.
- Assess the business impact of identified vulnerabilities.
- Provide clear, actionable recommendations for remediation.
- Verify that remediations have been successfully implemented.
- Improve the overall security posture of the platform continuously.

---

## 2. Scope

| Surface                                | In Scope                 |
| -------------------------------------- | ------------------------ |
| Web application (cepho.ai)             | Yes                      |
| REST API (`/api/*`)                    | Yes                      |
| tRPC endpoints (`/api/trpc/*`)         | Yes                      |
| Webhook endpoints (`/api/webhooks/*`)  | Yes                      |
| Authentication flows (Supabase Auth)   | Yes                      |
| Admin dashboard (`/admin`)             | Yes                      |
| File upload endpoints                  | Yes                      |
| Third-party integrations (OAuth flows) | Yes                      |
| Supabase database (network layer)      | No — managed by Supabase |
| Render infrastructure                  | No — managed by Render   |

---

## 3. Methodology

Testing is conducted in **grey-box** mode: the testing team has access to user accounts and architectural documentation, but not source code. The primary framework is the **OWASP Top 10 2021**.

### Testing Process

1. **Information Gathering** — Map all endpoints, authentication flows, and data models.
2. **Vulnerability Analysis** — Automated scanning (OWASP ZAP, Nikto) + manual probing.
3. **Exploitation** — Attempt to exploit identified vulnerabilities to confirm impact.
4. **Post-Exploitation** — Assess lateral movement, data exfiltration, and privilege escalation.
5. **Reporting** — Document all findings with CVSS scores and remediation steps.
6. **Retest** — Verify all critical/high findings are remediated before sign-off.

---

## 4. OWASP Top 10 Checklist

### A01: Broken Access Control

| Test                                                                | Method                                                 | Expected Result                    | Status |
| ------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------- | ------ |
| Vertical privilege escalation — access admin routes as regular user | `GET /admin` without ADMIN role                        | 403 Forbidden                      | ☐      |
| Horizontal privilege escalation — access another user's data        | `GET /api/trpc/tasks.list` with another user's session | 403 / empty result                 | ☐      |
| IDOR on task/project IDs                                            | Enumerate task IDs in requests                         | 403 for non-owned resources        | ☐      |
| Forced browsing to unprotected routes                               | Navigate to `/admin`, `/api/trpc/*` without auth       | 401 Unauthorized                   | ☐      |
| JWT token manipulation                                              | Modify JWT payload (userId, role)                      | 401 / signature validation failure | ☐      |
| RLS bypass via direct Supabase API                                  | Call Supabase REST API directly with anon key          | Only own data returned             | ☐      |

### A02: Cryptographic Failures

| Test                         | Method                              | Expected Result                          | Status |
| ---------------------------- | ----------------------------------- | ---------------------------------------- | ------ |
| HTTPS enforcement            | `HTTP GET http://cepho.ai`          | 301 redirect to HTTPS                    | ☐      |
| HSTS header present          | Check response headers              | `Strict-Transport-Security` present      | ☐      |
| Sensitive data in URL params | Check for tokens/passwords in URL   | None found                               | ☐      |
| Sensitive data in logs       | Review server logs for PII / tokens | No PII in logs                           | ☐      |
| Cookie security flags        | Inspect session cookies             | `Secure`, `HttpOnly`, `SameSite=Strict`  | ☐      |
| Weak JWT algorithm           | Decode JWT header                   | Algorithm is RS256 or HS256 (not `none`) | ☐      |

### A03: Injection

| Test                              | Method                                              | Expected Result                              | Status |
| --------------------------------- | --------------------------------------------------- | -------------------------------------------- | ------ |
| SQL injection via tRPC inputs     | Inject `'; DROP TABLE tasks; --` into string inputs | Zod validation rejects / parameterised query | ☐      |
| NoSQL injection                   | Inject `{"$gt": ""}` into JSON inputs               | Zod validation rejects                       | ☐      |
| Command injection via file upload | Upload file with malicious filename                 | Sanitised filename stored                    | ☐      |
| XSS via stored content            | Inject `<script>alert(1)</script>` into task names  | Escaped on render                            | ☐      |
| XSS via reflected params          | Inject script in URL params                         | Escaped / CSP blocks execution               | ☐      |
| SSTI in document templates        | Inject `{{7*7}}` in template fields                 | Not evaluated / escaped                      | ☐      |

### A04: Insecure Design

| Test                                          | Method                                  | Expected Result                       | Status |
| --------------------------------------------- | --------------------------------------- | ------------------------------------- | ------ |
| Rate limiting on auth endpoints               | Send 100 login requests in 60 seconds   | 429 Too Many Requests after threshold | ☐      |
| Rate limiting on AI endpoints                 | Send 100 AI chat requests in 60 seconds | 429 after threshold                   | ☐      |
| Brute force protection on PIN gate            | Attempt 20 incorrect PINs               | Account lockout or CAPTCHA            | ☐      |
| Mass assignment via tRPC                      | Send extra fields in mutation input     | Extra fields ignored by Zod           | ☐      |
| Insecure direct object reference in file URLs | Enumerate S3/storage URLs               | Pre-signed URLs with expiry           | ☐      |

### A05: Security Misconfiguration

| Test                           | Method                                  | Expected Result                                      | Status |
| ------------------------------ | --------------------------------------- | ---------------------------------------------------- | ------ |
| Default credentials            | Test common admin credentials           | No default credentials accepted                      | ☐      |
| Verbose error messages         | Trigger server errors                   | No stack traces in production responses              | ☐      |
| Security headers present       | Check all response headers              | CSP, X-Frame-Options, X-Content-Type-Options present | ☐      |
| CORS misconfiguration          | Send cross-origin request from evil.com | Rejected by CORS policy                              | ☐      |
| Directory listing              | `GET /api/`                             | 404 / no directory listing                           | ☐      |
| Exposed `.env` or config files | `GET /.env`, `GET /config.json`         | 404                                                  | ☐      |
| Debug endpoints in production  | `GET /api/debug`, `GET /api/test`       | 404                                                  | ☐      |

### A06: Vulnerable and Outdated Components

| Test                            | Method                              | Expected Result                      | Status |
| ------------------------------- | ----------------------------------- | ------------------------------------ | ------ |
| `pnpm audit` — no critical CVEs | Run `pnpm audit --audit-level=high` | 0 high/critical vulnerabilities      | ☐      |
| Snyk scan                       | Run `snyk test`                     | 0 critical issues                    | ☐      |
| Outdated Node.js version        | Check `node --version`              | LTS version (22.x)                   | ☐      |
| Outdated npm packages           | Run `pnpm outdated`                 | No packages >2 major versions behind | ☐      |

### A07: Identification and Authentication Failures

| Test                                | Method                                 | Expected Result                        | Status |
| ----------------------------------- | -------------------------------------- | -------------------------------------- | ------ |
| Session fixation                    | Reuse session token after login        | New session token issued on login      | ☐      |
| Session token in URL                | Check for session tokens in URLs       | No session tokens in URLs              | ☐      |
| Concurrent session limit            | Login from 5 different devices         | Sessions managed per Supabase policy   | ☐      |
| Password reset flow                 | Test reset token expiry and single-use | Token expires after 1 hour, single-use | ☐      |
| 2FA bypass                          | Attempt to skip 2FA step               | 2FA cannot be bypassed                 | ☐      |
| Account enumeration via login error | Test login with valid vs invalid email | Same error message for both            | ☐      |

### A08: Software and Data Integrity Failures

| Test                           | Method                                | Expected Result            | Status |
| ------------------------------ | ------------------------------------- | -------------------------- | ------ |
| Webhook signature verification | Send webhook without HMAC signature   | 401 Unauthorized           | ☐      |
| Webhook replay attack          | Resend a valid webhook payload        | Rejected (timestamp check) | ☐      |
| Subresource integrity          | Check CDN-loaded scripts              | SRI hashes present         | ☐      |
| CI/CD pipeline integrity       | Check for unapproved code in pipeline | Branch protection enforced | ☐      |

### A09: Security Logging and Monitoring Failures

| Test                                 | Method                             | Expected Result                   | Status |
| ------------------------------------ | ---------------------------------- | --------------------------------- | ------ |
| Failed login attempts logged         | Attempt 5 failed logins            | All attempts in audit_logs        | ☐      |
| Privilege escalation attempts logged | Attempt to access admin route      | Attempt logged in audit_logs      | ☐      |
| Alert on anomalous activity          | Trigger 50 API calls in 10 seconds | Anomaly alert generated           | ☐      |
| Log retention                        | Check log retention policy         | Logs retained for 90 days minimum | ☐      |

### A10: Server-Side Request Forgery (SSRF)

| Test                            | Method                                                   | Expected Result      | Status |
| ------------------------------- | -------------------------------------------------------- | -------------------- | ------ |
| SSRF via URL ingestion endpoint | Submit `http://169.254.169.254/latest/meta-data/` as URL | Blocked by allowlist | ☐      |
| SSRF via webhook URL            | Register webhook pointing to internal service            | Blocked by allowlist | ☐      |
| SSRF via image/document URL     | Submit internal IP as document URL                       | Blocked              | ☐      |

---

## 5. Additional Tests

### File Upload Security

| Test                                                   | Expected Result                  | Status |
| ------------------------------------------------------ | -------------------------------- | ------ |
| Upload executable file (`.exe`, `.sh`)                 | Rejected by file type validation | ☐      |
| Upload file with double extension (`evil.pdf.exe`)     | Rejected                         | ☐      |
| Upload oversized file (>50MB)                          | Rejected with 413                | ☐      |
| Upload file with malicious content (EICAR test string) | Rejected or quarantined          | ☐      |
| Path traversal in filename (`../../etc/passwd`)        | Sanitised filename               | ☐      |

### API Security

| Test                                                 | Expected Result              | Status |
| ---------------------------------------------------- | ---------------------------- | ------ |
| Unauthenticated access to protected tRPC procedures  | 401 UNAUTHORIZED             | ☐      |
| Expired JWT token                                    | 401 UNAUTHORIZED             | ☐      |
| Malformed JWT token                                  | 401 UNAUTHORIZED             | ☐      |
| Request without CSRF token (state-changing requests) | 403 FORBIDDEN                | ☐      |
| Oversized request body (>10MB)                       | 413 Request Entity Too Large | ☐      |

---

## 6. Tools

| Tool                                                           | Purpose                                 |
| -------------------------------------------------------------- | --------------------------------------- |
| [OWASP ZAP](https://www.zaproxy.org/)                          | Automated web app scanning              |
| [Burp Suite Community](https://portswigger.net/burp)           | Manual request interception and testing |
| [pnpm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) | Dependency vulnerability scanning       |
| [Snyk](https://snyk.io/)                                       | Continuous dependency monitoring        |
| [jwt.io](https://jwt.io/)                                      | JWT token inspection and manipulation   |
| [sqlmap](https://sqlmap.org/)                                  | Automated SQL injection testing         |
| [nikto](https://cirt.net/Nikto2)                               | Web server misconfiguration scanning    |

---

## 7. Schedule and Frequency

| Type                                     | Frequency                 | Responsible                               |
| ---------------------------------------- | ------------------------- | ----------------------------------------- |
| Automated dependency scan (`pnpm audit`) | Every CI/CD run           | CI/CD pipeline                            |
| Automated OWASP ZAP scan                 | Weekly (staging)          | CI/CD pipeline                            |
| Full manual penetration test             | Quarterly                 | External security firm or senior engineer |
| Ad-hoc test                              | After every major release | Engineering team                          |

---

## 8. Reporting and Remediation

All findings are logged as GitHub Issues with the `security` label. Remediation deadlines:

| Severity | CVSS Score | Deadline |
| -------- | ---------- | -------- |
| Critical | 9.0–10.0   | 24 hours |
| High     | 7.0–8.9    | 7 days   |
| Medium   | 4.0–6.9    | 30 days  |
| Low      | 0.1–3.9    | 90 days  |

A retest is conducted after each remediation to confirm the fix. The CTO or security lead must sign off before any critical/high finding is closed.

---

## 9. Responsible Disclosure

External security researchers should report vulnerabilities to **security@cepho.ai**. CEPHO operates a responsible disclosure policy with a 90-day remediation window before public disclosure. Researchers who responsibly disclose valid findings are acknowledged in our security hall of fame.

---

_This document is reviewed and updated quarterly by the engineering team._
