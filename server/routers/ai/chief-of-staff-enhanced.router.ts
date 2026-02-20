// Enhanced Chief of Staff Router - WITH REAL DATA
import { router, protectedProcedure } from '../../_core/trpc';
import { z } from 'zod';
import { dataAggregationService } from '../../services/data-aggregation.service';
import { emailAnalysisService } from '../../services/email-analysis.service';
import { todoistService } from '../../services/todoist.service';
import { getLLMService } from '../../services/llm-service';

const llmService = getLLMService();

export const chiefOfStaffEnhancedRouter = router({
  
  /**
   * Get morning briefing with REAL data
   */
  getMorningBriefing: protectedProcedure
    .query(async ({ ctx }) => {
      // Get all aggregated data
      const data = await dataAggregationService.aggregateAll(ctx.user.id);
      const context = await dataAggregationService.getContext(ctx.user.id);
      
      // Use AI to create intelligent briefing
      const prompt = `You are the Chief of Staff for ${ctx.user.name || 'the user'}. 

Based on the following comprehensive data about their work, create an intelligent morning briefing:

${context}

Generate a briefing that includes:
1. **Personalized greeting** - Warm and professional
2. **Top 3 Priorities for Today** - Based on deadlines, importance, and dependencies
3. **Important Emails** - Highlight emails that need immediate attention
4. **Upcoming Deadlines** - Tasks and commitments due soon
5. **Overdue Items** - What needs to be caught up on
6. **Key Insights** - Patterns or recommendations you notice
7. **Recommended Actions** - Specific, actionable next steps

Be specific, reference actual emails and tasks by name, and prioritize ruthlessly. Keep it concise but actionable.`;

      const aiResponse = await llmService.chat({
        messages: [{ role: 'user', content: prompt }],
        provider: 'openai',
        model: 'gpt-4.1-mini',
        temperature: 0.7,
      });
      
      return {
        date: new Date().toISOString(),
        briefing: aiResponse.content,
        stats: data.stats,
        aggregatedAt: data.aggregatedAt,
      };
    }),

  /**
   * Chat with Chief of Staff (WITH CONTEXT)
   */
  chat: protectedProcedure
    .input(z.object({
      message: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Build full context
      const context = await dataAggregationService.getContext(ctx.user.id);
      
      // Build conversation with context
      const messages = [
        {
          role: 'system' as const,
          content: `You are the Chief of Staff for ${ctx.user.name || 'the user'}. You have access to all their work data and help them stay organized, prioritized, and productive.

Current Context:
${context}

Use this context to provide specific, actionable advice. Reference actual emails, tasks, and data when relevant. Be concise but helpful.`,
        },
        ...(input.conversationHistory || []),
        {
          role: 'user' as const,
          content: input.message,
        },
      ];
      
      const response = await llmService.chat({
        messages,
        provider: 'openai',
        model: 'gpt-4.1-mini',
        temperature: 0.7,
      });
      
      return {
        message: response.content,
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Get aggregated data summary
   */
  getDataSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const data = await dataAggregationService.aggregateAll(ctx.user.id);
      return data;
    }),

  /**
   * Analyze emails and create tasks
   */
  analyzeEmailsAndCreateTasks: protectedProcedure
    .input(z.object({
      emailIds: z.array(z.string()).optional(),
      autoCreate: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get action items from emails
      const actionItems = await emailAnalysisService.extractActionItems(
        ctx.user.id,
        input.emailIds
      );
      
      if (!input.autoCreate) {
        return {
          actionItems,
          tasksCreated: 0,
        };
      }
      
      // Create tasks in Todoist
      let tasksCreated = 0;
      
      for (const item of actionItems) {
        for (const action of item.actionItems) {
          try {
            await todoistService.createTask({
              content: action,
              description: `From email: ${item.subject}\nFrom: ${item.fromEmail}`,
              priority: 3, // High priority
            });
            tasksCreated++;
          } catch (error) {
            console.error('Failed to create task:', error);
          }
        }
      }
      
      return {
        actionItems,
        tasksCreated,
      };
    }),

  /**
   * Get intelligent recommendations
   */
  getRecommendations: protectedProcedure
    .query(async ({ ctx }) => {
      const context = await dataAggregationService.getContext(ctx.user.id);
      
      const prompt = `Based on this user's current work state, provide 5 intelligent, actionable recommendations:

${context}

Each recommendation should be:
1. Specific and actionable (reference actual emails, tasks, or data)
2. Prioritized by impact
3. Realistic and achievable today or this week
4. Address the most pressing issues first

Format as a numbered list with brief explanations.`;

      const aiResponse = await llmService.chat({
        messages: [{ role: 'user', content: prompt }],
        provider: 'openai',
        model: 'gpt-4.1-mini',
        temperature: 0.7,
      });
      
      return {
        recommendations: aiResponse.content,
        generatedAt: new Date().toISOString(),
      };
    }),

  /**
   * Get what to focus on today
   */
  getTodaysFocus: protectedProcedure
    .query(async ({ ctx }) => {
      const context = await dataAggregationService.getContext(ctx.user.id);
      
      const prompt = `Based on this user's current work state, identify the TOP 3 things they should focus on TODAY:

${context}

For each item:
1. Explain WHY it's a priority (deadline, impact, dependencies)
2. Provide specific next steps
3. Estimate time required

Be ruthless in prioritization. Only the most important 3 items.`;

      const aiResponse = await llmService.chat({
        messages: [{ role: 'user', content: prompt }],
        provider: 'openai',
        model: 'gpt-4.1-mini',
        temperature: 0.5,
      });
      
      return {
        focus: aiResponse.content,
        generatedAt: new Date().toISOString(),
      };
    }),

  /**
   * Get email statistics
   */
  getEmailStats: protectedProcedure
    .query(async ({ ctx }) => {
      return await emailAnalysisService.getEmailStats(ctx.user.id);
    }),

  /**
   * Get top email senders
   */
  getTopSenders: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      return await emailAnalysisService.getTopSenders(ctx.user.id, input.limit);
    }),
});
