/**
 * Agent Learning System
 * Enables agents to research, learn, and propose self-improvements
 */

import { getLLMService } from './llm-service';
import { agentService, type AIAgent } from './agent-service';
import { AGENT_DEFINITIONS } from '../data/agent-definitions';

const llmService = getLLMService();

export interface LearningOpportunity {
  type: 'skill' | 'tool' | 'api' | 'framework' | 'best_practice';
  name: string;
  description: string;
  relevance: number; // 0-100
  estimatedBenefit: string;
  implementationCost: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ResearchResult {
  topic: string;
  findings: string[];
  recommendations: string[];
  sources: string[];
  confidence: number; // 0-100
}

export class AgentLearningSystem {
  
  /**
   * Daily research and learning for an agent
   */
  async performDailyResearch(agentId: string): Promise<{
    researchConducted: ResearchResult[];
    learningOpportunities: LearningOpportunity[];
    improvementProposals: number;
  }> {
    const agent = await agentService.getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const definition = AGENT_DEFINITIONS.find(d => d.name === agent.name);
    if (!definition) {
      throw new Error(`Agent definition not found: ${agent.name}`);
    }

    // Select research topics from learning focus
    const researchTopics = this.selectResearchTopics(definition);
    
    // Conduct research on each topic
    const researchResults: ResearchResult[] = [];
    for (const topic of researchTopics) {
      const result = await this.researchTopic(agent, topic);
      researchResults.push(result);
      
      // Save learnings
      for (const finding of result.findings) {
        await agentService.addLearning(agentId, finding);
      }
    }
    
    // Identify learning opportunities
    const opportunities = await this.identifyLearningOpportunities(agent, definition, researchResults);
    
    // Create improvement proposals for high-value opportunities
    let proposalCount = 0;
    for (const opportunity of opportunities) {
      if (opportunity.relevance >= 70 && opportunity.riskLevel !== 'high') {
        await this.proposeImprovement(agentId, opportunity);
        proposalCount++;
      }
    }
    
    return {
      researchConducted: researchResults,
      learningOpportunities: opportunities,
      improvementProposals: proposalCount
    };
  }

  /**
   * Select research topics based on learning focus
   */
  private selectResearchTopics(definition: any): string[] {
    const topics: string[] = [];
    
    // Select 2-3 topics from learning focus
    const learningFocus = definition.learningFocus || [];
    const shuffled = [...learningFocus].sort(() => Math.random() - 0.5);
    topics.push(...shuffled.slice(0, Math.min(3, shuffled.length)));
    
    // Add category-specific research
    topics.push(`Latest trends in ${definition.category}`);
    
    // Add specialization research
    topics.push(`Advanced techniques for ${definition.specialization}`);
    
    return topics.slice(0, 3); // Limit to 3 topics per day
  }

  /**
   * Research a specific topic
   */
  private async researchTopic(agent: AIAgent, topic: string): Promise<ResearchResult> {
    const prompt = `You are ${agent.name}, a specialized AI agent conducting research to improve your capabilities.

Research Topic: ${topic}

Your Specialization: ${agent.specialization}

Conduct comprehensive research on this topic and provide:
1. Key findings (3-5 important insights)
2. Actionable recommendations for improving your capabilities
3. Credible sources or references
4. Confidence level in your findings (0-100)

Focus on practical, implementable insights that will make you better at your job.

Respond in JSON format:
{
  "findings": ["finding1", "finding2", "finding3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "sources": ["source1", "source2"],
  "confidence": 85
}`;

    try {
      const response = await llmService.chat({
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant helping an AI agent learn and improve. Provide accurate, actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        provider: 'openai',
        model: 'gpt-4.1-mini',
        temperature: 0.7,
        maxTokens: 1500
      });

      // Parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(response.content);
      } catch (e) {
        // Fallback if JSON parsing fails
        parsed = {
          findings: [response.content.substring(0, 200)],
          recommendations: ['Continue researching this topic'],
          sources: ['LLM research'],
          confidence: 50
        };
      }

      return {
        topic,
        findings: parsed.findings || [],
        recommendations: parsed.recommendations || [],
        sources: parsed.sources || [],
        confidence: parsed.confidence || 50
      };
    } catch (error) {
      return {
        topic,
        findings: [`Research error: ${error.message}`],
        recommendations: [],
        sources: [],
        confidence: 0
      };
    }
  }

  /**
   * Identify learning opportunities from research
   */
  private async identifyLearningOpportunities(
    agent: AIAgent,
    definition: any,
    researchResults: ResearchResult[]
  ): Promise<LearningOpportunity[]> {
    const opportunities: LearningOpportunity[] = [];
    
    // Extract opportunities from research findings
    for (const research of researchResults) {
      for (const recommendation of research.recommendations) {
        const opportunity = await this.evaluateOpportunity(agent, definition, recommendation, research);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      }
    }
    
    // Sort by relevance
    opportunities.sort((a, b) => b.relevance - a.relevance);
    
    return opportunities.slice(0, 10); // Top 10 opportunities
  }

  /**
   * Evaluate a potential learning opportunity
   */
  private async evaluateOpportunity(
    agent: AIAgent,
    definition: any,
    recommendation: string,
    research: ResearchResult
  ): Promise<LearningOpportunity | null> {
    // Determine opportunity type
    let type: 'skill' | 'tool' | 'api' | 'framework' | 'best_practice' = 'best_practice';
    const lower = recommendation.toLowerCase();
    if (lower.includes('api') || lower.includes('integration')) {
      type = 'api';
    } else if (lower.includes('tool') || lower.includes('software')) {
      type = 'tool';
    } else if (lower.includes('skill') || lower.includes('learn')) {
      type = 'skill';
    } else if (lower.includes('framework') || lower.includes('methodology')) {
      type = 'framework';
    }
    
    // Calculate relevance based on research confidence and agent's focus
    const relevance = Math.min(100, research.confidence + (agent.performanceRating > 80 ? 10 : 0));
    
    // Estimate cost and risk
    const cost = this.estimateCost(recommendation);
    const risk = this.estimateRisk(recommendation, type);
    
    return {
      type,
      name: recommendation.substring(0, 100),
      description: recommendation,
      relevance,
      estimatedBenefit: `Improve ${definition.specialization} capabilities`,
      implementationCost: cost,
      riskLevel: risk
    };
  }

  /**
   * Estimate implementation cost
   */
  private estimateCost(recommendation: string): 'low' | 'medium' | 'high' {
    const lower = recommendation.toLowerCase();
    if (lower.includes('simple') || lower.includes('quick') || lower.includes('easy')) {
      return 'low';
    } else if (lower.includes('complex') || lower.includes('significant') || lower.includes('major')) {
      return 'high';
    }
    return 'medium';
  }

  /**
   * Estimate risk level
   */
  private estimateRisk(recommendation: string, type: string): 'low' | 'medium' | 'high' {
    const lower = recommendation.toLowerCase();
    
    // High risk indicators
    if (lower.includes('replace') || lower.includes('overhaul') || lower.includes('critical')) {
      return 'high';
    }
    
    // Low risk indicators
    if (type === 'best_practice' || lower.includes('add') || lower.includes('enhance')) {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Propose an improvement to Chief of Staff
   */
  private async proposeImprovement(agentId: string, opportunity: LearningOpportunity): Promise<void> {
    await agentService.createApprovalRequest({
      agentId,
      requestType: opportunity.type === 'api' ? 'new_api' : 
                   opportunity.type === 'tool' ? 'new_tool' :
                   opportunity.type === 'skill' ? 'new_skill' : 'process_change',
      description: opportunity.description,
      benefitEstimate: opportunity.estimatedBenefit,
      costEstimate: opportunity.implementationCost === 'low' ? 5 :
                     opportunity.implementationCost === 'medium' ? 15 : 30,
      riskLevel: opportunity.riskLevel,
      priority: opportunity.relevance >= 85 ? 'high' : 
                opportunity.relevance >= 70 ? 'medium' : 'low'
    });
  }

  /**
   * Analyze performance and suggest optimizations
   */
  async analyzePerformance(agentId: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    optimizations: string[];
  }> {
    const agent = await agentService.getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const optimizations: string[] = [];

    // Analyze performance metrics
    if (agent.successRate >= 90) {
      strengths.push(`Excellent success rate: ${agent.successRate}%`);
    } else if (agent.successRate < 70) {
      weaknesses.push(`Success rate below target: ${agent.successRate}%`);
      optimizations.push('Review failed tasks to identify common failure patterns');
    }

    if (agent.performanceRating >= 85) {
      strengths.push(`High performance rating: ${agent.performanceRating}/100`);
    } else if (agent.performanceRating < 70) {
      weaknesses.push(`Performance rating needs improvement: ${agent.performanceRating}/100`);
      optimizations.push('Focus on quality over speed to improve rating');
    }

    if (agent.avgResponseTime < 3000) {
      strengths.push(`Fast response time: ${agent.avgResponseTime}ms`);
    } else if (agent.avgResponseTime > 10000) {
      weaknesses.push(`Slow response time: ${agent.avgResponseTime}ms`);
      optimizations.push('Optimize execution logic to reduce response time');
    }

    if (agent.tasksCompleted > 100) {
      strengths.push(`Highly experienced: ${agent.tasksCompleted} tasks completed`);
    } else if (agent.tasksCompleted < 10) {
      weaknesses.push(`Limited experience: ${agent.tasksCompleted} tasks completed`);
      optimizations.push('Gain more experience by taking on diverse tasks');
    }

    // Add general optimizations
    if (optimizations.length === 0) {
      optimizations.push('Continue current excellent performance');
      optimizations.push('Explore advanced techniques in specialization area');
    }

    return { strengths, weaknesses, optimizations };
  }

  /**
   * Generate learning summary for daily report
   */
  async generateLearningSummary(agentId: string): Promise<{
    newSkills: number;
    newTools: number;
    newAPIs: number;
    researchTopics: number;
    improvementProposals: number;
    learningVelocity: 'slow' | 'moderate' | 'fast';
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const recentLearnings = await agentService.getRecentLearnings(agentId, todayStart);
    const pendingImprovements = await agentService.getPendingImprovements(agentId);
    const capabilities = await agentService.getAgentCapabilities(agentId);
    
    // Count new additions today
    const newSkills = capabilities.filter(c => 
      c.type === 'skill' && new Date(c.createdAt) >= todayStart
    ).length;
    
    const newTools = capabilities.filter(c => 
      c.type === 'tool' && new Date(c.createdAt) >= todayStart
    ).length;
    
    const newAPIs = capabilities.filter(c => 
      c.type === 'api' && new Date(c.createdAt) >= todayStart
    ).length;
    
    // Determine learning velocity
    const totalNew = newSkills + newTools + newAPIs;
    const learningVelocity: 'slow' | 'moderate' | 'fast' = 
      totalNew >= 5 ? 'fast' :
      totalNew >= 2 ? 'moderate' : 'slow';
    
    return {
      newSkills,
      newTools,
      newAPIs,
      researchTopics: recentLearnings.length,
      improvementProposals: pendingImprovements.length,
      learningVelocity
    };
  }
}

export const agentLearningSystem = new AgentLearningSystem();
