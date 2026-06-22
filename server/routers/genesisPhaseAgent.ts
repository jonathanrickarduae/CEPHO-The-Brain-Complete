/**
 * Genesis Phase Agent
 * Drives each of the 7 Genesis phases autonomously.
 * One call = one phase run = structured output for review.
 */
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { genesisAssessments, agentRuns, learningEntries } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── Phase definitions ────────────────────────────────────────────────────────
const GENESIS_PHASES = [
  {
    id: 1,
    name: "concept",
    label: "Concept Validation",
    systemPrompt: `You are the CEPHO Concept Validation Agent. Your role is to stress-test a business idea at its earliest stage.
You have access to first-principles reasoning, market intuition, and pattern recognition from thousands of business models.
Be direct, specific, and honest. Do not hedge. If the idea is weak, say so clearly.`,
    taskPrompt: (idea: string, summary: string) => `Validate this business concept:
IDEA: ${idea}
SUMMARY: ${summary}

Produce a structured Phase 1 Concept Validation Report:
1. **Core Problem** — Is this a real, painful problem? Evidence?
2. **Solution Fit** — Does the proposed solution actually solve it?
3. **Market Existence** — Is there a market willing to pay?
4. **Unfair Advantage** — What gives this an edge?
5. **Fatal Flaws** — What could kill this before it starts?
6. **Concept Score** — /100
7. **Proceed Recommendation** — Yes / Conditional / No with rationale
8. **Next Phase Questions** — 5 specific questions to answer in market research`,
  },
  {
    id: 2,
    name: "market",
    label: "Market Research",
    systemPrompt: `You are the CEPHO Market Research Agent. You synthesise market intelligence to size opportunities and identify competitive dynamics.`,
    taskPrompt: (idea: string, summary: string) => `Conduct market research for:
IDEA: ${idea}
SUMMARY: ${summary}

Produce a Phase 2 Market Research Report:
1. **TAM / SAM / SOM** — Estimated market sizes with reasoning
2. **Target Customer Segments** — 3 specific segments with pain profiles
3. **Competitive Landscape** — Direct and indirect competitors, their weaknesses
4. **Market Timing** — Why now? What tailwinds exist?
5. **Regulatory Environment** — Key regulations or compliance requirements
6. **Market Score** — /100
7. **Key Insights** — 3 insights that change how we think about this opportunity`,
  },
  {
    id: 3,
    name: "model",
    label: "Business Model Design",
    systemPrompt: `You are the CEPHO Business Model Agent. You design revenue architectures that are defensible and scalable.`,
    taskPrompt: (idea: string, summary: string) => `Design the business model for:
IDEA: ${idea}
SUMMARY: ${summary}

Produce a Phase 3 Business Model Report:
1. **Revenue Streams** — Primary and secondary, with pricing logic
2. **Unit Economics** — CAC, LTV, payback period estimates
3. **Cost Structure** — Fixed vs variable, key cost drivers
4. **Scalability** — What happens at 10x? 100x?
5. **Moat Building** — How does the model get harder to compete with over time?
6. **Model Score** — /100
7. **Financial Milestones** — Key numbers to hit at 6m, 12m, 24m`,
  },
  {
    id: 4,
    name: "team",
    label: "Team & SME Assembly",
    systemPrompt: `You are the CEPHO Team Architecture Agent. You identify the human and AI capabilities required to execute this venture.`,
    taskPrompt: (idea: string, summary: string) => `Design the team architecture for:
IDEA: ${idea}
SUMMARY: ${summary}

Produce a Phase 4 Team & Capability Report:
1. **Founding Team Profile** — Skills and experience required in the founding team
2. **Critical Hires (Year 1)** — Roles that must be filled to execute
3. **AI SME Team** — Which expert AI agents should be assigned (e.g. Patent Lawyer, CFO, CMO, Domain Expert)
4. **Advisory Board** — 3 specific types of advisors needed and why
5. **Capability Gaps** — What is currently missing and how to bridge it
6. **Team Score** — /100
7. **Recommended SME Activations** — Which CEPHO AI experts to activate immediately`,
  },
  {
    id: 5,
    name: "risk",
    label: "Risk & Validation",
    systemPrompt: `You are the CEPHO Risk Assessment Agent. You identify, quantify, and mitigate the risks that kill ventures.`,
    taskPrompt: (idea: string, summary: string) => `Assess risks for:
IDEA: ${idea}
SUMMARY: ${summary}

Produce a Phase 5 Risk Assessment Report:
1. **Risk Matrix** — Top 10 risks rated by Probability × Impact
2. **Existential Risks** — The 3 risks that could kill the business entirely
3. **Mitigation Strategies** — Specific actions to reduce each existential risk
4. **Validation Experiments** — 5 cheap, fast experiments to de-risk the top assumptions
5. **Pivot Options** — If the core thesis fails, what pivots are available?
6. **Risk Score** — /100 (higher = lower risk)
7. **Go/No-Go Threshold** — What must be true before committing serious capital?`,
  },
  {
    id: 6,
    name: "execution",
    label: "Execution Roadmap",
    systemPrompt: `You are the CEPHO Execution Planning Agent. You translate strategy into a concrete 90-day sprint plan.`,
    taskPrompt: (idea: string, summary: string) => `Build the execution roadmap for:
IDEA: ${idea}
SUMMARY: ${summary}

Produce a Phase 6 Execution Roadmap:
1. **90-Day Sprint Plan** — Week-by-week milestones for the first 90 days
2. **MVP Definition** — The minimum viable product that proves the core thesis
3. **First Customer Strategy** — How to get the first 10 paying customers
4. **Resource Requirements** — Capital, time, and people needed for Phase 1
5. **Decision Gates** — What metrics trigger a go/no-go at 30, 60, 90 days
6. **Execution Score** — /100
7. **Launch Checklist** — 10 items that must be done before launch`,
  },
  {
    id: 7,
    name: "complete",
    label: "Final Synthesis & Investment Brief",
    systemPrompt: `You are the CEPHO Investment Brief Agent. You synthesise all phase outputs into a compelling investor-ready brief.`,
    taskPrompt: (idea: string, summary: string) => `Create the final investment brief for:
IDEA: ${idea}
SUMMARY: ${summary}

Produce a Phase 7 Investment Brief:
1. **Executive Summary** — 3 sentences: problem, solution, opportunity
2. **The Opportunity** — Why this, why now, why us
3. **Business Model** — How we make money
4. **Traction Plan** — How we prove it works
5. **Ask** — What we need (capital, partners, resources) and what it buys
6. **Return Potential** — Conservative, base, and optimistic scenarios
7. **Overall Genesis Score** — /100 composite
8. **Final Recommendation** — Proceed to Project / Archive / Pivot with full rationale`,
  },
];

// ─── Router ───────────────────────────────────────────────────────────────────
export const genesisPhaseAgentRouter = router({
  // Run a specific phase for a genesis assessment
  runPhase: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      phaseNumber: z.number().min(1).max(7),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, output: null };

      const [assessment] = await db.select().from(genesisAssessments)
        .where(eq(genesisAssessments.id, input.assessmentId));
      if (!assessment) return { success: false, output: null };

      const phase = GENESIS_PHASES[input.phaseNumber - 1];
      if (!phase) return { success: false, output: null };

      // Build context from previous phases
      let previousContext = "";
      try {
        const existing = JSON.parse(assessment.aiAnalysis ?? "{}");
        const prevPhases = Object.entries(existing)
          .filter(([k]) => k.startsWith("phase"))
          .map(([k, v]) => `--- ${k.toUpperCase()} ---\n${v}`)
          .join("\n\n");
        if (prevPhases) previousContext = `\n\nPREVIOUS PHASE OUTPUTS:\n${prevPhases}`;
      } catch { /* ignore */ }

      const response = await invokeLLM({
        messages: [
          { role: "system", content: phase.systemPrompt },
          { role: "user", content: phase.taskPrompt(assessment.ideaTitle, assessment.ideaSummary) + previousContext },
        ],
        max_tokens: 2000,
      });

      const output = typeof response.choices[0]?.message?.content === "string"
        ? response.choices[0].message.content
        : "Phase agent returned no output.";

      // Store phase output in aiAnalysis JSON
      let analysisData: Record<string, unknown> = {};
      try { analysisData = JSON.parse(assessment.aiAnalysis ?? "{}"); } catch { /* ignore */ }
      analysisData[`phase${input.phaseNumber}`] = output;
      analysisData[`phase${input.phaseNumber}_runAt`] = new Date().toISOString();

      // Update stage to current phase name
      await db.update(genesisAssessments).set({
        aiAnalysis: JSON.stringify(analysisData),
        stage: phase.name as "concept" | "market" | "model" | "team" | "risk" | "execution" | "complete",
      }).where(eq(genesisAssessments.id, input.assessmentId));

      // Log to agent runs for reflection loop
      await db.insert(agentRuns).values({
        agentId: 0,
        prompt: phase.taskPrompt(assessment.ideaTitle, assessment.ideaSummary).slice(0, 500),
        result: output.slice(0, 1000),
        status: "completed",
      }).catch(() => {});

      // Capture to Vault
      await db.insert(learningEntries).values({
        source: "genesis",
        category: "genesis",
        insight: `Phase ${input.phaseNumber} (${phase.label}) completed for: ${assessment.ideaTitle}`,
        context: JSON.stringify({ assessmentId: input.assessmentId, phase: phase.name }),
        confidence: 85,
      }).catch(() => {});

      return { success: true, output, phase: phase.label };
    }),

  // Run ALL phases sequentially (one-click full Genesis run)
  runAllPhases: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, phases: [] };

      const [assessment] = await db.select().from(genesisAssessments)
        .where(eq(genesisAssessments.id, input.assessmentId));
      if (!assessment) return { success: false, phases: [] };

      const results: Array<{ phase: string; output: string }> = [];
      let analysisData: Record<string, unknown> = {};
      try { analysisData = JSON.parse(assessment.aiAnalysis ?? "{}"); } catch { /* ignore */ }

      for (const phase of GENESIS_PHASES) {
        const prevPhases = Object.entries(analysisData)
          .filter(([k]) => k.startsWith("phase") && !k.endsWith("_runAt"))
          .map(([k, v]) => `--- ${k.toUpperCase()} ---\n${v}`)
          .join("\n\n");
        const previousContext = prevPhases ? `\n\nPREVIOUS PHASE OUTPUTS:\n${prevPhases}` : "";

        const response = await invokeLLM({
          messages: [
            { role: "system", content: phase.systemPrompt },
            { role: "user", content: phase.taskPrompt(assessment.ideaTitle, assessment.ideaSummary) + previousContext },
          ],
          max_tokens: 2000,
        });

        const output = typeof response.choices[0]?.message?.content === "string"
          ? response.choices[0].message.content
          : "No output.";

        analysisData[`phase${phase.id}`] = output;
        analysisData[`phase${phase.id}_runAt`] = new Date().toISOString();
        results.push({ phase: phase.label, output });
      }

      await db.update(genesisAssessments).set({
        aiAnalysis: JSON.stringify(analysisData),
        stage: "complete",
      }).where(eq(genesisAssessments.id, input.assessmentId));

      await db.insert(learningEntries).values({
        source: "genesis",
        category: "genesis",
        insight: `Full Genesis run completed for: ${assessment.ideaTitle}`,
        context: JSON.stringify({ assessmentId: input.assessmentId, phasesRun: 7 }),
        confidence: 90,
      }).catch(() => {});

      return { success: true, phases: results };
    }),

  // Get phase outputs for display
  getPhaseOutputs: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [assessment] = await db.select().from(genesisAssessments)
        .where(eq(genesisAssessments.id, input.assessmentId));
      if (!assessment) return null;
      let analysisData: Record<string, unknown> = {};
      try { analysisData = JSON.parse(assessment.aiAnalysis ?? "{}"); } catch { /* ignore */ }
      return {
        assessment,
        phases: GENESIS_PHASES.map(p => ({
          id: p.id,
          name: p.name,
          label: p.label,
          output: analysisData[`phase${p.id}`] as string ?? null,
          runAt: analysisData[`phase${p.id}_runAt`] as string ?? null,
        })),
      };
    }),

  listPhases: protectedProcedure.query(async () => {
    return GENESIS_PHASES.map(p => ({ id: p.id, name: p.name, label: p.label }));
  }),
});
