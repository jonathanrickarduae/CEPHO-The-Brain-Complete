import { getRawClient } from '../db';
import type { Database } from '../db';

export interface AIAgent {
  id: string;
  name: string;
  category: string;
  specialization: string;
  description?: string;
  performanceRating: number;
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: number;
  userSatisfaction: number;
  status: 'active' | 'learning' | 'idle' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentCapability {
  id: string;
  agentId: string;
  capabilityType: 'skill' | 'tool' | 'api' | 'framework';
  name: string;
  description?: string;
  version?: string;
  costPerMonth: number;
  addedDate: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface DailyReport {
  id: string;
  agentId: string;
  reportDate: Date;
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: number;
  userSatisfaction: number;
  improvementsMade: any[];
  learningOutcomes: any;
  approvalRequests: any[];
  recommendations: any[];
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface ApprovalRequest {
  id: string;
  agentId: string;
  requestType: 'capability' | 'tool' | 'api' | 'framework' | 'process_change';
  requestTitle: string;
  requestDetails: any;
  costEstimate: number;
  benefitEstimate?: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

export class AgentService {
  private db: Database | null = null;

  async initialize() {
    this.db = await getRawClient() as any;
  }

  // Agent Management
  async getAllAgents(): Promise<AIAgent[]> {
    if (!this.db) await this.initialize();
    const result = await this.db!`SELECT * FROM ai_agents ORDER BY "performanceRating" DESC`;
    return result as AIAgent[];
  }

  async getAgentById(id: string): Promise<AIAgent | null> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      'SELECT * FROM ai_agents WHERE id = $1',
      [id]
    );
    return result.rows[0] as AIAgent || null;
  }

  async getAgentsByCategory(category: string): Promise<AIAgent[]> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      'SELECT * FROM ai_agents WHERE category = $1 ORDER BY "performanceRating" DESC',
      [category]
    );
    return result.rows as AIAgent[];
  }

  async createAgent(agent: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIAgent> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      `INSERT INTO ai_agents (name, category, specialization, description, performance_rating, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [agent.name, agent.category, agent.specialization, agent.description, agent.performanceRating || 50, agent.status || 'active']
    );
    return result.rows[0] as AIAgent;
  }

  async updateAgent(id: string, updates: Partial<AIAgent>): Promise<AIAgent | null> {
    if (!this.db) await this.initialize();
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'createdAt');
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(f => updates[f as keyof AIAgent])];
    
    const result = await this.db!.execute(
      `UPDATE ai_agents SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] as AIAgent || null;
  }

  async deleteAgent(id: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      'DELETE FROM ai_agents WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  // Capabilities Management
  async getAgentCapabilities(agentId: string): Promise<AgentCapability[]> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      'SELECT * FROM agent_capabilities WHERE "agentId" = $1 ORDER BY "createdAt" DESC',
      [agentId]
    );
    return result.rows as AgentCapability[];
  }

  async addCapability(capability: Omit<AgentCapability, 'id' | 'addedDate'>): Promise<AgentCapability> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      `INSERT INTO agent_capabilities (agent_id, capability_type, name, description, version, cost_per_month, approved_by, approved_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [capability.agentId, capability.capabilityType, capability.name, capability.description, capability.version, capability.costPerMonth || 0, capability.approvedBy, capability.approvedAt]
    );
    return result.rows[0] as AgentCapability;
  }

  async removeCapability(id: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      'DELETE FROM agent_capabilities WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  // Daily Reports
  async getDailyReports(agentId: string, limit: number = 30): Promise<DailyReport[]> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      'SELECT * FROM agent_daily_reports WHERE "agentId" = $1 ORDER BY "reportDate" DESC LIMIT $2',
      [agentId, limit]
    );
    return result.rows as DailyReport[];
  }

  async getLatestReport(agentId: string): Promise<DailyReport | null> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      'SELECT * FROM agent_daily_reports WHERE "agentId" = $1 ORDER BY "reportDate" DESC LIMIT 1',
      [agentId]
    );
    return result.rows[0] as DailyReport || null;
  }

  async getPendingReports(): Promise<DailyReport[]> {
    if (!this.db) await this.initialize();
    const result = await this.db!`
      SELECT r.*, a.name as agent_name, a.category 
      FROM agent_daily_reports r 
      JOIN ai_agents a ON r."agentId" = a.id 
      WHERE r.status = 'pending' 
      ORDER BY r."reportDate" DESC`;
    return result as DailyReport[];
  }

  async submitDailyReport(report: Omit<DailyReport, 'id' | 'createdAt'>): Promise<DailyReport> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      `INSERT INTO agent_daily_reports 
       (agent_id, report_date, tasks_completed, success_rate, avg_response_time, user_satisfaction, 
        improvements_made, learning_outcomes, approval_requests, recommendations, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (agent_id, report_date) 
       DO UPDATE SET 
         tasks_completed = EXCLUDED.tasks_completed,
         success_rate = EXCLUDED.success_rate,
         avg_response_time = EXCLUDED.avg_response_time,
         user_satisfaction = EXCLUDED.user_satisfaction,
         improvements_made = EXCLUDED.improvements_made,
         learning_outcomes = EXCLUDED.learning_outcomes,
         approval_requests = EXCLUDED.approval_requests,
         recommendations = EXCLUDED.recommendations
       RETURNING *`,
      [
        report.agentId, report.reportDate, report.tasksCompleted, report.successRate,
        report.avgResponseTime, report.userSatisfaction,
        JSON.stringify(report.improvementsMade), JSON.stringify(report.learningOutcomes),
        JSON.stringify(report.approvalRequests), JSON.stringify(report.recommendations),
        report.status || 'pending'
      ]
    );
    return result.rows[0] as DailyReport;
  }

  async reviewReport(reportId: string, status: 'approved' | 'rejected', reviewedBy: string): Promise<DailyReport | null> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      `UPDATE agent_daily_reports 
       SET status = $1, reviewed_by = $2, reviewed_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, reviewedBy, reportId]
    );
    return result.rows[0] as DailyReport || null;
  }

  // Approval Requests
  async getPendingApprovals(): Promise<ApprovalRequest[]> {
    if (!this.db) await this.initialize();
    const result = await this.db!`
      SELECT r.*, a.name as agent_name, a.category 
      FROM agent_approval_requests r 
      JOIN ai_agents a ON r."agentId" = a.id 
      WHERE r.status = 'pending' 
      ORDER BY r."riskLevel" DESC, r."costEstimate" DESC`;
    return result as ApprovalRequest[];
  }

  async getAgentApprovals(agentId: string): Promise<ApprovalRequest[]> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      'SELECT * FROM agent_approval_requests WHERE "agentId" = $1 ORDER BY "createdAt" DESC',
      [agentId]
    );
    return result.rows as ApprovalRequest[];
  }

  async createApprovalRequest(request: Omit<ApprovalRequest, 'id' | 'createdAt'>): Promise<ApprovalRequest> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      `INSERT INTO agent_approval_requests 
       (agent_id, request_type, request_title, request_details, cost_estimate, benefit_estimate, risk_level, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        request.agentId, request.requestType, request.requestTitle,
        JSON.stringify(request.requestDetails), request.costEstimate,
        request.benefitEstimate, request.riskLevel || 'low', request.status || 'pending'
      ]
    );
    return result.rows[0] as ApprovalRequest;
  }

  async approveRequest(requestId: string, approvedBy: string): Promise<ApprovalRequest | null> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      `UPDATE agent_approval_requests 
       SET status = 'approved', approved_by = $1, approved_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [approvedBy, requestId]
    );
    return result.rows[0] as ApprovalRequest || null;
  }

  async rejectRequest(requestId: string, approvedBy: string, reason: string): Promise<ApprovalRequest | null> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      `UPDATE agent_approval_requests 
       SET status = 'rejected', approved_by = $1, approved_at = NOW(), rejection_reason = $2 
       WHERE id = $3 
       RETURNING *`,
      [approvedBy, reason, requestId]
    );
    return result.rows[0] as ApprovalRequest || null;
  }

  // Performance Tracking
  async updatePerformanceRating(agentId: string): Promise<number> {
    if (!this.db) await this.initialize();
    
    // Calculate performance rating based on recent metrics
    const result = await this.db!.execute(
      `SELECT 
         AVG(success_rate) as avg_success_rate,
         AVG(user_satisfaction) as avg_satisfaction,
         COUNT(*) as report_count
       FROM agent_daily_reports
       WHERE agent_id = $1 AND report_date >= CURRENT_DATE - INTERVAL '30 days'`,
      [agentId]
    );

    const metrics = result.rows[0] as any;
    const successWeight = 0.4;
    const satisfactionWeight = 0.4;
    const consistencyWeight = 0.2;

    const rating = Math.round(
      (metrics.avg_success_rate || 50) * successWeight +
      (metrics.avg_satisfaction || 50) * satisfactionWeight +
      Math.min(100, (metrics.report_count / 30) * 100) * consistencyWeight
    );

    await this.db!.execute(
      'UPDATE ai_agents SET performance_rating = $1, updated_at = NOW() WHERE id = $2',
      [rating, agentId]
    );

    return rating;
  }

  async getLeaderboard(limit: number = 10): Promise<AIAgent[]> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      'SELECT * FROM ai_agents WHERE status = \'active\' ORDER BY performance_rating DESC LIMIT $1',
      [limit]
    );
    return result.rows as AIAgent[];
  }

  async getUnderperformers(threshold: number = 60): Promise<AIAgent[]> {
    if (!this.db) await this.initialize();
    const result = await this.db!.execute(
      'SELECT * FROM ai_agents WHERE status = \'active\' AND performance_rating < $1 ORDER BY performance_rating ASC',
      [threshold]
    );
    return result.rows as AIAgent[];
  }
}

export const agentService = new AgentService();
