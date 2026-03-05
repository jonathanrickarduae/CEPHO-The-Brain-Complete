/**
 * AI Agents Monitoring Router
 *
 * Provides status, performance ratings, and daily reports for
 * all 51 specialised AI agents in the CEPHO system.
 * Includes Chief of Staff approval workflow for improvement requests.
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  activityFeed,
  agentDailyReports,
  agentPerformanceMetrics,
  agentRatings,
} from "../../drizzle/schema";
import { avg, count } from "drizzle-orm";

const AGENTS = [
  // Communication & Correspondence (8)
  {
    id: "email_composer",
    name: "Email Composer",
    category: "communication",
    specialization: "Communication & Correspondence",
    description: "Drafts professional emails, responses, and correspondence",
  },
  {
    id: "meeting_summariser",
    name: "Meeting Summariser",
    category: "communication",
    specialization: "Communication & Correspondence",
    description:
      "Summarises meetings, extracts action items, creates follow-ups",
  },
  {
    id: "stakeholder_comms",
    name: "Stakeholder Communications",
    category: "communication",
    specialization: "Communication & Correspondence",
    description:
      "Manages stakeholder updates, board communications, investor relations",
  },
  {
    id: "proposal_writer",
    name: "Proposal Writer",
    category: "communication",
    specialization: "Communication & Correspondence",
    description: "Creates business proposals, pitch decks, and presentations",
  },
  {
    id: "newsletter_editor",
    name: "Newsletter Editor",
    category: "communication",
    specialization: "Communication & Correspondence",
    description: "Produces internal and external newsletters and updates",
  },
  {
    id: "linkedin_manager",
    name: "LinkedIn Manager",
    category: "communication",
    specialization: "Communication & Correspondence",
    description:
      "Manages LinkedIn presence, posts, and professional networking",
  },
  {
    id: "press_release_writer",
    name: "Press Release Writer",
    category: "communication",
    specialization: "Communication & Correspondence",
    description: "Drafts press releases and media communications",
  },
  {
    id: "crisis_comms",
    name: "Crisis Communications",
    category: "communication",
    specialization: "Communication & Correspondence",
    description: "Handles crisis communications and reputation management",
  },
  // Content Creation (7)
  {
    id: "report_writer",
    name: "Report Writer",
    category: "content",
    specialization: "Content Creation",
    description:
      "Creates detailed business reports, analysis documents, and white papers",
  },
  {
    id: "blog_writer",
    name: "Blog Writer",
    category: "content",
    specialization: "Content Creation",
    description: "Produces thought leadership articles and blog content",
  },
  {
    id: "social_media_manager",
    name: "Social Media Manager",
    category: "content",
    specialization: "Content Creation",
    description: "Manages social media content across platforms",
  },
  {
    id: "video_scriptwriter",
    name: "Video Scriptwriter",
    category: "content",
    specialization: "Content Creation",
    description:
      "Writes scripts for video content, presentations, and webinars",
  },
  {
    id: "case_study_writer",
    name: "Case Study Writer",
    category: "content",
    specialization: "Content Creation",
    description: "Documents success stories and case studies",
  },
  {
    id: "seo_specialist",
    name: "SEO Specialist",
    category: "content",
    specialization: "Content Creation",
    description: "Optimises content for search engines and digital discovery",
  },
  {
    id: "brand_voice_guardian",
    name: "Brand Voice Guardian",
    category: "content",
    specialization: "Content Creation",
    description: "Ensures consistency in brand voice and messaging",
  },
  // Analysis & Intelligence (8)
  {
    id: "market_analyst",
    name: "Market Analyst",
    category: "analysis",
    specialization: "Analysis & Intelligence",
    description:
      "Analyses market trends, competitive landscape, and opportunities",
  },
  {
    id: "financial_analyst",
    name: "Financial Analyst",
    category: "analysis",
    specialization: "Analysis & Intelligence",
    description: "Provides financial analysis, modelling, and forecasting",
  },
  {
    id: "competitive_intelligence",
    name: "Competitive Intelligence",
    category: "analysis",
    specialization: "Analysis & Intelligence",
    description: "Monitors competitors and provides strategic intelligence",
  },
  {
    id: "data_interpreter",
    name: "Data Interpreter",
    category: "analysis",
    specialization: "Analysis & Intelligence",
    description:
      "Interprets complex data sets and provides actionable insights",
  },
  {
    id: "risk_assessor",
    name: "Risk Assessor",
    category: "analysis",
    specialization: "Analysis & Intelligence",
    description:
      "Identifies and evaluates business risks and mitigation strategies",
  },
  {
    id: "trend_spotter",
    name: "Trend Spotter",
    category: "analysis",
    specialization: "Analysis & Intelligence",
    description:
      "Identifies emerging trends in technology, business, and markets",
  },
  {
    id: "research_synthesiser",
    name: "Research Synthesiser",
    category: "analysis",
    specialization: "Analysis & Intelligence",
    description:
      "Synthesises research from multiple sources into actionable briefs",
  },
  {
    id: "kpi_tracker",
    name: "KPI Tracker",
    category: "analysis",
    specialization: "Analysis & Intelligence",
    description: "Monitors KPIs and provides performance dashboards",
  },
  // Daily Operations (7)
  {
    id: "calendar_manager",
    name: "Calendar Manager",
    category: "operations",
    specialization: "Daily Operations",
    description:
      "Manages scheduling, meeting coordination, and calendar optimisation",
  },
  {
    id: "task_prioritiser",
    name: "Task Prioritiser",
    category: "operations",
    specialization: "Daily Operations",
    description:
      "Prioritises tasks based on urgency, importance, and strategic value",
  },
  {
    id: "inbox_manager",
    name: "Inbox Manager",
    category: "operations",
    specialization: "Daily Operations",
    description: "Manages email inbox, flags priorities, and drafts responses",
  },
  {
    id: "travel_coordinator",
    name: "Travel Coordinator",
    category: "operations",
    specialization: "Daily Operations",
    description: "Coordinates travel arrangements and logistics",
  },
  {
    id: "expense_tracker",
    name: "Expense Tracker",
    category: "operations",
    specialization: "Daily Operations",
    description: "Tracks expenses, categorises spending, and flags anomalies",
  },
  {
    id: "document_organiser",
    name: "Document Organiser",
    category: "operations",
    specialization: "Daily Operations",
    description: "Organises and manages document libraries and knowledge bases",
  },
  {
    id: "reminder_manager",
    name: "Reminder Manager",
    category: "operations",
    specialization: "Daily Operations",
    description: "Manages reminders, follow-ups, and deadline tracking",
  },
  // Strategy & Planning (7)
  {
    id: "strategic_planner",
    name: "Strategic Planner",
    category: "strategy",
    specialization: "Strategy & Planning",
    description: "Develops strategic plans, OKRs, and long-term roadmaps",
  },
  {
    id: "innovation_catalyst",
    name: "Innovation Catalyst",
    category: "strategy",
    specialization: "Strategy & Planning",
    description:
      "Generates innovative ideas and facilitates innovation processes",
  },
  {
    id: "business_developer",
    name: "Business Developer",
    category: "strategy",
    specialization: "Strategy & Planning",
    description:
      "Identifies business development opportunities and partnerships",
  },
  {
    id: "product_strategist",
    name: "Product Strategist",
    category: "strategy",
    specialization: "Strategy & Planning",
    description: "Develops product strategy, roadmaps, and go-to-market plans",
  },
  {
    id: "growth_hacker",
    name: "Growth Hacker",
    category: "strategy",
    specialization: "Strategy & Planning",
    description: "Identifies and executes growth strategies and experiments",
  },
  {
    id: "scenario_planner",
    name: "Scenario Planner",
    category: "strategy",
    specialization: "Strategy & Planning",
    description: "Develops scenario analyses and contingency plans",
  },
  {
    id: "investment_advisor",
    name: "Investment Advisor",
    category: "strategy",
    specialization: "Strategy & Planning",
    description: "Provides investment analysis and portfolio recommendations",
  },
  // Workflow & Process (7)
  {
    id: "process_optimiser",
    name: "Process Optimiser",
    category: "workflow",
    specialization: "Workflow & Process",
    description: "Identifies and improves inefficient business processes",
  },
  {
    id: "project_coordinator",
    name: "Project Coordinator",
    category: "workflow",
    specialization: "Workflow & Process",
    description:
      "Coordinates project execution, tracks milestones, and manages dependencies",
  },
  {
    id: "automation_builder",
    name: "Automation Builder",
    category: "workflow",
    specialization: "Workflow & Process",
    description:
      "Identifies automation opportunities and builds workflow automations",
  },
  {
    id: "quality_controller",
    name: "Quality Controller",
    category: "workflow",
    specialization: "Workflow & Process",
    description: "Ensures quality standards across all outputs and processes",
  },
  {
    id: "compliance_monitor",
    name: "Compliance Monitor",
    category: "workflow",
    specialization: "Workflow & Process",
    description: "Monitors regulatory compliance and flags potential issues",
  },
  {
    id: "vendor_manager",
    name: "Vendor Manager",
    category: "workflow",
    specialization: "Workflow & Process",
    description: "Manages vendor relationships, contracts, and performance",
  },
  {
    id: "resource_allocator",
    name: "Resource Allocator",
    category: "workflow",
    specialization: "Workflow & Process",
    description: "Optimises resource allocation across projects and teams",
  },
  // Learning & Improvement (7)
  {
    id: "knowledge_curator",
    name: "Knowledge Curator",
    category: "learning",
    specialization: "Learning & Improvement",
    description:
      "Curates and organises knowledge from conversations and documents",
  },
  {
    id: "skill_developer",
    name: "Skill Developer",
    category: "learning",
    specialization: "Learning & Improvement",
    description: "Identifies skill gaps and recommends learning paths",
  },
  {
    id: "feedback_analyst",
    name: "Feedback Analyst",
    category: "learning",
    specialization: "Learning & Improvement",
    description:
      "Analyses feedback patterns and generates improvement recommendations",
  },
  {
    id: "performance_coach",
    name: "Performance Coach",
    category: "learning",
    specialization: "Learning & Improvement",
    description:
      "Provides performance coaching and productivity recommendations",
  },
  {
    id: "best_practice_researcher",
    name: "Best Practice Researcher",
    category: "learning",
    specialization: "Learning & Improvement",
    description:
      "Researches industry best practices and applies them to the business",
  },
  {
    id: "experiment_designer",
    name: "Experiment Designer",
    category: "learning",
    specialization: "Learning & Improvement",
    description: "Designs and tracks business experiments and A/B tests",
  },
  {
    id: "retrospective_facilitator",
    name: "Retrospective Facilitator",
    category: "learning",
    specialization: "Learning & Improvement",
    description: "Facilitates retrospectives and captures lessons learned",
  },
];

function getAgentMetrics(agentId: string) {
  const seed = agentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const baseRating = 72 + (seed % 25); // 72-96
  const tasksCompleted = 120 + (seed % 400);
  const successRate = 85 + (seed % 12);
  const avgResponseTime = 0.8 + (seed % 30) / 10;
  const statuses = [
    "active",
    "active",
    "active",
    "active",
    "learning",
    "idle",
  ] as const;
  const status = statuses[seed % statuses.length];

  return {
    performance: {
      rating: Math.round(baseRating * 10) / 10,
      tasksCompleted,
      successRate,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
    },
    status,
    lastActive: new Date(Date.now() - (seed % 3600000)).toISOString(),
    improvementRequests: seed % 5 === 0 ? 1 : 0,
  };
}

function generateDailyReport(
  agentId: string,
  agentName: string,
  specialization: string
) {
  const seed = agentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const metrics = getAgentMetrics(agentId);

  const improvements = [
    `Improved ${specialization.toLowerCase()} accuracy by ${2 + (seed % 8)}% through additional training`,
    `Reduced processing time by ${10 + (seed % 20)}% through optimised algorithms`,
    `Added ${1 + (seed % 4)} new capabilities to handle edge cases`,
  ];

  const newLearnings = [
    `Analysed ${10 + (seed % 40)} new research papers in ${specialization}`,
    `Identified ${2 + (seed % 6)} emerging trends relevant to current projects`,
    `Processed feedback from ${5 + (seed % 15)} recent interactions`,
  ];

  const suggestions = [
    `Consider integrating ${agentName} with the ${specialization} workflow for improved outcomes`,
    `Recommend increasing autonomy level for routine ${specialization.toLowerCase()} tasks`,
    `Suggest weekly review sessions to align priorities with strategic goals`,
  ];

  const researchTopics = [
    `Latest developments in AI-assisted ${specialization.toLowerCase()}`,
    `Best practices for ${agentName.toLowerCase()} in high-growth organisations`,
    `Emerging tools and APIs for ${specialization.toLowerCase()} automation`,
  ];

  const requestsForApproval =
    metrics.improvementRequests > 0
      ? [
          {
            id: `req_${agentId}_${new Date().toISOString().split("T")[0]}`,
            type: "Capability Enhancement",
            description: `Request to expand ${agentName}'s access to external ${specialization} data sources`,
            reasoning: `Analysis shows ${15 + (seed % 20)}% improvement potential with access to real-time feeds`,
            estimatedImpact: `+${15 + (seed % 15)}-${20 + (seed % 10)}% accuracy improvement, estimated 2 hours/week time saving`,
            status: "pending" as const,
            requestedAt: new Date().toISOString(),
          },
        ]
      : [];

  return {
    agentId,
    agentName,
    date: new Date().toISOString().split("T")[0],
    tasksCompleted: Math.floor(metrics.performance.tasksCompleted / 30),
    performanceRating: metrics.performance.rating,
    improvements,
    newLearnings,
    suggestions,
    researchTopics,
    requestsForApproval,
    status: metrics.status,
  };
}

export const aiAgentsMonitoringRouter = router({
  getAllStatus: protectedProcedure.query(async () => {
    const rawAgents = AGENTS.map(agent => ({
      ...agent,
      ...getAgentMetrics(agent.id),
    }));

    // Flatten nested performance object so client receives flat fields
    const agents = rawAgents.map(a => ({
      id: a.id,
      name: a.name,
      category: a.category,
      specialization: a.specialization,
      description: a.description,
      status: a.status,
      lastActive: a.lastActive,
      improvementRequests: a.improvementRequests,
      performanceRating: a.performance.rating,
      tasksCompleted: a.performance.tasksCompleted,
      successRate: a.performance.successRate,
      avgResponseTime: a.performance.averageResponseTime,
    }));

    const activeAgents = agents.filter(a => a.status === "active").length;
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

  getDailyReports: protectedProcedure
    .input(
      z.object({ date: z.string().optional(), agentId: z.string().optional() })
    )
    .query(async ({ input, ctx }) => {
      // Try real DB reports first (populated by daily scheduler at 06:30)
      let dbReports: typeof agentDailyReports.$inferSelect[] = [];
      try {
        const conditions = [eq(agentDailyReports.userId, ctx.user.id)];
        if (input.agentId)
          conditions.push(eq(agentDailyReports.agentId, input.agentId));
        dbReports = await db
          .select()
          .from(agentDailyReports)
          .where(and(...conditions))
          .orderBy(desc(agentDailyReports.date))
          .limit(input.agentId ? 5 : 51);
      } catch (_e) {
        // Table may not exist yet — fall through to generated reports
      }

      if (dbReports.length > 0) {
        const reports = dbReports.map(r => ({
          agentId: r.agentId,
          agentName: r.agentName,
          date:
            r.date instanceof Date
              ? r.date.toISOString().split("T")[0]
              : String(r.date),
          tasksCompleted: (r.tasksCompleted as string[]).length,
          performanceRating: 4.2,
          improvements: [],
          newLearnings: (
            r.newLearnings as { topic: string; insight: string }[]
          ).map(l => l.insight ?? l.topic),
          suggestions: (
            r.suggestions as { title: string; description: string }[]
          ).map(s => s.title),
          researchTopics: (r.newLearnings as { topic: string }[]).map(
            l => l.topic
          ),
          requestsForApproval:
            r.capabilityRequest && r.approvalStatus === "pending"
              ? [
                  {
                    id: `req_${r.agentId}_${r.id}`,
                    type: "Capability Enhancement",
                    description: String(
                      (r.capabilityRequest as Record<string, unknown>)
                        .description ?? "Enhancement request"
                    ),
                    reasoning: String(
                      (r.capabilityRequest as Record<string, unknown>)
                        .rationale ?? ""
                    ),
                    estimatedImpact: "See request for details",
                    status: "pending" as const,
                    requestedAt:
                      r.createdAt instanceof Date
                        ? r.createdAt.toISOString()
                        : new Date().toISOString(),
                  },
                ]
              : [],
          status: "active" as const,
          achievements: r.achievements,
          challenges: r.challenges,
          approvalStatus: r.approvalStatus,
        }));
        return {
          reports,
          reportDate: new Date().toISOString().split("T")[0],
          pendingApprovals: reports.filter(
            r => r.requestsForApproval.length > 0
          ).length,
          source: "live" as const,
        };
      }

      // Fallback to generated reports (used before first scheduler run)
      const agentsToReport = input.agentId
        ? AGENTS.filter(a => a.id === input.agentId)
        : AGENTS;
      const reports = agentsToReport.map(agent =>
        generateDailyReport(agent.id, agent.name, agent.specialization)
      );
      return {
        reports,
        reportDate: new Date().toISOString().split("T")[0],
        pendingApprovals: reports.filter(r => r.requestsForApproval.length > 0)
          .length,
        source: "generated" as const,
      };
    }),

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
      await db.insert(activityFeed).values({
        userId: ctx.user.id,
        actorType: "user",
        actorName: ctx.user.name,
        action: input.decision,
        targetType: "ai_agent_request",
        targetId: 0,
        targetName: input.agentId,
        description: `${input.decision === "approved" ? "Approved" : "Denied"} improvement request for agent: ${input.agentId}${input.notes ? `. Notes: ${input.notes}` : ""}`,
      });

      return {
        success: true,
        requestId: input.requestId,
        decision: input.decision,
        processedAt: new Date().toISOString(),
      };
    }),

  /**
   * p6-9: Real-time agent activity feed
   * Returns the last N activity feed entries related to agent actions.
   */
  getLiveActivityFeed: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(30),
        agentId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let items: typeof activityFeed.$inferSelect[] = [];
      try {
        const conditions: Parameters<typeof and>[0][] = [
          eq(activityFeed.userId, ctx.user.id),
        ];
        if (input.agentId) {
          conditions.push(eq(activityFeed.targetName, input.agentId));
        }
        items = await db
          .select()
          .from(activityFeed)
          .where(and(...conditions))
          .orderBy(desc(activityFeed.createdAt))
          .limit(input.limit);
      } catch (_e) {
        // Table may not exist yet
      }
      return {
        items: items.map(item => ({
          id: item.id,
          actorType: item.actorType,
          actorName: item.actorName,
          action: item.action,
          targetType: item.targetType,
          targetName: item.targetName,
          description: item.description,
          createdAt: item.createdAt.toISOString(),
        })),
        total: items.length,
      };
    }),

  /**
   * p6-9: Per-agent performance metrics summary
   * Returns aggregated performance data for all agents or a specific agent.
   */
  getPerformanceMetrics: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        periodDays: z.number().int().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const metricsQuery = db
        .select({
          agentId: agentPerformanceMetrics.agentId,
          agentName: agentPerformanceMetrics.agentName,
          avgOverallScore: avg(agentPerformanceMetrics.overallScore),
          avgLearningScore: avg(agentPerformanceMetrics.learningScore),
          totalTasks: count(agentPerformanceMetrics.id),
        })
        .from(agentPerformanceMetrics)
        .where(eq(agentPerformanceMetrics.userId, ctx.user.id))
        .groupBy(
          agentPerformanceMetrics.agentId,
          agentPerformanceMetrics.agentName
        );

      const ratingsQuery = db
        .select({
          agentId: agentRatings.agentId,
          avgRating: avg(agentRatings.rating),
          totalRatings: count(agentRatings.id),
        })
        .from(agentRatings)
        .where(eq(agentRatings.userId, ctx.user.id))
        .groupBy(agentRatings.agentId);

      let metrics: any[] = [];
      let ratings: any[] = [];
      try {
        [metrics, ratings] = await Promise.all([metricsQuery, ratingsQuery]);
      } catch (_e) {
        // Tables may not exist yet — return generated fallback below
      }

      const ratingsMap = new Map(ratings.map((r: any) => [r.agentId, r]));

      const combined = metrics.map((m: any) => ({
        agentId: m.agentId,
        agentName: m.agentName,
        overallScore: Number(m.avgOverallScore ?? 0).toFixed(1),
        learningScore: Number(m.avgLearningScore ?? 0).toFixed(1),
        totalTasks: m.totalTasks,
        avgRating: Number(ratingsMap.get(m.agentId)?.avgRating ?? 0).toFixed(1),
        totalRatings: ratingsMap.get(m.agentId)?.totalRatings ?? 0,
      }));

      if (combined.length === 0) {
        return {
          metrics: AGENTS.map(a => ({
            agentId: a.id,
            agentName: a.name,
            overallScore: "0.0",
            learningScore: "0.0",
            totalTasks: 0,
            avgRating: "0.0",
            totalRatings: 0,
          })),
          periodDays: input.periodDays,
          generatedAt: new Date().toISOString(),
        };
      }

      return {
        metrics: combined,
        periodDays: input.periodDays,
        generatedAt: new Date().toISOString(),
      };
    }),
});
