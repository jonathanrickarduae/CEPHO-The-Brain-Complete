import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllAgentsStatus,
  getAgentStatus,
  getAllAgentsDailyReports,
  updateRequestStatus,
  getAgentPerformanceHistory,
} from "../../services/ai-agents-monitoring.service";

/**
 * AI Agents Monitoring Router
 * Provides endpoints for monitoring AI agents performance and ratings
 */
export const aiAgentsMonitoringRouter = router({
  /**
   * Get all AI agents with their status and performance
   */
  getAllStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const agents = await getAllAgentsStatus();
        return {
          success: true,
          agents,
          totalAgents: agents.length,
          activeAgents: agents.filter(a => a.status === 'active').length,
        };
      } catch (error) {
        console.error("Get all agents status error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get agents status",
          cause: error,
        });
      }
    }),

  /**
   * Get specific agent status with detailed information
   */
  getAgentStatus: protectedProcedure
    .input(z.object({
      agentId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const agent = await getAgentStatus(input.agentId);
        
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }
        
        return {
          success: true,
          agent,
        };
      } catch (error: any) {
        if (error.code === "NOT_FOUND") {
          throw error;
        }
        
        console.error("Get agent status error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get agent status",
          cause: error,
        });
      }
    }),

  /**
   * Get daily reports for all agents
   */
  getDailyReports: protectedProcedure
    .input(z.object({
      date: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const reports = await getAllAgentsDailyReports(input.date);
        return {
          success: true,
          reports,
          date: input.date || new Date().toISOString().split('T')[0],
        };
      } catch (error) {
        console.error("Get daily reports error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get daily reports",
          cause: error,
        });
      }
    }),

  /**
   * Approve or deny agent improvement request
   */
  updateRequestStatus: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      status: z.enum(['approved', 'denied']),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const success = await updateRequestStatus(
          input.requestId,
          input.status,
          input.feedback
        );
        
        return {
          success,
          message: `Request ${input.status} successfully`,
        };
      } catch (error) {
        console.error("Update request status error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update request status",
          cause: error,
        });
      }
    }),

  /**
   * Get agent performance history
   */
  getPerformanceHistory: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      days: z.number().min(1).max(90).default(30),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const history = await getAgentPerformanceHistory(input.agentId, input.days);
        return {
          success: true,
          history,
          agentId: input.agentId,
          days: input.days,
        };
      } catch (error) {
        console.error("Get performance history error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get performance history",
          cause: error,
        });
      }
    }),
});
