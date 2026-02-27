import validator from "validator";
import type { Request, Response, NextFunction } from "express";

/**
 * Input Sanitization Middleware
 * Prevents XSS attacks by sanitizing user inputs
 */

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return input;

  // Escape HTML entities
  return validator.escape(input);
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  if (!validator.isEmail(email)) {
    return null;
  }
  return validator.normalizeEmail(email) || email;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string): string | null {
  if (
    !validator.isURL(url, {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  ) {
    return null;
  }
  return url;
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string | null {
  if (!validator.isMobilePhone(phone, "any")) {
    return null;
  }
  return phone;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

/**
 * Middleware to sanitize query parameters
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction) {
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }
  next();
}

/**
 * Middleware to sanitize URL parameters
 */
export function sanitizeParams(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeObject(req.params);
  }
  next();
}

/**
 * Apply all sanitization middleware
 */
export function applySanitizationMiddleware(app: any) {
  app.use(sanitizeBody);
  app.use(sanitizeQuery);
  app.use(sanitizeParams);
}

/**
 * Validation helpers
 */
export const validators = {
  isEmail: (email: string) => validator.isEmail(email),
  isURL: (url: string) => validator.isURL(url),
  isPhone: (phone: string) => validator.isMobilePhone(phone, "any"),
  isAlphanumeric: (str: string) => validator.isAlphanumeric(str),
  isNumeric: (str: string) => validator.isNumeric(str),
  isLength: (str: string, min: number, max: number) =>
    validator.isLength(str, { min, max }),
  isStrongPassword: (password: string) =>
    validator.isStrongPassword(password, {
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
};
