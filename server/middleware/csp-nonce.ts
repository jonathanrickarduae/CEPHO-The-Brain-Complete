/**
 * CSP Nonce Middleware
 *
 * Generates a cryptographically secure, per-request nonce and attaches it to
 * `res.locals.cspNonce`. The nonce is then injected into the HTML <script> tags
 * and the Content-Security-Policy header, eliminating the need for `unsafe-inline`.
 *
 * Usage:
 *   1. Apply this middleware BEFORE Helmet/security-headers.
 *   2. Use `res.locals.cspNonce` in your HTML template.
 *   3. The Helmet CSP config reads `res.locals.cspNonce` via the callback form.
 */

import { randomBytes } from "crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * Generates a URL-safe base64 nonce (16 bytes = 128 bits of entropy).
 */
function generateNonce(): string {
  return randomBytes(16).toString("base64url");
}

/**
 * Middleware: attaches a fresh nonce to every response via `res.locals.cspNonce`.
 */
export function cspNonceMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.cspNonce = generateNonce();
  next();
}
