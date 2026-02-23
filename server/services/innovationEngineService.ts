/**
 * Innovation Engine Service
 * Core service for the Innovation Hub flywheel
 */

import { getRawClient } from '../db';
import type { Database } from '../db';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Idea {
  id: number;
  userId: string;
  title: string;
  description?: string;
  source: string;
  sourceUrl?: string;
  category?: string;
  tags?: string[];
  status: string;
  currentStage: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Assessment {
  id: number;
  ideaId: number;
  assessmentType: string;
  results: any;
  score?: number;
  createdAt: Date;
}

export async function captureIdea(
  userId: string,
  input: {
    title: string;
    description?: string;
    source?: string;
    sourceUrl?: string;
    category?: string;
    tags?: string[];
  }
): Promise<Idea> {
  const db = await getRawClient() as any;
  
  const idea = {
    userId,
    title: input.title,
    description: input.description || '',
    source: input.source || 'manual',
    sourceUrl: input.sourceUrl,
    category: input.category,
    tags: input.tags ? JSON.stringify(input.tags) : null,
    status: 'captured',
    currentStage: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.query(
    `INSERT INTO innovation_ideas (user_id, title, description, source, source_url, category, tags, status, current_stage, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [idea.userId, idea.title, idea.description, idea.source, idea.sourceUrl, idea.category, idea.tags, idea.status, idea.currentStage, idea.createdAt, idea.updatedAt]
  );

  return result.rows[0];
}

export async function getIdeas(
  userId: string,
  filters?: {
    status?: string;
    stage?: number;
    limit?: number;
  }
): Promise<Idea[]> {
  const db = await getRawClient() as any;
  
  let query = 'SELECT * FROM innovation_ideas WHERE user_id = $1';
  const params: any[] = [userId];
  let paramIndex = 2;

  if (filters?.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters?.stage) {
    query += ` AND current_stage = $${paramIndex}`;
    params.push(filters.stage);
    paramIndex++;
  }

  query += ' ORDER BY created_at DESC';

  if (filters?.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
  }

  const result = await db.query(query, params);
  return result.rows;
}

export async function getIdeaWithAssessments(ideaId: number): Promise<{ idea: Idea; assessments: Assessment[] }> {
  const db = await getRawClient() as any;
  
  const ideaResult = await db.query('SELECT * FROM innovation_ideas WHERE id = $1', [ideaId]);
  const assessmentsResult = await db.query('SELECT * FROM innovation_assessments WHERE idea_id = $1 ORDER BY created_at DESC', [ideaId]);

  return {
    idea: ideaResult.rows[0],
    assessments: assessmentsResult.rows,
  };
}

export async function runStrategicAssessment(
  ideaId: number,
  assessmentType: string
): Promise<Assessment> {
  const db = await getRawClient() as any;
  
  const ideaResult = await db.query('SELECT * FROM innovation_ideas WHERE id = $1', [ideaId]);
  const idea = ideaResult.rows[0];

  if (!idea) {
    throw new Error('Idea not found');
  }

  // Use AI to run the assessment
  const prompt = `Analyze this business idea for ${assessmentType}:
Title: ${idea.title}
Description: ${idea.description}

Provide a detailed ${assessmentType} assessment with:
1. Key findings
2. Opportunities
3. Risks
4. Recommendations
5. Overall score (0-100)

Return as JSON with fields: findings, opportunities, risks, recommendations, score`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const results = JSON.parse(completion.choices[0].message.content || '{}');

  const assessment = {
    ideaId,
    assessmentType,
    results: JSON.stringify(results),
    score: results.score || null,
    createdAt: new Date(),
  };

  const result = await db.query(
    `INSERT INTO innovation_assessments (idea_id, assessment_type, results, score, created_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [assessment.ideaId, assessment.assessmentType, assessment.results, assessment.score, assessment.createdAt]
  );

  // Update idea status to assessing
  await db.query(
    'UPDATE innovation_ideas SET status = $1, current_stage = $2, updated_at = $3 WHERE id = $4',
    ['assessing', 2, new Date(), ideaId]
  );

  return result.rows[0];
}

export async function advanceToNextStage(
  ideaId: number,
  rationale?: string
): Promise<Idea> {
  const db = await getRawClient() as any;
  
  const ideaResult = await db.query('SELECT * FROM innovation_ideas WHERE id = $1', [ideaId]);
  const idea = ideaResult.rows[0];

  if (!idea) {
    throw new Error('Idea not found');
  }

  const nextStage = Math.min(idea.current_stage + 1, 5);
  const statusMap: Record<number, string> = {
    1: 'captured',
    2: 'assessing',
    3: 'refining',
    4: 'refining',
    5: 'validated',
  };

  const result = await db.query(
    'UPDATE innovation_ideas SET current_stage = $1, status = $2, updated_at = $3 WHERE id = $4 RETURNING *',
    [nextStage, statusMap[nextStage], new Date(), ideaId]
  );

  return result.rows[0];
}

export async function generateInvestmentScenarios(
  ideaId: number,
  budgets?: number[]
): Promise<any> {
  const db = await getRawClient() as any;
  
  const ideaResult = await db.query('SELECT * FROM innovation_ideas WHERE id = $1', [ideaId]);
  const idea = ideaResult.rows[0];

  if (!idea) {
    throw new Error('Idea not found');
  }

  const defaultBudgets = budgets || [50000, 100000, 250000, 500000];

  const prompt = `Generate investment scenarios for this business idea:
Title: ${idea.title}
Description: ${idea.description}

For each budget level (${defaultBudgets.join(', ')} USD), provide:
1. Resource allocation
2. Timeline
3. Expected outcomes
4. ROI projection
5. Risk level

Return as JSON array with fields: budget, allocation, timeline, outcomes, roi, risk`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const scenarios = JSON.parse(completion.choices[0].message.content || '{"scenarios": []}');

  return scenarios;
}

export async function analyzeArticleForOpportunities(
  userId: string,
  url: string,
  context?: string
): Promise<{ opportunities: Idea[] }> {
  const db = await getRawClient() as any;

  // Use AI to analyze the article
  const prompt = `Analyze this article URL for business opportunities: ${url}
${context ? `Additional context: ${context}` : ''}

Extract and identify potential business ideas, innovations, or opportunities mentioned or implied in the article.

For each opportunity, provide:
1. Title (concise, actionable)
2. Description (2-3 sentences)
3. Category (e.g., "Technology", "Healthcare", "Finance", etc.)
4. Tags (relevant keywords)
5. Why it's an opportunity

Return as JSON array with fields: title, description, category, tags (array), rationale`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const analysis = JSON.parse(completion.choices[0].message.content || '{"opportunities": []}');
  const opportunities: Idea[] = [];

  // Create ideas from opportunities
  for (const opp of analysis.opportunities || []) {
    const idea = await captureIdea(userId, {
      title: opp.title,
      description: `${opp.description}\n\nRationale: ${opp.rationale}`,
      source: 'article',
      sourceUrl: url,
      category: opp.category,
      tags: opp.tags,
    });
    opportunities.push(idea);
  }

  return { opportunities };
}

export async function generateDailyIdeas(userId: string): Promise<Idea[]> {
  const db = await getRawClient() as any;

  // Use AI to generate daily business ideas based on current trends
  const prompt = `Generate 3 innovative business ideas for today (${new Date().toLocaleDateString()}).

Consider:
1. Current market trends
2. Emerging technologies
3. Societal needs
4. Sustainability
5. Digital transformation

For each idea, provide:
1. Title (concise, compelling)
2. Description (2-3 sentences explaining the concept)
3. Category
4. Tags (relevant keywords)
5. Market opportunity

Return as JSON array with fields: title, description, category, tags (array), marketOpportunity`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const generated = JSON.parse(completion.choices[0].message.content || '{"ideas": []}');
  const ideas: Idea[] = [];

  // Create ideas from generated content
  for (const gen of generated.ideas || []) {
    const idea = await captureIdea(userId, {
      title: gen.title,
      description: `${gen.description}\n\nMarket Opportunity: ${gen.marketOpportunity}`,
      source: 'ai_generated',
      category: gen.category,
      tags: gen.tags,
    });
    ideas.push(idea);
  }

  return ideas;
}
