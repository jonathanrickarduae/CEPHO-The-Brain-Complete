import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

/**
 * Global rate limiter for all API endpoints
 * Limits: 100 requests per 15 minutes per IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests",
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter: res.getHeader("RateLimit-Reset"),
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many login attempts",
      message: "Account temporarily locked. Please try again in 15 minutes.",
      retryAfter: res.getHeader("RateLimit-Reset"),
    });
  },
});

/**
 * Moderate rate limiter for API endpoints that perform heavy operations
 * Limits: 20 requests per 15 minutes per IP
 */
export const heavyOperationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: "Too many requests for this resource, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "This operation is rate-limited. Please try again later.",
      retryAfter: res.getHeader("RateLimit-Reset"),
    });
  },
});

/**
 * Lenient rate limiter for read-only endpoints
 * Limits: 300 requests per 15 minutes per IP
 */
export const readOnlyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
