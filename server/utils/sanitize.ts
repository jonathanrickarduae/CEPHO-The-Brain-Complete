/**
 * Input Sanitization Utility
 * Prevents XSS, SQL injection, and other injection attacks
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove vbscript: protocol
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  // Remove dangerous tags
  const dangerousTags = ['iframe', 'embed', 'object', 'applet', 'meta', 'link', 'style', 'base'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing tags
    const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    sanitized = sanitized.replace(selfClosing, '');
  });
  
  return sanitized.trim();
}

/**
 * Sanitize text input
 * Removes control characters and normalizes whitespace
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  // Remove control characters except newlines and tabs
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: string): string {
  if (!input) return '';
  
  // Convert to lowercase and trim
  let sanitized = input.toLowerCase().trim();
  
  // Remove any characters that aren't valid in email addresses
  sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, '');
  
  // Basic email validation
  const emailRegex = /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitize URL
 * Only allows http, https, and mailto protocols
 */
export function sanitizeUrl(input: string): string {
  if (!input) return '';
  
  const trimmed = input.trim();
  
  // Check for allowed protocols
  const allowedProtocols = ['http://', 'https://', 'mailto:'];
  const hasAllowedProtocol = allowedProtocols.some(protocol => 
    trimmed.toLowerCase().startsWith(protocol)
  );
  
  if (!hasAllowedProtocol) {
    // If no protocol, assume https
    return `https://${trimmed}`;
  }
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const hasDangerousProtocol = dangerousProtocols.some(protocol =>
    trimmed.toLowerCase().startsWith(protocol)
  );
  
  if (hasDangerousProtocol) {
    return '';
  }
  
  return trimmed;
}

/**
 * Sanitize filename
 * Removes path traversal attempts and dangerous characters
 */
export function sanitizeFilename(input: string): string {
  if (!input) return '';
  
  // Remove path traversal attempts
  let sanitized = input.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[/\\]/g, '');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }
  
  return sanitized.trim();
}

/**
 * Sanitize SQL input (for use in raw queries)
 * Note: Prefer parameterized queries over this
 */
export function sanitizeSql(input: string): string {
  if (!input) return '';
  
  // Escape single quotes
  let sanitized = input.replace(/'/g, "''");
  
  // Remove SQL comments
  sanitized = sanitized.replace(/--.*$/gm, '');
  sanitized = sanitized.replace(/\/\*.*?\*\//g, '');
  
  // Remove dangerous SQL keywords (basic protection)
  const dangerousKeywords = [
    'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE',
    'EXEC', 'EXECUTE', 'SCRIPT', 'UNION'
  ];
  
  dangerousKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized;
}

/**
 * Sanitize JSON input
 */
export function sanitizeJson(input: string): string {
  if (!input) return '';
  
  try {
    // Parse and re-stringify to ensure valid JSON
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return '';
  }
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: any): number | null {
  const num = Number(input);
  return isNaN(num) || !isFinite(num) ? null : num;
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    const lower = input.toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  return Boolean(input);
}

/**
 * Sanitize object recursively
 * Applies appropriate sanitization to each field
 */
export function sanitizeObject(
  obj: Record<string, any>,
  schema?: Record<string, 'text' | 'html' | 'email' | 'url' | 'number' | 'boolean'>
): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }
    
    const type = schema?.[key];
    
    switch (type) {
      case 'text':
        sanitized[key] = sanitizeText(String(value));
        break;
      case 'html':
        sanitized[key] = sanitizeHtml(String(value));
        break;
      case 'email':
        sanitized[key] = sanitizeEmail(String(value));
        break;
      case 'url':
        sanitized[key] = sanitizeUrl(String(value));
        break;
      case 'number':
        sanitized[key] = sanitizeNumber(value);
        break;
      case 'boolean':
        sanitized[key] = sanitizeBoolean(value);
        break;
      default:
        // No schema - apply basic sanitization
        if (typeof value === 'string') {
          sanitized[key] = sanitizeText(value);
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
    }
  }
  
  return sanitized;
}

/**
 * Strip HTML tags completely
 */
export function stripHtml(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Truncate string to max length
 */
export function truncate(input: string, maxLength: number): string {
  if (!input || input.length <= maxLength) return input;
  return input.substring(0, maxLength - 3) + '...';
}
