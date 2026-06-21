# CEPHO.AI — Security Configuration (v11)

**Version**: 2.0 (v11)
**Last Updated**: March 2, 2026
**Status**: Final

---

## 1. Security Posture Overview

This document outlines the definitive security configuration for the CEPHO.AI v11 platform. The architecture has been hardened based on the remediation plan, focusing on three core pillars: **Authentication & Authorization**, **Application Security**, and **Infrastructure Security**.

## 2. Authentication & Authorization

- **Provider:** Authentication has been fully migrated to **Supabase Auth**.
- **Method:** Secure JWT-based authentication is used for all API requests. The legacy email/password and sJWT system has been deprecated.
- **Authorization:** All database access is now governed by **Row-Level Security (RLS)** policies. This is a critical enhancement that ensures strict data isolation and prevents unauthorized data access.
- **Session Management:** Sessions are managed via secure, `HttpOnly` cookies handled automatically by the Supabase client libraries.

## 3. Application Security

### 3.1. Content Security Policy (CSP)

A strict, nonce-based CSP is enforced to mitigate XSS attacks. `unsafe-inline` and `unsafe-eval` are disallowed.

| Directive         | Value                          |
| :---------------- | :----------------------------- |
| `default-src`     | `self`                         |
| `script-src`      | `self`, `nonce-{random}`       |
| `style-src`       | `self`, `nonce-{random}`       |
| `img-src`         | `self`, data:, blob:           |
| `connect-src`     | `self`, `*.supabase.co`        |
| `frame-ancestors` | `none` (prevents clickjacking) |
| `form-action`     | `self`                         |
| `object-src`      | `none`                         |

### 3.2. Other Security Headers

| Header                      | Value                                           | Purpose                                |
| :-------------------------- | :---------------------------------------------- | :------------------------------------- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload`  | Enforces HTTPS.                        |
| `X-Content-Type-Options`    | `nosniff`                                       | Prevents MIME sniffing.                |
| `X-Frame-Options`           | `DENY`                                          | Prevents clickjacking.                 |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`               | Controls referrer information.         |
| `Permissions-Policy`        | Restrictive (camera, microphone, etc. disabled) | Disables unnecessary browser features. |

### 3.3. CORS Configuration

CORS is configured to only allow requests from the official frontend domains (`cepho.ai`, `*.onrender.com`) and `localhost` during development.

### 3.4. Rate Limiting

API rate limiting is enforced on sensitive endpoints (e.g., login, password reset) to prevent brute-force attacks. The standard configuration is 100 requests per 15-minute window per IP.

## 4. Infrastructure Security

- **Hosting:** The application is hosted on Render, which provides a secure, managed infrastructure.
- **Database:** The Supabase PostgreSQL database is secured with network policies, and direct access is restricted. All connections require SSL.
- **Environment Variables:** All secrets and API keys are managed securely as environment variables in Render. There are no hardcoded secrets in the codebase.
- **Dependencies:** All dependencies are regularly scanned for vulnerabilities using `pnpm audit`.

## 5. Security Policy

The official security policy, including vulnerability disclosure and reporting guidelines, is documented in the root `SECURITY.md` file.
