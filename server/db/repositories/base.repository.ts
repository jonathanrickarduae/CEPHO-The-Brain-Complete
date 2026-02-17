/**
 * Base Repository Class
 * 
 * Provides common database operations and utilities for all repositories.
 * All domain-specific repositories should extend this class.
 * 
 * @module db/repositories/base
 */

import { getDb } from "../connection";
import { logger } from "../../utils/logger";

/**
 * Base repository with common CRUD operations
 * 
 * @abstract
 * @class BaseRepository
 * 
 * @example
 * ```typescript
 * class UserRepository extends BaseRepository {
 *   constructor() {
 *     super("UserRepository");
 *   }
 *   
 *   async findByEmail(email: string) {
 *     const db = await this.getDatabase();
 *     // ... implementation
 *   }
 * }
 * ```
 */
export abstract class BaseRepository {
  protected repositoryName: string;

  /**
   * Create a new repository instance
   * 
   * @param {string} repositoryName - Name of the repository for logging
   */
  constructor(repositoryName: string) {
    this.repositoryName = repositoryName;
  }

  /**
   * Get database instance with error handling
   * 
   * @protected
   * @returns {Promise<ReturnType<typeof drizzle>>} Database instance
   * @throws {Error} If database is not available
   */
  protected async getDatabase() {
    const db = await getDb();
    if (!db) {
      const error = new Error("Database not available");
      logger.error(`${this.repositoryName}: Database not available`);
      throw error;
    }
    return db;
  }

  /**
   * Log repository operation
   * 
   * @protected
   * @param {string} operation - Operation name
   * @param {any} data - Operation data
   */
  protected logOperation(operation: string, data?: any) {
    logger.info(`${this.repositoryName}.${operation}`, data);
  }

  /**
   * Log repository error
   * 
   * @protected
   * @param {string} operation - Operation name
   * @param {Error} error - Error object
   * @param {any} context - Additional context
   */
  protected logError(operation: string, error: Error, context?: any) {
    logger.error(`${this.repositoryName}.${operation} failed`, {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Handle repository errors with consistent logging
   * 
   * @protected
   * @param {string} operation - Operation name
   * @param {Error} error - Error object
   * @param {any} context - Additional context
   * @throws {Error} Rethrows the error after logging
   */
  protected handleError(operation: string, error: Error, context?: any): never {
    this.logError(operation, error, context);
    throw error;
  }
}
