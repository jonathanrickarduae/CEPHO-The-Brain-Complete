import { getDb } from '../db';
import { desc, eq, and, gte } from 'drizzle-orm';
import { logger } from '../utils/logger';

const log = logger.module('InnovationHubAggregation');

export interface AggregatedArticle {
  id: number;
  title: string;
  url: string;
  source: string;
  publishedAt?: Date;
  summary?: string;
  category?: string;
  relevanceScore?: number;
  tags?: string[];
  addedAt: Date;
}

export interface InnovationHubSummary {
  totalArticles: number;
  recentArticles: AggregatedArticle[];
  topCategories: { category: string; count: number }[];
  topSources: { source: string; count: number }[];
}

export class InnovationHubAggregationService {
  
  /**
   * Get recent articles from Innovation Hub
   */
  async getRecentArticles(userId: string, options?: {
    limit?: number;
    since?: Date;
    category?: string;
  }): Promise<AggregatedArticle[]> {
    const db = await getDb();
    if (!db) {
      log.error('Database not available');
      return [];
    }
    
    try {
      // Check if innovation_articles table exists
      const tableCheck = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'innovation_articles'
        );
      `);
      
      if (!tableCheck.rows[0]?.exists) {
        log.warn('innovation_articles table does not exist yet');
        return [];
      }
      
      let query = `
        SELECT 
          id, title, url, source, published_at, summary, 
          category, relevance_score, tags, created_at
        FROM innovation_articles
        WHERE user_id = $1
      `;
      
      const params: any[] = [userId];
      let paramIndex = 2;
      
      if (options?.since) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(options.since);
        paramIndex++;
      }
      
      if (options?.category) {
        query += ` AND category = $${paramIndex}`;
        params.push(options.category);
        paramIndex++;
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
      params.push(options?.limit || 50);
      
      const result = await db.execute({ sql: query, args: params });
      
      return result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        url: row.url,
        source: row.source,
        publishedAt: row.published_at ? new Date(row.published_at) : undefined,
        summary: row.summary,
        category: row.category,
        relevanceScore: row.relevance_score,
        tags: row.tags,
        addedAt: new Date(row.created_at),
      }));
    } catch (error: any) {
      log.error('Failed to get articles:', error);
      return [];
    }
  }
  
  /**
   * Get Innovation Hub summary
   */
  async getSummary(userId: string): Promise<InnovationHubSummary> {
    const db = await getDb();
    if (!db) {
      return {
        totalArticles: 0,
        recentArticles: [],
        topCategories: [],
        topSources: [],
      };
    }
    
    try {
      const recentArticles = await this.getRecentArticles(userId, { limit: 10 });
      
      // Get total count
      const countResult = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM innovation_articles WHERE user_id = $1',
        args: [userId],
      });
      const totalArticles = parseInt(countResult.rows[0]?.count || '0');
      
      // Get top categories
      const categoriesResult = await db.execute({
        sql: `
          SELECT category, COUNT(*) as count 
          FROM innovation_articles 
          WHERE user_id = $1 AND category IS NOT NULL
          GROUP BY category 
          ORDER BY count DESC 
          LIMIT 5
        `,
        args: [userId],
      });
      const topCategories = categoriesResult.rows.map((row: any) => ({
        category: row.category,
        count: parseInt(row.count),
      }));
      
      // Get top sources
      const sourcesResult = await db.execute({
        sql: `
          SELECT source, COUNT(*) as count 
          FROM innovation_articles 
          WHERE user_id = $1 
          GROUP BY source 
          ORDER BY count DESC 
          LIMIT 5
        `,
        args: [userId],
      });
      const topSources = sourcesResult.rows.map((row: any) => ({
        source: row.source,
        count: parseInt(row.count),
      }));
      
      return {
        totalArticles,
        recentArticles,
        topCategories,
        topSources,
      };
    } catch (error: any) {
      log.error('Failed to get summary:', error);
      return {
        totalArticles: 0,
        recentArticles: [],
        topCategories: [],
        topSources: [],
      };
    }
  }
  
  /**
   * Get context for Chief of Staff
   */
  async getContext(userId: string): Promise<string> {
    const summary = await this.getSummary(userId);
    
    if (summary.totalArticles === 0) {
      return 'No articles in Innovation Hub yet.';
    }
    
    const context = `
## Innovation Hub Articles

**Total Articles:** ${summary.totalArticles}

**Recent Articles (Last 10):**
${summary.recentArticles.map(article => `
- **${article.title}**
  Source: ${article.source}
  ${article.publishedAt ? `Published: ${article.publishedAt.toLocaleDateString()}` : ''}
  ${article.summary ? `Summary: ${article.summary}` : ''}
  ${article.category ? `Category: ${article.category}` : ''}
  URL: ${article.url}
`).join('\n')}

**Top Categories:**
${summary.topCategories.map(c => `- ${c.category}: ${c.count} articles`).join('\n') || '(none)'}

**Top Sources:**
${summary.topSources.map(s => `- ${s.source}: ${s.count} articles`).join('\n') || '(none)'}
`;
    
    return context.trim();
  }
}

export const innovationHubAggregationService = new InnovationHubAggregationService();
