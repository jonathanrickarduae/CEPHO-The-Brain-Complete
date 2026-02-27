// @ts-nocheck
/**
 * Chief of Staff Tasks Router
 * Handles task delegation from The Signal to COS with AI agent assignment
 */

import { router, publicProcedure } from "../../_core/trpc";
import { z } from "zod";
import { db } from "../../db";
import { tasks } from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";

// Task delegation from Signal to COS
export const cosTasksRouter = router({
  /**
   * Delegate a task from The Signal to Chief of Staff
   */
  delegateTask: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(['urgent', 'high', 'medium', 'low']),
      category: z.string(),
      source: z.enum(['schedule', 'email', 'intelligence', 'recommendation']),
      time: z.string().optional(),
      dueDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create task in database
      const [task] = await db.insert(tasks).values({
        userId: ctx.user?.id || 1,
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: 'delegated',
        assignedTo: 'chief_of_staff',
        dueDate: input.dueDate,
        metadata: {
          category: input.category,
          source: input.source,
          time: input.time,
          delegatedBy: ctx.user?.id || 'ceo',
          delegatedAt: new Date().toISOString(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      // Auto-assign to best AI agent based on task requirements
      const bestAgent = await findBestAgentForTask(input);
      
      if (bestAgent) {
        await db.update(tasks)
          .set({
            assignedExperts: [bestAgent],
            updatedAt: new Date(),
          })
          .where(eq(tasks.id, task.id));
      }

      return {
        success: true,
        task,
        assignedAgent: bestAgent,
      };
    }),

  /**
   * Get all COS tasks with their assigned agents
   */
  getTasks: publicProcedure
    .input(z.object({
      status: z.enum(['pending', 'delegated', 'in_progress', 'completed', 'all']).optional(),
    }).optional())
    .query(async ({ input }) => {
      const statusFilter = input?.status && input.status !== 'all' ? input.status : undefined;
      
      const allTasks = await db.query.tasks.findMany({
        where: statusFilter ? eq(tasks.status, statusFilter) : undefined,
        orderBy: [desc(tasks.createdAt)],
      });

      return allTasks;
    }),

  /**
   * Update task status
   */
  updateTaskStatus: publicProcedure
    .input(z.object({
      taskId: z.number(),
      status: z.enum(['pending', 'delegated', 'in_progress', 'completed']),
      progress: z.number().min(0).max(100).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const [updated] = await db.update(tasks)
        .set({
          status: input.status,
          progress: input.progress,
          metadata: input.notes ? { notes: input.notes } : undefined,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, input.taskId))
        .returning();

      return updated;
    }),

  /**
   * Get task details with agent activity
   */
  getTaskDetail: publicProcedure
    .input(z.object({
      taskId: z.number(),
    }))
    .query(async ({ input }) => {
      const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, input.taskId),
      });

      return task;
    }),

  /**
   * Get active AI agents and their current workload
   */
  getActiveAgents: publicProcedure
    .query(async () => {
      // Mock AI agents data - in production this would come from a real agents table
      const mockAgents = [
        { id: 'dt-1', name: 'Digital Twin', type: 'digital-twin', status: 'active', performanceRating: 95, successRate: 94, specialization: 'General' },
        { id: 'cos-1', name: 'Chief of Staff', type: 'chief-of-staff', status: 'active', performanceRating: 98, successRate: 96, specialization: 'Management' },
        { id: 'sme-finance', name: 'Finance Expert', type: 'sme', status: 'active', performanceRating: 97, successRate: 95, specialization: 'Finance' },
        { id: 'sme-legal', name: 'Legal Counsel', type: 'sme', status: 'active', performanceRating: 96, successRate: 94, specialization: 'Legal' },
        { id: 'sme-marketing', name: 'Marketing Strategist', type: 'sme', status: 'active', performanceRating: 94, successRate: 92, specialization: 'Marketing' },
      ];

      // Get current workload for each agent
      const agentsWithWorkload = await Promise.all(mockAgents.map(async (agent) => {
        const activeTasks = await db.query.tasks.findMany({
          where: and(
            eq(tasks.assignedTo, agent.id),
            eq(tasks.status, 'in_progress')
          ),
        });
        
        const completedTasks = await db.query.tasks.findMany({
          where: and(
            eq(tasks.assignedTo, agent.id),
            eq(tasks.status, 'completed')
          ),
        });

        return {
          ...agent,
          currentWorkload: activeTasks.length,
          completedTasks: completedTasks.length,
        };
      }));

      return agentsWithWorkload;
    }),

  /**
   * Reassign task to different agent
   */
  reassignTask: publicProcedure
    .input(z.object({
      taskId: z.number(),
      agentId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Update task assignment
      const [updated] = await db.update(tasks)
        .set({
          assignedTo: input.agentId.toString(),
          metadata: { reassignReason: input.reason },
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, input.taskId))
        .returning();

      return updated;
    }),
});

/**
 * Find the best AI agent for a task based on category and workload
 */
async function findBestAgentForTask(task: {
  category: string;
  priority: string;
}) {
  // Mock AI agents - in production this would query a real agents table
  const mockAgents = [
    { id: 'dt-1', name: 'Digital Twin', performanceRating: 95, successRate: 94, specialization: 'General' },
    { id: 'cos-1', name: 'Chief of Staff', performanceRating: 98, successRate: 96, specialization: 'Management' },
    { id: 'sme-finance', name: 'Finance Expert', performanceRating: 97, successRate: 95, specialization: 'Finance' },
    { id: 'sme-legal', name: 'Legal Counsel', performanceRating: 96, successRate: 94, specialization: 'Legal' },
    { id: 'sme-marketing', name: 'Marketing Strategist', performanceRating: 94, successRate: 92, specialization: 'Marketing' },
  ];

  // Score agents based on specialization and workload
  const scoredAgents = await Promise.all(mockAgents.map(async (agent) => {
    let score = 0;
    
    // Base score from performance rating
    score += agent.performanceRating || 0;
    
    // Bonus for matching specialization
    if (agent.specialization?.toLowerCase().includes(task.category.toLowerCase())) {
      score += 20;
    }
    
    // Get current workload
    const activeTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.assignedTo, agent.id),
        eq(tasks.status, 'in_progress')
      ),
    });
    const workload = activeTasks.length;
    score -= workload * 5;
    
    // Bonus for high priority tasks if agent has high success rate
    if (task.priority === 'urgent' && (agent.successRate || 0) > 90) {
      score += 10;
    }
    
    return { agent, score };
  }));

  // Sort by score and return best agent
  scoredAgents.sort((a, b) => b.score - a.score);
  return scoredAgents[0]?.agent || null;
}
