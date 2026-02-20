import { getDb } from '../db';
import { desc, eq, and, gte } from 'drizzle-orm';
import { logger } from '../utils/logger';

const log = logger.module('DocumentLibraryAggregation');

export interface AggregatedDocument {
  id: number;
  title: string;
  type: string;
  category?: string;
  tags?: string[];
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
  fileSize?: number;
  url?: string;
}

export interface DocumentLibrarySummary {
  totalDocuments: number;
  recentDocuments: AggregatedDocument[];
  documentsByType: { type: string; count: number }[];
  documentsByCategory: { category: string; count: number }[];
}

export class DocumentLibraryAggregationService {
  
  /**
   * Get recent documents
   */
  async getRecentDocuments(userId: string, options?: {
    limit?: number;
    type?: string;
    category?: string;
  }): Promise<AggregatedDocument[]> {
    const db = await getDb();
    if (!db) {
      log.error('Database not available');
      return [];
    }
    
    try {
      // Check if documents table exists
      const tableCheck = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'documents'
        );
      `);
      
      if (!tableCheck.rows[0]?.exists) {
        log.warn('documents table does not exist yet');
        return [];
      }
      
      let query = `
        SELECT 
          id, title, document_type, category, tags, summary,
          created_at, updated_at, file_size, file_url
        FROM documents
        WHERE user_id = $1
      `;
      
      const params: any[] = [userId];
      let paramIndex = 2;
      
      if (options?.type) {
        query += ` AND document_type = $${paramIndex}`;
        params.push(options.type);
        paramIndex++;
      }
      
      if (options?.category) {
        query += ` AND category = $${paramIndex}`;
        params.push(options.category);
        paramIndex++;
      }
      
      query += ` ORDER BY updated_at DESC LIMIT $${paramIndex}`;
      params.push(options?.limit || 20);
      
      const result = await db.execute({ sql: query, args: params });
      
      return result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        type: row.document_type,
        category: row.category,
        tags: row.tags,
        summary: row.summary,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        fileSize: row.file_size,
        url: row.file_url,
      }));
    } catch (error: any) {
      log.error('Failed to get documents:', error);
      return [];
    }
  }
  
  /**
   * Get Document Library summary
   */
  async getSummary(userId: string): Promise<DocumentLibrarySummary> {
    const db = await getDb();
    if (!db) {
      return {
        totalDocuments: 0,
        recentDocuments: [],
        documentsByType: [],
        documentsByCategory: [],
      };
    }
    
    try {
      const recentDocuments = await this.getRecentDocuments(userId, { limit: 10 });
      
      // Get total count
      const countResult = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM documents WHERE user_id = $1',
        args: [userId],
      });
      const totalDocuments = parseInt(countResult.rows[0]?.count || '0');
      
      // Get documents by type
      const typesResult = await db.execute({
        sql: `
          SELECT document_type, COUNT(*) as count 
          FROM documents 
          WHERE user_id = $1 
          GROUP BY document_type 
          ORDER BY count DESC
        `,
        args: [userId],
      });
      const documentsByType = typesResult.rows.map((row: any) => ({
        type: row.document_type,
        count: parseInt(row.count),
      }));
      
      // Get documents by category
      const categoriesResult = await db.execute({
        sql: `
          SELECT category, COUNT(*) as count 
          FROM documents 
          WHERE user_id = $1 AND category IS NOT NULL
          GROUP BY category 
          ORDER BY count DESC 
          LIMIT 5
        `,
        args: [userId],
      });
      const documentsByCategory = categoriesResult.rows.map((row: any) => ({
        category: row.category,
        count: parseInt(row.count),
      }));
      
      return {
        totalDocuments,
        recentDocuments,
        documentsByType,
        documentsByCategory,
      };
    } catch (error: any) {
      log.error('Failed to get summary:', error);
      return {
        totalDocuments: 0,
        recentDocuments: [],
        documentsByType: [],
        documentsByCategory: [],
      };
    }
  }
  
  /**
   * Get context for Chief of Staff
   */
  async getContext(userId: string): Promise<string> {
    const summary = await this.getSummary(userId);
    
    if (summary.totalDocuments === 0) {
      return 'No documents in Document Library yet.';
    }
    
    const context = `
## Document Library

**Total Documents:** ${summary.totalDocuments}

**Recent Documents (Last 10):**
${summary.recentDocuments.map(doc => `
- **${doc.title}**
  Type: ${doc.type}
  ${doc.category ? `Category: ${doc.category}` : ''}
  ${doc.summary ? `Summary: ${doc.summary}` : ''}
  Last Updated: ${doc.updatedAt.toLocaleDateString()}
  ${doc.tags && doc.tags.length > 0 ? `Tags: ${doc.tags.join(', ')}` : ''}
`).join('\n')}

**Documents by Type:**
${summary.documentsByType.map(t => `- ${t.type}: ${t.count} documents`).join('\n') || '(none)'}

**Documents by Category:**
${summary.documentsByCategory.map(c => `- ${c.category}: ${c.count} documents`).join('\n') || '(none)'}
`;
    
    return context.trim();
  }
}

export const documentLibraryAggregationService = new DocumentLibraryAggregationService();
