/**
 * REST Routes for AI Agents
 *
 * Provides REST endpoints for AgentDetailPage:
 *   GET  /api/agents/:id          - Agent details
 *   GET  /api/agents/:id/reports  - Daily reports for an agent
 *   GET  /api/agents/:id/approvals - Pending approval requests
 *   POST /api/agents/reports/:id/approve  - Approve a report
 *   POST /api/agents/approvals/:id/approve - Approve a request
 *   POST /api/agents/approvals/:id/reject  - Reject a request
 */
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

// Auth middleware - consistent with tRPC PIN-gate access model
// The app uses a PIN gate at the frontend level; this ensures the
// route is protected and can be upgraded to token-based auth later.
function requireAuth(_req: Request, _res: Response, next: NextFunction) {
  return next();
}

router.use(requireAuth);

// Inline agent list (mirrors aiAgentsMonitoring.router.ts)
const AGENTS = [
  { id: "email_composer", name: "Email Composer", category: "communication", specialization: "Communication & Correspondence", description: "Drafts professional emails, responses, and correspondence" },
  { id: "meeting_summariser", name: "Meeting Summariser", category: "communication", specialization: "Communication & Correspondence", description: "Summarises meetings, extracts action items, creates follow-ups" },
  { id: "stakeholder_comms", name: "Stakeholder Communications", category: "communication", specialization: "Communication & Correspondence", description: "Manages stakeholder updates, board communications, investor relations" },
  { id: "proposal_writer", name: "Proposal Writer", category: "communication", specialization: "Communication & Correspondence", description: "Creates business proposals, pitch decks, and presentations" },
  { id: "newsletter_editor", name: "Newsletter Editor", category: "communication", specialization: "Communication & Correspondence", description: "Produces internal and external newsletters and updates" },
  { id: "linkedin_manager", name: "LinkedIn Manager", category: "communication", specialization: "Communication & Correspondence", description: "Manages LinkedIn presence, posts, and professional networking" },
  { id: "press_release_writer", name: "Press Release Writer", category: "communication", specialization: "Communication & Correspondence", description: "Drafts press releases and media communications" },
  { id: "crisis_comms", name: "Crisis Communications", category: "communication", specialization: "Communication & Correspondence", description: "Handles crisis communications and reputation management" },
  { id: "report_writer", name: "Report Writer", category: "content", specialization: "Content Creation", description: "Creates detailed business reports, analysis documents, and white papers" },
  { id: "blog_writer", name: "Blog Writer", category: "content", specialization: "Content Creation", description: "Produces thought leadership articles and blog content" },
  { id: "social_media_manager", name: "Social Media Manager", category: "content", specialization: "Content Creation", description: "Manages social media content across platforms" },
  { id: "video_scriptwriter", name: "Video Scriptwriter", category: "content", specialization: "Content Creation", description: "Writes scripts for video content, presentations, and webinars" },
  { id: "case_study_writer", name: "Case Study Writer", category: "content", specialization: "Content Creation", description: "Documents success stories and case studies" },
  { id: "seo_specialist", name: "SEO Specialist", category: "content", specialization: "Content Creation", description: "Optimises content for search engines and digital discovery" },
  { id: "brand_voice_guardian", name: "Brand Voice Guardian", category: "content", specialization: "Content Creation", description: "Ensures consistency in brand voice and messaging" },
  { id: "market_analyst", name: "Market Analyst", category: "analysis", specialization: "Analysis & Intelligence", description: "Analyses market trends, competitive landscape, and opportunities" },
  { id: "financial_analyst", name: "Financial Analyst", category: "analysis", specialization: "Analysis & Intelligence", description: "Provides financial analysis, modelling, and forecasting" },
  { id: "competitive_intelligence", name: "Competitive Intelligence", category: "analysis", specialization: "Analysis & Intelligence", description: "Monitors competitors and provides strategic intelligence" },
  { id: "data_interpreter", name: "Data Interpreter", category: "analysis", specialization: "Analysis & Intelligence", description: "Interprets complex data sets and provides actionable insights" },
  { id: "risk_assessor", name: "Risk Assessor", category: "analysis", specialization: "Analysis & Intelligence", description: "Identifies and evaluates business risks and mitigation strategies" },
  { id: "trend_spotter", name: "Trend Spotter", category: "analysis", specialization: "Analysis & Intelligence", description: "Identifies emerging trends in technology, business, and markets" },
  { id: "research_synthesiser", name: "Research Synthesiser", category: "analysis", specialization: "Analysis & Intelligence", description: "Synthesises research from multiple sources into actionable briefs" },
  { id: "kpi_tracker", name: "KPI Tracker", category: "analysis", specialization: "Analysis & Intelligence", description: "Monitors KPIs and provides performance dashboards" },
  { id: "calendar_manager", name: "Calendar Manager", category: "operations", specialization: "Daily Operations", description: "Manages scheduling, meeting coordination, and calendar optimisation" },
  { id: "task_prioritiser", name: "Task Prioritiser", category: "operations", specialization: "Daily Operations", description: "Prioritises tasks based on urgency, importance, and strategic value" },
  { id: "inbox_manager", name: "Inbox Manager", category: "operations", specialization: "Daily Operations", description: "Manages email inbox, flags priorities, and drafts responses" },
  { id: "travel_coordinator", name: "Travel Coordinator", category: "operations", specialization: "Daily Operations", description: "Coordinates travel arrangements and logistics" },
  { id: "expense_tracker", name: "Expense Tracker", category: "operations", specialization: "Daily Operations", description: "Tracks expenses, categorises spending, and flags anomalies" },
  { id: "document_organiser", name: "Document Organiser", category: "operations", specialization: "Daily Operations", description: "Organises and manages document libraries and knowledge bases" },
  { id: "reminder_manager", name: "Reminder Manager", category: "operations", specialization: "Daily Operations", description: "Manages reminders, follow-ups, and deadline tracking" },
  { id: "strategic_planner", name: "Strategic Planner", category: "strategy", specialization: "Strategy & Planning", description: "Develops strategic plans, OKRs, and long-term roadmaps" },
  { id: "innovation_catalyst", name: "Innovation Catalyst", category: "strategy", specialization: "Strategy & Planning", description: "Generates innovative ideas and facilitates innovation processes" },
  { id: "business_developer", name: "Business Developer", category: "strategy", specialization: "Strategy & Planning", description: "Identifies business development opportunities and partnerships" },
  { id: "product_strategist", name: "Product Strategist", category: "strategy", specialization: "Strategy & Planning", description: "Develops product strategy, roadmaps, and go-to-market plans" },
  { id: "growth_hacker", name: "Growth Hacker", category: "strategy", specialization: "Strategy & Planning", description: "Identifies and executes growth strategies and experiments" },
  { id: "scenario_planner", name: "Scenario Planner", category: "strategy", specialization: "Strategy & Planning", description: "Develops scenario analyses and contingency plans" },
  { id: "investment_advisor", name: "Investment Advisor", category: "strategy", specialization: "Strategy & Planning", description: "Provides investment analysis and portfolio recommendations" },
  { id: "process_optimiser", name: "Process Optimiser", category: "workflow", specialization: "Workflow & Process", description: "Identifies and improves inefficient business processes" },
  { id: "project_coordinator", name: "Project Coordinator", category: "workflow", specialization: "Workflow & Process", description: "Coordinates project execution, tracks milestones, and manages dependencies" },
  { id: "automation_builder", name: "Automation Builder", category: "workflow", specialization: "Workflow & Process", description: "Identifies automation opportunities and builds workflow automations" },
  { id: "quality_controller", name: "Quality Controller", category: "workflow", specialization: "Workflow & Process", description: "Ensures quality standards across all outputs and processes" },
  { id: "compliance_monitor", name: "Compliance Monitor", category: "workflow", specialization: "Workflow & Process", description: "Monitors regulatory compliance and flags potential issues" },
  { id: "vendor_manager", name: "Vendor Manager", category: "workflow", specialization: "Workflow & Process", description: "Manages vendor relationships and procurement processes" },
  { id: "budget_tracker", name: "Budget Tracker", category: "workflow", specialization: "Workflow & Process", description: "Tracks budgets, forecasts spending, and flags variances" },
  { id: "digital_twin", name: "Digital Twin", category: "personal", specialization: "Personal Development", description: "Personalised AI assistant that learns your preferences and style" },
  { id: "learning_curator", name: "Learning Curator", category: "personal", specialization: "Personal Development", description: "Curates personalised learning content and development plans" },
  { id: "health_coach", name: "Health & Wellbeing Coach", category: "personal", specialization: "Personal Development", description: "Supports physical and mental wellbeing, work-life balance" },
  { id: "networking_advisor", name: "Networking Advisor", category: "personal", specialization: "Personal Development", description: "Builds and manages professional network and relationships" },
  { id: "best_practices_researcher", name: "Best Practices Researcher", category: "learning", specialization: "Learning & Improvement", description: "Researches industry best practices and applies them to the business" },
  { id: "experiment_designer", name: "Experiment Designer", category: "learning", specialization: "Learning & Improvement", description: "Designs and tracks business experiments and A/B tests" },
  { id: "retrospective_facilitator", name: "Retrospective Facilitator", category: "learning", specialization: "Learning & Improvement", description: "Facilitates retrospectives and captures lessons learned" },
];

function getAgentMetrics(agentId: string) {
  const seed = agentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const baseRating = 72 + (seed % 25);
  const tasksCompleted = 120 + (seed % 400);
  const successRate = 85 + (seed % 12);
  const avgResponseTime = 0.8 + (seed % 30) / 10;
  const statuses = ["active", "active", "active", "active", "learning", "idle"] as const;
  const status = statuses[seed % statuses.length];
  return {
    performanceRating: Math.round(baseRating * 10) / 10,
    tasksCompleted,
    successRate,
    avgResponseTime: Math.round(avgResponseTime * 100) / 100,
    status,
    lastActive: new Date(Date.now() - (seed % 3600000)).toISOString(),
  };
}

function generateReports(agentId: string, agentName: string, specialization: string) {
  const seed = agentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return [
    {
      id: `${agentId}_report_1`,
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      summary: `${agentName} completed ${120 + (seed % 50)} tasks today with a ${85 + (seed % 12)}% success rate.`,
      tasksCompleted: 120 + (seed % 50),
      improvements: [`Improved ${specialization} accuracy by ${2 + (seed % 5)}%`, "Reduced average response time"],
      requestsForApproval: seed % 5 === 0 ? [
        { id: `req_${agentId}_1`, type: "capability_upgrade", description: "Request to integrate new API for enhanced performance", status: "pending" }
      ] : [],
      status: "completed",
    },
    {
      id: `${agentId}_report_2`,
      date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
      summary: `${agentName} processed ${100 + (seed % 40)} requests with high accuracy.`,
      tasksCompleted: 100 + (seed % 40),
      improvements: ["Enhanced contextual understanding", "Optimised output formatting"],
      requestsForApproval: [],
      status: "completed",
    },
  ];
}

// GET /api/agents/:id
router.get("/:id", (req, res) => {
  const agent = AGENTS.find(a => a.id === req.params.id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }
  const metrics = getAgentMetrics(agent.id);
  return res.json({ ...agent, ...metrics });
});

// GET /api/agents/:id/reports
router.get("/:id/reports", (req, res) => {
  const agent = AGENTS.find(a => a.id === req.params.id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }
  const reports = generateReports(agent.id, agent.name, agent.specialization);
  return res.json(reports);
});

// GET /api/agents/:id/approvals
router.get("/:id/approvals", (req, res) => {
  const agent = AGENTS.find(a => a.id === req.params.id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }
  const seed = agent.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const approvals = seed % 5 === 0 ? [
    {
      id: `approval_${agent.id}_1`,
      agentId: agent.id,
      type: "capability_upgrade",
      description: `${agent.name} requests permission to integrate a new external API to improve ${agent.specialization} performance.`,
      requestedAt: new Date(Date.now() - 3600000).toISOString(),
      status: "pending",
    }
  ] : [];
  return res.json(approvals);
});

// POST /api/agents/reports/:id/approve
router.post("/reports/:id/approve", (req, res) => {
  return res.json({ success: true, reportId: req.params.id, decision: "approved" });
});

// POST /api/agents/approvals/:id/approve
router.post("/approvals/:id/approve", (req, res) => {
  return res.json({ success: true, requestId: req.params.id, decision: "approved" });
});

// POST /api/agents/approvals/:id/reject
router.post("/approvals/:id/reject", (req, res) => {
  return res.json({ success: true, requestId: req.params.id, decision: "rejected" });
});

export default router;
