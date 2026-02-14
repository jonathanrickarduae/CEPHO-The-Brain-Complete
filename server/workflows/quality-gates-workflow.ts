import { WorkflowEngine, WorkflowConfig, WorkflowPhase } from '../services/workflow-engine';

/**
 * Quality Gates Workflow - QMS Validation & Compliance
 * 
 * This workflow implements quality validation and compliance checking
 * for projects at key milestones.
 */

export const QUALITY_GATES_PHASES: WorkflowPhase[] = [
  {
    phaseNumber: 1,
    phaseName: 'Validation',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Gate Definition',
        description: 'Define quality criteria, validation rules, and compliance requirements',
        validations: [
          {
            type: 'required_field',
            rule: 'quality_criteria',
            message: 'Quality criteria must be defined',
          },
        ],
        deliverables: ['Quality Criteria Document'],
      },
      {
        stepNumber: 2,
        stepName: 'Validation Execution',
        description: 'Run automated checks against defined criteria',
        validations: [
          {
            type: 'validation_complete',
            rule: 'all_checks_run',
            message: 'All validation checks must be executed',
          },
        ],
        deliverables: ['Validation Report'],
      },
      {
        stepNumber: 3,
        stepName: 'Compliance Review',
        description: 'Review validation results and identify non-conformances',
        validations: [
          {
            type: 'review_complete',
            rule: 'review_signed_off',
            message: 'Compliance review must be signed off',
          },
        ],
        deliverables: ['Compliance Review Report', 'Corrective Action Plan'],
      },
      {
        stepNumber: 4,
        stepName: 'Audit Trail',
        description: 'Generate audit trail and compliance documentation',
        validations: [],
        deliverables: ['Audit Trail Document', 'Compliance Certificate'],
      },
    ],
  },
];

/**
 * Quality Gate Types
 */
export enum QualityGateType {
  PROJECT_INITIATION = 'project_initiation',
  DESIGN_REVIEW = 'design_review',
  DEVELOPMENT_COMPLETE = 'development_complete',
  PRE_LAUNCH = 'pre_launch',
  POST_LAUNCH = 'post_launch',
}

/**
 * Quality Criteria Templates
 */
export const QUALITY_CRITERIA_TEMPLATES = {
  [QualityGateType.PROJECT_INITIATION]: [
    { criterion: 'Business case approved', weight: 0.2 },
    { criterion: 'Budget allocated', weight: 0.2 },
    { criterion: 'Team assigned', weight: 0.2 },
    { criterion: 'Stakeholders identified', weight: 0.2 },
    { criterion: 'Risk assessment complete', weight: 0.2 },
  ],
  [QualityGateType.DESIGN_REVIEW]: [
    { criterion: 'Requirements documented', weight: 0.15 },
    { criterion: 'Architecture approved', weight: 0.2 },
    { criterion: 'UX design complete', weight: 0.15 },
    { criterion: 'Technical feasibility confirmed', weight: 0.2 },
    { criterion: 'Security review passed', weight: 0.15 },
    { criterion: 'Cost estimate approved', weight: 0.15 },
  ],
  [QualityGateType.DEVELOPMENT_COMPLETE]: [
    { criterion: 'All features implemented', weight: 0.2 },
    { criterion: 'Unit tests passed', weight: 0.15 },
    { criterion: 'Integration tests passed', weight: 0.15 },
    { criterion: 'Code review complete', weight: 0.15 },
    { criterion: 'Documentation complete', weight: 0.15 },
    { criterion: 'Performance benchmarks met', weight: 0.2 },
  ],
  [QualityGateType.PRE_LAUNCH]: [
    { criterion: 'UAT completed', weight: 0.2 },
    { criterion: 'Security audit passed', weight: 0.2 },
    { criterion: 'Load testing passed', weight: 0.15 },
    { criterion: 'Rollback plan ready', weight: 0.15 },
    { criterion: 'Support team trained', weight: 0.15 },
    { criterion: 'Marketing materials ready', weight: 0.15 },
  ],
  [QualityGateType.POST_LAUNCH]: [
    { criterion: 'No critical bugs', weight: 0.25 },
    { criterion: 'Performance SLAs met', weight: 0.2 },
    { criterion: 'User feedback positive', weight: 0.2 },
    { criterion: 'KPIs on track', weight: 0.2 },
    { criterion: 'Support tickets manageable', weight: 0.15 },
  ],
};

/**
 * Quality Gates Workflow Service
 */
export class QualityGatesWorkflow {
  /**
   * Create a new Quality Gates workflow
   */
  static async create(
    userId: number,
    gateType: QualityGateType,
    projectName: string
  ) {
    const config: WorkflowConfig = {
      name: `Quality Gate: ${gateType} - ${projectName}`,
      skillType: 'quality_gates',
      phases: QUALITY_GATES_PHASES,
      metadata: {
        gateType,
        projectName,
        criteria: QUALITY_CRITERIA_TEMPLATES[gateType] || [],
      },
    };

    return await WorkflowEngine.createWorkflow(userId, config);
  }

  /**
   * Define quality criteria
   */
  static async defineCriteria(
    workflowId: string,
    criteria: Array<{ criterion: string; weight: number; threshold?: number }>
  ) {
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);
    const definitionStep = steps.find(s => s.stepName === 'Gate Definition');

    if (!definitionStep) {
      throw new Error('Gate Definition step not found');
    }

    return await WorkflowEngine.completeStep(workflowId, definitionStep.id, {
      criteria,
      definedAt: new Date().toISOString(),
    });
  }

  /**
   * Execute validation checks
   */
  static async executeValidation(
    workflowId: string,
    checkResults: Record<string, boolean>
  ) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);
    const validationStep = steps.find(s => s.stepName === 'Validation Execution');

    if (!validationStep) {
      throw new Error('Validation Execution step not found');
    }

    const criteria = workflow.metadata.criteria || [];
    const results = criteria.map((c: any) => ({
      criterion: c.criterion,
      weight: c.weight,
      passed: checkResults[c.criterion] || false,
      score: (checkResults[c.criterion] ? 1 : 0) * c.weight,
    }));

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const passThreshold = 0.8; // 80% pass threshold
    const overallResult = totalScore >= passThreshold;

    return await WorkflowEngine.completeStep(workflowId, validationStep.id, {
      results,
      totalScore,
      passThreshold,
      overallResult,
      nonConformances: results.filter(r => !r.passed),
      executedAt: new Date().toISOString(),
    });
  }

  /**
   * Submit compliance review
   */
  static async submitReview(
    workflowId: string,
    reviewNotes: string,
    correctiveActions: string[],
    signedOff: boolean
  ) {
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);
    const reviewStep = steps.find(s => s.stepName === 'Compliance Review');

    if (!reviewStep) {
      throw new Error('Compliance Review step not found');
    }

    return await WorkflowEngine.completeStep(workflowId, reviewStep.id, {
      reviewNotes,
      correctiveActions,
      signedOff,
      reviewedAt: new Date().toISOString(),
      reviewer: 'System', // TODO: Get actual reviewer
    });
  }

  /**
   * Generate audit trail
   */
  static async generateAuditTrail(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);

    const auditTrail = {
      workflowId: workflow.id,
      gateType: workflow.metadata.gateType,
      projectName: workflow.metadata.projectName,
      criteria: workflow.metadata.criteria,
      validationResults: steps.find(s => s.stepName === 'Validation Execution')?.data,
      complianceReview: steps.find(s => s.stepName === 'Compliance Review')?.data,
      overallStatus: workflow.status,
      generatedAt: new Date().toISOString(),
    };

    return auditTrail;
  }

  /**
   * Get gate status
   */
  static async getGateStatus(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);

    const validationStep = steps.find(s => s.stepName === 'Validation Execution');
    const passed = validationStep?.data?.overallResult || false;

    return {
      workflowId: workflow.id,
      gateType: workflow.metadata.gateType,
      status: workflow.status,
      passed,
      score: validationStep?.data?.totalScore || 0,
      completedSteps: steps.filter(s => s.status === 'completed').length,
      totalSteps: steps.length,
    };
  }
}
