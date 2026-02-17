import { WorkflowEngine, WorkflowConfig, WorkflowPhase } from '../services/workflow-engine';

/**
 * Project Genesis Workflow - 6-Phase Venture Development Process
 * 
 * This workflow guides users through the complete venture development lifecycle
 * from initial market research to launch and scaling.
 */

export const PROJECT_GENESIS_PHASES: WorkflowPhase[] = [
  {
    phaseNumber: 1,
    phaseName: 'Discovery',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Market Research',
        description: 'Conduct comprehensive market research to identify opportunities and validate market size',
        validations: [
          {
            type: 'required_field',
            rule: 'market_size',
            message: 'Market size estimate is required',
          },
          {
            type: 'required_field',
            rule: 'target_market',
            message: 'Target market definition is required',
          },
        ],
        deliverables: ['Market Research Report'],
      },
      {
        stepNumber: 2,
        stepName: 'Competitor Analysis',
        description: 'Analyze competitors to understand competitive landscape and identify differentiation opportunities',
        validations: [
          {
            type: 'minimum_count',
            rule: 'competitors >= 3',
            message: 'At least 3 competitors must be analyzed',
          },
        ],
        deliverables: ['Competitor Analysis Matrix'],
      },
      {
        stepNumber: 3,
        stepName: 'Customer Discovery',
        description: 'Conduct customer interviews and surveys to validate problem and solution fit',
        validations: [
          {
            type: 'minimum_count',
            rule: 'interviews >= 10',
            message: 'At least 10 customer interviews required',
          },
        ],
        deliverables: ['Customer Personas', 'Interview Insights Report'],
      },
      {
        stepNumber: 4,
        stepName: 'Problem Validation',
        description: 'Validate that the identified problem is significant and worth solving',
        validations: [
          {
            type: 'required_field',
            rule: 'problem_statement',
            message: 'Clear problem statement is required',
          },
        ],
        deliverables: ['Problem Validation Report'],
      },
    ],
  },
  {
    phaseNumber: 2,
    phaseName: 'Definition',
    steps: [
      {
        stepNumber: 5,
        stepName: 'Business Model Canvas',
        description: 'Define business model using Business Model Canvas framework',
        validations: [
          {
            type: 'required_fields',
            rule: 'all_canvas_blocks',
            message: 'All 9 Business Model Canvas blocks must be completed',
          },
        ],
        deliverables: ['Business Model Canvas'],
      },
      {
        stepNumber: 6,
        stepName: 'Value Proposition',
        description: 'Craft compelling value proposition that resonates with target customers',
        validations: [
          {
            type: 'required_field',
            rule: 'value_proposition',
            message: 'Value proposition statement is required',
          },
        ],
        deliverables: ['Value Proposition Canvas'],
      },
      {
        stepNumber: 7,
        stepName: 'Revenue Model',
        description: 'Define revenue streams and pricing strategy',
        validations: [
          {
            type: 'minimum_count',
            rule: 'revenue_streams >= 1',
            message: 'At least one revenue stream must be defined',
          },
        ],
        deliverables: ['Revenue Model Document'],
      },
      {
        stepNumber: 8,
        stepName: 'Financial Projections',
        description: 'Create 3-5 year financial projections',
        validations: [
          {
            type: 'required_field',
            rule: 'projections',
            message: 'Financial projections are required',
          },
        ],
        deliverables: ['Financial Projections Spreadsheet'],
      },
    ],
  },
  {
    phaseNumber: 3,
    phaseName: 'Design',
    steps: [
      {
        stepNumber: 9,
        stepName: 'Feature Prioritization',
        description: 'Prioritize features for MVP using MoSCoW or similar framework',
        validations: [
          {
            type: 'minimum_count',
            rule: 'must_have_features >= 3',
            message: 'At least 3 must-have features required',
          },
        ],
        deliverables: ['Feature Prioritization Matrix'],
      },
      {
        stepNumber: 10,
        stepName: 'UX Design',
        description: 'Design user experience and create wireframes',
        validations: [
          {
            type: 'required_field',
            rule: 'wireframes',
            message: 'Wireframes are required',
          },
        ],
        deliverables: ['Wireframes', 'User Flow Diagrams'],
      },
      {
        stepNumber: 11,
        stepName: 'Technical Architecture',
        description: 'Define technical architecture and technology stack',
        validations: [
          {
            type: 'required_field',
            rule: 'architecture_diagram',
            message: 'Architecture diagram is required',
          },
        ],
        deliverables: ['Technical Architecture Document'],
      },
      {
        stepNumber: 12,
        stepName: 'Prototype Development',
        description: 'Build clickable prototype or proof of concept',
        validations: [
          {
            type: 'required_field',
            rule: 'prototype_url',
            message: 'Prototype URL or demo is required',
          },
        ],
        deliverables: ['Interactive Prototype'],
      },
    ],
  },
  {
    phaseNumber: 4,
    phaseName: 'Development',
    steps: [
      {
        stepNumber: 13,
        stepName: 'MVP Development',
        description: 'Build minimum viable product with core features',
        validations: [
          {
            type: 'required_field',
            rule: 'mvp_url',
            message: 'MVP URL is required',
          },
        ],
        deliverables: ['MVP Application'],
      },
      {
        stepNumber: 14,
        stepName: 'Quality Assurance',
        description: 'Test MVP for bugs and usability issues',
        validations: [
          {
            type: 'minimum_count',
            rule: 'test_cases >= 20',
            message: 'At least 20 test cases required',
          },
        ],
        deliverables: ['QA Test Report'],
      },
      {
        stepNumber: 15,
        stepName: 'User Testing',
        description: 'Conduct user testing sessions with target customers',
        validations: [
          {
            type: 'minimum_count',
            rule: 'user_tests >= 5',
            message: 'At least 5 user testing sessions required',
          },
        ],
        deliverables: ['User Testing Report'],
      },
      {
        stepNumber: 16,
        stepName: 'Iteration',
        description: 'Iterate on MVP based on user feedback',
        validations: [
          {
            type: 'required_field',
            rule: 'iteration_summary',
            message: 'Iteration summary is required',
          },
        ],
        deliverables: ['Iteration Report'],
      },
    ],
  },
  {
    phaseNumber: 5,
    phaseName: 'Deployment',
    steps: [
      {
        stepNumber: 17,
        stepName: 'Go-to-Market Strategy',
        description: 'Define go-to-market strategy and launch plan',
        validations: [
          {
            type: 'required_field',
            rule: 'gtm_strategy',
            message: 'Go-to-market strategy is required',
          },
        ],
        deliverables: ['Go-to-Market Plan'],
      },
      {
        stepNumber: 18,
        stepName: 'Marketing Plan',
        description: 'Create comprehensive marketing plan and materials',
        validations: [
          {
            type: 'minimum_count',
            rule: 'marketing_channels >= 3',
            message: 'At least 3 marketing channels required',
          },
        ],
        deliverables: ['Marketing Plan', 'Marketing Materials'],
      },
      {
        stepNumber: 19,
        stepName: 'Sales Strategy',
        description: 'Define sales process and build sales pipeline',
        validations: [
          {
            type: 'required_field',
            rule: 'sales_process',
            message: 'Sales process is required',
          },
        ],
        deliverables: ['Sales Playbook'],
      },
      {
        stepNumber: 20,
        stepName: 'Partnership Development',
        description: 'Identify and establish strategic partnerships',
        validations: [
          {
            type: 'minimum_count',
            rule: 'partnerships >= 2',
            message: 'At least 2 partnerships required',
          },
        ],
        deliverables: ['Partnership Strategy Document'],
      },
    ],
  },
  {
    phaseNumber: 6,
    phaseName: 'Delivery',
    steps: [
      {
        stepNumber: 21,
        stepName: 'Launch Execution',
        description: 'Execute launch plan and go live',
        validations: [
          {
            type: 'required_field',
            rule: 'launch_date',
            message: 'Launch date is required',
          },
        ],
        deliverables: ['Launch Report'],
      },
      {
        stepNumber: 22,
        stepName: 'Performance Monitoring',
        description: 'Monitor key metrics and performance indicators',
        validations: [
          {
            type: 'minimum_count',
            rule: 'kpis >= 5',
            message: 'At least 5 KPIs must be tracked',
          },
        ],
        deliverables: ['KPI Dashboard'],
      },
      {
        stepNumber: 23,
        stepName: 'Customer Acquisition',
        description: 'Execute customer acquisition strategy',
        validations: [
          {
            type: 'minimum_count',
            rule: 'customers >= 10',
            message: 'At least 10 customers required',
          },
        ],
        deliverables: ['Customer Acquisition Report'],
      },
      {
        stepNumber: 24,
        stepName: 'Scaling Strategy',
        description: 'Plan and execute scaling strategy',
        validations: [
          {
            type: 'required_field',
            rule: 'scaling_plan',
            message: 'Scaling plan is required',
          },
        ],
        deliverables: ['Scaling Plan Document'],
      },
    ],
  },
];

/**
 * Project Genesis Workflow Service
 */
export class ProjectGenesisWorkflow {
  /**
   * Create a new Project Genesis workflow
   */
  static async create(
    userId: number,
    projectName: string,
    projectDescription: string
  ) {
    const config: WorkflowConfig = {
      name: `Project Genesis: ${projectName}`,
      skillType: 'project_genesis',
      phases: PROJECT_GENESIS_PHASES,
      metadata: {
        projectName,
        projectDescription,
        totalPhases: 6,
        totalSteps: 24,
        estimatedDuration: '4-12 weeks',
      },
    };

    return await WorkflowEngine.createWorkflow(userId, config);
  }

  /**
   * Get workflow progress summary
   */
  static async getProgress(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);

    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const totalSteps = steps.length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    const currentPhase = PROJECT_GENESIS_PHASES.find(
      p => p.phaseNumber === workflow.currentPhase
    );

    return {
      workflowId: workflow.id,
      status: workflow.status,
      currentPhase: workflow.currentPhase,
      currentPhaseName: currentPhase?.phaseName || 'Unknown',
      currentStep: workflow.currentStep,
      completedSteps,
      totalSteps,
      progressPercentage,
      phases: PROJECT_GENESIS_PHASES.map(phase => ({
        phaseNumber: phase.phaseNumber,
        phaseName: phase.phaseName,
        steps: phase.steps.map(step => {
          const stepData = steps.find(s => s.stepNumber === step.stepNumber);
          return {
            stepNumber: step.stepNumber,
            stepName: step.stepName,
            status: stepData?.status || 'pending',
            completedAt: stepData?.completedAt || null,
          };
        }),
      })),
    };
  }

  /**
   * Get current phase guidance
   */
  static async getCurrentGuidance(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const currentStep = await WorkflowEngine.getCurrentStep(workflowId);

    if (!currentStep) {
      return {
        message: 'Workflow completed or no current step found',
        guidance: null,
      };
    }

    const phase = PROJECT_GENESIS_PHASES.find(
      p => p.phaseNumber === workflow.currentPhase
    );

    const stepDef = phase?.steps.find(s => s.stepNumber === currentStep.stepNumber);

    return {
      phase: {
        number: phase?.phaseNumber,
        name: phase?.phaseName,
      },
      step: {
        number: currentStep.stepNumber,
        name: currentStep.stepName,
        description: stepDef?.description,
        deliverables: stepDef?.deliverables || [],
      },
      guidance: this.generateStepGuidance(currentStep.stepName),
    };
  }

  /**
   * Generate AI-powered guidance for a step
   */
  private static generateStepGuidance(stepName: string): string {
    // TODO: Integrate with AI to generate contextual guidance
    const guidanceMap: Record<string, string> = {
      'Market Research': 'Start by defining your target market size (TAM, SAM, SOM). Research industry trends, growth rates, and market dynamics. Use tools like Statista, IBISWorld, or government databases for data.',
      'Competitor Analysis': 'Identify direct and indirect competitors. Analyze their strengths, weaknesses, pricing, features, and market positioning. Create a competitive matrix to visualize differentiation opportunities.',
      'Customer Discovery': 'Conduct in-depth interviews with potential customers. Focus on understanding their pain points, current solutions, and willingness to pay. Use open-ended questions to uncover insights.',
      'Problem Validation': 'Validate that the problem you\'re solving is significant enough that customers will pay for a solution. Quantify the cost of the problem and the value of solving it.',
      // Add more guidance for other steps...
    };

    return guidanceMap[stepName] || 'Complete this step to progress to the next phase.';
  }

  /**
   * Submit step completion data
   */
  static async submitStepData(
    workflowId: string,
    stepId: string,
    data: Record<string, any>
  ) {
    return await WorkflowEngine.completeStep(workflowId, stepId, data);
  }

  /**
   * Generate deliverable for a completed step
   */
  static async generateDeliverable(
    workflowId: string,
    stepId: string,
    deliverableType: string
  ) {
    return await WorkflowEngine.generateDeliverable(workflowId, stepId, deliverableType);
  }
}
