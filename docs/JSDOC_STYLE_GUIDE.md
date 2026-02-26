# JSDoc Style Guide

**Priority 2 - CODE-04: Add JSDoc Comments**

This document defines the JSDoc documentation standards for the CEPHO.AI codebase.

---

## Why JSDoc?

- **Better IDE Support:** Autocomplete, type hints, inline documentation
- **Self-Documenting Code:** Reduces need for external documentation
- **Type Safety:** Works with TypeScript for better type checking
- **API Documentation:** Can generate API docs automatically

---

## Basic Format

```typescript
/**
 * Brief description of what the function does.
 * 
 * More detailed description if needed. Can span multiple lines.
 * Explain complex logic, edge cases, or important notes.
 * 
 * @param paramName - Description of the parameter
 * @returns Description of the return value
 * @throws {ErrorType} Description of when this error is thrown
 * @example
 * ```typescript
 * const result = functionName(param);
 * console.log(result); // Expected output
 * ```
 */
function functionName(paramName: string): ReturnType {
  // Implementation
}
```

---

## Functions

### Simple Function

```typescript
/**
 * Calculates the sum of two numbers.
 * 
 * @param a - The first number
 * @param b - The second number
 * @returns The sum of a and b
 */
function add(a: number, b: number): number {
  return a + b;
}
```

### Complex Function

```typescript
/**
 * Fetches user data from the API with caching support.
 * 
 * This function first checks the Redis cache for the user data.
 * If not found, it fetches from the database and caches the result.
 * Cache TTL is 5 minutes.
 * 
 * @param userId - The unique identifier of the user
 * @param options - Optional configuration
 * @param options.skipCache - If true, bypasses the cache
 * @param options.includeDeleted - If true, includes soft-deleted users
 * @returns Promise resolving to the user object
 * @throws {NotFoundError} When user doesn't exist
 * @throws {DatabaseError} When database query fails
 * 
 * @example
 * ```typescript
 * const user = await fetchUserData('user-123');
 * console.log(user.name);
 * 
 * // Skip cache
 * const freshUser = await fetchUserData('user-123', { skipCache: true });
 * ```
 */
async function fetchUserData(
  userId: string,
  options?: {
    skipCache?: boolean;
    includeDeleted?: boolean;
  }
): Promise<User> {
  // Implementation
}
```

### Async Function

```typescript
/**
 * Saves a document to the database and triggers post-save hooks.
 * 
 * @async
 * @param document - The document to save
 * @returns Promise resolving to the saved document with generated ID
 * @throws {ValidationError} When document validation fails
 * @throws {DatabaseError} When save operation fails
 */
async function saveDocument(document: Document): Promise<Document> {
  // Implementation
}
```

---

## React Components

### Functional Component

```typescript
/**
 * Displays a user profile card with avatar, name, and bio.
 * 
 * Supports edit mode when `isEditable` is true. Changes are saved
 * automatically on blur or when the user presses Enter.
 * 
 * @component
 * @param props - Component props
 * @param props.userId - The ID of the user to display
 * @param props.isEditable - Whether the card should be editable
 * @param props.onSave - Callback fired when changes are saved
 * @returns The rendered user profile card
 * 
 * @example
 * ```tsx
 * <UserProfileCard
 *   userId="user-123"
 *   isEditable={true}
 *   onSave={(data) => console.log('Saved:', data)}
 * />
 * ```
 */
function UserProfileCard({
  userId,
  isEditable,
  onSave
}: UserProfileCardProps): JSX.Element {
  // Implementation
}
```

### Component Props Interface

```typescript
/**
 * Props for the UserProfileCard component.
 */
interface UserProfileCardProps {
  /**
   * The unique identifier of the user to display.
   */
  userId: string;
  
  /**
   * Whether the card should be in edit mode.
   * @default false
   */
  isEditable?: boolean;
  
  /**
   * Callback fired when the user saves changes.
   * @param data - The updated user data
   */
  onSave?: (data: Partial<User>) => void;
  
  /**
   * Additional CSS classes to apply to the card.
   */
  className?: string;
}
```

---

## Custom Hooks

```typescript
/**
 * Custom hook for managing user authentication state.
 * 
 * Provides authentication status, user data, and auth actions.
 * Automatically refreshes the token when it expires.
 * 
 * @hook
 * @returns Authentication state and actions
 * @returns user - The current user object or null if not authenticated
 * @returns isAuthenticated - Whether the user is authenticated
 * @returns isLoading - Whether authentication is being checked
 * @returns login - Function to log in with credentials
 * @returns logout - Function to log out the current user
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <LoginForm onSubmit={login} />;
 *   }
 *   
 *   return <div>Welcome, {user.name}!</div>;
 * }
 * ```
 */
function useAuth() {
  // Implementation
}
```

---

## Classes

### Class

```typescript
/**
 * Service for managing Redis cache operations.
 * 
 * Provides a simple interface for getting, setting, and deleting
 * cached values. Automatically handles serialization and error handling.
 * 
 * @class
 * @example
 * ```typescript
 * const cache = new RedisCacheService();
 * await cache.set('user:123', userData, 300); // 5 minutes TTL
 * const user = await cache.get('user:123');
 * ```
 */
class RedisCacheService {
  /**
   * The Redis client instance.
   * @private
   */
  private client: RedisClient;
  
  /**
   * Creates a new Redis cache service instance.
   * 
   * @param config - Redis configuration options
   * @param config.url - Redis connection URL
   * @param config.password - Redis password (optional)
   */
  constructor(config: RedisConfig) {
    // Implementation
  }
  
  /**
   * Gets a value from the cache.
   * 
   * @param key - The cache key
   * @returns Promise resolving to the cached value or null if not found
   * @throws {RedisError} When Redis operation fails
   */
  async get<T>(key: string): Promise<T | null> {
    // Implementation
  }
  
  /**
   * Sets a value in the cache with optional TTL.
   * 
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time to live in seconds (optional)
   * @returns Promise resolving when the value is cached
   * @throws {RedisError} When Redis operation fails
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Implementation
  }
}
```

---

## Types and Interfaces

### Interface

```typescript
/**
 * Represents a user in the system.
 * 
 * @interface
 */
interface User {
  /**
   * The unique identifier of the user.
   */
  id: string;
  
  /**
   * The user's email address.
   * Must be unique across all users.
   */
  email: string;
  
  /**
   * The user's display name.
   * @minLength 2
   * @maxLength 50
   */
  name: string;
  
  /**
   * The user's role in the system.
   * @default 'USER'
   */
  role: UserRole;
  
  /**
   * When the user account was created.
   */
  createdAt: Date;
  
  /**
   * When the user account was last updated.
   */
  updatedAt: Date;
}
```

### Type Alias

```typescript
/**
 * Represents the possible statuses of a document.
 * 
 * - `draft`: Document is being edited
 * - `pending`: Document is awaiting review
 * - `approved`: Document has been approved
 * - `rejected`: Document has been rejected
 * 
 * @typedef {string} DocumentStatus
 */
type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected';
```

### Enum

```typescript
/**
 * User roles in the system.
 * 
 * @enum {string}
 */
enum UserRole {
  /**
   * Administrator with full system access.
   */
  ADMIN = 'ADMIN',
  
  /**
   * Regular user with standard permissions.
   */
  USER = 'USER',
  
  /**
   * Guest user with limited read-only access.
   */
  GUEST = 'GUEST'
}
```

---

## Utility Functions

```typescript
/**
 * Formats a date according to the specified format string.
 * 
 * Supports common date formats and localization.
 * Uses Intl.DateTimeFormat for consistent formatting.
 * 
 * @param date - The date to format
 * @param format - The format string ('short', 'long', 'iso', or custom)
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns The formatted date string
 * 
 * @example
 * ```typescript
 * formatDate(new Date(), 'short'); // "2/25/26"
 * formatDate(new Date(), 'long'); // "February 25, 2026"
 * formatDate(new Date(), 'iso'); // "2026-02-25"
 * ```
 */
export function formatDate(
  date: Date,
  format: 'short' | 'long' | 'iso' = 'short',
  locale: string = 'en-US'
): string {
  // Implementation
}
```

---

## Middleware

```typescript
/**
 * Rate limiting middleware using token bucket algorithm.
 * 
 * Limits the number of requests per IP address within a time window.
 * Returns 429 Too Many Requests when limit is exceeded.
 * 
 * @middleware
 * @param options - Rate limiting configuration
 * @param options.windowMs - Time window in milliseconds
 * @param options.max - Maximum number of requests per window
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * app.use(rateLimiter({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 100 // 100 requests per window
 * }));
 * ```
 */
export function rateLimiter(options: RateLimiterOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Implementation
  };
}
```

---

## Constants

```typescript
/**
 * Maximum number of retry attempts for failed API requests.
 * 
 * @constant {number}
 * @default 3
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Default timeout for API requests in milliseconds.
 * 
 * @constant {number}
 * @default 5000
 */
export const DEFAULT_TIMEOUT = 5000;

/**
 * Supported document types in the system.
 * 
 * @constant {string[]}
 */
export const SUPPORTED_DOCUMENT_TYPES = [
  'innovation-brief',
  'project-genesis',
  'business-plan',
  'report'
] as const;
```

---

## Tags Reference

### Common Tags

- `@param` - Function parameter
- `@returns` - Return value
- `@throws` - Exception that can be thrown
- `@example` - Usage example
- `@deprecated` - Mark as deprecated
- `@since` - Version when added
- `@see` - Reference to related code
- `@todo` - Future work needed
- `@internal` - Internal use only
- `@public` - Public API
- `@private` - Private method/property
- `@readonly` - Read-only property
- `@default` - Default value

### TypeScript-Specific Tags

- `@template` - Generic type parameter
- `@typedef` - Type definition
- `@type` - Variable type
- `@enum` - Enumeration

### React-Specific Tags

- `@component` - React component
- `@hook` - Custom React hook
- `@prop` - Component prop (alternative to @param)

---

## Best Practices

### DO ✅

```typescript
/**
 * Validates an email address format.
 * 
 * Uses RFC 5322 compliant regex for validation.
 * 
 * @param email - The email address to validate
 * @returns True if valid, false otherwise
 * 
 * @example
 * ```typescript
 * validateEmail('user@example.com'); // true
 * validateEmail('invalid-email'); // false
 * ```
 */
function validateEmail(email: string): boolean {
  // Implementation
}
```

### DON'T ❌

```typescript
/**
 * Validates email
 */
function validateEmail(email: string): boolean {
  // Too brief, no examples, no parameter description
}

/**
 * This function validates an email address by checking if it matches
 * the RFC 5322 standard using a regular expression pattern that looks
 * for the @ symbol and a domain name...
 * (200 more words of unnecessary detail)
 */
function validateEmail(email: string): boolean {
  // Too verbose
}
```

---

## Priority

### High Priority (Document First)

1. **Public APIs** - All exported functions, classes, types
2. **Complex Logic** - Functions with non-obvious behavior
3. **React Components** - All components and their props
4. **Custom Hooks** - All custom hooks
5. **Utility Functions** - Reusable helper functions

### Medium Priority

6. **Middleware** - All middleware functions
7. **Services** - Service classes and methods
8. **Types/Interfaces** - Complex types and interfaces

### Low Priority

9. **Simple Functions** - Self-explanatory functions
10. **Private Methods** - Internal implementation details

---

## Tools

### VSCode Extensions

- **Document This** - Auto-generate JSDoc comments
- **Better Comments** - Highlight TODO, FIXME, etc.
- **TypeDoc** - Generate documentation from JSDoc

### Generate Documentation

```bash
# Install TypeDoc
pnpm add -D typedoc

# Generate docs
pnpm typedoc --out docs/api client/src server
```

---

## Examples by File Type

### API Router

```typescript
/**
 * User management API router.
 * 
 * Provides endpoints for user CRUD operations, authentication,
 * and profile management.
 * 
 * @module routers/user
 */

export const userRouter = router({
  /**
   * Gets a user by ID.
   * 
   * @procedure
   * @param input - User ID
   * @returns User object
   * @throws {NotFoundError} When user doesn't exist
   */
  getUser: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      // Implementation
    }),
  
  /**
   * Creates a new user.
   * 
   * @procedure
   * @param input - User creation data
   * @returns Created user object
   * @throws {ValidationError} When input is invalid
   * @throws {ConflictError} When email already exists
   */
  createUser: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
      // Implementation
    })
});
```

### Service Class

```typescript
/**
 * Image optimization service using Sharp.
 * 
 * Provides methods for resizing, converting, and optimizing images.
 * Supports WebP conversion and multiple size variants.
 * 
 * @class
 * @example
 * ```typescript
 * const optimizer = new ImageOptimizerService();
 * const optimized = await optimizer.optimize('/path/to/image.jpg', {
 *   sizes: ['thumbnail', 'medium', 'full'],
 *   format: 'webp'
 * });
 * ```
 */
export class ImageOptimizerService {
  // Implementation
}
```

---

## Checklist

When writing JSDoc comments:

- [ ] Brief description (one sentence)
- [ ] Detailed description (if needed)
- [ ] All parameters documented with `@param`
- [ ] Return value documented with `@returns`
- [ ] Exceptions documented with `@throws`
- [ ] At least one `@example`
- [ ] Proper formatting (indentation, spacing)
- [ ] No typos or grammatical errors
- [ ] Links to related code with `@see` (if applicable)
- [ ] Version info with `@since` (for new APIs)

---

**Last Updated:** 2026-02-25  
**Status:** Active  
**Tool:** TypeDoc for documentation generation
