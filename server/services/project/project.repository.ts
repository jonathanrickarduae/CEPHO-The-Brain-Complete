import { getDb } from '../../db';
import { projects, InsertProject, Project } from '../../../drizzle/schema';
import { eq, and, desc, lte } from 'drizzle-orm';

/**
 * Project Repository
 * 
 * Handles all database operations for project management.
 */
export class ProjectRepository {
  /**
   * Create a new project
   */
  async create(data: InsertProject): Promise<Project> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [project] = await db
      .insert(projects)
      .values(data)
      .returning();

    return project;
  }

  /**
   * Find project by ID
   */
  async findById(id: number, userId: number): Promise<Project | null> {
    const db = await getDb();
    if (!db) return null;

    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, userId)
        )
      )
      .limit(1);

    return project || null;
  }

  /**
   * Find all projects for a user
   */
  async findByUserId(userId: number): Promise<Project[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  /**
   * Find projects by status
   */
  async findByStatus(
    userId: number,
    status: 'not_started' | 'in_progress' | 'blocked' | 'review' | 'complete'
  ): Promise<Project[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.userId, userId),
          eq(projects.status, status)
        )
      )
      .orderBy(desc(projects.priority), desc(projects.updatedAt));
  }

  /**
   * Find projects by priority
   */
  async findByPriority(
    userId: number,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<Project[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.userId, userId),
          eq(projects.priority, priority)
        )
      )
      .orderBy(desc(projects.updatedAt));
  }

  /**
   * Find overdue projects
   */
  async findOverdue(userId: number): Promise<Project[]> {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();

    return await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.userId, userId),
          lte(projects.dueDate, now),
          eq(projects.status, 'in_progress')
        )
      )
      .orderBy(projects.dueDate);
  }

  /**
   * Update project
   */
  async update(
    id: number,
    userId: number,
    data: Partial<InsertProject>
  ): Promise<Project | null> {
    const db = await getDb();
    if (!db) return null;

    const [updated] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, userId)
        )
      )
      .returning();

    return updated || null;
  }

  /**
   * Delete project
   */
  async delete(id: number, userId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    const result = await db
      .delete(projects)
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, userId)
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Count projects by status
   */
  async countByStatus(userId: number): Promise<Record<string, number>> {
    const db = await getDb();
    if (!db) return {};

    const allProjects = await this.findByUserId(userId);

    return {
      not_started: allProjects.filter(p => p.status === 'not_started').length,
      in_progress: allProjects.filter(p => p.status === 'in_progress').length,
      blocked: allProjects.filter(p => p.status === 'blocked').length,
      review: allProjects.filter(p => p.status === 'review').length,
      complete: allProjects.filter(p => p.status === 'complete').length,
    };
  }
}
