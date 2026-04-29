/**
 * Unit Tests: SME Intelligence Layer
 *
 * Tests for:
 * 1. SME idea submission input validation
 * 2. Agent1 verdict classification logic
 * 3. Intelligence scan idea extraction shape
 * 4. Full panel scan batching logic
 * 5. Stats aggregation computation
 */
import { describe, it, expect } from "vitest";

// ── 1. SME Idea Submission Input Validation ───────────────────────────────────
// Mirrors the SubmitIdeaInput schema in smeIntelligence.router.ts

interface SubmitIdeaInput {
  expertId: string;
  expertName: string;
  expertCategory: string;
  title: string;
  description: string;
  sourceUrl?: string;
  sourceTitle?: string;
  cephoArea?: string;
  toolName?: string;
  toolUrl?: string;
  confidenceScore?: number;
  metadata?: Record<string, unknown>;
}

function validateSubmitIdeaInput(input: SubmitIdeaInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!input.expertId || input.expertId.length > 100)
    errors.push("expertId: required, max 100 chars");
  if (!input.expertName || input.expertName.length > 200)
    errors.push("expertName: required, max 200 chars");
  if (!input.expertCategory || input.expertCategory.length > 100)
    errors.push("expertCategory: required, max 100 chars");
  if (!input.title || input.title.length > 300)
    errors.push("title: required, max 300 chars");
  if (!input.description || input.description.length > 5000)
    errors.push("description: required, max 5000 chars");
  if (
    input.confidenceScore !== undefined &&
    (input.confidenceScore < 0 || input.confidenceScore > 100)
  )
    errors.push("confidenceScore: must be 0-100");
  return { valid: errors.length === 0, errors };
}

describe("SME Idea Submission Input Validation", () => {
  it("accepts a valid submission", () => {
    const result = validateSubmitIdeaInput({
      expertId: "ai_automation_expert",
      expertName: "Dr. Sarah Chen",
      expertCategory: "AI & Automation",
      title: "Integrate Notion AI for meeting notes",
      description:
        "CEPHO could integrate Notion AI to automatically summarise meeting notes and push them into the Chief of Staff task queue.",
      cephoArea: "Chief of Staff",
      confidenceScore: 85,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects a submission missing required fields", () => {
    const result = validateSubmitIdeaInput({
      expertId: "",
      expertName: "",
      expertCategory: "",
      title: "",
      description: "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects a confidenceScore out of range", () => {
    const result = validateSubmitIdeaInput({
      expertId: "expert_1",
      expertName: "Expert One",
      expertCategory: "Technology",
      title: "Some idea",
      description: "Some description",
      confidenceScore: 150,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("confidenceScore"))).toBe(true);
  });

  it("accepts an optional toolUrl without error", () => {
    const result = validateSubmitIdeaInput({
      expertId: "expert_2",
      expertName: "Expert Two",
      expertCategory: "Finance",
      title: "Use Xero for invoicing",
      description: "Integrate Xero to automate invoice generation.",
      toolName: "Xero",
      toolUrl: "https://www.xero.com",
    });
    expect(result.valid).toBe(true);
  });
});

// ── 2. Agent1 Verdict Classification Logic ────────────────────────────────────
// Mirrors the verdict derivation in smeIntelligence.router.ts assess endpoint

type Verdict =
  | "integrate_now"
  | "explore_further"
  | "archive"
  | "needs_more_info";

function deriveVerdict(
  strategicScore: number,
  feasibilityScore: number,
  urgencyScore: number
): Verdict {
  const avg = (strategicScore + feasibilityScore + urgencyScore) / 3;
  if (avg >= 75 && urgencyScore >= 70) return "integrate_now";
  if (avg >= 55) return "explore_further";
  if (avg < 30) return "archive";
  return "needs_more_info";
}

describe("Agent1 Verdict Classification", () => {
  it("returns integrate_now for high-scoring ideas", () => {
    expect(deriveVerdict(90, 85, 80)).toBe("integrate_now");
  });

  it("returns explore_further for mid-range ideas", () => {
    expect(deriveVerdict(65, 60, 55)).toBe("explore_further");
  });

  it("returns archive for low-scoring ideas", () => {
    expect(deriveVerdict(20, 25, 15)).toBe("archive");
  });

  it("returns needs_more_info for borderline ideas", () => {
    expect(deriveVerdict(45, 50, 40)).toBe("needs_more_info");
  });

  it("requires urgency >= 70 for integrate_now even with high avg", () => {
    // avg = 80 but urgency is only 60
    expect(deriveVerdict(90, 90, 60)).toBe("explore_further");
  });
});

// ── 3. Intelligence Scan Idea Extraction Shape ────────────────────────────────
// Validates that LLM-extracted ideas conform to the expected shape

interface ExtractedIdea {
  title: string;
  description: string;
  cephoArea?: string;
  toolName?: string;
  toolUrl?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  confidenceScore?: number;
}

function validateExtractedIdea(idea: unknown): idea is ExtractedIdea {
  if (typeof idea !== "object" || idea === null) return false;
  const obj = idea as Record<string, unknown>;
  if (typeof obj.title !== "string" || obj.title.trim().length === 0)
    return false;
  if (typeof obj.description !== "string" || obj.description.trim().length === 0)
    return false;
  if (
    obj.confidenceScore !== undefined &&
    (typeof obj.confidenceScore !== "number" ||
      obj.confidenceScore < 0 ||
      obj.confidenceScore > 100)
  )
    return false;
  return true;
}

describe("Intelligence Scan Idea Extraction Shape", () => {
  it("accepts a well-formed extracted idea", () => {
    const idea = {
      title: "Add AI-powered email triage",
      description:
        "Use an LLM to automatically categorise and prioritise incoming emails in the Chief of Staff module.",
      cephoArea: "Chief of Staff",
      toolName: "OpenAI GPT-4",
      confidenceScore: 78,
    };
    expect(validateExtractedIdea(idea)).toBe(true);
  });

  it("rejects an idea with missing title", () => {
    expect(validateExtractedIdea({ description: "Some description" })).toBe(
      false
    );
  });

  it("rejects an idea with missing description", () => {
    expect(validateExtractedIdea({ title: "Some title" })).toBe(false);
  });

  it("rejects a non-object input", () => {
    expect(validateExtractedIdea("not an object")).toBe(false);
    expect(validateExtractedIdea(null)).toBe(false);
    expect(validateExtractedIdea(42)).toBe(false);
  });

  it("rejects an idea with out-of-range confidenceScore", () => {
    expect(
      validateExtractedIdea({
        title: "Idea",
        description: "Desc",
        confidenceScore: 200,
      })
    ).toBe(false);
  });
});

// ── 4. Full Panel Scan Batching Logic ─────────────────────────────────────────
// Validates that the scan correctly limits the number of experts processed

function selectExpertsForScan(
  experts: Array<{ id: string; status: string }>,
  limit: number
): Array<{ id: string; status: string }> {
  return experts.filter(e => e.status === "active").slice(0, limit);
}

describe("Full Panel Scan Batching Logic", () => {
  const mockExperts = [
    { id: "exp_1", status: "active" },
    { id: "exp_2", status: "active" },
    { id: "exp_3", status: "training" },
    { id: "exp_4", status: "active" },
    { id: "exp_5", status: "inactive" },
    { id: "exp_6", status: "active" },
  ];

  it("returns only active experts", () => {
    const selected = selectExpertsForScan(mockExperts, 100);
    expect(selected.every(e => e.status === "active")).toBe(true);
  });

  it("respects the limit parameter", () => {
    const selected = selectExpertsForScan(mockExperts, 2);
    expect(selected).toHaveLength(2);
  });

  it("returns all active experts when limit exceeds count", () => {
    const selected = selectExpertsForScan(mockExperts, 50);
    expect(selected).toHaveLength(4); // 4 active experts in mock
  });

  it("returns empty array when no active experts exist", () => {
    const inactive = mockExperts.map(e => ({ ...e, status: "inactive" }));
    const selected = selectExpertsForScan(inactive, 10);
    expect(selected).toHaveLength(0);
  });
});

// ── 5. Stats Aggregation Computation ─────────────────────────────────────────
// Validates the stats aggregation logic used in getStats endpoint

interface SubmissionRecord {
  status: string;
  agent1Verdict: string | null;
}

function computeStats(submissions: SubmissionRecord[]) {
  const total = submissions.length;
  const pending = submissions.filter(s => s.status === "pending").length;
  const assessed = submissions.filter(s => s.status === "assessed").length;
  const approved = submissions.filter(s => s.status === "approved").length;
  const verdicts = {
    integrate_now: submissions.filter(
      s => s.agent1Verdict === "integrate_now"
    ).length,
    explore_further: submissions.filter(
      s => s.agent1Verdict === "explore_further"
    ).length,
    archive: submissions.filter(s => s.agent1Verdict === "archive").length,
    needs_more_info: submissions.filter(
      s => s.agent1Verdict === "needs_more_info"
    ).length,
  };
  return { total, pending, assessed, approved, verdicts };
}

describe("SME Stats Aggregation Computation", () => {
  const mockSubmissions: SubmissionRecord[] = [
    { status: "pending", agent1Verdict: null },
    { status: "pending", agent1Verdict: null },
    { status: "assessed", agent1Verdict: "integrate_now" },
    { status: "assessed", agent1Verdict: "explore_further" },
    { status: "assessed", agent1Verdict: "archive" },
    { status: "approved", agent1Verdict: "integrate_now" },
  ];

  it("computes total correctly", () => {
    const stats = computeStats(mockSubmissions);
    expect(stats.total).toBe(6);
  });

  it("counts pending submissions correctly", () => {
    const stats = computeStats(mockSubmissions);
    expect(stats.pending).toBe(2);
  });

  it("counts assessed submissions correctly", () => {
    const stats = computeStats(mockSubmissions);
    expect(stats.assessed).toBe(3);
  });

  it("counts integrate_now verdicts correctly", () => {
    const stats = computeStats(mockSubmissions);
    expect(stats.verdicts.integrate_now).toBe(2);
  });

  it("returns zero counts for empty input", () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.verdicts.integrate_now).toBe(0);
  });
});
