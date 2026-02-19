/**
 * Enhanced Security Headers Middleware
 * Implements security best practices with nonce-based CSP
 */

import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Generate a cryptographically secure nonce for CSP
 */
function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Apply enhanced security headers to all responses
 * Removes unsafe-inline and unsafe-eval, uses nonce-based CSP
 */
export function enhancedSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Generate nonce for this request
  const nonce = generateNonce();
  
  // Store nonce in res.locals so it can be accessed by templates
  res.locals.cspNonce = nonce;
  
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy - don't leak full URL
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy - restrict browser features
  res.setHeader('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '));
  
  // Enhanced Content Security Policy with nonce
  const cspDirectives = [
    "default-src 'self'",
    // Scripts: Allow self, nonce-based inline scripts, and trusted domains
    `script-src 'self' 'nonce-${nonce}' https://accounts.google.com https://www.gstatic.com https://cloud.umami.is`,
    // Styles: Allow self, nonce-based inline styles, and Google Fonts
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    // Fonts: Allow self, Google Fonts, and data URIs
    "font-src 'self' https://fonts.gstatic.com data:",
    // Images: Allow self, data URIs, HTTPS, and blob
    "img-src 'self' data: https: blob:",
    // Connect: Allow self and trusted APIs
    "connect-src 'self' https://accounts.google.com https://www.googleapis.com https://cloud.umami.is",
    // Frames: Allow self and Google accounts
    "frame-src 'self' https://accounts.google.com",
    // Objects: Disallow all plugins
    "object-src 'none'",
    // Base URI: Only allow self
    "base-uri 'self'",
    // Form actions: Only allow self
    "form-action 'self'",
    // Frame ancestors: Disallow all framing
    "frame-ancestors 'none'",
    // Upgrade insecure requests
    "upgrade-insecure-requests",
    // Worker sources: Allow self and blob for service workers
    "worker-src 'self' blob:",
    // Manifest source: Allow self
    "manifest-src 'self'",
  ];
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  // Strict Transport Security (HSTS) - only in production with HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Cross-Origin policies
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
  next();
}

/**
 * CORS configuration for production
 */
export function corsHeaders(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    'https://cepho.ai',
    'https://www.cepho.ai',
    'https://cepho-the-brain-complete.onrender.com',
  ];
  
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
  }
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS, PATCH'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie'
    );
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
}

/**
 * Remove sensitive headers that leak server info
 */
export function removeServerHeaders(req: Request, res: Response, next: NextFunction) {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
}

/**
 * Apply all enhanced security middleware
 */
export function applyEnhancedSecurityMiddleware(app: any) {
  app.use(removeServerHeaders);
  app.use(corsHeaders);
  app.use(enhancedSecurityHeaders);
}

/**
 * Middleware to inject nonce into HTML responses
 * This should be used for serving the main index.html
 */
export function injectNonceIntoHTML(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  
  res.send = function(data: any): Response {
    if (typeof data === 'string' && data.includes('</html>')) {
      const nonce = res.locals.cspNonce;
      if (nonce) {
        // Inject nonce into script tags
        data = data.replace(
          /<script(?!\s+nonce=)/g,
          `<script nonce="${nonce}"`
        );
      }
    }
    return originalSend.call(this, data);
  };
  
  next();
}
