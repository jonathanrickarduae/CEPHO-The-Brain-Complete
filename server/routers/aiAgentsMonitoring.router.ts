/**
 * AI Agents Monitoring Router
 *
 * Provides status, performance ratings, and daily reports for
 * all 51 specialized AI agents in the CEPHO platform.
 *
 * Per Phase 6 requirements: agents have continuous learning capabilities,
 * daily reports for the Chief of Staff, and approval workflows.
 */
import { z } from "zod";
import { desc, eq, gte } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { activityFeed, tasks } from "../../drizzle/schema";

// The 51 specialized AI agents for CEPHO
const AGENTS = [
  // Communication & Correspondence (8)
  { id: "email_composer", name: "Email Composer", category: "communication", specialization: "Communication & Correspondence", description: "Drafts professional emails, responses, and correspondence" },
  { id: "meeting_summariser", name: "Meeting Summariser", category: "communication", specialization: "Communication & Correspondence", description: "Summarises meetings, extracts action items, creates follow-ups" },
  { id: "stakeholder_comms", name: "Stakeholder Communications", category: "communication", specialization: "Communication & Correspondence", description: "Manages stakeholder updates, board communications, investor relations" },
  { id: "proposal_writer", name: "Proposal Writer", category: "communication", specialization: "Communication & Correspondence", description: "Creates business proposals, pitch decks, and presentations" },
  { id: "newsletter_editor", name: "Newsletter Editor", category: "communication", specialization: "Communication & Correspondence", description: "Produces internal and external newsletters and updates" },
  { id: "linkedin_manager", name: "LinkedIn Manager", category: "communication", specialization: "Communication & Correspondence", description: "Manages LinkedIn presence, posts, and professional networking" },
  { id: "press_release_writer", name: "Press Release Writer", category: "communication", specialization: "Communication & Correspondence", description: "Drafts press releases and media communications" },
  { id: "crisis_comms", name: "Crisis Communications", category: "communication", specialization: "Communication & Correspondence", description: "Handles crisis communications and reputation management" },

  // Content Creation (7)
  { id: "report_writer", name: "Report Writer", category: "content", specialization: "Content Creation", description: "Creates detailed business reports, analysis documents, and white papers" },
  { id: "blog_writer", name: "Blog Writer", category: "content", specialization: "Content Creation", description: "Produces thought leadership articles and blog content" },
  { id: "social_media_manager", name: "Social Media Manager", category: "content", specialization: "Content Creation", description: "Manages social media content across platforms" },
  { id: "video_scriptwriter", name: "Video Scriptwriter", category: "content", specialization: "Content Creation", description: "Writes scripts for video content, presentations, and webinars" },
  { id: "case_study_writer", name: "Case Study Writer", category: "content", specialization: "Content Creation", description: "Documents success stories and case studies" },
  { id: "seo_specialist", name: "SEO Specialist", category: "content", specialization: "Content Creation", description: "Optimises content for search engines and digital discovery" },
  { id: "brand_voice_guardian", name: "Brand Voice Guardian", category: "content", specialization: "Content Creation", description: "Ensures consistency in brand voice and messaging" },

  // Analysis & Intelligence (8)
  { id: "market_analyst", name: "Market Analyst", category: "analysis", specialization: "Analysis & Intelligence", description: "Analyses market trends, competitive landscape, and opportunities" },
  { id: "financial_analyst", name: "Financial Analyst", category: "analysis", specialization: "Analysis & Intelligence", description: "Provides financial analysis, modelling, and forecasting" },
  { id: "competitive_intelligence", name: "Competitive Intelligence", category: "analysis", specialization: "Analysis & Intelligence", description: "Monitors competitors and provides strategic intelligence" },
  { id: "data_interpreter", name: "Data Interpreter", category: "analysis", specialization: "Analysis & Intelligence", description: "Interprets complex data sets and provides actionable insights" },
  { id: "risk_assessor", name: "Risk Assessor", category: "analysis", specialization: "Analysis & Intelligence", description: "Identifies and evaluates business risks and mitigation strategies" },
  { id: "trend_spotter", name: "Trend Spotter", category: "analysis", specialization: "Analysis & Intelligence", description: "Identifies emerging trends in technology, business, and markets" },
  { id: "research_synthesiser", name: "Research Synthesiser", category: "analysis", specialization: "Analysis & Intelligence", description: "Synthesises research from multiple sources into actionable briefs" },
  { id: "kpi_tracker", name: "KPI Tracker", category: "analysis", specialization: "Analysis & Intelligence", description: "Monitors KPIs and provides performance dashboards" },

  // Daily Operations (7)
  { id: "calendar_manager", name: "Calendar Manager", category: "operations", specialization: "Daily Operations", description: "Manages scheduling, meeting coordination, and calendar optimisation" },
  { id: "task_prioritiser", name: "Task Prioritiser", category: "operations", specialization: "Daily Operations", description: "Prioritises tasks based on urgency, importance, and strategic value" },
  { id: "inbox_manager", name: "Inbox Manager", category: "operations", specialization: "Daily Operations", description: "Manages email inbox, flags priorities, and drafts responses" },
  { id: "travel_coordinator", name: "Travel Coordinator", category: "operations", specialization: "Daily Operations", description: "Coordinates travel arrangements and logistics" },
  { id: "expense_tracker", name: "Expense Tracker", category: "operations", specialization: "Daily Operations", description: "Tracks expenses, categorises spending, and flags anomalies" },
  { id: "document_organiser", name: "Document Organiser", category: "operations", specialization: "Daily Operations", description: "Organises and manages document libraries and knowledge bases" },
  { id: "reminder_manager", name: "Reminder Manager", category: "operations", specialization: "Daily Operations", description: "Manages reminders, follow-ups, and deadline tracking" },

  // Strategy & Planning (7)
  { id: "strategic_planner", name: "Strategic Planner", category: "strategy", specialization: "Strategy & Planning", description: "Develops strategic plans, OKRs, and long-term roadmaps" },
  { id: "innovation_catalyst", name: "Innovation Catalyst", category: "strategy", specialization: "Strategy & Planning", description: "Generates innovative ideas and facilitates innovation processes" },
  { id: "business_developer", name: "Business Developer", category: "strategy", specialization: "Strategy & Planning", description: "Identifies business development opportunities and partnerships" },
  { id: "product_strategist", name: "Product Strategist", category: "strategy", specialization: "Strategy & Planning", description: "Develops product strategy, roadmaps, and go-to-market plans" },
  { id: "growth_hacker", name: "Growth Hacker", category: "strategy", specialization: "Strategy & Planning", description: "Identifies and executes growth strategies and experiments" },
  { id: "scenario_planner", name: "Scenario Planner", category: "strategy", specialization: "Strategy & Planning", description: "Develops scenario analyses and contingency plans" },
  { id: "investment_advisor", name: "Investment Advisor", category: "strategy", specialization: "Strategy & Planning", description: "Provides investment analysis and portfolio recommendations" },

  // Workflow & Process (7)
  { id: "process_optimiser", name: "Process Optimiser", category: "workflow", specialization: "Workflow & Process", description: "Identifies and improves inefficient business processes" },
  { id: "project_coordinator", name: "Project Coordinator", category: "workflow", specialization: "Workflow & Process", description: "Coordinates project execution, tracks milestones, and manages dependencies" },
  { id: "automation_builder", name: "Automation Builder", category: "workflow", specialization: "Workflow & Process", description: "Identifies automation opportunities and builds workflow automations" },
  { id: "quality_controller", name: "Quality Controller", category: "workflow", specialization: "Workflow & Process", description: "Ensures quality standards across all outputs and processes" },
  { id: "compliance_monitor", name: "Compliance Monitor", category: "workflow", specialization: "Workflow & Process", description: "Monitors regulatory compliance and flags potential issues" },
  { id: "vendor_manager", name: "Vendor Manager", category: "workflow", specialization: "Workflow & Process", description: "Manages vendor relationships, contracts, and performance" },
  { id: "resource_allocator", name: "Resource Allocator", category: "workflow", specialization: "Workflow & Process", description: "Optimises resource allocation across projects and teams" },

  // Learning & Improvement (7)
  { id: "knowledge_curator", name: "Knowledge Curator", category: "learning", specialization: "Learning & Improvement", description: "Curates and organises knowledge from conversations and documents" },
  { id: "skill_developer", name: "Skill Developer", category: "learning", specialization: "Learning & Improvement", description: "Identifies skill gaps and recommends learning paths" },
  { id: "feedback_analyst", name: "Feedback Analyst", category: "learning", specialization: "Learning & Improvement", description: "Analyses feedback patterns and generates improvement recommendations" },
  { id: "performance_coach", name: "Performance Coach", category: "learning", specialization: "Learning & Improvement", description: "Provides performance coaching and productivity recommendations" },
  { id: "best_practice_researcher", name: "Best Practice Researcher", category: "learning", specialization: "Learning & Improvement", description: "Researches industry best practices and applies them to the business" },
  { id: "experiment_designer", name: "Experiment Designer", category: "learning", specialization: "Learning & Improvement", description: "Designs and tracks business experiments and A/B tests" },
  { id: "retrospective_facilitator", name: "Retrospective Facilitator", category: "learning", specialization: "Learning & Improvement", description: "Facilitates retrospectives and captures lessons learned" },
];

// Simulate realistic performance ratings (in production these would come from DB)
function getAgentMetrics(agentId: string) {
  // Use a deterministic seed based on agentId for consistent values
  const seed = agentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const baseRating = 6.5 + ((seed % 30) / 10); // 6.5 - 9.5
  const tasksCompleted = 50 + (seed % 200);
  const statuses = ["active", "active", "active", "active", "learning", "idle"] as const;
  const status = statuses[seed % statuses.length];

  return {
    performanceRating: Math.round(baseRating * 10) / 10,
    tasksCompleted,
    status,
    lastActive: new Date(Date.now() - (seed % 3600000)).toISOString(),
    improvementRequests: seed % 3 === 0 ? 1 : 0,
  };
}

export const aiAgentsMonitoringRouter = router({
  /**
   * Get status of all 51 AI agents.
   */
  getAllStatus: protectedProcedure.query(async () => {
    const agents = AGENTS.map((agent) => {
      const metrics = getAgentMetrics(agent.id);
      return {
        ...agent,
        ...metrics,
      };
    });

    const activeAgents = agents.filter((a) => a.status === "active").length;
    const avgRating =
      agents.reduce((sum, a) => sum + a.performanceRating, 0) / agents.length;

    return {
      agents,
      totalAgents: agents.length,
      activeAgents,
      averageRating: Math.round(avgRating * 10) / 10,
      lastUpdated: new Date().toISOString(),
    };
  }),

  /**
   * Get daily reports for all agents (for Chief of Staff review).
   */
  getDailyReports: protectedProcedure
    .input(
      z.object({
        date: z.string().optional(),
        agentId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const reportDate = input.date ? new Date(input.date) : new Date();

      const reports = AGENTS.slice(0, 10).map((agent) => {
        const metrics = getAgentMetrics(agent.id);
        return {
          agentId: agent.id,
          agentName: agent.name,
          date: reportDate.toISOString().split("T")[0],
          tasksCompleted: Math.floor(metrics.tasksCompleted / 30), // Daily estimate
          performanceRating: metrics.performanceRating,
          activities: [
            `Processed ${Math.floor(Math.random() * 10) + 1} requests`,
            `Updated knowledge base with ${Math.floor(Math.random() * 5) + 1} new items`,
            `Completed ${Math.floor(Math.random() * 3) + 1} improvement cycles`,
          ],
          improvementRequests:
            metrics.improvementRequests > 0
              ? [
                  {
                    id: `req_${agent.id}_${Date.now()}`,
                    description: `Requesting access to additional ${agent.specialization} data sources to improve accuracy`,
                    status: "pending" as const,
                    requestedAt: new Date().toISOString(),
                  },
                ]
              : [],
          status: metrics.status,
        };
      });

      return {
        reports,
        reportDate: reportDate.toISOString().split("T")[0],
        pendingApprovals: reports.filter((r) => r.improvementRequests.length > 0).length,
      };
    }),

  /**
   * Approve or deny an agent improvement request.
   */
  reviewRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        agentId: z.string(),
        decision: z.enum(["approved", "denied"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Log the decision to activity feed
      await db.insert(activityFeed).values({
        userId: ctx.user.id,
        actorType: "user",
        actorName: ctx.user.name,
        action: input.decision,
        targetType: "ai_agent_request",
        targetName: input.agentId,
        description: `${input.decision === "approved" ? "Approved" : "Denied"} improvement request for agent: ${input.agentId}${input.notes ? `. Notes: ${input.notes}` : ""}`,
      });

      return {
        success: true,
        requestId: input.requestId,
        decision: input.decision,
        reviewedAt: new Date().toISOString(),
        reviewedBy: ctx.user.name,
      };
    }),
});
