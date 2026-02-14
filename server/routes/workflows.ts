import express from 'express';
import { WorkflowEngine } from '../services/workflow-engine';
import { StepExecutor } from '../services/step-executor';
import { DeliverableGenerator } from '../services/deliverable-generator';
import { StepValidator } from '../services/step-validator';
import { ProjectGenesisWorkflow } from '../workflows/project-genesis-workflow';
import { AISMEWorkflow } from '../workflows/ai-sme-workflow';
import { QualityGatesWorkflow, QualityGateType } from '../workflows/quality-gates-workflow';
import { DueDiligenceWorkflow, DDTemplate } from '../workflows/due-diligence-workflow';
import { FinancialModelingWorkflow, FinancialModelType } from '../workflows/financial-modeling-workflow';
import { DataRoomWorkflow, AccessLevel } from '../workflows/data-room-workflow';
import { DigitalTwinWorkflow } from '../workflows/digital-twin-workflow';

const router = express.Router();

/**
 * Get all workflows for a user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 999; // TODO: Get from auth
    const skillType = req.query.skillType as any;

    const workflows = await WorkflowEngine.getUserWorkflows(userId, skillType);

    res.json({
      success: true,
      workflows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get workflow by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const workflow = await WorkflowEngine.getWorkflow(req.params.id);

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get workflow steps
 */
router.get('/:id/steps', async (req, res) => {
  try {
    const steps = await WorkflowEngine.getWorkflowSteps(req.params.id);

    res.json({
      success: true,
      steps,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Start workflow
 */
router.post('/:id/start', async (req, res) => {
  try {
    const workflow = await WorkflowEngine.startWorkflow(req.params.id);

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Pause workflow
 */
router.post('/:id/pause', async (req, res) => {
  try {
    const workflow = await WorkflowEngine.pauseWorkflow(req.params.id);

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Resume workflow
 */
router.post('/:id/resume', async (req, res) => {
  try {
    const workflow = await WorkflowEngine.resumeWorkflow(req.params.id);

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Validate step data
 */
router.post('/:id/steps/:stepId/validate', async (req, res) => {
  try {
    const { stepData } = req.body;
    const workflow = await WorkflowEngine.getWorkflow(req.params.id);
    const steps = await WorkflowEngine.getWorkflowSteps(req.params.id);
    const step = steps.find(s => s.id === req.params.stepId);

    if (!step) {
      return res.status(404).json({
        success: false,
        error: 'Step not found',
      });
    }

    // Get validation rules from workflow definition
    const workflowDef = workflow.metadata.phases?.find(
      (p: any) => p.phaseNumber === workflow.currentPhase
    );
    const stepDef = workflowDef?.steps?.find(
      (s: any) => s.stepNumber === step.stepNumber
    );

    const validationResult = await StepValidator.validateStep({
      workflowId: workflow.id,
      stepId: step.id,
      skillType: workflow.skillType,
      stepNumber: step.stepNumber,
      stepName: step.stepName,
      stepData: stepData || step.data,
      validationRules: stepDef?.validations || [],
    });

    res.json({
      success: true,
      validation: validationResult,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get step execution guidance
 */
router.get('/:id/steps/:stepId/guidance', async (req, res) => {
  try {
    const workflow = await WorkflowEngine.getWorkflow(req.params.id);
    const steps = await WorkflowEngine.getWorkflowSteps(req.params.id);
    const step = steps.find(s => s.id === req.params.stepId);

    if (!step) {
      return res.status(404).json({
        success: false,
        error: 'Step not found',
      });
    }

    const executionResult = await StepExecutor.executeStep({
      workflowId: workflow.id,
      stepId: step.id,
      userId: workflow.userId,
      skillType: workflow.skillType,
      stepNumber: step.stepNumber,
      stepName: step.stepName,
      stepData: step.data,
      workflowData: workflow.data,
    });

    res.json({
      success: true,
      step,
      guidance: executionResult.guidance,
      recommendations: executionResult.recommendations,
      deliverables: executionResult.deliverables,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Complete step
 */
router.post('/:id/steps/:stepId/complete', async (req, res) => {
  try {
    const { stepData } = req.body;

    const step = await WorkflowEngine.completeStep(
      req.params.id,
      req.params.stepId,
      stepData
    );

    res.json({
      success: true,
      step,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate deliverable for a step
 */
router.post('/:id/steps/:stepId/generate-deliverable', async (req, res) => {
  try {
    const { deliverableType, data } = req.body;
    const workflow = await WorkflowEngine.getWorkflow(req.params.id);
    const steps = await WorkflowEngine.getWorkflowSteps(req.params.id);
    const step = steps.find(s => s.id === req.params.stepId);

    if (!step) {
      return res.status(404).json({
        success: false,
        error: 'Step not found',
      });
    }

    const deliverable = await DeliverableGenerator.generateDeliverable({
      workflowId: workflow.id,
      stepId: step.id,
      skillType: workflow.skillType,
      stepName: step.stepName,
      deliverableType: deliverableType || 'Report',
      data: data || step.data,
    });

    res.json({
      success: true,
      deliverable,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * List deliverables for a workflow
 */
router.get('/:id/deliverables', async (req, res) => {
  try {
    const deliverables = await DeliverableGenerator.listDeliverables(req.params.id);

    res.json({
      success: true,
      deliverables,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Download deliverable
 */
router.get('/deliverables/:filename', async (req, res) => {
  try {
    const filepath = await DeliverableGenerator.getDeliverable(req.params.filename);
    res.download(filepath);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: 'Deliverable not found',
    });
  }
});

/**
 * Delete workflow
 */
router.delete('/:id', async (req, res) => {
  try {
    await WorkflowEngine.deleteWorkflow(req.params.id);

    res.json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Project Genesis Routes
// ============================================================================

router.post('/project-genesis/create', async (req, res) => {
  try {
    const userId = req.user?.id || 999;
    const { projectName, projectDescription } = req.body;

    const workflow = await ProjectGenesisWorkflow.create(
      userId,
      projectName,
      projectDescription
    );

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/project-genesis/:id/progress', async (req, res) => {
  try {
    const progress = await ProjectGenesisWorkflow.getProgress(req.params.id);

    res.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/project-genesis/:id/guidance', async (req, res) => {
  try {
    const guidance = await ProjectGenesisWorkflow.getCurrentGuidance(req.params.id);

    res.json({
      success: true,
      guidance,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// AI-SME Routes
// ============================================================================

router.post('/ai-sme/create', async (req, res) => {
  try {
    const userId = req.user?.id || 999;
    const { question, category } = req.body;

    const workflow = await AISMEWorkflow.create(userId, question, category);

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/ai-sme/experts', async (req, res) => {
  try {
    const { category } = req.query;

    const experts = await AISMEWorkflow.getExpertsByCategory(category as string);

    res.json({
      success: true,
      experts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/ai-sme/:id/select-experts', async (req, res) => {
  try {
    const { expertIds } = req.body;

    const result = await AISMEWorkflow.selectExperts(req.params.id, expertIds);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/ai-sme/:id/submit-question', async (req, res) => {
  try {
    const { question, context } = req.body;

    const result = await AISMEWorkflow.submitQuestion(req.params.id, question, context);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Quality Gates Routes
// ============================================================================

router.post('/quality-gates/create', async (req, res) => {
  try {
    const userId = req.user?.id || 999;
    const { gateType, projectName } = req.body;

    const workflow = await QualityGatesWorkflow.create(
      userId,
      gateType as QualityGateType,
      projectName
    );

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/quality-gates/:id/execute-validation', async (req, res) => {
  try {
    const { checkResults } = req.body;

    const result = await QualityGatesWorkflow.executeValidation(
      req.params.id,
      checkResults
    );

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/quality-gates/:id/status', async (req, res) => {
  try {
    const status = await QualityGatesWorkflow.getGateStatus(req.params.id);

    res.json({
      success: true,
      status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Due Diligence Routes
// ============================================================================

router.post('/due-diligence/create', async (req, res) => {
  try {
    const userId = req.user?.id || 999;
    const { targetCompany, ddTemplate } = req.body;

    const workflow = await DueDiligenceWorkflow.create(
      userId,
      targetCompany,
      ddTemplate as DDTemplate
    );

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/due-diligence/:id/upload-document', async (req, res) => {
  try {
    const { document } = req.body;

    const result = await DueDiligenceWorkflow.uploadDocument(req.params.id, document);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/due-diligence/:id/analyze', async (req, res) => {
  try {
    const result = await DueDiligenceWorkflow.analyzeDocuments(req.params.id);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Financial Modeling Routes
// ============================================================================

router.post('/financial-modeling/create', async (req, res) => {
  try {
    const userId = req.user?.id || 999;
    const { companyName, modelType } = req.body;

    const workflow = await FinancialModelingWorkflow.create(
      userId,
      companyName,
      modelType as FinancialModelType
    );

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/financial-modeling/:id/submit-data', async (req, res) => {
  try {
    const { data } = req.body;

    const result = await FinancialModelingWorkflow.submitFinancialData(
      req.params.id,
      data
    );

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/financial-modeling/:id/generate', async (req, res) => {
  try {
    const result = await FinancialModelingWorkflow.generateModel(req.params.id);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Data Room Routes
// ============================================================================

router.post('/data-room/create', async (req, res) => {
  try {
    const userId = req.user?.id || 999;
    const { roomName, purpose } = req.body;

    const workflow = await DataRoomWorkflow.create(userId, roomName, purpose);

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/data-room/:id/upload', async (req, res) => {
  try {
    const { document } = req.body;

    const result = await DataRoomWorkflow.uploadDocument(req.params.id, document);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/data-room/:id/grant-access', async (req, res) => {
  try {
    const { user } = req.body;

    const result = await DataRoomWorkflow.grantAccess(req.params.id, user);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/data-room/:id/activity', async (req, res) => {
  try {
    const report = await DataRoomWorkflow.generateActivityReport(req.params.id);

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Digital Twin Routes
// ============================================================================

router.post('/digital-twin/create', async (req, res) => {
  try {
    const userId = req.user?.id || 999;
    const { date } = req.body;

    const workflow = await DigitalTwinWorkflow.create(userId, date);

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/digital-twin/:id/morning-briefing', async (req, res) => {
  try {
    const briefing = await DigitalTwinWorkflow.generateMorningBriefing(req.params.id);

    res.json({
      success: true,
      briefing,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/digital-twin/:id/prioritize-tasks', async (req, res) => {
  try {
    const { tasks } = req.body;

    const prioritizedTasks = await DigitalTwinWorkflow.prioritizeTasks(
      req.params.id,
      tasks
    );

    res.json({
      success: true,
      tasks: prioritizedTasks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/digital-twin/:id/track-progress', async (req, res) => {
  try {
    const { completedTasks, notes } = req.body;

    const progress = await DigitalTwinWorkflow.trackProgress(
      req.params.id,
      completedTasks,
      notes
    );

    res.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/digital-twin/:id/evening-review', async (req, res) => {
  try {
    const review = await DigitalTwinWorkflow.generateEveningReview(req.params.id);

    res.json({
      success: true,
      review,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
