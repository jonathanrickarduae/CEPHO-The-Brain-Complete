/**
 * Innovation Hub Workflow Service
 * Connects SME/AI Agent suggestions to Innovation Hub
 */

import { getRawClient } from '../db';
import type { Database } from '../db';

export interface IdeaSuggestion {
  id: string;
  sourceType: 'sme' | 'ai_agent' | 'chief_of_staff' | 'digital_twin';
  sourceId: string;
  sourceName: string;
  title: string;
  description: string;
  rationale: string;
  category?: string;
  tags?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  supportingData?: any;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'converted';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  convertedIdeaId?: number;
  createdAt: Date;
}

export interface IdeaConversion {
  suggestionId: string;
  ideaId: number;
  convertedBy: string;
  notes?: string;
  createdAt: Date;
}

export class InnovationHubWorkflowService {
  private db: Database | null = null;

  async initialize() {
    this.db = await getRawClient() as any;
  }

  /**
   * Submit an idea suggestion from an AI agent or SME
   */
  async submitIdeaSuggestion(
    sourceType: IdeaSuggestion['sourceType'],
    sourceId: string,
    sourceName: string,
    suggestion: {
      title: string;
      description: string;
      rationale: string;
      category?: string;
      tags?: string[];
      priority?: IdeaSuggestion['priority'];
      confidence?: number;
      supportingData?: any;
    }
  ): Promise<IdeaSuggestion> {
    if (!this.db) await this.initialize();

    const result = await this.db!`
      INSERT INTO idea_suggestions (
        source_type, source_id, source_name, title, description, rationale,
        category, tags, priority, confidence, supporting_data, status
      ) VALUES (
        ${sourceType}, ${sourceId}, ${sourceName}, ${suggestion.title}, 
        ${suggestion.description}, ${suggestion.rationale},
        ${suggestion.category || 'General'}, ${JSON.stringify(suggestion.tags || [])},
        ${suggestion.priority || 'medium'}, ${suggestion.confidence || 70},
        ${JSON.stringify(suggestion.supportingData || {})}, 'pending'
      ) RETURNING *`;

    return result[0] as IdeaSuggestion;
  }

  /**
   * Get all pending idea suggestions
   */
  async getPendingSuggestions(): Promise<IdeaSuggestion[]> {
    if (!this.db) await this.initialize();

    const result = await this.db!`
      SELECT * FROM idea_suggestions 
      WHERE status = 'pending' 
      ORDER BY priority DESC, confidence DESC, created_at DESC`;

    return result as IdeaSuggestion[];
  }

  /**
   * Get suggestions by source
   */
  async getSuggestionsBySource(sourceType: string, sourceId?: string): Promise<IdeaSuggestion[]> {
    if (!this.db) await this.initialize();

    if (sourceId) {
      const result = await this.db!`
        SELECT * FROM idea_suggestions 
        WHERE source_type = ${sourceType} AND source_id = ${sourceId}
        ORDER BY created_at DESC`;
      return result as IdeaSuggestion[];
    } else {
      const result = await this.db!`
        SELECT * FROM idea_suggestions 
        WHERE source_type = ${sourceType}
        ORDER BY created_at DESC`;
      return result as IdeaSuggestion[];
    }
  }

  /**
   * Review a suggestion (accept or reject)
   */
  async reviewSuggestion(
    suggestionId: string,
    status: 'accepted' | 'rejected',
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<IdeaSuggestion> {
    if (!this.db) await this.initialize();

    const result = await this.db!`
      UPDATE idea_suggestions 
      SET status = ${status === 'accepted' ? 'reviewed' : 'rejected'},
          reviewed_by = ${reviewedBy},
          reviewed_at = NOW(),
          rejection_reason = ${rejectionReason || null}
      WHERE id = ${suggestionId}
      RETURNING *`;

    return result[0] as IdeaSuggestion;
  }

  /**
   * Convert accepted suggestion to Innovation Hub idea
   */
  async convertToIdea(
    suggestionId: string,
    userId: string,
    additionalContext?: string
  ): Promise<{ suggestion: IdeaSuggestion; ideaId: number }> {
    if (!this.db) await this.initialize();

    // Get the suggestion
    const suggestionResult = await this.db!`
      SELECT * FROM idea_suggestions WHERE id = ${suggestionId}`;
    
    const suggestion = suggestionResult[0] as IdeaSuggestion;

    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    if (suggestion.status === 'converted') {
      throw new Error('Suggestion already converted to idea');
    }

    // Create idea in innovation hub
    const ideaResult = await this.db!`
      INSERT INTO ideas (
        user_id, title, description, source, category, tags, current_stage, status
      ) VALUES (
        ${userId}, ${suggestion.title}, 
        ${suggestion.description + '\n\nRationale: ' + suggestion.rationale + (additionalContext ? '\n\n' + additionalContext : '')},
        ${suggestion.sourceType + '_suggestion'}, ${suggestion.category || 'General'},
        ${JSON.stringify(suggestion.tags || [])}, 1, 'active'
      ) RETURNING id`;

    const ideaId = ideaResult[0].id;

    // Update suggestion status
    await this.db!`
      UPDATE idea_suggestions 
      SET status = 'converted', converted_idea_id = ${ideaId}
      WHERE id = ${suggestionId}`;

    // Record conversion
    await this.db!`
      INSERT INTO idea_conversions (suggestion_id, idea_id, converted_by, notes)
      VALUES (${suggestionId}, ${ideaId}, ${userId}, ${additionalContext || null})`;

    return {
      suggestion: { ...suggestion, status: 'converted', convertedIdeaId: ideaId },
      ideaId
    };
  }

  /**
   * Get suggestion statistics
   */
  async getSuggestionStats(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    converted: number;
    bySource: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    if (!this.db) await this.initialize();

    const statsResult = await this.db!`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'reviewed' OR status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'converted') as converted,
        json_object_agg(source_type, source_count) as by_source,
        json_object_agg(priority, priority_count) as by_priority
      FROM (
        SELECT 
          status, source_type, priority,
          COUNT(*) OVER (PARTITION BY source_type) as source_count,
          COUNT(*) OVER (PARTITION BY priority) as priority_count
        FROM idea_suggestions
      ) subq`;

    const stats = statsResult[0] as any;

    return {
      total: parseInt(stats.total || 0),
      pending: parseInt(stats.pending || 0),
      accepted: parseInt(stats.accepted || 0),
      rejected: parseInt(stats.rejected || 0),
      converted: parseInt(stats.converted || 0),
      bySource: stats.by_source || {},
      byPriority: stats.by_priority || {}
    };
  }

  /**
   * Get conversion history
   */
  async getConversionHistory(limit: number = 50): Promise<Array<IdeaConversion & { suggestion: IdeaSuggestion }>> {
    if (!this.db) await this.initialize();

    const result = await this.db!`
      SELECT 
        c.*,
        s.source_type, s.source_name, s.title, s.description, s.rationale,
        s.category, s.tags, s.priority, s.confidence
      FROM idea_conversions c
      JOIN idea_suggestions s ON c.suggestion_id = s.id
      ORDER BY c.created_at DESC
      LIMIT ${limit}`;

    return result as any[];
  }
}

export const innovationHubWorkflowService = new InnovationHubWorkflowService();
