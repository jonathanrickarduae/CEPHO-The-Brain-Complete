import { getDb } from '../../db';
import { libraryDocuments, InsertLibraryDocument, LibraryDocument } from '../../../drizzle/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';

/**
 * Document Repository
 * 
 * Handles all database operations for document library.
 */
export class DocumentRepository {
  /**
   * Create a new document
   */
  async create(data: InsertLibraryDocument): Promise<LibraryDocument> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [document] = await db
      .insert(libraryDocuments)
      .values(data)
      .returning();

    return document;
  }

  /**
   * Find document by ID
   */
  async findById(id: number, userId: number): Promise<LibraryDocument | null> {
    const db = await getDb();
    if (!db) return null;

    const [document] = await db
      .select()
      .from(libraryDocuments)
      .where(
        and(
          eq(libraryDocuments.id, id),
          eq(libraryDocuments.userId, userId)
        )
      )
      .limit(1);

    return document || null;
  }

  /**
   * Find all documents for a user
   */
  async findByUserId(userId: number): Promise<LibraryDocument[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(libraryDocuments)
      .where(eq(libraryDocuments.userId, userId))
      .orderBy(desc(libraryDocuments.updatedAt));
  }

  /**
   * Find documents by category
   */
  async findByCategory(userId: number, category: string): Promise<LibraryDocument[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(libraryDocuments)
      .where(
        and(
          eq(libraryDocuments.userId, userId),
          eq(libraryDocuments.category, category)
        )
      )
      .orderBy(desc(libraryDocuments.updatedAt));
  }

  /**
   * Find documents by file type
   */
  async findByFileType(userId: number, fileType: string): Promise<LibraryDocument[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(libraryDocuments)
      .where(
        and(
          eq(libraryDocuments.userId, userId),
          eq(libraryDocuments.fileType, fileType)
        )
      )
      .orderBy(desc(libraryDocuments.updatedAt));
  }

  /**
   * Search documents by title or description
   */
  async search(userId: number, query: string): Promise<LibraryDocument[]> {
    const db = await getDb();
    if (!db) return [];

    const searchPattern = `%${query}%`;

    return await db
      .select()
      .from(libraryDocuments)
      .where(
        and(
          eq(libraryDocuments.userId, userId),
          or(
            like(libraryDocuments.title, searchPattern),
            like(libraryDocuments.description, searchPattern)
          )
        )
      )
      .orderBy(desc(libraryDocuments.updatedAt));
  }

  /**
   * Get most accessed documents
   */
  async findMostAccessed(userId: number, limit: number = 10): Promise<LibraryDocument[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(libraryDocuments)
      .where(eq(libraryDocuments.userId, userId))
      .orderBy(desc(libraryDocuments.accessCount))
      .limit(limit);
  }

  /**
   * Get recently added documents
   */
  async findRecentlyAdded(userId: number, limit: number = 10): Promise<LibraryDocument[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(libraryDocuments)
      .where(eq(libraryDocuments.userId, userId))
      .orderBy(desc(libraryDocuments.createdAt))
      .limit(limit);
  }

  /**
   * Update document
   */
  async update(
    id: number,
    userId: number,
    data: Partial<InsertLibraryDocument>
  ): Promise<LibraryDocument | null> {
    const db = await getDb();
    if (!db) return null;

    const [updated] = await db
      .update(libraryDocuments)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(libraryDocuments.id, id),
          eq(libraryDocuments.userId, userId)
        )
      )
      .returning();

    return updated || null;
  }

  /**
   * Increment access count
   */
  async incrementAccessCount(id: number, userId: number): Promise<void> {
    const db = await getDb();
    if (!db) return;

    const document = await this.findById(id, userId);
    if (!document) return;

    await db
      .update(libraryDocuments)
      .set({
        accessCount: document.accessCount + 1,
        lastAccessedAt: new Date(),
      })
      .where(
        and(
          eq(libraryDocuments.id, id),
          eq(libraryDocuments.userId, userId)
        )
      );
  }

  /**
   * Delete document
   */
  async delete(id: number, userId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    const result = await db
      .delete(libraryDocuments)
      .where(
        and(
          eq(libraryDocuments.id, id),
          eq(libraryDocuments.userId, userId)
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Get unique categories for a user
   */
  async getCategories(userId: number): Promise<string[]> {
    const documents = await this.findByUserId(userId);
    const categories = new Set<string>();
    
    documents.forEach(doc => {
      if (doc.category) {
        categories.add(doc.category);
      }
    });

    return Array.from(categories).sort();
  }

  /**
   * Count documents by category
   */
  async countByCategory(userId: number): Promise<Record<string, number>> {
    const documents = await this.findByUserId(userId);
    const counts: Record<string, number> = {};

    documents.forEach(doc => {
      const category = doc.category || 'Uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }
}
