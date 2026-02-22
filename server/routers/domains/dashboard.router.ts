import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { generateDashboardInsights } from "../../services/dashboard-insights.service";

/**
 * Dashboard Router
 * Handles dashboard insights and metrics
 */
export const dashboardRouter = router({
  /**
   * Get comprehensive dashboard insights
   */
  getInsights: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id;
        const insights = await generateDashboardInsights(userId);
        
        return {
          success: true,
          insights,
        };
      } catch (error) {
        console.error("Dashboard insights error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate dashboard insights",
          cause: error,
        });
      }
    }),
});
