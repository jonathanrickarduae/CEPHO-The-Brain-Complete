/**
 * Project Genesis Service
 * Implements the 6-phase venture development workflow
 */

import { db } from '../db';
import { projectGenesis, projectGenesisPhases, projectGenesisMilestones, projectGenesisDeliverables } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { genesisWizardQuestions, type WizardQuestion } from '../../client/src/data/genesisBlueprint';

// Phase definitions
export const GENESIS_PHASES = [
  {
    id: 1,
    name: 'Discovery & Foundation',
    description: 'Understand the business, market, and objectives',
    duration: '1-2 weeks',
    deliverables: ['Business Profile', 'Market Analysis', 'Success Metrics']
  },
  {
    id: 2,
    name: 'Strategic Planning',
    description: 'Develop strategy, positioning, and go-to-market approach',
    duration: '2-3 weeks',
    deliverables: ['Strategic Plan', 'Value Proposition', 'Competitive Analysis']
  },
  {
    id: 3,
    name: 'Blueprint Development',
    description: 'Create detailed execution blueprints',
    duration: '2-3 weeks',
    deliverables: ['Master Blueprint', 'Financial Model', 'Resource Plan']
  },
  {
    id: 4,
    name: 'Validation & Refinement',
    description: 'Test assumptions, gather feedback, refine approach',
    duration: '1-2 weeks',
    deliverables: ['Validation Report', 'Refined Strategy', 'Risk Assessment']
  },
  {
    id: 5,
    name: 'Execution Preparation',
    description: 'Prepare for launch, build team, finalize materials',
    duration: '2-4 weeks',
    deliverables: ['Launch Plan', 'Team Structure', 'Marketing Materials']
  },
  {
    id: 6,
    name: 'Launch & Scale',
    description: 'Execute launch, monitor progress, iterate',
    duration: 'Ongoing',
    deliverables: ['Launch Report', 'Performance Dashboard', 'Optimization Plan']
  }
];

export interface ProjectGenesisAnswers {
  [questionId: string]: string | string[] | number | boolean;
}

export interface PhaseProgress {
  phaseId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  answers: ProjectGenesisAnswers;
  deliverables: string[];
}

/**
 * Initiate a new Project Genesis workflow
 */
export async function initiateProject(userId: string, initialAnswers: ProjectGenesisAnswers) {
  // Create project record
  const [project] = await db.insert(projectGenesis).values({
    userId,
    name: (initialAnswers.company_name as string) || 'New Project',
    industry: (initialAnswers.industry as string) || 'Technology',
    stage: (initialAnswers.stage as string) || 'idea',
    description: (initialAnswers.description as string) || '',
    currentPhase: 1,
    status: 'in_progress',
    answers: initialAnswers,
  }).returning();

  // Create phase records
  for (const phase of GENESIS_PHASES) {
    await db.insert(projectGenesisPhases).values({
      projectId: project.id,
      phaseNumber: phase.id,
      name: phase.name,
      description: phase.description,
      status: phase.id === 1 ? 'in_progress' : 'not_started',
      startedAt: phase.id === 1 ? new Date() : undefined,
    });
  }

  return project;
}

/**
 * Get project by ID
 */
export async function getProject(projectId: string) {
  const [project] = await db.select()
    .from(projectGenesis)
    .where(eq(projectGenesis.id, projectId));
  
  return project;
}

/**
 * Get all projects for a user
 */
export async function listProjects(userId: string) {
  const projects = await db.select()
    .from(projectGenesis)
    .where(eq(projectGenesis.userId, userId))
    .orderBy(projectGenesis.createdAt);
  
  return projects;
}

/**
 * Get current active phase for a project
 */
export async function getCurrentPhase(projectId: string) {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found');

  const [phase] = await db.select()
    .from(projectGenesisPhases)
    .where(
      and(
        eq(projectGenesisPhases.projectId, projectId),
        eq(projectGenesisPhases.phaseNumber, project.currentPhase)
      )
    );

  return phase;
}

/**
 * Get all phases for a project
 */
export async function getProjectPhases(projectId: string) {
  const phases = await db.select()
    .from(projectGenesisPhases)
    .where(eq(projectGenesisPhases.projectId, projectId))
    .orderBy(projectGenesisPhases.phaseNumber);

  return phases;
}

/**
 * Get questions for a specific phase
 */
export function getPhaseQuestions(phaseNumber: number): WizardQuestion[] {
  // Map phase numbers to question sections
  const sectionMap: Record<number, string[]> = {
    1: ['entry', 'business', 'objectives'],
    2: ['market', 'competition', 'value_proposition'],
    3: ['revenue_model', 'financial_projections', 'resources'],
    4: ['risks', 'validation', 'feedback'],
    5: ['team', 'timeline', 'launch_plan'],
    6: ['execution', 'metrics', 'optimization']
  };

  const sections = sectionMap[phaseNumber] || [];
  return genesisWizardQuestions.filter(q => sections.includes(q.section));
}

/**
 * Submit answers for a phase
 */
export async function submitPhaseAnswers(
  projectId: string,
  phaseNumber: number,
  answers: ProjectGenesisAnswers
) {
  // Get existing project
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found');

  // Merge answers with existing ones
  const updatedAnswers = {
    ...(project.answers as ProjectGenesisAnswers),
    ...answers
  };

  // Update project with new answers
  await db.update(projectGenesis)
    .set({ answers: updatedAnswers })
    .where(eq(projectGenesis.id, projectId));

  // Update phase status
  await db.update(projectGenesisPhases)
    .set({
      status: 'in_progress',
      answers: answers,
    })
    .where(
      and(
        eq(projectGenesisPhases.projectId, projectId),
        eq(projectGenesisPhases.phaseNumber, phaseNumber)
      )
    );

  return updatedAnswers;
}

/**
 * Generate deliverables for a phase
 */
export async function generatePhaseDeliverables(projectId: string, phaseNumber: number) {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found');

  const phase = GENESIS_PHASES.find(p => p.id === phaseNumber);
  if (!phase) throw new Error('Phase not found');

  const deliverables = [];

  // Generate each deliverable based on phase
  for (const deliverableName of phase.deliverables) {
    const content = await generateDeliverableContent(
      deliverableName,
      project.answers as ProjectGenesisAnswers
    );

    const [deliverable] = await db.insert(projectGenesisDeliverables).values({
      projectId,
      phaseNumber,
      name: deliverableName,
      content,
      status: 'draft',
    }).returning();

    deliverables.push(deliverable);
  }

  return deliverables;
}

/**
 * Generate content for a specific deliverable
 */
async function generateDeliverableContent(
  deliverableName: string,
  answers: ProjectGenesisAnswers
): Promise<string> {
  // This would integrate with LLM service to generate actual content
  // For now, return structured template

  const templates: Record<string, string> = {
    'Business Profile': `# Business Profile

## Company Overview
**Name:** ${answers.company_name || 'TBD'}
**Industry:** ${answers.industry || 'TBD'}
**Stage:** ${answers.stage || 'TBD'}

## Description
${answers.description || 'TBD'}

## Mission & Vision
${answers.mission || 'TBD'}

## Core Values
${Array.isArray(answers.values) ? answers.values.join(', ') : 'TBD'}
`,
    
    'Market Analysis': `# Market Analysis

## Market Size
- **TAM (Total Addressable Market):** $${answers.tam || 'TBD'}
- **SAM (Serviceable Addressable Market):** $${answers.sam || 'TBD'}
- **SOM (Serviceable Obtainable Market):** $${answers.som || 'TBD'}

## Market Trends
${answers.market_trends || 'TBD'}

## Growth Drivers
${answers.growth_drivers || 'TBD'}
`,

    'Success Metrics': `# Success Metrics

## Primary Objective
${answers.primary_objective || 'TBD'}

## Timeframe
${answers.timeframe || 'TBD'}

## Success Definition
${answers.success_definition || 'TBD'}

## Key Performance Indicators
${answers.kpis || 'TBD'}
`,

    'Strategic Plan': `# Strategic Plan

## Strategic Positioning
${answers.positioning || 'TBD'}

## Go-to-Market Strategy
${answers.gtm_strategy || 'TBD'}

## Competitive Advantage
${answers.competitive_advantage || 'TBD'}
`,

    'Value Proposition': `# Value Proposition

## Headline
${answers.value_prop_headline || 'TBD'}

## Key Benefits
${answers.key_benefits || 'TBD'}

## Differentiators
${answers.differentiators || 'TBD'}
`,

    'Master Blueprint': `# Master Blueprint

## Executive Summary
Project: ${answers.company_name}
Industry: ${answers.industry}
Stage: ${answers.stage}

## Strategic Overview
${answers.description}

## Implementation Roadmap
[Generated based on all previous phases]
`,
  };

  return templates[deliverableName] || `# ${deliverableName}\n\n[Content to be generated]`;
}

/**
 * Complete a phase and move to next
 */
export async function completePhase(projectId: string, phaseNumber: number) {
  // Mark current phase as completed
  await db.update(projectGenesisPhases)
    .set({
      status: 'completed',
      completedAt: new Date(),
    })
    .where(
      and(
        eq(projectGenesisPhases.projectId, projectId),
        eq(projectGenesisPhases.phaseNumber, phaseNumber)
      )
    );

  // If not the last phase, start next phase
  if (phaseNumber < 6) {
    await db.update(projectGenesisPhases)
      .set({
        status: 'in_progress',
        startedAt: new Date(),
      })
      .where(
        and(
          eq(projectGenesisPhases.projectId, projectId),
          eq(projectGenesisPhases.phaseNumber, phaseNumber + 1)
        )
      );

    // Update project current phase
    await db.update(projectGenesis)
      .set({ currentPhase: phaseNumber + 1 })
      .where(eq(projectGenesis.id, projectId));
  } else {
    // All phases complete
    await db.update(projectGenesis)
      .set({ status: 'completed' })
      .where(eq(projectGenesis.id, projectId));
  }

  return true;
}

/**
 * Get deliverables for a project
 */
export async function getProjectDeliverables(projectId: string, phaseNumber?: number) {
  let query = db.select()
    .from(projectGenesisDeliverables)
    .where(eq(projectGenesisDeliverables.projectId, projectId));

  if (phaseNumber) {
    query = query.where(eq(projectGenesisDeliverables.phaseNumber, phaseNumber));
  }

  const deliverables = await query;
  return deliverables;
}

/**
 * Update deliverable status
 */
export async function updateDeliverableStatus(
  deliverableId: string,
  status: 'draft' | 'review' | 'approved' | 'needs_revision'
) {
  await db.update(projectGenesisDeliverables)
    .set({ status })
    .where(eq(projectGenesisDeliverables.id, deliverableId));

  return true;
}
