# Security Configuration Guide

## Overview

CEPHO.AI implements comprehensive security measures to protect against common web vulnerabilities including XSS, CSRF, clickjacking, and data leakage.

---

## Security Headers

### Content Security Policy (CSP)

**Current Implementation**: Enhanced nonce-based CSP

The application uses a strict Content Security Policy that:
- **Removes** `unsafe-inline` and `unsafe-eval` directives
- **Uses** cryptographically secure nonces for inline scripts
- **Restricts** script sources to trusted domains only
- **Prevents** XSS attacks through strict source whitelisting

#### CSP Directives

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Default policy for all resources |
| `script-src` | `'self' 'nonce-{random}' trusted-domains` | Scripts from self and trusted sources only |
| `style-src` | `'self' 'nonce-{random}' fonts.googleapis.com` | Styles from self and Google Fonts |
| `font-src` | `'self' fonts.gstatic.com data:` | Fonts from self and Google |
| `img-src` | `'self' data: https: blob:` | Images from various sources |
| `connect-src` | `'self' trusted-apis` | API connections to trusted endpoints |
| `frame-src` | `'self' accounts.google.com` | Frames only from self and Google |
| `object-src` | `'none'` | No plugins allowed |
| `base-uri` | `'self'` | Prevent base tag hijacking |
| `form-action` | `'self'` | Forms can only submit to self |
| `frame-ancestors` | `'none'` | Prevent clickjacking |
| `worker-src` | `'self' blob:` | Service workers from self |
| `manifest-src` | `'self'` | PWA manifest from self |

### Other Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | Enable XSS filter (legacy) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS (production only) |
| `Permissions-Policy` | Restrictive | Disable unnecessary browser features |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Prevent cross-origin resource loading |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolate browsing context |
| `Cross-Origin-Resource-Policy` | `same-origin` | Restrict resource sharing |

---

## Nonce-Based CSP Implementation

### How It Works

1. **Server generates nonce**: A cryptographically secure random nonce is generated for each request
2. **Nonce in headers**: The nonce is included in the CSP header
3. **Nonce in HTML**: The same nonce is injected into inline script tags
4. **Browser validates**: Browser only executes scripts with matching nonce

### Example

**Request 1:**
```html
<!-- CSP Header -->
Content-Security-Policy: script-src 'self' 'nonce-abc123xyz'

<!-- HTML -->
<script nonce="abc123xyz">
  // This script will execute
</script>

<script>
  // This script will be blocked (no nonce)
</script>
```

**Request 2:**
```html
<!-- CSP Header -->
Content-Security-Policy: script-src 'self' 'nonce-def456uvw'

<!-- HTML -->
<script nonce="def456uvw">
  // This script will execute
</script>
```

### Benefits

- **Prevents XSS**: Attackers cannot inject scripts without knowing the nonce
- **Unique per request**: Each request gets a new random nonce
- **No unsafe-inline**: Removes the need for dangerous CSP directives
- **Maintains functionality**: Legitimate inline scripts still work

---

## CORS Configuration

### Allowed Origins

**Production:**
- `https://cepho.ai`
- `https://www.cepho.ai`
- `https://cepho-the-brain-complete.onrender.com`

**Development:**
- `http://localhost:5173`
- `http://localhost:3000`

### CORS Headers

- `Access-Control-Allow-Origin`: Dynamically set based on request origin
- `Access-Control-Allow-Credentials`: `true` (cookies allowed)
- `Access-Control-Allow-Methods`: `GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers`: Standard headers plus `Authorization` and `Cookie`
- `Access-Control-Max-Age`: `86400` (24 hours)

---

## Rate Limiting

### Configuration

- **Window**: 15 minutes
- **Max requests**: 100 per window per IP
- **Skip conditions**: Health checks, metrics endpoints
- **Headers**: Rate limit info included in responses

### Rate Limit Headers

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Timestamp when window resets

---

## Authentication Security

### Session Management

- **Cookie-based sessions**: HttpOnly, Secure, SameSite=Strict
- **Session expiration**: Configurable timeout
- **CSRF protection**: SameSite cookie attribute

### Password Security

- **Hashing**: bcrypt with salt
- **Minimum complexity**: Enforced on registration
- **Rate limiting**: Applied to login attempts

---

## Permissions Policy

Restricts browser features to prevent abuse:

- `camera=()` - No camera access
- `microphone=()` - No microphone access
- `geolocation=()` - No geolocation access
- `payment=()` - No payment API access
- `usb=()` - No USB access
- `magnetometer=()` - No magnetometer access
- `gyroscope=()` - No gyroscope access
- `accelerometer=()` - No accelerometer access

---

## Implementation Files

### Backend

- `server/middleware/security-headers-enhanced.ts` - Enhanced security headers with nonce
- `server/middleware/security-headers.ts` - Original security headers (legacy)
- `server/_core/rateLimit.ts` - Rate limiting configuration

### Frontend

- `client/vite-plugin-csp-nonce.ts` - Vite plugin for nonce injection
- `client/index.html` - HTML template with nonce placeholders

---

## Migration from Legacy CSP

### Phase 1: Enhanced Headers (Current)
- Implement nonce generation
- Add nonce to CSP headers
- Inject nonce into HTML
- Test with both old and new CSP

### Phase 2: Remove unsafe-inline (Next)
- Update all inline scripts to use nonce
- Remove `unsafe-inline` from CSP
- Remove `unsafe-eval` from CSP
- Comprehensive testing

### Phase 3: Monitoring (Ongoing)
- Monitor CSP violation reports
- Track blocked resources
- Adjust CSP as needed

---

## Testing Security Headers

### Manual Testing

```bash
# Check security headers
curl -I https://cepho.ai

# Expected headers:
# Content-Security-Policy: ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: ...
```

### Automated Testing

Use security header testing tools:
- [Security Headers](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com)

---

## Security Checklist

- [x] Content Security Policy implemented
- [x] Nonce-based CSP for inline scripts
- [x] X-Frame-Options set to DENY
- [x] X-Content-Type-Options set to nosniff
- [x] HSTS enabled in production
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] Cookie security (HttpOnly, Secure, SameSite)
- [x] Permissions Policy restrictive
- [x] Cross-Origin policies set
- [x] Server headers removed (X-Powered-By)
- [x] CSRF protection via SameSite cookies

---

## Monitoring and Alerts

### CSP Violation Reports

Configure CSP reporting to track violations:

```javascript
// Add to CSP directives
"report-uri /api/csp-report"
```

### Sentry Integration

Security errors are automatically reported to Sentry:
- CSP violations
- Authentication failures
- Rate limit violations
- Suspicious activity

---

## Best Practices

1. **Keep CSP strict**: Only add trusted domains to CSP
2. **Use nonces**: Prefer nonces over unsafe-inline
3. **Monitor violations**: Track and investigate CSP violations
4. **Regular audits**: Run security header tests regularly
5. **Update dependencies**: Keep security packages up to date
6. **Test thoroughly**: Test security changes in staging first
7. **Document changes**: Keep this document updated

---

## Resources

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Security Headers Best Practices](https://securityheaders.com)

---

## Support

For security concerns or questions:
- Email: security@cepho.ai
- GitHub Issues: Security label
- Emergency: Contact development team directly
