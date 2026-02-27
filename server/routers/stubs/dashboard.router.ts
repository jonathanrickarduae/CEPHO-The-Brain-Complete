/**
 * Dashboard Router (Stub)
 * Placeholder until the dashboard analytics service is implemented.
 */
import { publicProcedure, router } from "../../_core/trpc";

export const dashboardRouter = router({
  getInsights: publicProcedure.query(async () => {
    // TODO: Wire to analytics/insights service
    return {
      summary: "Dashboard insights not yet implemented",
      metrics: [],
      lastUpdated: new Date().toISOString(),
    };
  }),
});
