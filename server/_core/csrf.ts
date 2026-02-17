import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF token store (in production, use Redis or database)
const tokenStore = new Map<string, { token: string; expires: number }>();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(tokenStore.entries());
  for (const [key, value] of entries) {
    if (value.expires < now) {
      tokenStore.delete(key);
    }
  }
}, 60 * 1000); // Clean every minute

/**
 * Generate a CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour expiry
  
  tokenStore.set(sessionId, { token, expires });
  
  return token;
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId);
  
  if (!stored) return false;
  if (stored.expires < Date.now()) {
    tokenStore.delete(sessionId);
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(stored.token),
    Buffer.from(token)
  );
}

/**
 * CSRF protection middleware
 * Skips GET, HEAD, OPTIONS requests (safe methods)
 * Validates token from X-CSRF-Token header or _csrf body field
 */
export function csrfProtection(options: { 
  skip?: (req: Request) => boolean;
  cookie?: boolean;
} = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Allow custom skip logic
    if (options.skip?.(req)) {
      return next();
    }

    // Get session ID from cookie or header
    const sessionId = req.cookies?.['session_id'] || 
                      req.headers['x-session-id'] as string ||
                      req.ip || 'anonymous';

    // Get token from header or body
    const token = req.headers['x-csrf-token'] as string || 
                  req.body?._csrf;

    if (!token) {
      res.status(403).json({
        error: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token is required for this request'
      });
      return;
    }

    if (!validateCsrfToken(sessionId, token)) {
      res.status(403).json({
        error: 'CSRF_TOKEN_INVALID',
        message: 'Invalid or expired CSRF token'
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to generate and attach CSRF token to response
 */
export function csrfTokenGenerator(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.['session_id'] || 
                    req.headers['x-session-id'] as string ||
                    req.ip || 'anonymous';

  const token = generateCsrfToken(sessionId);
  
  // Attach token to response locals for templates
  res.locals.csrfToken = token;
  
  // Also set as cookie for SPA access
  res.cookie('csrf-token', token, {
    httpOnly: false, // Allow JS access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000 // 1 hour
  });

  next();
}

/**
 * API endpoint to get a fresh CSRF token
 */
export function getCsrfTokenEndpoint(req: Request, res: Response) {
  const sessionId = req.cookies?.['session_id'] || 
                    req.headers['x-session-id'] as string ||
                    req.ip || 'anonymous';

  const token = generateCsrfToken(sessionId);
  
  res.json({ csrfToken: token });
}
