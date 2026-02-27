/**
 * CSRF Protection Middleware
 * Implements Double Submit Cookie pattern for CSRF protection
 *
 * Priority 1 - SEC-02
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * CSRF token generation middleware
 * Generates and sets CSRF token in cookie
 */
export function csrfTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip for safe methods (GET, HEAD, OPTIONS)
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Generate token if not exists
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  next();
}

/**
 * CSRF validation middleware
 * Validates CSRF token from header matches cookie
 */
export function csrfValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip for health check and metrics endpoints
  if (req.path.startsWith("/health") || req.path === "/api/metrics") {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  // Validate tokens exist
  if (!cookieToken) {
    return res.status(403).json({
      error: "CSRF token missing",
      message: "CSRF protection requires a valid token cookie",
    });
  }

  if (!headerToken) {
    return res.status(403).json({
      error: "CSRF token missing",
      message: "CSRF protection requires X-CSRF-Token header",
    });
  }

  // Validate tokens match (constant-time comparison)
  if (
    !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    return res.status(403).json({
      error: "CSRF token invalid",
      message: "CSRF token validation failed",
    });
  }

  next();
}

/**
 * Endpoint to get CSRF token for client
 * GET /api/csrf-token
 */
export function csrfTokenHandler(req: Request, res: Response) {
  const token = req.cookies[CSRF_COOKIE_NAME] || generateToken();

  // Set cookie if not exists
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  res.json({ csrfToken: token });
}
