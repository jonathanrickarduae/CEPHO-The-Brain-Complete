/**
 * Agent Execution Engine
 * Executes agent tasks with context, tools, and self-improvement capabilities
 */

import { getLLMService } from './llm-service';
import { agentService, type AIAgent } from './agent-service';
import { AGENT_DEFINITIONS } from '../data/agent-definitions';

const llmService = getLLMService();

export interface AgentTask {
  id: string;
  agentId: string;
  description: string;
  context: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: Date;
}

export interface AgentExecutionResult {
  taskId: string;
  agentId: string;
  success: boolean;
  output: any;
  reasoning: string;
  toolsUsed: string[];
  executionTime: number;
  learnings: string[];
  improvements: string[];
}

export class AgentExecutionEngine {
  
  /**
   * Execute a task with the specified agent
   */
  async executeTask(task: AgentTask): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    
    // Get agent details
    const agent = await agentService.getAgentById(task.agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${task.agentId}`);
    }

    // Get agent definition for skills and tools
    const definition = AGENT_DEFINITIONS.find(d => d.name === agent.name);
    if (!definition) {
      throw new Error(`Agent definition not found: ${agent.name}`);
    }

    // Get agent capabilities
    const capabilities = await agentService.getAgentCapabilities(agent.id);
    
    // Build execution context
    const executionContext = this.buildExecutionContext(agent, definition, capabilities, task);
    
    // Execute task using LLM with agent's specialized knowledge
    const result = await this.executeWithLLM(executionContext);
    
    // Extract learnings and improvements
    const learnings = this.extractLearnings(result, task);
    const improvements = this.identifyImprovements(result, agent, definition);
    
    // Record execution
    await agentService.recordTaskExecution(agent.id, task.id, result.success);
    
    // Save learnings
    if (learnings.length > 0) {
      await agentService.addLearnings(agent.id, learnings);
    }
    
    // Create improvement requests if needed
    if (improvements.length > 0) {
      for (const improvement of improvements) {
        await agentService.requestImprovement(agent.id, improvement);
      }
    }
    
    const executionTime = Date.now() - startTime;
    
    return {
      taskId: task.id,
      agentId: agent.id,
      success: result.success,
      output: result.output,
      reasoning: result.reasoning,
      toolsUsed: result.toolsUsed,
      executionTime,
      learnings,
      improvements
    };
  }

  /**
   * Build execution context for the agent
   */
  private buildExecutionContext(
    agent: AIAgent,
    definition: any,
    capabilities: any[],
    task: AgentTask
  ): string {
    const capabilityList = capabilities.map(c => `- ${c.name}: ${c.description}`).join('\n');
    
    return `You are ${agent.name}, a world-class AI agent specializing in ${agent.specialization}.

Your Role:
${definition.description}

Your Current Skills:
${definition.initialSkills.join(', ')}

Your Available Tools:
${definition.initialTools.join(', ')}

Your Available APIs:
${definition.initialAPIs.join(', ')}

Your Capabilities:
${capabilityList}

Your Performance Stats:
- Performance Rating: ${agent.performanceRating}/100
- Success Rate: ${agent.successRate}%
- Tasks Completed: ${agent.tasksCompleted}
- Average Response Time: ${agent.avgResponseTime}ms

Task:
${task.description}

Context:
${JSON.stringify(task.context, null, 2)}

Priority: ${task.priority}
${task.deadline ? `Deadline: ${task.deadline.toISOString()}` : ''}

Instructions:
1. Analyze the task thoroughly
2. Use your specialized knowledge and skills
3. Leverage available tools and APIs as needed
4. Provide a detailed, actionable solution
5. Explain your reasoning
6. Identify what you learned from this task
7. Suggest improvements to your capabilities

Respond in JSON format:
{
  "success": boolean,
  "output": "your detailed solution/result",
  "reasoning": "your step-by-step reasoning",
  "toolsUsed": ["tool1", "tool2"],
  "learnings": ["learning1", "learning2"],
  "suggestedImprovements": ["improvement1", "improvement2"]
}`;
  }

  /**
   * Execute task using LLM
   */
  private async executeWithLLM(context: string): Promise<{
    success: boolean;
    output: string;
    reasoning: string;
    toolsUsed: string[];
  }> {
    try {
      const response = await llmService.chat({
        messages: [
          {
            role: 'system',
            content: 'You are a specialized AI agent executing a task. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        provider: 'openai',
        model: 'gpt-4.1-mini',
        temperature: 0.7,
        maxTokens: 2000
      });

      // Parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(response.content);
      } catch (e) {
        // If JSON parsing fails, extract what we can
        parsed = {
          success: true,
          output: response.content,
          reasoning: 'Task completed',
          toolsUsed: []
        };
      }

      return {
        success: parsed.success !== false,
        output: parsed.output || response.content,
        reasoning: parsed.reasoning || 'Task executed successfully',
        toolsUsed: parsed.toolsUsed || []
      };
    } catch (error) {
      return {
        success: false,
        output: `Error: ${error.message}`,
        reasoning: 'Task execution failed',
        toolsUsed: []
      };
    }
  }

  /**
   * Extract learnings from execution result
   */
  private extractLearnings(result: any, task: AgentTask): string[] {
    const learnings: string[] = [];
    
    // Extract from LLM response if available
    if (result.learnings && Array.isArray(result.learnings)) {
      learnings.push(...result.learnings);
    }
    
    // Add context-based learnings
    if (result.success) {
      learnings.push(`Successfully completed ${task.priority} priority task`);
    } else {
      learnings.push(`Encountered challenges with ${task.description}`);
    }
    
    return learnings;
  }

  /**
   * Identify potential improvements
   */
  private identifyImprovements(result: any, agent: AIAgent, definition: any): string[] {
    const improvements: string[] = [];
    
    // Extract from LLM response
    if (result.suggestedImprovements && Array.isArray(result.suggestedImprovements)) {
      improvements.push(...result.suggestedImprovements);
    }
    
    // Suggest improvements based on performance
    if (agent.successRate < 80) {
      improvements.push('Review failed tasks to identify common patterns and improve success rate');
    }
    
    if (agent.avgResponseTime > 5000) {
      improvements.push('Optimize execution speed to reduce response time');
    }
    
    // Suggest new tools/APIs based on learning focus
    if (definition.learningFocus && definition.learningFocus.length > 0) {
      const randomFocus = definition.learningFocus[Math.floor(Math.random() * definition.learningFocus.length)];
      improvements.push(`Research and integrate new tools for: ${randomFocus}`);
    }
    
    return improvements;
  }

  /**
   * Generate daily report for an agent
   */
  async generateDailyReport(agentId: string): Promise<{
    agentId: string;
    date: Date;
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
    learnings: string[];
    improvements: string[];
    performanceRating: number;
    highlights: string[];
    concerns: string[];
  }> {
    const agent = await agentService.getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Get today's activity
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const recentLearnings = await agentService.getRecentLearnings(agentId, todayStart);
    const pendingImprovements = await agentService.getPendingImprovements(agentId);
    
    // Calculate highlights and concerns
    const highlights: string[] = [];
    const concerns: string[] = [];
    
    if (agent.successRate >= 90) {
      highlights.push(`Excellent success rate: ${agent.successRate}%`);
    }
    
    if (agent.performanceRating >= 85) {
      highlights.push(`High performance rating: ${agent.performanceRating}/100`);
    }
    
    if (recentLearnings.length > 5) {
      highlights.push(`Active learning: ${recentLearnings.length} new learnings today`);
    }
    
    if (agent.successRate < 70) {
      concerns.push(`Success rate below target: ${agent.successRate}%`);
    }
    
    if (agent.avgResponseTime > 10000) {
      concerns.push(`Response time high: ${agent.avgResponseTime}ms`);
    }
    
    if (pendingImprovements.length > 10) {
      concerns.push(`${pendingImprovements.length} pending improvement requests need review`);
    }
    
    return {
      agentId: agent.id,
      date: new Date(),
      tasksCompleted: agent.tasksCompleted,
      successRate: agent.successRate,
      avgResponseTime: agent.avgResponseTime,
      learnings: recentLearnings.map(l => l.learning),
      improvements: pendingImprovements.map(i => i.improvement),
      performanceRating: agent.performanceRating,
      highlights,
      concerns
    };
  }
}

export const agentExecutionEngine = new AgentExecutionEngine();
