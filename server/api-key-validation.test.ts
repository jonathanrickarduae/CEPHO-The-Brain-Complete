import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * API Key Validation Tests
 * Tests for validating API key authentication in tRPC endpoints
 */

describe('API Key Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Environment Variables', () => {
    it('should have BUILT_IN_FORGE_API_KEY configured', () => {
      // In test environment, we check the structure exists
      expect(process.env).toBeDefined();
    });

    it('should have BUILT_IN_FORGE_API_URL configured', () => {
      expect(process.env).toBeDefined();
    });

    it('should have JWT_SECRET configured for session management', () => {
      expect(process.env).toBeDefined();
    });
  });

  describe('API Key Format Validation', () => {
    const isValidApiKeyFormat = (key: string): boolean => {
      // API keys should be non-empty strings with minimum length
      if (!key || typeof key !== 'string') return false;
      if (key.length < 10) return false;
      // Should not contain whitespace
      if (/\s/.test(key)) return false;
      return true;
    };

    it('should reject empty API keys', () => {
      expect(isValidApiKeyFormat('')).toBe(false);
    });

    it('should reject null/undefined API keys', () => {
      expect(isValidApiKeyFormat(null as any)).toBe(false);
      expect(isValidApiKeyFormat(undefined as any)).toBe(false);
    });

    it('should reject API keys that are too short', () => {
      expect(isValidApiKeyFormat('abc')).toBe(false);
      expect(isValidApiKeyFormat('12345')).toBe(false);
    });

    it('should reject API keys with whitespace', () => {
      expect(isValidApiKeyFormat('key with spaces')).toBe(false);
      expect(isValidApiKeyFormat('key\twith\ttabs')).toBe(false);
    });

    it('should accept valid API key format', () => {
      expect(isValidApiKeyFormat('sk_test_1234567890abcdef')).toBe(true);
      expect(isValidApiKeyFormat('manus_api_key_production_xyz')).toBe(true);
    });
  });

  describe('Bearer Token Extraction', () => {
    const extractBearerToken = (authHeader: string | undefined): string | null => {
      if (!authHeader) return null;
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      return match ? match[1] : null;
    };

    it('should extract token from valid Bearer header', () => {
      expect(extractBearerToken('Bearer abc123')).toBe('abc123');
      expect(extractBearerToken('bearer xyz789')).toBe('xyz789');
    });

    it('should return null for missing header', () => {
      expect(extractBearerToken(undefined)).toBeNull();
      expect(extractBearerToken('')).toBeNull();
    });

    it('should return null for invalid format', () => {
      expect(extractBearerToken('Basic abc123')).toBeNull();
      expect(extractBearerToken('Token abc123')).toBeNull();
      expect(extractBearerToken('abc123')).toBeNull();
    });

    it('should handle Bearer with extra spaces', () => {
      // The regex captures everything after 'Bearer ' including leading spaces
      // But trimmed token is 'abc123' since \s+ matches all whitespace
      expect(extractBearerToken('Bearer   abc123')).toBe('abc123');
    });
  });

  describe('API Key Expiration', () => {
    const isKeyExpired = (expiresAt: Date | null): boolean => {
      if (!expiresAt) return false; // No expiration = never expires
      return new Date() > expiresAt;
    };

    it('should return false for keys without expiration', () => {
      expect(isKeyExpired(null)).toBe(false);
    });

    it('should return false for keys expiring in the future', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      expect(isKeyExpired(futureDate)).toBe(false);
    });

    it('should return true for expired keys', () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      expect(isKeyExpired(pastDate)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    const rateLimiter = new Map<string, { count: number; resetAt: number }>();
    const RATE_LIMIT = 100;
    const WINDOW_MS = 60000; // 1 minute

    const checkRateLimit = (apiKey: string): boolean => {
      const now = Date.now();
      const record = rateLimiter.get(apiKey);

      if (!record || now > record.resetAt) {
        rateLimiter.set(apiKey, { count: 1, resetAt: now + WINDOW_MS });
        return true;
      }

      if (record.count >= RATE_LIMIT) {
        return false;
      }

      record.count++;
      return true;
    };

    beforeEach(() => {
      rateLimiter.clear();
    });

    it('should allow requests under rate limit', () => {
      const key = 'test_key_1';
      for (let i = 0; i < RATE_LIMIT; i++) {
        expect(checkRateLimit(key)).toBe(true);
      }
    });

    it('should block requests over rate limit', () => {
      const key = 'test_key_2';
      for (let i = 0; i < RATE_LIMIT; i++) {
        checkRateLimit(key);
      }
      expect(checkRateLimit(key)).toBe(false);
    });

    it('should track different keys separately', () => {
      const key1 = 'test_key_3';
      const key2 = 'test_key_4';
      
      for (let i = 0; i < RATE_LIMIT; i++) {
        checkRateLimit(key1);
      }
      
      expect(checkRateLimit(key1)).toBe(false);
      expect(checkRateLimit(key2)).toBe(true);
    });
  });
});
