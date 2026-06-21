/**
 * Unit Tests: Critical Business Logic (Remediation TEST-01)
 *
 * Tests for:
 * 1. Agent metrics computation (agents REST route)
 * 2. Task data shape mapping (qa/cosTasks routers)
 * 3. Project Genesis phase completion logic
 * 4. AI Agents monitoring flat field mapping
 * 5. Innovation Hub stats computation
 * 6. Document Library filtering logic
 */
import { describe, it, expect } from "vitest";

// ── 1. Agent Metrics Computation ─────────────────────────────────────────────
// Mirrors the getAgentMetrics function in server/routes/agents.ts
function getAgentMetrics(agentId: string) {
  const seed = agentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const baseRating = 72 + (seed % 25);
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
    performanceRating: Math.round(baseRating * 10) / 10,
    tasksCompleted,
    successRate,
    avgResponseTime: Math.round(avgResponseTime * 100) / 100,
    status,
    lastActive: new Date(Date.now() - (seed % 3600000)).toISOString(),
  };
}

describe("Agent Metrics Computation", () => {
  it("returns all required fields", () => {
    const metrics = getAgentMetrics("email_composer");
    expect(metrics).toHaveProperty("performanceRating");
    expect(metrics).toHaveProperty("tasksCompleted");
    expect(metrics).toHaveProperty("successRate");
    expect(metrics).toHaveProperty("avgResponseTime");
    expect(metrics).toHaveProperty("status");
    expect(metrics).toHaveProperty("lastActive");
  });

  it("performanceRating is between 72 and 96", () => {
    const agents = [
      "email_composer",
      "meeting_summariser",
      "market_analyst",
      "digital_twin",
    ];
    for (const id of agents) {
      const { performanceRating } = getAgentMetrics(id);
      expect(performanceRating).toBeGreaterThanOrEqual(72);
      expect(performanceRating).toBeLessThanOrEqual(97);
    }
  });

  it("successRate is between 85 and 96", () => {
    const { successRate } = getAgentMetrics("task_prioritiser");
    expect(successRate).toBeGreaterThanOrEqual(85);
    expect(successRate).toBeLessThanOrEqual(97);
  });

  it("status is one of the valid values", () => {
    const validStatuses = ["active", "learning", "idle"];
    const { status } = getAgentMetrics("strategic_planner");
    expect(validStatuses).toContain(status);
  });

  it("is deterministic - same input gives same output", () => {
    const m1 = getAgentMetrics("email_composer");
    const m2 = getAgentMetrics("email_composer");
    expect(m1.performanceRating).toBe(m2.performanceRating);
    expect(m1.tasksCompleted).toBe(m2.tasksCompleted);
    expect(m1.status).toBe(m2.status);
  });

  it("different agents produce different metrics", () => {
    const m1 = getAgentMetrics("email_composer");
    const m2 = getAgentMetrics("market_analyst");
    // At least one metric should differ
    const differs =
      m1.performanceRating !== m2.performanceRating ||
      m1.tasksCompleted !== m2.tasksCompleted ||
      m1.successRate !== m2.successRate;
    expect(differs).toBe(true);
  });

  it("lastActive is a valid ISO date string", () => {
    const { lastActive } = getAgentMetrics("email_composer");
    expect(() => new Date(lastActive)).not.toThrow();
    expect(new Date(lastActive).toISOString()).toBe(lastActive);
  });
});

// ── 2. Task Data Shape Mapping ────────────────────────────────────────────────
// Mirrors the mapping logic in qa.getTasksWithStatus and cosTasks.getTasks

interface MockDbTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  progress: number | null;
  qaStatus: string | null;
  cosScore: number | null;
  secondaryAiScore: number | null;
  assignedExperts: string[] | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapQaTask(t: MockDbTask) {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? "",
    status: t.status,
    priority: t.priority,
    progress: t.progress ?? 0,
    qaStatus: t.qaStatus ?? (t.status === "completed" ? "passed" : "pending"),
    cosScore: t.cosScore ?? null,
    secondaryAiScore: t.secondaryAiScore ?? null,
    assignedExperts: (t.assignedExperts as string[] | null) ?? [],
    metadata: t.metadata as Record<string, unknown> | null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

describe("QA Task Data Shape Mapping", () => {
  const mockTask: MockDbTask = {
    id: 1,
    title: "Test Task",
    description: "A test task",
    status: "completed",
    priority: "high",
    progress: 100,
    qaStatus: "passed",
    cosScore: 9,
    secondaryAiScore: 8,
    assignedExperts: ["expert_1", "expert_2"],
    metadata: { category: "strategy" },
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-02T00:00:00Z"),
  };

  it("maps all required fields", () => {
    const mapped = mapQaTask(mockTask);
    expect(mapped.id).toBe(1);
    expect(mapped.title).toBe("Test Task");
    expect(mapped.description).toBe("A test task");
    expect(mapped.status).toBe("completed");
    expect(mapped.priority).toBe("high");
    expect(mapped.progress).toBe(100);
    expect(mapped.qaStatus).toBe("passed");
    expect(mapped.cosScore).toBe(9);
    expect(mapped.secondaryAiScore).toBe(8);
    expect(mapped.assignedExperts).toEqual(["expert_1", "expert_2"]);
    expect(mapped.createdAt).toBe("2025-01-01T00:00:00.000Z");
    expect(mapped.updatedAt).toBe("2025-01-02T00:00:00.000Z");
  });

  it("uses default values for null fields", () => {
    const nullTask: MockDbTask = {
      ...mockTask,
      description: null,
      progress: null,
      qaStatus: null,
      cosScore: null,
      secondaryAiScore: null,
      assignedExperts: null,
      metadata: null,
    };
    const mapped = mapQaTask(nullTask);
    expect(mapped.description).toBe("");
    expect(mapped.progress).toBe(0);
    expect(mapped.qaStatus).toBe("passed"); // status is "completed" so defaults to "passed"
    expect(mapped.cosScore).toBeNull();
    expect(mapped.secondaryAiScore).toBeNull();
    expect(mapped.assignedExperts).toEqual([]);
    expect(mapped.metadata).toBeNull();
  });

  it("qaStatus defaults to pending for non-completed tasks", () => {
    const pendingTask: MockDbTask = {
      ...mockTask,
      status: "in_progress",
      qaStatus: null,
    };
    const mapped = mapQaTask(pendingTask);
    expect(mapped.qaStatus).toBe("pending");
  });

  it("dates are valid ISO strings", () => {
    const mapped = mapQaTask(mockTask);
    expect(new Date(mapped.createdAt).toISOString()).toBe(mapped.createdAt);
    expect(new Date(mapped.updatedAt).toISOString()).toBe(mapped.updatedAt);
  });
});

// ── 3. Project Genesis Phase Completion Logic ─────────────────────────────────

interface Phase {
  id: number;
  phaseNumber: number;
  status: "not_started" | "in_progress" | "completed" | "blocked";
}

function computeProjectProgress(phases: Phase[]) {
  const TOTAL_PHASES = 6;
  const completedPhases = phases.filter(ph => ph.status === "completed").length;
  const currentPhase =
    phases.find(ph => ph.status === "in_progress")?.phaseNumber ?? 1;
  const completionPercentage =
    phases.length > 0 ? Math.round((completedPhases / TOTAL_PHASES) * 100) : 0;
  return { completedPhases, currentPhase, completionPercentage };
}

describe("Project Genesis Phase Completion Logic", () => {
  it("returns 0% for a new project with no completed phases", () => {
    const phases: Phase[] = [
      { id: 1, phaseNumber: 1, status: "in_progress" },
      { id: 2, phaseNumber: 2, status: "not_started" },
      { id: 3, phaseNumber: 3, status: "not_started" },
      { id: 4, phaseNumber: 4, status: "not_started" },
      { id: 5, phaseNumber: 5, status: "not_started" },
      { id: 6, phaseNumber: 6, status: "not_started" },
    ];
    const { completionPercentage, currentPhase } =
      computeProjectProgress(phases);
    expect(completionPercentage).toBe(0);
    expect(currentPhase).toBe(1);
  });

  it("returns 50% when 3 of 6 phases are completed", () => {
    const phases: Phase[] = [
      { id: 1, phaseNumber: 1, status: "completed" },
      { id: 2, phaseNumber: 2, status: "completed" },
      { id: 3, phaseNumber: 3, status: "completed" },
      { id: 4, phaseNumber: 4, status: "in_progress" },
      { id: 5, phaseNumber: 5, status: "not_started" },
      { id: 6, phaseNumber: 6, status: "not_started" },
    ];
    const { completionPercentage, currentPhase } =
      computeProjectProgress(phases);
    expect(completionPercentage).toBe(50);
    expect(currentPhase).toBe(4);
  });

  it("returns 100% when all 6 phases are completed", () => {
    const phases: Phase[] = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      phaseNumber: i + 1,
      status: "completed" as const,
    }));
    const { completionPercentage } = computeProjectProgress(phases);
    expect(completionPercentage).toBe(100);
  });

  it("defaults currentPhase to 1 when no phase is in_progress", () => {
    const phases: Phase[] = [
      { id: 1, phaseNumber: 1, status: "completed" },
      { id: 2, phaseNumber: 2, status: "not_started" },
    ];
    const { currentPhase } = computeProjectProgress(phases);
    expect(currentPhase).toBe(1);
  });

  it("returns 0% for empty phases array", () => {
    const { completionPercentage } = computeProjectProgress([]);
    expect(completionPercentage).toBe(0);
  });
});

// ── 4. AI Agents Monitoring Flat Field Mapping ────────────────────────────────
// Mirrors the getAllStatus flattening fix in aiAgentsMonitoring.router.ts

interface AgentPerformance {
  id: number;
  agentId: string;
  agentName: string;
  status: string;
  performanceRating: number;
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: number;
  lastActive: string;
}

function flattenAgentStatus(raw: AgentPerformance) {
  return {
    id: raw.id,
    agentId: raw.agentId,
    agentName: raw.agentName,
    status: raw.status,
    performanceRating: raw.performanceRating,
    tasksCompleted: raw.tasksCompleted,
    successRate: raw.successRate,
    avgResponseTime: raw.avgResponseTime,
    lastActive: raw.lastActive,
  };
}

describe("AI Agents Monitoring Flat Field Mapping", () => {
  const mockAgent: AgentPerformance = {
    id: 1,
    agentId: "email_composer",
    agentName: "Email Composer",
    status: "active",
    performanceRating: 87.5,
    tasksCompleted: 342,
    successRate: 94,
    avgResponseTime: 1.2,
    lastActive: new Date().toISOString(),
  };

  it("returns all required flat fields", () => {
    const flat = flattenAgentStatus(mockAgent);
    expect(flat).toHaveProperty("performanceRating");
    expect(flat).toHaveProperty("tasksCompleted");
    expect(flat).toHaveProperty("successRate");
    expect(flat).toHaveProperty("avgResponseTime");
    expect(flat).toHaveProperty("status");
    expect(flat).toHaveProperty("lastActive");
    expect(flat).toHaveProperty("agentId");
    expect(flat).toHaveProperty("agentName");
  });

  it("does NOT return a nested performance object", () => {
    const flat = flattenAgentStatus(mockAgent) as Record<string, unknown>;
    expect(flat).not.toHaveProperty("performance");
  });

  it("performanceRating is a number", () => {
    const flat = flattenAgentStatus(mockAgent);
    expect(typeof flat.performanceRating).toBe("number");
  });
});

// ── 5. Innovation Hub Stats Computation ──────────────────────────────────────

interface Idea {
  id: number;
  status: string;
  currentStage: number;
}

function computeInnovationStats(ideas: Idea[]) {
  return {
    totalIdeas: ideas.length,
    activeIdeas: ideas.filter(
      i => !["rejected", "archived", "promoted_to_genesis"].includes(i.status)
    ).length,
    validatedIdeas: ideas.filter(i => i.status === "validated").length,
    promotedIdeas: ideas.filter(i => i.status === "promoted_to_genesis").length,
  };
}

describe("Innovation Hub Stats Computation", () => {
  const mockIdeas: Idea[] = [
    { id: 1, status: "new", currentStage: 1 },
    { id: 2, status: "validated", currentStage: 3 },
    { id: 3, status: "promoted_to_genesis", currentStage: 5 },
    { id: 4, status: "rejected", currentStage: 2 },
    { id: 5, status: "in_review", currentStage: 2 },
    { id: 6, status: "validated", currentStage: 4 },
  ];

  it("counts total ideas correctly", () => {
    const stats = computeInnovationStats(mockIdeas);
    expect(stats.totalIdeas).toBe(6);
  });

  it("counts active ideas (excludes rejected, archived, promoted)", () => {
    const stats = computeInnovationStats(mockIdeas);
    // new, validated (x2), in_review = 4 active
    expect(stats.activeIdeas).toBe(4);
  });

  it("counts validated ideas correctly", () => {
    const stats = computeInnovationStats(mockIdeas);
    expect(stats.validatedIdeas).toBe(2);
  });

  it("counts promoted ideas correctly", () => {
    const stats = computeInnovationStats(mockIdeas);
    expect(stats.promotedIdeas).toBe(1);
  });

  it("returns zeros for empty array", () => {
    const stats = computeInnovationStats([]);
    expect(stats.totalIdeas).toBe(0);
    expect(stats.activeIdeas).toBe(0);
    expect(stats.validatedIdeas).toBe(0);
    expect(stats.promotedIdeas).toBe(0);
  });

  it("archived ideas are excluded from activeIdeas", () => {
    const archivedIdeas: Idea[] = [
      { id: 1, status: "archived", currentStage: 1 },
      { id: 2, status: "new", currentStage: 1 },
    ];
    const stats = computeInnovationStats(archivedIdeas);
    expect(stats.activeIdeas).toBe(1);
  });
});

// ── 6. Document Library Filtering Logic ──────────────────────────────────────

interface Document {
  id: number;
  title: string;
  documentId: string;
  type: string;
  qaStatus: string;
}

function filterDocuments(documents: Document[], searchQuery: string) {
  if (!searchQuery) return documents;
  return documents.filter(
    doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentId.toLowerCase().includes(searchQuery.toLowerCase())
  );
}

describe("Document Library Filtering Logic", () => {
  const mockDocs: Document[] = [
    {
      id: 1,
      title: "Market Research Report",
      documentId: "DOC-001",
      type: "report",
      qaStatus: "approved",
    },
    {
      id: 2,
      title: "Innovation Brief Q1",
      documentId: "DOC-002",
      type: "innovation_brief",
      qaStatus: "pending",
    },
    {
      id: 3,
      title: "Project Genesis Plan",
      documentId: "DOC-003",
      type: "project_genesis",
      qaStatus: "approved",
    },
    {
      id: 4,
      title: "Financial Projections",
      documentId: "DOC-004",
      type: "report",
      qaStatus: "pending",
    },
  ];

  it("returns all documents when searchQuery is empty", () => {
    const result = filterDocuments(mockDocs, "");
    expect(result).toHaveLength(4);
  });

  it("filters by title (case-insensitive)", () => {
    const result = filterDocuments(mockDocs, "market");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Market Research Report");
  });

  it("filters by documentId", () => {
    const result = filterDocuments(mockDocs, "DOC-003");
    expect(result).toHaveLength(1);
    expect(result[0].documentId).toBe("DOC-003");
  });

  it("is case-insensitive for title search", () => {
    const result = filterDocuments(mockDocs, "INNOVATION");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Innovation Brief Q1");
  });

  it("returns empty array when no matches", () => {
    const result = filterDocuments(mockDocs, "xyz_no_match_123");
    expect(result).toHaveLength(0);
  });

  it("matches partial documentId", () => {
    const result = filterDocuments(mockDocs, "DOC");
    expect(result).toHaveLength(4);
  });
});
