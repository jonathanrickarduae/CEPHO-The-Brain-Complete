/**
 * Database Module
 * 
 * Main entry point for all database operations.
 * Exports connection utilities and repositories.
 * 
 * @module db
 * 
 * @example
 * ```typescript
 * // Using repositories (recommended)
 * import { userRepository } from "./db";
 * const user = await userRepository.findByEmail("user@example.com");
 * 
 * // Using direct connection (for complex queries)
 * import { getDb } from "./db";
 * const db = await getDb();
 * const result = await db.select().from(users).where(...);
 * ```
 */

// Export connection utilities
export {
  initializeDatabase,
  getDb,
  getRawClient,
  closeDatabase,
  checkDatabaseHealth,
} from "./connection";

// Export db instance for direct use
export { db } from "./connection";

// Export repositories
export * from "./repositories";

// Re-export legacy db.ts functions for backward compatibility
// These will be gradually migrated to repositories
export * from "../db";
