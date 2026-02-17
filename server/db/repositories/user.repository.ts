/**
 * User Repository
 * 
 * Handles all database operations related to users.
 * Provides methods for user CRUD operations, authentication, and profile management.
 * 
 * @module db/repositories/user
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import { users, type User, type InsertUser } from "../../../drizzle/schema";

/**
 * Repository for user-related database operations
 * 
 * @class UserRepository
 * @extends BaseRepository
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super("UserRepository");
  }

  /**
   * Create a new user
   * 
   * @param {InsertUser} userData - User data to insert
   * @returns {Promise<User>} Created user
   * @throws {Error} If user creation fails
   * 
   * @example
   * ```typescript
   * const user = await userRepository.create({
   *   email: "user@example.com",
   *   name: "John Doe",
   *   googleId: "google-id-123"
   * });
   * ```
   */
  async create(userData: InsertUser): Promise<User> {
    try {
      const db = await this.getDatabase();
      this.logOperation("create", { email: userData.email });

      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();

      return user;
    } catch (error) {
      this.handleError("create", error as Error, { email: userData.email });
    }
  }

  /**
   * Find user by ID
   * 
   * @param {number} id - User ID
   * @returns {Promise<User | null>} User or null if not found
   * 
   * @example
   * ```typescript
   * const user = await userRepository.findById(123);
   * if (!user) {
   *   throw new Error("User not found");
   * }
   * ```
   */
  async findById(id: number): Promise<User | null> {
    try {
      const db = await this.getDatabase();
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return user || null;
    } catch (error) {
      this.handleError("findById", error as Error, { id });
    }
  }

  /**
   * Find user by email
   * 
   * @param {string} email - User email address
   * @returns {Promise<User | null>} User or null if not found
   * 
   * @example
   * ```typescript
   * const user = await userRepository.findByEmail("user@example.com");
   * ```
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const db = await this.getDatabase();
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return user || null;
    } catch (error) {
      this.handleError("findByEmail", error as Error, { email });
    }
  }

  /**
   * Find user by Google ID
   * 
   * @param {string} googleId - Google OAuth ID
   * @returns {Promise<User | null>} User or null if not found
   * 
   * @example
   * ```typescript
   * const user = await userRepository.findByGoogleId("google-id-123");
   * ```
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const db = await this.getDatabase();
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.googleId, googleId))
        .limit(1);

      return user || null;
    } catch (error) {
      this.handleError("findByGoogleId", error as Error, { googleId });
    }
  }

  /**
   * Update user by ID
   * 
   * @param {number} id - User ID
   * @param {Partial<InsertUser>} updates - Fields to update
   * @returns {Promise<User>} Updated user
   * @throws {Error} If user not found or update fails
   * 
   * @example
   * ```typescript
   * const updatedUser = await userRepository.update(123, {
   *   name: "Jane Doe",
   *   lastLoginAt: new Date()
   * });
   * ```
   */
  async update(id: number, updates: Partial<InsertUser>): Promise<User> {
    try {
      const db = await this.getDatabase();
      this.logOperation("update", { id, updates });

      const [user] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();

      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      this.handleError("update", error as Error, { id, updates });
    }
  }

  /**
   * Update user's last login timestamp
   * 
   * @param {number} id - User ID
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * await userRepository.updateLastLogin(123);
   * ```
   */
  async updateLastLogin(id: number): Promise<void> {
    try {
      const db = await this.getDatabase();
      
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, id));
    } catch (error) {
      this.handleError("updateLastLogin", error as Error, { id });
    }
  }

  /**
   * Delete user by ID
   * 
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * 
   * @example
   * ```typescript
   * const deleted = await userRepository.delete(123);
   * if (deleted) {
   *   console.log("User deleted successfully");
   * }
   * ```
   */
  async delete(id: number): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      this.logOperation("delete", { id });

      const result = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      this.handleError("delete", error as Error, { id });
    }
  }

  /**
   * Get total user count
   * 
   * @returns {Promise<number>} Total number of users
   * 
   * @example
   * ```typescript
   * const totalUsers = await userRepository.count();
   * console.log(`Total users: ${totalUsers}`);
   * ```
   */
  async count(): Promise<number> {
    try {
      const db = await this.getDatabase();
      
      const [result] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users);

      return result?.count || 0;
    } catch (error) {
      this.handleError("count", error as Error);
    }
  }

  /**
   * Get recently registered users
   * 
   * @param {number} limit - Maximum number of users to return
   * @returns {Promise<User[]>} Array of recent users
   * 
   * @example
   * ```typescript
   * const recentUsers = await userRepository.getRecent(10);
   * ```
   */
  async getRecent(limit: number = 10): Promise<User[]> {
    try {
      const db = await this.getDatabase();
      
      const recentUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit);

      return recentUsers;
    } catch (error) {
      this.handleError("getRecent", error as Error, { limit });
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
