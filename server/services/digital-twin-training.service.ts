import { getDb } from "../db";

const getDbClient = async () => {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db;
};
import { sql } from "drizzle-orm";

export interface TrainingSession {
  id: number;
  userId: number;
  digitalTwinId: number;
  sessionType: string;
  topic: string;
  durationSeconds?: number;
  completionStatus: string;
  effectivenessScore?: number;
  notes?: string;
  metadata?: any;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export interface TrainingInteraction {
  id: number;
  sessionId: number;
  userId: number;
  interactionType: string;
  content: string;
  context?: string;
  confidenceScore?: number;
  userSatisfaction?: number;
  learningValue?: number;
  metadata?: any;
  createdAt: Date;
}

export interface KnowledgeEntry {
  id: number;
  userId: number;
  digitalTwinId: number;
  knowledgeType: string;
  category: string;
  key: string;
  value: string;
  confidence: number;
  source: string;
  sourceReference?: string;
  validationCount: number;
  contradictionCount: number;
  lastValidatedAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningFeedback {
  id: number;
  userId: number;
  digitalTwinId: number;
  feedbackType: string;
  context: string;
  feedbackContent: string;
  severity?: string;
  actionTaken?: string;
  relatedKnowledgeId?: number;
  relatedSessionId?: number;
  metadata?: any;
  createdAt: Date;
  processedAt?: Date;
}

export interface CompetencyProgress {
  id: number;
  userId: number;
  digitalTwinId: number;
  competencyName: string;
  previousScore: number;
  newScore: number;
  improvementReason?: string;
  evidence?: string;
  trainingSessionId?: number;
  createdAt: Date;
}

export interface TrainingModule {
  id: number;
  moduleName: string;
  moduleType: string;
  competencyFocus: string;
  description: string;
  content: any;
  prerequisites?: any;
  estimatedDurationMinutes?: number;
  difficultyLevel?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleCompletion {
  id: number;
  userId: number;
  digitalTwinId: number;
  moduleId: number;
  trainingSessionId?: number;
  completionStatus: string;
  score?: number;
  timeSpentMinutes?: number;
  attempts: number;
  notes?: string;
  startedAt: Date;
  completedAt?: Date;
}

export class DigitalTwinTrainingService {
  // ============================================
  // Training Sessions
  // ============================================

  async createTrainingSession(data: {
    userId: number;
    digitalTwinId: number;
    sessionType: string;
    topic: string;
    notes?: string;
    metadata?: any;
  }): Promise<TrainingSession> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO training_sessions (user_id, digital_twin_id, session_type, topic, notes, metadata)
      VALUES (${data.userId}, ${data.digitalTwinId}, ${data.sessionType}, ${data.topic}, ${data.notes || null}, ${JSON.stringify(data.metadata || {})})
      RETURNING *
    `);
    return result.rows[0] as TrainingSession;
  }

  async getTrainingSession(sessionId: number): Promise<TrainingSession | null> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      SELECT * FROM training_sessions WHERE id = ${sessionId}
    `);
    return (result.rows[0] as TrainingSession) || null;
  }

  async getTrainingSessions(filters: {
    userId?: number;
    digitalTwinId?: number;
    sessionType?: string;
    completionStatus?: string;
    limit?: number;
    offset?: number;
  }): Promise<TrainingSession[]> {
    let query = sql`SELECT * FROM training_sessions WHERE 1=1`;
    
    if (filters.userId) {
      query = sql`${query} AND user_id = ${filters.userId}`;
    }
    if (filters.digitalTwinId) {
      query = sql`${query} AND digital_twin_id = ${filters.digitalTwinId}`;
    }
    if (filters.sessionType) {
      query = sql`${query} AND session_type = ${filters.sessionType}`;
    }
    if (filters.completionStatus) {
      query = sql`${query} AND completion_status = ${filters.completionStatus}`;
    }
    
    query = sql`${query} ORDER BY created_at DESC`;
    
    if (filters.limit) {
      query = sql`${query} LIMIT ${filters.limit}`;
    }
    if (filters.offset) {
      query = sql`${query} OFFSET ${filters.offset}`;
    }
    
    const result = await db.execute(query);
    return result.rows as TrainingSession[];
  }

  async completeTrainingSession(sessionId: number, data: {
    effectivenessScore?: number;
    notes?: string;
  }): Promise<TrainingSession> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE training_sessions
      SET completion_status = 'completed',
          completed_at = NOW(),
          effectiveness_score = ${data.effectivenessScore || null},
          notes = COALESCE(${data.notes || null}, notes),
          updated_at = NOW()
      WHERE id = ${sessionId}
      RETURNING *
    `);
    return result.rows[0] as TrainingSession;
  }

  // ============================================
  // Training Interactions
  // ============================================

  async logInteraction(data: {
    sessionId: number;
    userId: number;
    interactionType: string;
    content: string;
    context?: string;
    confidenceScore?: number;
    userSatisfaction?: number;
    learningValue?: number;
    metadata?: any;
  }): Promise<TrainingInteraction> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO training_interactions (
        session_id, user_id, interaction_type, content, context,
        confidence_score, user_satisfaction, learning_value, metadata
      )
      VALUES (
        ${data.sessionId}, ${data.userId}, ${data.interactionType}, ${data.content},
        ${data.context || null}, ${data.confidenceScore || null},
        ${data.userSatisfaction || null}, ${data.learningValue || null},
        ${JSON.stringify(data.metadata || {})}
      )
      RETURNING *
    `);
    return result.rows[0] as TrainingInteraction;
  }

  async getSessionInteractions(sessionId: number): Promise<TrainingInteraction[]> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      SELECT * FROM training_interactions
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `);
    return result.rows as TrainingInteraction[];
  }

  // ============================================
  // Knowledge Management
  // ============================================

  async addKnowledge(data: {
    userId: number;
    digitalTwinId: number;
    knowledgeType: string;
    category: string;
    key: string;
    value: string;
    confidence?: number;
    source: string;
    sourceReference?: string;
    metadata?: any;
  }): Promise<KnowledgeEntry> {
    // Check if knowledge with this key already exists
    const existing = await db.execute(sql`
      SELECT * FROM knowledge_entries
      WHERE user_id = ${data.userId} AND key = ${data.key}
    `);

    if (existing.rows.length > 0) {
      // Update existing knowledge
      const db = await getDbClient();
    const result = await db.execute(sql`
        UPDATE knowledge_entries
        SET value = ${data.value},
            confidence = ${data.confidence || 0.5},
            source = ${data.source},
            source_reference = ${data.sourceReference || null},
            validation_count = validation_count + 1,
            last_validated_at = NOW(),
            metadata = ${JSON.stringify(data.metadata || {})},
            updated_at = NOW()
        WHERE user_id = ${data.userId} AND key = ${data.key}
        RETURNING *
      `);
      return result.rows[0] as KnowledgeEntry;
    } else {
      // Insert new knowledge
      const db = await getDbClient();
    const result = await db.execute(sql`
        INSERT INTO knowledge_entries (
          user_id, digital_twin_id, knowledge_type, category, key, value,
          confidence, source, source_reference, metadata
        )
        VALUES (
          ${data.userId}, ${data.digitalTwinId}, ${data.knowledgeType}, ${data.category},
          ${data.key}, ${data.value}, ${data.confidence || 0.5}, ${data.source},
          ${data.sourceReference || null}, ${JSON.stringify(data.metadata || {})}
        )
        RETURNING *
      `);
      return result.rows[0] as KnowledgeEntry;
    }
  }

  async getKnowledge(filters: {
    userId?: number;
    digitalTwinId?: number;
    knowledgeType?: string;
    category?: string;
    key?: string;
    minConfidence?: number;
  }): Promise<KnowledgeEntry[]> {
    let query = sql`SELECT * FROM knowledge_entries WHERE 1=1`;
    
    if (filters.userId) {
      query = sql`${query} AND user_id = ${filters.userId}`;
    }
    if (filters.digitalTwinId) {
      query = sql`${query} AND digital_twin_id = ${filters.digitalTwinId}`;
    }
    if (filters.knowledgeType) {
      query = sql`${query} AND knowledge_type = ${filters.knowledgeType}`;
    }
    if (filters.category) {
      query = sql`${query} AND category = ${filters.category}`;
    }
    if (filters.key) {
      query = sql`${query} AND key = ${filters.key}`;
    }
    if (filters.minConfidence !== undefined) {
      query = sql`${query} AND confidence >= ${filters.minConfidence}`;
    }
    
    query = sql`${query} ORDER BY confidence DESC, updated_at DESC`;
    
    const result = await db.execute(query);
    return result.rows as KnowledgeEntry[];
  }

  async validateKnowledge(knowledgeId: number): Promise<KnowledgeEntry> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE knowledge_entries
      SET validation_count = validation_count + 1,
          last_validated_at = NOW(),
          confidence = LEAST(1.0, confidence + 0.1),
          updated_at = NOW()
      WHERE id = ${knowledgeId}
      RETURNING *
    `);
    return result.rows[0] as KnowledgeEntry;
  }

  async contradictKnowledge(knowledgeId: number): Promise<KnowledgeEntry> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE knowledge_entries
      SET contradiction_count = contradiction_count + 1,
          confidence = GREATEST(0.0, confidence - 0.15),
          updated_at = NOW()
      WHERE id = ${knowledgeId}
      RETURNING *
    `);
    return result.rows[0] as KnowledgeEntry;
  }

  // ============================================
  // Learning Feedback
  // ============================================

  async submitFeedback(data: {
    userId: number;
    digitalTwinId: number;
    feedbackType: string;
    context: string;
    feedbackContent: string;
    severity?: string;
    relatedKnowledgeId?: number;
    relatedSessionId?: number;
    metadata?: any;
  }): Promise<LearningFeedback> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO learning_feedback (
        user_id, digital_twin_id, feedback_type, context, feedback_content,
        severity, related_knowledge_id, related_session_id, metadata
      )
      VALUES (
        ${data.userId}, ${data.digitalTwinId}, ${data.feedbackType}, ${data.context},
        ${data.feedbackContent}, ${data.severity || null}, ${data.relatedKnowledgeId || null},
        ${data.relatedSessionId || null}, ${JSON.stringify(data.metadata || {})}
      )
      RETURNING *
    `);
    return result.rows[0] as LearningFeedback;
  }

  async processFeedback(feedbackId: number, actionTaken: string): Promise<LearningFeedback> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE learning_feedback
      SET action_taken = ${actionTaken},
          processed_at = NOW()
      WHERE id = ${feedbackId}
      RETURNING *
    `);
    return result.rows[0] as LearningFeedback;
  }

  async getPendingFeedback(digitalTwinId: number): Promise<LearningFeedback[]> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      SELECT * FROM learning_feedback
      WHERE digital_twin_id = ${digitalTwinId}
        AND processed_at IS NULL
      ORDER BY created_at ASC
    `);
    return result.rows as LearningFeedback[];
  }

  // ============================================
  // Competency Progress
  // ============================================

  async recordCompetencyProgress(data: {
    userId: number;
    digitalTwinId: number;
    competencyName: string;
    previousScore: number;
    newScore: number;
    improvementReason?: string;
    evidence?: string;
    trainingSessionId?: number;
  }): Promise<CompetencyProgress> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO competency_progress (
        user_id, digital_twin_id, competency_name, previous_score, new_score,
        improvement_reason, evidence, training_session_id
      )
      VALUES (
        ${data.userId}, ${data.digitalTwinId}, ${data.competencyName},
        ${data.previousScore}, ${data.newScore}, ${data.improvementReason || null},
        ${data.evidence || null}, ${data.trainingSessionId || null}
      )
      RETURNING *
    `);
    return result.rows[0] as CompetencyProgress;
  }

  async getCompetencyHistory(filters: {
    userId?: number;
    digitalTwinId?: number;
    competencyName?: string;
    limit?: number;
  }): Promise<CompetencyProgress[]> {
    let query = sql`SELECT * FROM competency_progress WHERE 1=1`;
    
    if (filters.userId) {
      query = sql`${query} AND user_id = ${filters.userId}`;
    }
    if (filters.digitalTwinId) {
      query = sql`${query} AND digital_twin_id = ${filters.digitalTwinId}`;
    }
    if (filters.competencyName) {
      query = sql`${query} AND competency_name = ${filters.competencyName}`;
    }
    
    query = sql`${query} ORDER BY created_at DESC`;
    
    if (filters.limit) {
      query = sql`${query} LIMIT ${filters.limit}`;
    }
    
    const result = await db.execute(query);
    return result.rows as CompetencyProgress[];
  }

  // ============================================
  // Training Modules
  // ============================================

  async createTrainingModule(data: {
    moduleName: string;
    moduleType: string;
    competencyFocus: string;
    description: string;
    content: any;
    prerequisites?: any;
    estimatedDurationMinutes?: number;
    difficultyLevel?: number;
  }): Promise<TrainingModule> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO training_modules (
        module_name, module_type, competency_focus, description, content,
        prerequisites, estimated_duration_minutes, difficulty_level
      )
      VALUES (
        ${data.moduleName}, ${data.moduleType}, ${data.competencyFocus}, ${data.description},
        ${JSON.stringify(data.content)}, ${JSON.stringify(data.prerequisites || [])},
        ${data.estimatedDurationMinutes || null}, ${data.difficultyLevel || null}
      )
      RETURNING *
    `);
    return result.rows[0] as TrainingModule;
  }

  async getTrainingModules(filters: {
    moduleType?: string;
    competencyFocus?: string;
    isActive?: boolean;
  }): Promise<TrainingModule[]> {
    let query = sql`SELECT * FROM training_modules WHERE 1=1`;
    
    if (filters.moduleType) {
      query = sql`${query} AND module_type = ${filters.moduleType}`;
    }
    if (filters.competencyFocus) {
      query = sql`${query} AND competency_focus = ${filters.competencyFocus}`;
    }
    if (filters.isActive !== undefined) {
      query = sql`${query} AND is_active = ${filters.isActive}`;
    }
    
    query = sql`${query} ORDER BY difficulty_level ASC, module_name ASC`;
    
    const result = await db.execute(query);
    return result.rows as TrainingModule[];
  }

  async startModule(data: {
    userId: number;
    digitalTwinId: number;
    moduleId: number;
    trainingSessionId?: number;
  }): Promise<ModuleCompletion> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO module_completions (user_id, digital_twin_id, module_id, training_session_id)
      VALUES (${data.userId}, ${data.digitalTwinId}, ${data.moduleId}, ${data.trainingSessionId || null})
      RETURNING *
    `);
    return result.rows[0] as ModuleCompletion;
  }

  async completeModule(completionId: number, data: {
    score?: number;
    timeSpentMinutes?: number;
    notes?: string;
  }): Promise<ModuleCompletion> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE module_completions
      SET completion_status = 'completed',
          score = ${data.score || null},
          time_spent_minutes = ${data.timeSpentMinutes || null},
          notes = ${data.notes || null},
          completed_at = NOW()
      WHERE id = ${completionId}
      RETURNING *
    `);
    return result.rows[0] as ModuleCompletion;
  }

  async getModuleCompletions(filters: {
    userId?: number;
    digitalTwinId?: number;
    moduleId?: number;
    completionStatus?: string;
  }): Promise<ModuleCompletion[]> {
    let query = sql`SELECT * FROM module_completions WHERE 1=1`;
    
    if (filters.userId) {
      query = sql`${query} AND user_id = ${filters.userId}`;
    }
    if (filters.digitalTwinId) {
      query = sql`${query} AND digital_twin_id = ${filters.digitalTwinId}`;
    }
    if (filters.moduleId) {
      query = sql`${query} AND module_id = ${filters.moduleId}`;
    }
    if (filters.completionStatus) {
      query = sql`${query} AND completion_status = ${filters.completionStatus}`;
    }
    
    query = sql`${query} ORDER BY started_at DESC`;
    
    const result = await db.execute(query);
    return result.rows as ModuleCompletion[];
  }

  // ============================================
  // Analytics & Reporting
  // ============================================

  async getTrainingStats(userId: number, digitalTwinId: number): Promise<any> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      SELECT
        COUNT(DISTINCT ts.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN ts.completion_status = 'completed' THEN ts.id END) as completed_sessions,
        AVG(CASE WHEN ts.effectiveness_score IS NOT NULL THEN ts.effectiveness_score END) as avg_effectiveness,
        SUM(ts.duration_seconds) / 3600.0 as total_hours,
        COUNT(DISTINCT ke.id) as knowledge_entries,
        AVG(ke.confidence) as avg_knowledge_confidence,
        COUNT(DISTINCT lf.id) as feedback_count,
        COUNT(DISTINCT mc.id) as modules_completed
      FROM training_sessions ts
      LEFT JOIN knowledge_entries ke ON ke.user_id = ts.user_id AND ke.digital_twin_id = ts.digital_twin_id
      LEFT JOIN learning_feedback lf ON lf.user_id = ts.user_id AND lf.digital_twin_id = ts.digital_twin_id
      LEFT JOIN module_completions mc ON mc.user_id = ts.user_id AND mc.digital_twin_id = ts.digital_twin_id AND mc.completion_status = 'completed'
      WHERE ts.user_id = ${userId} AND ts.digital_twin_id = ${digitalTwinId}
    `);
    return result.rows[0];
  }
}
