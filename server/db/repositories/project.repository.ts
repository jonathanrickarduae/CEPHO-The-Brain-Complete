/**
 * Project Repository
 * 
 * Handles all database operations related to projects and Project Genesis.
 * 
 * @module db/repositories/project
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import { 
  projects, 
  projectGenesis,
  type Project, 
  type InsertProject,
  type ProjectGenesisRecord,
  type InsertProjectGenesis
} from "../../../drizzle/schema";

/**
 * Repository for project-related database operations
 */
export class ProjectRepository extends BaseRepository {
  constructor() {
    super("ProjectRepository");
  }

  /**
   * Create a new project
   */
  async create(data: InsertProject): Promise<Project | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("create", { name: data.name, userId: data.userId });

      const [project] = await db
        .insert(projects)
        .values(data)
        .returning();

      return project || null;
    } catch (error) {
      this.handleError("create", error as Error, { data });
    }
  }

  /**
   * Get projects for a user
   */
  async getProjects(
    userId: number, 
    options?: { status?: string; limit?: number }
  ): Promise<Project[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId));

      if (options?.status) {
        query = query.where(and(
          eq(projects.userId, userId),
          eq(projects.status, options.status)
        )) as any;
      }

      if (options?.limit) {
        query = query.limit(options.limit) as any;
      }

      return await query;
    } catch (error) {
      this.handleError("getProjects", error as Error, { userId, options });
    }
  }

  /**
   * Update a project
   */
  async update(id: number, data: Partial<InsertProject>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("update", { id, data });

      await db
        .update(projects)
        .set(data)
        .where(eq(projects.id, id));
    } catch (error) {
      this.handleError("update", error as Error, { id, data });
    }
  }

  /**
   * Create a Project Genesis record
   */
  async createGenesis(data: InsertProjectGenesis): Promise<ProjectGenesisRecord | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createGenesis", { userId: data.userId });

      const [record] = await db
        .insert(projectGenesis)
        .values(data)
        .returning();

      return record || null;
    } catch (error) {
      this.handleError("createGenesis", error as Error, { data });
    }
  }

  /**
   * Get Project Genesis records for a user
   */
  async getGenesisRecords(userId: number): Promise<ProjectGenesisRecord[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(projectGenesis)
        .where(eq(projectGenesis.userId, userId))
        .orderBy(desc(projectGenesis.createdAt));
    } catch (error) {
      this.handleError("getGenesisRecords", error as Error, { userId });
    }
  }

  /**
   * Update a Project Genesis record
   */
  async updateGenesis(id: number, data: Partial<InsertProjectGenesis>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updateGenesis", { id });

      await db
        .update(projectGenesis)
        .set(data)
        .where(eq(projectGenesis.id, id));
    } catch (error) {
      this.handleError("updateGenesis", error as Error, { id, data });
    }
  }
}

// Export singleton instance
export const projectRepository = new ProjectRepository();
