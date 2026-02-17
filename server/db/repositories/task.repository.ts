/**
 * Task Repository
 * 
 * Handles all database operations related to tasks and universal inbox.
 * 
 * @module db/repositories/task
 */

import { eq, and, desc } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import { 
  tasks,
  universalInbox,
  type Task,
  type InsertTask,
  type UniversalInboxItem,
  type InsertUniversalInboxItem
} from "../../../drizzle/schema";

/**
 * Repository for task and inbox-related database operations
 */
export class TaskRepository extends BaseRepository {
  constructor() {
    super("TaskRepository");
  }

  // ==================== Tasks ====================

  /**
   * Create a new task
   */
  async create(data: InsertTask): Promise<Task | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("create", { title: data.title, userId: data.userId });

      const [task] = await db
        .insert(tasks)
        .values(data)
        .returning();

      return task || null;
    } catch (error) {
      this.handleError("create", error as Error, { data });
    }
  }

  /**
   * Get tasks for a user
   */
  async getTasks(
    userId: number,
    options?: { projectId?: number; status?: string; limit?: number }
  ): Promise<Task[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId));

      if (options?.projectId) {
        query = query.where(and(
          eq(tasks.userId, userId),
          eq(tasks.projectId, options.projectId)
        )) as any;
      }

      if (options?.status) {
        query = query.where(and(
          eq(tasks.userId, userId),
          eq(tasks.status, options.status)
        )) as any;
      }

      query = query.orderBy(desc(tasks.createdAt)) as any;

      if (options?.limit) {
        query = query.limit(options.limit) as any;
      }

      return await query;
    } catch (error) {
      this.handleError("getTasks", error as Error, { userId, options });
    }
  }

  /**
   * Update a task
   */
  async update(id: number, data: Partial<InsertTask>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("update", { id });

      await db
        .update(tasks)
        .set(data)
        .where(eq(tasks.id, id));
    } catch (error) {
      this.handleError("update", error as Error, { id, data });
    }
  }

  // ==================== Universal Inbox ====================

  /**
   * Create an inbox item
   */
  async createInboxItem(data: InsertUniversalInboxItem): Promise<UniversalInboxItem | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createInboxItem", { userId: data.userId });

      const [item] = await db
        .insert(universalInbox)
        .values(data)
        .returning();

      return item || null;
    } catch (error) {
      this.handleError("createInboxItem", error as Error, { data });
    }
  }

  /**
   * Get inbox items for a user
   */
  async getInboxItems(
    userId: number,
    options?: { status?: string; limit?: number }
  ): Promise<UniversalInboxItem[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db
        .select()
        .from(universalInbox)
        .where(eq(universalInbox.userId, userId));

      if (options?.status) {
        query = query.where(and(
          eq(universalInbox.userId, userId),
          eq(universalInbox.status, options.status)
        )) as any;
      }

      query = query.orderBy(desc(universalInbox.createdAt)) as any;

      if (options?.limit) {
        query = query.limit(options.limit) as any;
      }

      return await query;
    } catch (error) {
      this.handleError("getInboxItems", error as Error, { userId, options });
    }
  }

  /**
   * Update an inbox item
   */
  async updateInboxItem(id: number, data: Partial<InsertUniversalInboxItem>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updateInboxItem", { id });

      await db
        .update(universalInbox)
        .set(data)
        .where(eq(universalInbox.id, id));
    } catch (error) {
      this.handleError("updateInboxItem", error as Error, { id, data });
    }
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();
