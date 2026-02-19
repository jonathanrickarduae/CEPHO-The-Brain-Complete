import { getDb } from "../db";
import { sql } from "drizzle-orm";

const getDbClient = async () => {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db;
};

export interface CosTrainingSession {
  id: number;
  userId: number;
  sessionType: string;
  topic: string;
  durationSeconds?: number;
  completionStatus: string;
  effectivenessScore?: number;
  decisionsReviewed: number;
  insightsGenerated: number;
  notes?: string;
  metadata?: any;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export interface CosDecisionTracking {
  id: number;
  userId: number;
  trainingSessionId?: number;
  decisionType: string;
  decisionContext: string;
  decisionMade: string;
  reasoning: string;
  confidenceLevel?: number;
  alternativesConsidered?: any;
  factorsAnalyzed?: any;
  expectedOutcome?: string;
  actualOutcome?: string;
  outcomeRating?: number;
  outcomeNotes?: string;
  lessonsLearned?: string;
  wouldDecideDifferently?: boolean;
  improvementAreas?: string;
  createdAt: Date;
  outcomeRecordedAt?: Date;
}

export interface CosKnowledgeBase {
  id: number;
  userId: number;
  knowledgeCategory: string;
  domain: string;
  title: string;
  description: string;
  applicability?: string;
  confidence: number;
  source: string;
  sourceReference?: string;
  validationCount: number;
  applicationCount: number;
  successRate?: number;
  lastAppliedAt?: Date;
  lastValidatedAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CosLearningFeedback {
  id: number;
  userId: number;
  feedbackType: string;
  context: string;
  feedbackContent: string;
  rating?: number;
  severity?: string;
  relatedDecisionId?: number;
  relatedKnowledgeId?: number;
  actionTaken?: string;
  improvementImplemented: boolean;
  metadata?: any;
  createdAt: Date;
  processedAt?: Date;
}

export interface CosSkillProgress {
  id: number;
  userId: number;
  skillName: string;
  previousScore: number;
  newScore: number;
  improvementReason?: string;
  evidence?: string;
  trainingSessionId?: number;
  decisionId?: number;
  createdAt: Date;
}

export interface CosTrainingScenario {
  id: number;
  scenarioName: string;
  scenarioType: string;
  difficultyLevel?: number;
  description: string;
  scenarioData: any;
  learningObjectives?: any;
  successCriteria?: any;
  estimatedDurationMinutes?: number;
  prerequisites?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CosScenarioCompletion {
  id: number;
  userId: number;
  scenarioId: number;
  trainingSessionId?: number;
  completionStatus: string;
  score?: number;
  timeSpentMinutes?: number;
  decisionsMade?: number;
  qualityScore?: number;
  feedback?: string;
  notes?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface CosPerformanceMetrics {
  id: number;
  userId: number;
  metricDate: Date;
  decisionsMade: number;
  avgDecisionQuality?: number;
  avgConfidence?: number;
  knowledgeEntriesAdded: number;
  trainingSessionsCompleted: number;
  scenariosCompleted: number;
  feedbackReceived: number;
  avgFeedbackRating?: number;
  skillsImproved: number;
  metadata?: any;
  createdAt: Date;
}

export class ChiefOfStaffTrainingService {
  // ============================================
  // Training Sessions
  // ============================================

  async createTrainingSession(data: {
    userId: number;
    sessionType: string;
    topic: string;
    notes?: string;
    metadata?: any;
  }): Promise<CosTrainingSession> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO cos_training_sessions (user_id, session_type, topic, notes, metadata)
      VALUES (${data.userId}, ${data.sessionType}, ${data.topic}, ${data.notes || null}, ${JSON.stringify(data.metadata || {})})
      RETURNING *
    `);
    return result.rows[0] as CosTrainingSession;
  }

  async getTrainingSession(sessionId: number): Promise<CosTrainingSession | null> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      SELECT * FROM cos_training_sessions WHERE id = ${sessionId}
    `);
    return (result.rows[0] as CosTrainingSession) || null;
  }

  async getTrainingSessions(filters: {
    userId?: number;
    sessionType?: string;
    completionStatus?: string;
    limit?: number;
    offset?: number;
  }): Promise<CosTrainingSession[]> {
    let query = sql`SELECT * FROM cos_training_sessions WHERE 1=1`;
    
    if (filters.userId) {
      query = sql`${query} AND user_id = ${filters.userId}`;
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
    
    const db = await getDbClient();
    const result = await db.execute(query);
    return result.rows as CosTrainingSession[];
  }

  async completeTrainingSession(sessionId: number, data: {
    effectivenessScore?: number;
    decisionsReviewed?: number;
    insightsGenerated?: number;
    notes?: string;
  }): Promise<CosTrainingSession> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE cos_training_sessions
      SET completion_status = 'completed',
          completed_at = NOW(),
          effectiveness_score = ${data.effectivenessScore || null},
          decisions_reviewed = COALESCE(${data.decisionsReviewed || null}, decisions_reviewed),
          insights_generated = COALESCE(${data.insightsGenerated || null}, insights_generated),
          notes = COALESCE(${data.notes || null}, notes),
          updated_at = NOW()
      WHERE id = ${sessionId}
      RETURNING *
    `);
    return result.rows[0] as CosTrainingSession;
  }

  // ============================================
  // Decision Tracking
  // ============================================

  async trackDecision(data: {
    userId: number;
    trainingSessionId?: number;
    decisionType: string;
    decisionContext: string;
    decisionMade: string;
    reasoning: string;
    confidenceLevel?: number;
    alternativesConsidered?: any;
    factorsAnalyzed?: any;
    expectedOutcome?: string;
  }): Promise<CosDecisionTracking> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO cos_decision_tracking (
        user_id, training_session_id, decision_type, decision_context, decision_made,
        reasoning, confidence_level, alternatives_considered, factors_analyzed, expected_outcome
      )
      VALUES (
        ${data.userId}, ${data.trainingSessionId || null}, ${data.decisionType}, ${data.decisionContext},
        ${data.decisionMade}, ${data.reasoning}, ${data.confidenceLevel || null},
        ${JSON.stringify(data.alternativesConsidered || [])}, ${JSON.stringify(data.factorsAnalyzed || {})},
        ${data.expectedOutcome || null}
      )
      RETURNING *
    `);
    return result.rows[0] as CosDecisionTracking;
  }

  async recordDecisionOutcome(decisionId: number, data: {
    actualOutcome: string;
    outcomeRating: number;
    outcomeNotes?: string;
    lessonsLearned?: string;
    wouldDecideDifferently?: boolean;
    improvementAreas?: string;
  }): Promise<CosDecisionTracking> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE cos_decision_tracking
      SET actual_outcome = ${data.actualOutcome},
          outcome_rating = ${data.outcomeRating},
          outcome_notes = ${data.outcomeNotes || null},
          lessons_learned = ${data.lessonsLearned || null},
          would_decide_differently = ${data.wouldDecideDifferently || null},
          improvement_areas = ${data.improvementAreas || null},
          outcome_recorded_at = NOW()
      WHERE id = ${decisionId}
      RETURNING *
    `);
    return result.rows[0] as CosDecisionTracking;
  }

  async getDecisions(filters: {
    userId?: number;
    decisionType?: string;
    hasOutcome?: boolean;
    minOutcomeRating?: number;
    limit?: number;
  }): Promise<CosDecisionTracking[]> {
    let query = sql`SELECT * FROM cos_decision_tracking WHERE 1=1`;
    
    if (filters.userId) {
      query = sql`${query} AND user_id = ${filters.userId}`;
    }
    if (filters.decisionType) {
      query = sql`${query} AND decision_type = ${filters.decisionType}`;
    }
    if (filters.hasOutcome !== undefined) {
      if (filters.hasOutcome) {
        query = sql`${query} AND outcome_recorded_at IS NOT NULL`;
      } else {
        query = sql`${query} AND outcome_recorded_at IS NULL`;
      }
    }
    if (filters.minOutcomeRating !== undefined) {
      query = sql`${query} AND outcome_rating >= ${filters.minOutcomeRating}`;
    }
    
    query = sql`${query} ORDER BY created_at DESC`;
    
    if (filters.limit) {
      query = sql`${query} LIMIT ${filters.limit}`;
    }
    
    const db = await getDbClient();
    const result = await db.execute(query);
    return result.rows as CosDecisionTracking[];
  }

  // ============================================
  // Knowledge Base
  // ============================================

  async addKnowledge(data: {
    userId: number;
    knowledgeCategory: string;
    domain: string;
    title: string;
    description: string;
    applicability?: string;
    confidence?: number;
    source: string;
    sourceReference?: string;
    metadata?: any;
  }): Promise<CosKnowledgeBase> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO cos_knowledge_base (
        user_id, knowledge_category, domain, title, description, applicability,
        confidence, source, source_reference, metadata
      )
      VALUES (
        ${data.userId}, ${data.knowledgeCategory}, ${data.domain}, ${data.title},
        ${data.description}, ${data.applicability || null}, ${data.confidence || 0.5},
        ${data.source}, ${data.sourceReference || null}, ${JSON.stringify(data.metadata || {})}
      )
      RETURNING *
    `);
    return result.rows[0] as CosKnowledgeBase;
  }

  async getKnowledge(filters: {
    userId?: number;
    knowledgeCategory?: string;
    domain?: string;
    minConfidence?: number;
    minSuccessRate?: number;
  }): Promise<CosKnowledgeBase[]> {
    let query = sql`SELECT * FROM cos_knowledge_base WHERE 1=1`;
    
    if (filters.userId) {
      query = sql`${query} AND user_id = ${filters.userId}`;
    }
    if (filters.knowledgeCategory) {
      query = sql`${query} AND knowledge_category = ${filters.knowledgeCategory}`;
    }
    if (filters.domain) {
      query = sql`${query} AND domain = ${filters.domain}`;
    }
    if (filters.minConfidence !== undefined) {
      query = sql`${query} AND confidence >= ${filters.minConfidence}`;
    }
    if (filters.minSuccessRate !== undefined) {
      query = sql`${query} AND success_rate >= ${filters.minSuccessRate}`;
    }
    
    query = sql`${query} ORDER BY confidence DESC, success_rate DESC NULLS LAST`;
    
    const db = await getDbClient();
    const result = await db.execute(query);
    return result.rows as CosKnowledgeBase[];
  }

  async applyKnowledge(knowledgeId: number, successful: boolean): Promise<CosKnowledgeBase> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE cos_knowledge_base
      SET application_count = application_count + 1,
          success_rate = CASE
            WHEN application_count = 0 THEN ${successful ? 1.0 : 0.0}
            ELSE (COALESCE(success_rate, 0.5) * application_count + ${successful ? 1.0 : 0.0}) / (application_count + 1)
          END,
          last_applied_at = NOW(),
          confidence = CASE
            WHEN ${successful} THEN LEAST(1.0, confidence + 0.05)
            ELSE GREATEST(0.0, confidence - 0.05)
          END,
          updated_at = NOW()
      WHERE id = ${knowledgeId}
      RETURNING *
    `);
    return result.rows[0] as CosKnowledgeBase;
  }

  async validateKnowledge(knowledgeId: number): Promise<CosKnowledgeBase> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE cos_knowledge_base
      SET validation_count = validation_count + 1,
          last_validated_at = NOW(),
          confidence = LEAST(1.0, confidence + 0.1),
          updated_at = NOW()
      WHERE id = ${knowledgeId}
      RETURNING *
    `);
    return result.rows[0] as CosKnowledgeBase;
  }

  // ============================================
  // Learning Feedback
  // ============================================

  async submitFeedback(data: {
    userId: number;
    feedbackType: string;
    context: string;
    feedbackContent: string;
    rating?: number;
    severity?: string;
    relatedDecisionId?: number;
    relatedKnowledgeId?: number;
    metadata?: any;
  }): Promise<CosLearningFeedback> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO cos_learning_feedback (
        user_id, feedback_type, context, feedback_content, rating, severity,
        related_decision_id, related_knowledge_id, metadata
      )
      VALUES (
        ${data.userId}, ${data.feedbackType}, ${data.context}, ${data.feedbackContent},
        ${data.rating || null}, ${data.severity || null}, ${data.relatedDecisionId || null},
        ${data.relatedKnowledgeId || null}, ${JSON.stringify(data.metadata || {})}
      )
      RETURNING *
    `);
    return result.rows[0] as CosLearningFeedback;
  }

  async processFeedback(feedbackId: number, actionTaken: string): Promise<CosLearningFeedback> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE cos_learning_feedback
      SET action_taken = ${actionTaken},
          improvement_implemented = true,
          processed_at = NOW()
      WHERE id = ${feedbackId}
      RETURNING *
    `);
    return result.rows[0] as CosLearningFeedback;
  }

  async getPendingFeedback(userId: number): Promise<CosLearningFeedback[]> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      SELECT * FROM cos_learning_feedback
      WHERE user_id = ${userId}
        AND processed_at IS NULL
      ORDER BY created_at ASC
    `);
    return result.rows as CosLearningFeedback[];
  }

  // ============================================
  // Skill Progress
  // ============================================

  async recordSkillProgress(data: {
    userId: number;
    skillName: string;
    previousScore: number;
    newScore: number;
    improvementReason?: string;
    evidence?: string;
    trainingSessionId?: number;
    decisionId?: number;
  }): Promise<CosSkillProgress> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO cos_skill_progress (
        user_id, skill_name, previous_score, new_score, improvement_reason,
        evidence, training_session_id, decision_id
      )
      VALUES (
        ${data.userId}, ${data.skillName}, ${data.previousScore}, ${data.newScore},
        ${data.improvementReason || null}, ${data.evidence || null},
        ${data.trainingSessionId || null}, ${data.decisionId || null}
      )
      RETURNING *
    `);
    return result.rows[0] as CosSkillProgress;
  }

  async getSkillHistory(filters: {
    userId?: number;
    skillName?: string;
    limit?: number;
  }): Promise<CosSkillProgress[]> {
    let query = sql`SELECT * FROM cos_skill_progress WHERE 1=1`;
    
    if (filters.userId) {
      query = sql`${query} AND user_id = ${filters.userId}`;
    }
    if (filters.skillName) {
      query = sql`${query} AND skill_name = ${filters.skillName}`;
    }
    
    query = sql`${query} ORDER BY created_at DESC`;
    
    if (filters.limit) {
      query = sql`${query} LIMIT ${filters.limit}`;
    }
    
    const db = await getDbClient();
    const result = await db.execute(query);
    return result.rows as CosSkillProgress[];
  }

  // ============================================
  // Training Scenarios
  // ============================================

  async createScenario(data: {
    scenarioName: string;
    scenarioType: string;
    difficultyLevel?: number;
    description: string;
    scenarioData: any;
    learningObjectives?: any;
    successCriteria?: any;
    estimatedDurationMinutes?: number;
    prerequisites?: any;
  }): Promise<CosTrainingScenario> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO cos_training_scenarios (
        scenario_name, scenario_type, difficulty_level, description, scenario_data,
        learning_objectives, success_criteria, estimated_duration_minutes, prerequisites
      )
      VALUES (
        ${data.scenarioName}, ${data.scenarioType}, ${data.difficultyLevel || null},
        ${data.description}, ${JSON.stringify(data.scenarioData)},
        ${JSON.stringify(data.learningObjectives || [])}, ${JSON.stringify(data.successCriteria || {})},
        ${data.estimatedDurationMinutes || null}, ${JSON.stringify(data.prerequisites || [])}
      )
      RETURNING *
    `);
    return result.rows[0] as CosTrainingScenario;
  }

  async getScenarios(filters: {
    scenarioType?: string;
    maxDifficulty?: number;
    isActive?: boolean;
  }): Promise<CosTrainingScenario[]> {
    let query = sql`SELECT * FROM cos_training_scenarios WHERE 1=1`;
    
    if (filters.scenarioType) {
      query = sql`${query} AND scenario_type = ${filters.scenarioType}`;
    }
    if (filters.maxDifficulty !== undefined) {
      query = sql`${query} AND difficulty_level <= ${filters.maxDifficulty}`;
    }
    if (filters.isActive !== undefined) {
      query = sql`${query} AND is_active = ${filters.isActive}`;
    }
    
    query = sql`${query} ORDER BY difficulty_level ASC, scenario_name ASC`;
    
    const db = await getDbClient();
    const result = await db.execute(query);
    return result.rows as CosTrainingScenario[];
  }

  async startScenario(data: {
    userId: number;
    scenarioId: number;
    trainingSessionId?: number;
  }): Promise<CosScenarioCompletion> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      INSERT INTO cos_scenario_completions (user_id, scenario_id, training_session_id)
      VALUES (${data.userId}, ${data.scenarioId}, ${data.trainingSessionId || null})
      RETURNING *
    `);
    return result.rows[0] as CosScenarioCompletion;
  }

  async completeScenario(completionId: number, data: {
    score?: number;
    timeSpentMinutes?: number;
    decisionsMade?: number;
    qualityScore?: number;
    feedback?: string;
    notes?: string;
  }): Promise<CosScenarioCompletion> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      UPDATE cos_scenario_completions
      SET completion_status = 'completed',
          score = ${data.score || null},
          time_spent_minutes = ${data.timeSpentMinutes || null},
          decisions_made = ${data.decisionsMade || null},
          quality_score = ${data.qualityScore || null},
          feedback = ${data.feedback || null},
          notes = ${data.notes || null},
          completed_at = NOW()
      WHERE id = ${completionId}
      RETURNING *
    `);
    return result.rows[0] as CosScenarioCompletion;
  }

  async getScenarioCompletions(filters: {
    userId?: number;
    scenarioId?: number;
    completionStatus?: string;
  }): Promise<CosScenarioCompletion[]> {
    let query = sql`SELECT * FROM cos_scenario_completions WHERE 1=1`;
    
    if (filters.userId) {
      query = sql`${query} AND user_id = ${filters.userId}`;
    }
    if (filters.scenarioId) {
      query = sql`${query} AND scenario_id = ${filters.scenarioId}`;
    }
    if (filters.completionStatus) {
      query = sql`${query} AND completion_status = ${filters.completionStatus}`;
    }
    
    query = sql`${query} ORDER BY started_at DESC`;
    
    const db = await getDbClient();
    const result = await db.execute(query);
    return result.rows as CosScenarioCompletion[];
  }

  // ============================================
  // Performance Metrics
  // ============================================

  async updatePerformanceMetrics(userId: number, date: Date): Promise<CosPerformanceMetrics> {
    const db = await getDbClient();
    const dateStr = date.toISOString().split('T')[0];
    
    // Calculate metrics for the day
    const metrics = await db.execute(sql`
      SELECT
        COUNT(DISTINCT dt.id) as decisions_made,
        AVG(dt.outcome_rating) as avg_decision_quality,
        AVG(dt.confidence_level) as avg_confidence,
        COUNT(DISTINCT kb.id) as knowledge_entries_added,
        COUNT(DISTINCT ts.id) as training_sessions_completed,
        COUNT(DISTINCT sc.id) as scenarios_completed,
        COUNT(DISTINCT lf.id) as feedback_received,
        AVG(lf.rating) as avg_feedback_rating,
        COUNT(DISTINCT sp.id) as skills_improved
      FROM (SELECT ${userId} as user_id, ${dateStr}::date as metric_date) base
      LEFT JOIN cos_decision_tracking dt ON dt.user_id = base.user_id AND DATE(dt.created_at) = base.metric_date
      LEFT JOIN cos_knowledge_base kb ON kb.user_id = base.user_id AND DATE(kb.created_at) = base.metric_date
      LEFT JOIN cos_training_sessions ts ON ts.user_id = base.user_id AND DATE(ts.created_at) = base.metric_date AND ts.completion_status = 'completed'
      LEFT JOIN cos_scenario_completions sc ON sc.user_id = base.user_id AND DATE(sc.started_at) = base.metric_date AND sc.completion_status = 'completed'
      LEFT JOIN cos_learning_feedback lf ON lf.user_id = base.user_id AND DATE(lf.created_at) = base.metric_date
      LEFT JOIN cos_skill_progress sp ON sp.user_id = base.user_id AND DATE(sp.created_at) = base.metric_date
    `);
    
    const metricsData = metrics.rows[0] as any;
    
    // Upsert performance metrics
    const result = await db.execute(sql`
      INSERT INTO cos_performance_metrics (
        user_id, metric_date, decisions_made, avg_decision_quality, avg_confidence,
        knowledge_entries_added, training_sessions_completed, scenarios_completed,
        feedback_received, avg_feedback_rating, skills_improved
      )
      VALUES (
        ${userId}, ${dateStr}::date, ${metricsData.decisions_made || 0},
        ${metricsData.avg_decision_quality || null}, ${metricsData.avg_confidence || null},
        ${metricsData.knowledge_entries_added || 0}, ${metricsData.training_sessions_completed || 0},
        ${metricsData.scenarios_completed || 0}, ${metricsData.feedback_received || 0},
        ${metricsData.avg_feedback_rating || null}, ${metricsData.skills_improved || 0}
      )
      ON CONFLICT (user_id, metric_date) DO UPDATE SET
        decisions_made = EXCLUDED.decisions_made,
        avg_decision_quality = EXCLUDED.avg_decision_quality,
        avg_confidence = EXCLUDED.avg_confidence,
        knowledge_entries_added = EXCLUDED.knowledge_entries_added,
        training_sessions_completed = EXCLUDED.training_sessions_completed,
        scenarios_completed = EXCLUDED.scenarios_completed,
        feedback_received = EXCLUDED.feedback_received,
        avg_feedback_rating = EXCLUDED.avg_feedback_rating,
        skills_improved = EXCLUDED.skills_improved
      RETURNING *
    `);
    
    return result.rows[0] as CosPerformanceMetrics;
  }

  async getPerformanceMetrics(filters: {
    userId: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<CosPerformanceMetrics[]> {
    let query = sql`SELECT * FROM cos_performance_metrics WHERE user_id = ${filters.userId}`;
    
    if (filters.startDate) {
      const startStr = filters.startDate.toISOString().split('T')[0];
      query = sql`${query} AND metric_date >= ${startStr}::date`;
    }
    if (filters.endDate) {
      const endStr = filters.endDate.toISOString().split('T')[0];
      query = sql`${query} AND metric_date <= ${endStr}::date`;
    }
    
    query = sql`${query} ORDER BY metric_date DESC`;
    
    if (filters.limit) {
      query = sql`${query} LIMIT ${filters.limit}`;
    }
    
    const db = await getDbClient();
    const result = await db.execute(query);
    return result.rows as CosPerformanceMetrics[];
  }

  // ============================================
  // Analytics & Reporting
  // ============================================

  async getTrainingStats(userId: number): Promise<any> {
    const db = await getDbClient();
    const result = await db.execute(sql`
      SELECT
        COUNT(DISTINCT ts.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN ts.completion_status = 'completed' THEN ts.id END) as completed_sessions,
        AVG(CASE WHEN ts.effectiveness_score IS NOT NULL THEN ts.effectiveness_score END) as avg_effectiveness,
        SUM(ts.duration_seconds) / 3600.0 as total_hours,
        COUNT(DISTINCT dt.id) as decisions_tracked,
        AVG(dt.outcome_rating) as avg_decision_quality,
        COUNT(DISTINCT kb.id) as knowledge_entries,
        AVG(kb.confidence) as avg_knowledge_confidence,
        COUNT(DISTINCT lf.id) as feedback_count,
        AVG(lf.rating) as avg_feedback_rating,
        COUNT(DISTINCT sc.id) as scenarios_completed
      FROM cos_training_sessions ts
      LEFT JOIN cos_decision_tracking dt ON dt.user_id = ts.user_id
      LEFT JOIN cos_knowledge_base kb ON kb.user_id = ts.user_id
      LEFT JOIN cos_learning_feedback lf ON lf.user_id = ts.user_id
      LEFT JOIN cos_scenario_completions sc ON sc.user_id = ts.user_id AND sc.completion_status = 'completed'
      WHERE ts.user_id = ${userId}
    `);
    return result.rows[0];
  }
}
