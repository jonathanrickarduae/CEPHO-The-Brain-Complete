import { randomUUID } from 'crypto';
import { getDb } from '../db';
import { cephoWorkflows, cephoWorkflowSteps, cephoWorkflowValidations } from '../../drizzle/workflow-schema';
import { eq, and } from 'drizzle-orm';

export type WorkflowStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'failed';
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
export type ValidationResult = 'pass' | 'fail' | 'warning';

export type SkillType = 
  | 'project_genesis'
  | 'ai_sme'
  | 'quality_gates'
  | 'due_diligence'
  | 'financial_modeling'
  | 'data_room'
  | 'digital_twin';

export interface WorkflowConfig {
  name: string;
  skillType: SkillType;
  phases?: WorkflowPhase[];
  metadata?: Record<string, any>;
}

export interface WorkflowPhase {
  phaseNumber: number;
  phaseName: string;
  steps: WorkflowStepDefinition[];
}

export interface WorkflowStepDefinition {
  stepNumber: number;
  stepName: string;
  description: string;
  validations?: ValidationRule[];
  deliverables?: string[];
}

export interface ValidationRule {
  type: string;
  rule: string;
  message: string;
}

export interface Workflow {
  id: string;
  userId: number;
  skillType: SkillType;
  name: string;
  currentPhase: number;
  currentStep: number;
  status: WorkflowStatus;
  data: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  stepNumber: number;
  stepName: string;
  status: StepStatus;
  data: Record<string, any>;
  validationResult: Record<string, any> | null;
  completedAt: Date | null;
  createdAt: Date;
}

/**
 * Workflow Engine - Core state machine for managing multi-step cephoWorkflows
 */
export class WorkflowEngine {
  /**
   * Create a new workflow instance
   */
  static async createWorkflow(
    userId: number,
    config: WorkflowConfig
  ): Promise<Workflow> {
    const db = getDb();
    const workflowId = randomUUID();

    const workflow = {
      id: workflowId,
      userId,
      skillType: config.skillType,
      name: config.name,
      currentPhase: 1,
      currentStep: 1,
      status: 'not_started' as WorkflowStatus,
      data: {},
      metadata: {
        ...config.metadata,
        phases: config.phases || [],
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(cephoWorkflows).values(workflow);

    // Create workflow steps if phases are defined
    if (config.phases) {
      for (const phase of config.phases) {
        for (const stepDef of phase.steps) {
          await this.createStep(workflowId, phase.phaseNumber, stepDef);
        }
      }
    }

    return workflow;
  }

  /**
   * Create a workflow step
   */
  private static async createStep(
    workflowId: string,
    phaseNumber: number,
    stepDef: WorkflowStepDefinition
  ): Promise<void> {
    const db = getDb();

    const step = {
      id: randomUUID(),
      workflowId,
      stepNumber: stepDef.stepNumber,
      stepName: stepDef.stepName,
      status: 'pending' as StepStatus,
      data: {
        description: stepDef.description,
        validations: stepDef.validations || [],
        deliverables: stepDef.deliverables || [],
        phaseNumber,
      },
      validationResult: null,
      completedAt: null,
      createdAt: new Date(),
    };

    await db.insert(cephoWorkflowSteps).values(step);
  }

  /**
   * Start a workflow
   */
  static async startWorkflow(workflowId: string): Promise<Workflow> {
    const db = getDb();

    await db
      .update(cephoWorkflows)
      .set({
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(cephoWorkflows.id, workflowId));

    return this.getWorkflow(workflowId);
  }

  /**
   * Get workflow by ID
   */
  static async getWorkflow(workflowId: string): Promise<Workflow> {
    const db = getDb();

    const result = await db
      .select()
      .from(cephoWorkflows)
      .where(eq(cephoWorkflows.id, workflowId))
      .limit(1);

    if (!result || result.length === 0) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    return result[0] as Workflow;
  }

  /**
   * Get all cephoWorkflows for a user
   */
  static async getUserWorkflows(
    userId: number,
    skillType?: SkillType
  ): Promise<Workflow[]> {
    const db = getDb();

    let query = db.select().from(cephoWorkflows).where(eq(cephoWorkflows.userId, userId));

    if (skillType) {
      query = query.where(and(
        eq(cephoWorkflows.userId, userId),
        eq(cephoWorkflows.skillType, skillType)
      ));
    }

    const result = await query;
    return result as Workflow[];
  }

  /**
   * Update workflow data
   */
  static async updateWorkflowData(
    workflowId: string,
    data: Record<string, any>
  ): Promise<Workflow> {
    const db = getDb();
    const workflow = await this.getWorkflow(workflowId);

    const updatedData = {
      ...workflow.data,
      ...data,
    };

    await db
      .update(cephoWorkflows)
      .set({
        data: updatedData,
        updatedAt: new Date(),
      })
      .where(eq(cephoWorkflows.id, workflowId));

    return this.getWorkflow(workflowId);
  }

  /**
   * Get workflow steps
   */
  static async getWorkflowSteps(workflowId: string): Promise<WorkflowStep[]> {
    const db = getDb();

    const result = await db
      .select()
      .from(cephoWorkflowSteps)
      .where(eq(cephoWorkflowSteps.workflowId, workflowId))
      .orderBy(cephoWorkflowSteps.stepNumber);

    return result as WorkflowStep[];
  }

  /**
   * Get current step
   */
  static async getCurrentStep(workflowId: string): Promise<WorkflowStep | null> {
    const workflow = await this.getWorkflow(workflowId);
    const steps = await this.getWorkflowSteps(workflowId);

    return steps.find(s => s.stepNumber === workflow.currentStep) || null;
  }

  /**
   * Complete a step
   */
  static async completeStep(
    workflowId: string,
    stepId: string,
    stepData: Record<string, any>
  ): Promise<WorkflowStep> {
    const db = getDb();

    // Validate step first
    const validationResult = await this.validateStep(workflowId, stepId);

    if (validationResult.result === 'fail') {
      throw new Error(`Step validation failed: ${validationResult.message}`);
    }

    // Update step status
    await db
      .update(cephoWorkflowSteps)
      .set({
        status: 'completed',
        data: stepData,
        validationResult: validationResult,
        completedAt: new Date(),
      })
      .where(eq(cephoWorkflowSteps.id, stepId));

    // Advance workflow to next step
    await this.advanceWorkflow(workflowId);

    const result = await db
      .select()
      .from(cephoWorkflowSteps)
      .where(eq(cephoWorkflowSteps.id, stepId))
      .limit(1);

    return result[0] as WorkflowStep;
  }

  /**
   * Validate a step
   */
  static async validateStep(
    workflowId: string,
    stepId: string
  ): Promise<{ result: ValidationResult; message: string; details: any }> {
    const db = getDb();

    const stepResult = await db
      .select()
      .from(cephoWorkflowSteps)
      .where(eq(cephoWorkflowSteps.id, stepId))
      .limit(1);

    if (!stepResult || stepResult.length === 0) {
      return {
        result: 'fail',
        message: 'Step not found',
        details: {},
      };
    }

    const step = stepResult[0];
    const validations = step.data?.validations || [];

    // Run all validations
    const validationResults = [];
    for (const validation of validations) {
      const result = await this.runValidation(validation, step.data);
      validationResults.push(result);

      // Log validation result
      await db.insert(cephoWorkflowValidations).values({
        id: randomUUID(),
        workflowId,
        stepId,
        validationType: validation.type,
        result: result.result,
        message: result.message,
        data: result.details,
        createdAt: new Date(),
      });
    }

    // Determine overall result
    const hasFailed = validationResults.some(r => r.result === 'fail');
    const hasWarnings = validationResults.some(r => r.result === 'warning');

    return {
      result: hasFailed ? 'fail' : hasWarnings ? 'warning' : 'pass',
      message: hasFailed
        ? 'Validation failed'
        : hasWarnings
        ? 'Validation passed with warnings'
        : 'Validation passed',
      details: validationResults,
    };
  }

  /**
   * Run a single validation rule
   */
  private static async runValidation(
    validation: ValidationRule,
    stepData: any
  ): Promise<{ result: ValidationResult; message: string; details: any }> {
    // TODO: Implement specific validation logic based on validation.type
    // For now, return pass
    return {
      result: 'pass',
      message: validation.message,
      details: {},
    };
  }

  /**
   * Advance workflow to next step
   */
  static async advanceWorkflow(workflowId: string): Promise<Workflow> {
    const db = getDb();
    const workflow = await this.getWorkflow(workflowId);
    const steps = await this.getWorkflowSteps(workflowId);

    const nextStep = steps.find(s => s.stepNumber === workflow.currentStep + 1);

    if (!nextStep) {
      // No more steps, complete workflow
      return this.completeWorkflow(workflowId);
    }

    // Check if we're moving to a new phase
    const currentPhase = workflow.currentPhase;
    const nextPhase = nextStep.data?.phaseNumber || currentPhase;

    await db
      .update(cephoWorkflows)
      .set({
        currentStep: nextStep.stepNumber,
        currentPhase: nextPhase,
        updatedAt: new Date(),
      })
      .where(eq(cephoWorkflows.id, workflowId));

    return this.getWorkflow(workflowId);
  }

  /**
   * Pause workflow
   */
  static async pauseWorkflow(workflowId: string): Promise<Workflow> {
    const db = getDb();

    await db
      .update(cephoWorkflows)
      .set({
        status: 'paused',
        updatedAt: new Date(),
      })
      .where(eq(cephoWorkflows.id, workflowId));

    return this.getWorkflow(workflowId);
  }

  /**
   * Resume workflow
   */
  static async resumeWorkflow(workflowId: string): Promise<Workflow> {
    const db = getDb();

    await db
      .update(cephoWorkflows)
      .set({
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(cephoWorkflows.id, workflowId));

    return this.getWorkflow(workflowId);
  }

  /**
   * Fail workflow
   */
  static async failWorkflow(
    workflowId: string,
    error: string
  ): Promise<Workflow> {
    const db = getDb();

    await db
      .update(cephoWorkflows)
      .set({
        status: 'failed',
        metadata: {
          error,
          failedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(cephoWorkflows.id, workflowId));

    return this.getWorkflow(workflowId);
  }

  /**
   * Complete workflow
   */
  static async completeWorkflow(workflowId: string): Promise<Workflow> {
    const db = getDb();

    await db
      .update(cephoWorkflows)
      .set({
        status: 'completed',
        metadata: {
          completedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(cephoWorkflows.id, workflowId));

    return this.getWorkflow(workflowId);
  }

  /**
   * Generate deliverable for a step
   */
  static async generateDeliverable(
    workflowId: string,
    stepId: string,
    deliverableType: string
  ): Promise<{ url: string; filename: string }> {
    // TODO: Implement deliverable generation logic
    // This will integrate with document generation services
    return {
      url: `/api/cephoWorkflows/${workflowId}/deliverables/${deliverableType}`,
      filename: `${deliverableType}.pdf`,
    };
  }

  /**
   * Delete workflow
   */
  static async deleteWorkflow(workflowId: string): Promise<void> {
    const db = getDb();

    // Delete validations
    await db
      .delete(cephoWorkflowValidations)
      .where(eq(cephoWorkflowValidations.workflowId, workflowId));

    // Delete steps
    await db
      .delete(cephoWorkflowSteps)
      .where(eq(cephoWorkflowSteps.workflowId, workflowId));

    // Delete workflow
    await db.delete(cephoWorkflows).where(eq(cephoWorkflows.id, workflowId));
  }
}
