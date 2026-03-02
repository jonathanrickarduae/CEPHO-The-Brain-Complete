/**
 * REST routes for /api/workflows
 * Used by WorkflowsPage and WorkflowDetailPage (fetch-based, not tRPC)
 */
import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import OpenAI from "openai";

const router = Router();

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// GET /api/workflows — list all workflows
router.get("/", async (_req, res) => {
  try {
    const workflows = await db.execute(sql`
      SELECT w.*, 
        COUNT(s.id) as total_steps,
        COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_steps
      FROM cepho_workflows w
      LEFT JOIN cepho_workflow_steps s ON s."workflowId" = w.id
      GROUP BY w.id
      ORDER BY w."updatedAt" DESC
    `);
    res.json({ success: true, workflows: Array.from(workflows) });
  } catch (err) {
    console.error("GET /api/workflows error:", err);
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});

// GET /api/workflows/:id — get a single workflow
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute(sql`
      SELECT * FROM cepho_workflows WHERE id = ${parseInt(id, 10)}
    `);
    const rows = Array.from(result);
    if (rows.length === 0) return res.status(404).json({ error: "Workflow not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/workflows/:id error:", err);
    res.status(500).json({ error: "Failed to fetch workflow" });
  }
});

// GET /api/workflows/:id/steps — get steps for a workflow
router.get("/:id/steps", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute(sql`
      SELECT * FROM cepho_workflow_steps 
      WHERE "workflowId" = ${parseInt(id, 10)}
      ORDER BY "phase" ASC, "step" ASC
    `);
    res.json({ steps: Array.from(result) });
  } catch (err) {
    console.error("GET /api/workflows/:id/steps error:", err);
    res.status(500).json({ error: "Failed to fetch steps" });
  }
});

// GET /api/workflows/:id/steps/:stepId/guidance — AI guidance for a step
router.get("/:id/steps/:stepId/guidance", async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const wfResult = await db.execute(sql`SELECT * FROM cepho_workflows WHERE id = ${parseInt(id, 10)}`);
    const stepResult = await db.execute(sql`SELECT * FROM cepho_workflow_steps WHERE id = ${parseInt(stepId, 10)}`);
    
    const wfRows = Array.from(wfResult);
    const stepRows = Array.from(stepResult);
    if (wfRows.length === 0 || stepRows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    
    const workflow = wfRows[0] as Record<string, unknown>;
    const step = stepRows[0] as Record<string, unknown>;
    
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are CEPHO's AI Chief of Staff. Provide concise, actionable guidance for completing a workflow step. Be specific and practical.`
        },
        {
          role: "user",
          content: `Workflow: "${workflow.name}" (${workflow.skillType})\nCurrent step: "${step.stepName}"\nStep status: ${step.status}\n\nProvide 3-4 bullet points of specific guidance for completing this step successfully.`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    
    res.json({ guidance: completion.choices[0].message.content });
  } catch (err) {
    console.error("GET /api/workflows/:id/steps/:stepId/guidance error:", err);
    res.status(500).json({ error: "Failed to generate guidance" });
  }
});

// POST /api/workflows/:id/start — start a workflow
router.post("/:id/start", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(sql`
      UPDATE cepho_workflows SET status = 'in_progress', "updatedAt" = now()
      WHERE id = ${parseInt(id, 10)}
    `);
    // Mark first pending step as in_progress
    await db.execute(sql`
      UPDATE cepho_workflow_steps SET status = 'in_progress'
      WHERE "workflowId" = ${parseInt(id, 10)} AND status = 'pending'
      AND "step" = (SELECT MIN("step") FROM cepho_workflow_steps WHERE "workflowId" = ${parseInt(id, 10)} AND status = 'pending')
    `);
    res.json({ success: true, message: "Workflow started" });
  } catch (err) {
    console.error("POST /api/workflows/:id/start error:", err);
    res.status(500).json({ error: "Failed to start workflow" });
  }
});

// POST /api/workflows/:id/pause — pause a workflow
router.post("/:id/pause", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(sql`
      UPDATE cepho_workflows SET status = 'paused', "updatedAt" = now()
      WHERE id = ${parseInt(id, 10)}
    `);
    res.json({ success: true, message: "Workflow paused" });
  } catch (err) {
    console.error("POST /api/workflows/:id/pause error:", err);
    res.status(500).json({ error: "Failed to pause workflow" });
  }
});

// POST /api/workflows/:id/resume — resume a workflow
router.post("/:id/resume", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(sql`
      UPDATE cepho_workflows SET status = 'in_progress', "updatedAt" = now()
      WHERE id = ${parseInt(id, 10)}
    `);
    res.json({ success: true, message: "Workflow resumed" });
  } catch (err) {
    console.error("POST /api/workflows/:id/resume error:", err);
    res.status(500).json({ error: "Failed to resume workflow" });
  }
});

export default router;
