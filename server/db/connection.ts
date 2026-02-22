/**
 * Database Connection Module
 * 
 * Provides centralized database connection management for the application.
 * Supports both Drizzle ORM and raw PostgreSQL client access.
 * 
 * @module db/connection
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../drizzle/schema";
import { logger } from "../utils/logger";

let dbInstance: ReturnType<typeof drizzle> | null = null;
let rawClient: ReturnType<typeof postgres> | null = null;

// Export db for direct use (will be initialized on first access)
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!dbInstance) {
      throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return (dbInstance as any)[prop];
  }
});

/**
 * Initialize database connection
 * 
 * Creates a connection pool to the PostgreSQL database using the
 * DATABASE_URL environment variable.
 * 
 * @returns {Promise<void>}
 * @throws {Error} If DATABASE_URL is not configured
 */
export async function initializeDatabase(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    logger.error("DATABASE_URL environment variable is not set");
    throw new Error("DATABASE_URL is required");
  }

  try {
    rawClient = postgres(connectionString, {
      max: 10, // Maximum pool size
      idle_timeout: 20,
      connect_timeout: 10,
    });

    dbInstance = drizzle(rawClient, { schema, logger: false });
    
    logger.info("Database connection initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize database connection", { error });
    throw error;
  }
}

/**
 * Get Drizzle ORM database instance
 * 
 * Returns the initialized Drizzle database instance for type-safe queries.
 * If not initialized, attempts to initialize the connection.
 * 
 * @returns {Promise<ReturnType<typeof drizzle> | null>} Database instance or null if initialization fails
 * 
 * @example
 * ```typescript
 * const db = await getDb();
 * if (!db) throw new Error("Database not available");
 * 
 * const users = await db.select().from(schema.users);
 * ```
 */
export async function getDb(): Promise<ReturnType<typeof drizzle> | null> {
  if (!dbInstance) {
    try {
      await initializeDatabase();
    } catch (error) {
      logger.error("Failed to get database instance", { error });
      return null;
    }
  }
  return dbInstance;
}

/**
 * Get raw PostgreSQL client
 * 
 * Returns the raw postgres.js client for advanced queries or operations
 * that require direct SQL execution.
 * 
 * @returns {Promise<ReturnType<typeof postgres> | null>} Raw client or null if not initialized
 * 
 * @example
 * ```typescript
 * const client = await getRawClient();
 * if (!client) throw new Error("Database client not available");
 * 
 * const result = await client`SELECT NOW()`;
 * ```
 */
export async function getRawClient(): Promise<ReturnType<typeof postgres> | null> {
  if (!rawClient) {
    try {
      await initializeDatabase();
    } catch (error) {
      logger.error("Failed to get raw database client", { error });
      return null;
    }
  }
  return rawClient;
}

/**
 * Close database connection
 * 
 * Gracefully closes the database connection pool.
 * Should be called during application shutdown.
 * 
 * @returns {Promise<void>}
 */
export async function closeDatabase(): Promise<void> {
  if (rawClient) {
    try {
      await rawClient.end();
      dbInstance = null;
      rawClient = null;
      logger.info("Database connection closed");
    } catch (error) {
      logger.error("Error closing database connection", { error });
    }
  }
}

/**
 * Check database health
 * 
 * Performs a simple query to verify database connectivity.
 * Useful for health checks and monitoring.
 * 
 * @returns {Promise<boolean>} True if database is healthy, false otherwise
 * 
 * @example
 * ```typescript
 * const isHealthy = await checkDatabaseHealth();
 * if (!isHealthy) {
 *   logger.error("Database health check failed");
 * }
 * ```
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await getRawClient();
    if (!client) return false;
    
    const result = await client`SELECT 1 as health`;
    return result.length > 0 && result[0].health === 1;
  } catch (error) {
    logger.error("Database health check failed", { error });
    return false;
  }
}
