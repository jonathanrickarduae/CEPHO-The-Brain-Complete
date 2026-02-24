import { db } from '../db';
import { projects, projectPhases, projectDeliverables, approvalGates } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ProjectPhase {
  id: number;
  name: string;
  duration: string;
  objective: string;
  deliverables: string[];
  qualityGate: string[];
}

export const PROJECT_PHASES: ProjectPhase[] = [
  {
    id: 1,
    name: 'Ideation & Concept',
    duration: '1-2 weeks',
    objective: 'Define the project vision and validate feasibility',
    deliverables: [
      'Project concept document',
      'Feasibility analysis',
      'Market research summary',
      'Initial timeline estimate'
    ],
    qualityGate: [
      'Concept must be clear and compelling',
      'Market opportunity validated',
      'Resources available',
      'Stakeholder approval'
    ]
  },
  {
    id: 2,
    name: 'Planning & Strategy',
    duration: '2-3 weeks',
    objective: 'Develop detailed project plan',
    deliverables: [
      'Project charter',
      'Detailed timeline',
      'Resource allocation',
      'Risk register',
      'Budget breakdown'
    ],
    qualityGate: [
      'All deliverables complete',
      'Timeline realistic',
      'Budget approved',
      'Risks identified and mitigated'
    ]
  },
  {
    id: 3,
    name: 'Design & Architecture',
    duration: '3-4 weeks',
    objective: 'Create detailed designs and specifications',
    deliverables: [
      'System architecture diagram',
      'UI/UX mockups',
      'Data models',
      'Integration specifications',
      'Technical documentation'
    ],
    qualityGate: [
      'Design meets requirements',
      'Architecture scalable',
      'UX validated',
      'Technical feasibility confirmed'
    ]
  },
  {
    id: 4,
    name: 'Development & Prototyping',
    duration: '6-8 weeks',
    objective: 'Build the solution',
    deliverables: [
      'Working prototype',
      'Code repository',
      'Unit tests',
      'Integration tests',
      'Technical documentation'
    ],
    qualityGate: [
      'Code quality standards met',
      'Test coverage >80%',
      'Performance benchmarks met',
      'Security review passed'
    ]
  },
  {
    id: 5,
    name: 'Testing & Validation',
    duration: '2-3 weeks',
    objective: 'Validate solution meets requirements',
    deliverables: [
      'Test reports',
      'UAT results',
      'Performance test results',
      'Bug fix log',
      'Final documentation'
    ],
    qualityGate: [
      'All critical bugs fixed',
      'UAT approved',
      'Performance acceptable',
      'Documentation complete'
    ]
  },
  {
    id: 6,
    name: 'Launch & Commercialization',
    duration: '1-2 weeks',
    objective: 'Deploy and launch the solution',
    deliverables: [
      'Production deployment',
      'Launch plan',
      'Marketing materials',
      'User training materials',
      'Support documentation'
    ],
    qualityGate: [
      'Production stable',
      'Monitoring in place',
      'Support team ready',
      'Launch approved'
    ]
  }
];

/**
 * Start autonomous workflow for a project
 * Automatically progresses through phases with AI-generated deliverables
 */
export async function startAutonomousWorkflow(projectId: string, userId: string) {
  // Initialize project phases
  for (const phase of PROJECT_PHASES) {
    await db.insert(projectPhases).values({
      projectId,
      phaseNumber: phase.id,
      phaseName: phase.name,
      status: phase.id === 1 ? 'in_progress' : 'pending',
      startedAt: phase.id === 1 ? new Date() : null,
    });
  }

  // Start Phase 1 deliverable generation
  await generatePhaseDeliverables(projectId, 1, userId);
  
  return { success: true, message: 'Autonomous workflow started' };
}

/**
 * Generate deliverables for a specific phase using AI
 */
export async function generatePhaseDeliverables(
  projectId: string, 
  phaseNumber: number, 
  userId: string
) {
  const phase = PROJECT_PHASES.find(p => p.id === phaseNumber);
  if (!phase) throw new Error('Invalid phase number');

  // Get project details
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) throw new Error('Project not found');

  // Generate each deliverable using AI
  for (const deliverableName of phase.deliverables) {
    const content = await generateDeliverableContent(project, phase, deliverableName);
    
    await db.insert(projectDeliverables).values({
      projectId,
      phaseNumber,
      deliverableName,
      content,
      status: 'generated',
      generatedAt: new Date(),
    });
  }

  // Update phase status
  await db.update(projectPhases)
    .set({ status: 'awaiting_cos_review' })
    .where(and(
      eq(projectPhases.projectId, projectId),
      eq(projectPhases.phaseNumber, phaseNumber)
    ));

  // Notify COS for review
  await notifyCOSForReview(projectId, phaseNumber);

  return { success: true, deliverables: phase.deliverables };
}

/**
 * Generate content for a specific deliverable using AI
 */
async function generateDeliverableContent(
  project: any,
  phase: ProjectPhase,
  deliverableName: string
): Promise<string> {
  const prompt = `You are an expert business strategist helping to create a ${deliverableName} for a project.

Project Details:
- Name: ${project.name}
- Description: ${project.description}
- Phase: ${phase.name} (${phase.objective})

Generate a comprehensive ${deliverableName} that includes:
1. Executive Summary
2. Detailed Analysis
3. Recommendations
4. Next Steps

Format the output as a professional document with clear sections and actionable insights.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: 'You are an expert business strategist and project manager.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0].message.content || '';
}

/**
 * COS reviews phase deliverables
 */
export async function cosReviewPhase(
  projectId: string,
  phaseNumber: number,
  approved: boolean,
  feedback?: string
) {
  if (approved) {
    // Update phase status to awaiting user approval
    await db.update(projectPhases)
      .set({ 
        status: 'awaiting_user_approval',
        cosApprovedAt: new Date(),
        cosFeedback: feedback
      })
      .where(and(
        eq(projectPhases.projectId, projectId),
        eq(projectPhases.phaseNumber, phaseNumber)
      ));

    // Create approval gate
    await db.insert(approvalGates).values({
      projectId,
      phaseNumber,
      gateType: 'cos_review',
      status: 'approved',
      reviewedBy: 'Chief of Staff',
      reviewedAt: new Date(),
      feedback,
    });

    // Notify user for final approval
    await notifyUserForApproval(projectId, phaseNumber);
  } else {
    // Request revisions
    await db.update(projectPhases)
      .set({ 
        status: 'needs_revision',
        cosFeedback: feedback
      })
      .where(and(
        eq(projectPhases.projectId, projectId),
        eq(projectPhases.phaseNumber, phaseNumber)
      ));

    // Regenerate deliverables based on feedback
    // This would trigger AI to revise based on COS feedback
  }

  return { success: true };
}

/**
 * User approves phase and triggers next phase
 */
export async function userApprovePhase(
  projectId: string,
  phaseNumber: number,
  approved: boolean,
  feedback?: string
) {
  if (approved) {
    // Mark current phase as complete
    await db.update(projectPhases)
      .set({ 
        status: 'completed',
        completedAt: new Date(),
        userFeedback: feedback
      })
      .where(and(
        eq(projectPhases.projectId, projectId),
        eq(projectPhases.phaseNumber, phaseNumber)
      ));

    // Create approval gate
    await db.insert(approvalGates).values({
      projectId,
      phaseNumber,
      gateType: 'user_approval',
      status: 'approved',
      reviewedBy: 'User',
      reviewedAt: new Date(),
      feedback,
    });

    // Start next phase if not the last one
    if (phaseNumber < PROJECT_PHASES.length) {
      await db.update(projectPhases)
        .set({ 
          status: 'in_progress',
          startedAt: new Date()
        })
        .where(and(
          eq(projectPhases.projectId, projectId),
          eq(projectPhases.phaseNumber, phaseNumber + 1)
        ));

      // Generate deliverables for next phase
      await generatePhaseDeliverables(projectId, phaseNumber + 1, 'system');
    } else {
      // Project complete!
      await db.update(projects)
        .set({ 
          status: 'completed',
          completedAt: new Date()
        })
        .where(eq(projects.id, projectId));
    }
  } else {
    // Send back to COS for revision
    await db.update(projectPhases)
      .set({ 
        status: 'needs_revision',
        userFeedback: feedback
      })
      .where(and(
        eq(projectPhases.projectId, projectId),
        eq(projectPhases.phaseNumber, phaseNumber)
      ));
  }

  return { success: true };
}

/**
 * Get project workflow status
 */
export async function getProjectWorkflowStatus(projectId: string) {
  const phases = await db.select()
    .from(projectPhases)
    .where(eq(projectPhases.projectId, projectId))
    .orderBy(projectPhases.phaseNumber);

  const deliverables = await db.select()
    .from(projectDeliverables)
    .where(eq(projectDeliverables.projectId, projectId));

  const gates = await db.select()
    .from(approvalGates)
    .where(eq(approvalGates.projectId, projectId));

  return {
    phases,
    deliverables,
    gates,
    currentPhase: phases.find(p => p.status === 'in_progress' || p.status === 'awaiting_cos_review' || p.status === 'awaiting_user_approval'),
  };
}

/**
 * Notify COS for review (placeholder - would integrate with notification system)
 */
async function notifyCOSForReview(projectId: string, phaseNumber: number) {
  // TODO: Integrate with notification system
  console.log(`COS notification: Phase ${phaseNumber} ready for review on project ${projectId}`);
}

/**
 * Notify user for approval (placeholder - would integrate with notification system)
 */
async function notifyUserForApproval(projectId: string, phaseNumber: number) {
  // TODO: Integrate with notification system
  console.log(`User notification: Phase ${phaseNumber} ready for approval on project ${projectId}`);
}
