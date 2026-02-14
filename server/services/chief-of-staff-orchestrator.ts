import { agentService, type AIAgent, type ApprovalRequest } from './agent-service';
import { getLLMService } from './llm-service';

const llmService = getLLMService();

export interface Task {
  id: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiredCapabilities: string[];
  deadline?: Date;
}

export interface TaskAssignment {
  task: Task;
  agent: AIAgent;
  confidence: number;
  reasoning: string;
}

export class ChiefOfStaffOrchestrator {
  
  /**
   * Delegate a task to the best available agent
   */
  async delegateTask(task: Task): Promise<TaskAssignment> {
    // Get all active agents
    const allAgents = await agentService.getAllAgents();
    const activeAgents = allAgents.filter(a => a.status === 'active');

    if (activeAgents.length === 0) {
      throw new Error('No active agents available');
    }

    // Score each agent for this task
    const scoredAgents = await Promise.all(
      activeAgents.map(async (agent) => {
        const capabilities = await agentService.getAgentCapabilities(agent.id);
        const score = this.scoreAgentForTask(agent, capabilities, task);
        return { agent, score };
      })
    );

    // Select best agent
    scoredAgents.sort((a, b) => b.score - a.score);
    const best = scoredAgents[0];

    if (best.score < 30) {
      throw new Error('No suitable agent found for this task');
    }

    return {
      task,
      agent: best.agent,
      confidence: best.score,
      reasoning: this.generateReasoning(best.agent, task, best.score)
    };
  }

  /**
   * Score an agent's suitability for a task (0-100)
   */
  private scoreAgentForTask(
    agent: AIAgent,
    capabilities: any[],
    task: Task
  ): number {
    let score = 0;

    // Base score from performance rating (40%)
    score += agent.performanceRating * 0.4;

    // Capability match (40%)
    const capabilityNames = capabilities.map(c => c.name.toLowerCase());
    const matchedCapabilities = task.requiredCapabilities.filter(req =>
      capabilityNames.some(cap => cap.includes(req.toLowerCase()))
    );
    const capabilityScore = (matchedCapabilities.length / Math.max(1, task.requiredCapabilities.length)) * 100;
    score += capabilityScore * 0.4;

    // Success rate bonus (10%)
    score += agent.successRate * 0.1;

    // Response time penalty (10%)
    const responseTimeFactor = Math.max(0, 100 - (agent.avgResponseTime / 100));
    score += responseTimeFactor * 0.1;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate reasoning for agent selection
   */
  private generateReasoning(agent: AIAgent, task: Task, score: number): string {
    const reasons = [];
    
    if (agent.performanceRating >= 80) {
      reasons.push(`High performance rating (${agent.performanceRating}/100)`);
    }
    
    if (agent.successRate >= 85) {
      reasons.push(`Excellent success rate (${agent.successRate}%)`);
    }
    
    if (agent.tasksCompleted > 100) {
      reasons.push(`Experienced (${agent.tasksCompleted} tasks completed)`);
    }

    reasons.push(`Specialization: ${agent.specialization}`);

    return reasons.join('. ');
  }

  /**
   * Review all pending daily reports
   */
  async reviewDailyReports(): Promise<{
    reviewed: number;
    autoApproved: number;
    escalated: number;
  }> {
    const pendingReports = await agentService.getPendingReports();
    let reviewed = 0;
    let autoApproved = 0;
    let escalated = 0;

    for (const report of pendingReports) {
      // Auto-approve if performance is good
      if (report.successRate >= 80 && report.userSatisfaction >= 70) {
        await agentService.reviewReport(report.id, 'approved', 'Chief of Staff (Auto)');
        reviewed++;
        autoApproved++;
      } else {
        // Escalate to user for review
        escalated++;
      }

      // Update agent performance rating
      await agentService.updatePerformanceRating(report.agentId);
    }

    return { reviewed, autoApproved, escalated };
  }

  /**
   * Review pending approval requests
   */
  async reviewApprovalRequests(): Promise<{
    reviewed: number;
    autoApproved: number;
    autoRejected: number;
    escalated: number;
  }> {
    const pendingApprovals = await agentService.getPendingApprovals();
    let reviewed = 0;
    let autoApproved = 0;
    let autoRejected = 0;
    let escalated = 0;

    for (const request of pendingApprovals) {
      // Auto-approve low-risk, low-cost requests
      if (
        request.riskLevel === 'low' &&
        request.costEstimate < 10 &&
        request.requestType !== 'process_change'
      ) {
        await agentService.approveRequest(request.id, 'Chief of Staff (Auto)');
        reviewed++;
        autoApproved++;
      }
      // Auto-reject high-risk requests without clear benefits
      else if (
        request.riskLevel === 'high' &&
        (!request.benefitEstimate || request.benefitEstimate.length < 50)
      ) {
        await agentService.rejectRequest(
          request.id,
          'Chief of Staff (Auto)',
          'High risk without sufficient benefit justification'
        );
        reviewed++;
        autoRejected++;
      }
      // Escalate everything else to user
      else {
        escalated++;
      }
    }

    return { reviewed, autoApproved, autoRejected, escalated };
  }

  /**
   * Monitor agent performance and identify issues
   */
  async monitorAgentPerformance(): Promise<{
    healthy: AIAgent[];
    needsAttention: AIAgent[];
    underperforming: AIAgent[];
  }> {
    const allAgents = await agentService.getAllAgents();
    const activeAgents = allAgents.filter(a => a.status === 'active');

    const healthy = activeAgents.filter(a => a.performanceRating >= 80);
    const needsAttention = activeAgents.filter(a => a.performanceRating >= 60 && a.performanceRating < 80);
    const underperforming = activeAgents.filter(a => a.performanceRating < 60);

    return { healthy, needsAttention, underperforming };
  }

  /**
   * Coordinate multiple agents for a complex goal
   */
  async coordinateAgents(goal: string, requiredAgentCategories: string[]): Promise<{
    agents: AIAgent[];
    plan: string;
  }> {
    // Get agents from each required category
    const agents: AIAgent[] = [];
    for (const category of requiredAgentCategories) {
      const categoryAgents = await agentService.getAgentsByCategory(category);
      if (categoryAgents.length > 0) {
        // Pick the best performing agent from this category
        agents.push(categoryAgents[0]);
      }
    }

    if (agents.length === 0) {
      throw new Error('No agents available for the required categories');
    }

    // Generate coordination plan using LLM
    const prompt = `
You are the Chief of Staff coordinating multiple AI agents to achieve a goal.

Goal: ${goal}

Available Agents:
${agents.map(a => `- ${a.name} (${a.category}): ${a.specialization}`).join('\n')}

Create a coordination plan that:
1. Breaks down the goal into specific tasks
2. Assigns each task to the most suitable agent
3. Defines the sequence and dependencies
4. Estimates timeline

Provide a clear, actionable plan.
`;

    const plan = await llmService.chat({
      messages: [{ role: 'user', content: prompt }],
      provider: 'openai',
      model: 'gpt-4.1-mini',
      temperature: 0.7
    });

    return { agents, plan: plan.content };
  }

  /**
   * Generate daily summary for user
   */
  async generateDailySummary(): Promise<{
    date: Date;
    totalAgents: number;
    activeAgents: number;
    tasksCompleted: number;
    avgPerformance: number;
    pendingReports: number;
    pendingApprovals: number;
    highlights: string[];
    concerns: string[];
  }> {
    const allAgents = await agentService.getAllAgents();
    const activeAgents = allAgents.filter(a => a.status === 'active');
    const pendingReports = await agentService.getPendingReports();
    const pendingApprovals = await agentService.getPendingApprovals();

    const totalTasks = activeAgents.reduce((sum, a) => sum + a.tasksCompleted, 0);
    const avgPerformance = activeAgents.reduce((sum, a) => sum + a.performanceRating, 0) / Math.max(1, activeAgents.length);

    const highlights: string[] = [];
    const concerns: string[] = [];

    // Identify highlights
    const topPerformers = activeAgents.filter(a => a.performanceRating >= 90);
    if (topPerformers.length > 0) {
      highlights.push(`${topPerformers.length} agents performing at elite level (90+)`);
    }

    const highTaskCount = activeAgents.filter(a => a.tasksCompleted > 50);
    if (highTaskCount.length > 0) {
      highlights.push(`${highTaskCount.length} agents highly productive (50+ tasks)`);
    }

    // Identify concerns
    const underperformers = activeAgents.filter(a => a.performanceRating < 60);
    if (underperformers.length > 0) {
      concerns.push(`${underperformers.length} agents underperforming (rating < 60)`);
    }

    if (pendingReports.length > 10) {
      concerns.push(`${pendingReports.length} pending reports need review`);
    }

    if (pendingApprovals.filter(a => a.riskLevel === 'high').length > 0) {
      concerns.push(`${pendingApprovals.filter(a => a.riskLevel === 'high').length} high-risk approval requests pending`);
    }

    return {
      date: new Date(),
      totalAgents: allAgents.length,
      activeAgents: activeAgents.length,
      tasksCompleted: totalTasks,
      avgPerformance: Math.round(avgPerformance),
      pendingReports: pendingReports.length,
      pendingApprovals: pendingApprovals.length,
      highlights,
      concerns
    };
  }
}

export const chiefOfStaffOrchestrator = new ChiefOfStaffOrchestrator();
