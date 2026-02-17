import { WorkflowEngine, WorkflowConfig, WorkflowPhase } from '../services/workflow-engine';

/**
 * Due Diligence Workflow - Comprehensive DD Process
 * 
 * This workflow guides users through structured due diligence processes
 * for investment, M&A, or partnership evaluation.
 */

export const DUE_DILIGENCE_PHASES: WorkflowPhase[] = [
  {
    phaseNumber: 1,
    phaseName: 'Due Diligence',
    steps: [
      {
        stepNumber: 1,
        stepName: 'DD Checklist',
        description: 'Select due diligence template and customize checklist',
        validations: [
          {
            type: 'required_field',
            rule: 'template_selected',
            message: 'DD template must be selected',
          },
        ],
        deliverables: ['Due Diligence Checklist'],
      },
      {
        stepNumber: 2,
        stepName: 'Document Collection',
        description: 'Upload and organize required documents',
        validations: [
          {
            type: 'minimum_count',
            rule: 'documents >= 10',
            message: 'At least 10 documents required for comprehensive DD',
          },
        ],
        deliverables: ['Document Index'],
      },
      {
        stepNumber: 3,
        stepName: 'Analysis & Findings',
        description: 'AI-powered analysis of documents and identification of findings',
        validations: [
          {
            type: 'analysis_complete',
            rule: 'all_documents_analyzed',
            message: 'All documents must be analyzed',
          },
        ],
        deliverables: ['Findings Report', 'Risk Assessment'],
      },
      {
        stepNumber: 4,
        stepName: 'DD Report',
        description: 'Generate comprehensive due diligence report',
        validations: [],
        deliverables: ['Due Diligence Report', 'Executive Summary', 'Recommendations'],
      },
    ],
  },
];

/**
 * Due Diligence Templates
 */
export enum DDTemplate {
  INVESTMENT = 'investment',
  MERGERS_ACQUISITIONS = 'mergers_acquisitions',
  PARTNERSHIP = 'partnership',
  VENDOR = 'vendor',
  REAL_ESTATE = 'real_estate',
  TECHNOLOGY = 'technology',
}

/**
 * DD Checklist Items by Template
 */
export const DD_CHECKLISTS = {
  [DDTemplate.INVESTMENT]: {
    financial: [
      'Audited financial statements (3 years)',
      'Tax returns',
      'Cash flow statements',
      'Balance sheets',
      'Revenue projections',
      'Cap table',
    ],
    legal: [
      'Corporate documents',
      'Contracts and agreements',
      'Intellectual property',
      'Litigation history',
      'Regulatory compliance',
    ],
    operational: [
      'Business plan',
      'Customer contracts',
      'Supplier agreements',
      'Employee agreements',
      'Insurance policies',
    ],
    market: [
      'Market analysis',
      'Competitive landscape',
      'Customer references',
      'Growth strategy',
    ],
  },
  [DDTemplate.MERGERS_ACQUISITIONS]: {
    financial: [
      'Historical financials (5 years)',
      'Working capital analysis',
      'Debt schedule',
      'Tax liabilities',
      'Pension obligations',
    ],
    legal: [
      'Material contracts',
      'Real estate leases',
      'Employment agreements',
      'Regulatory approvals',
      'Pending litigation',
    ],
    operational: [
      'Organizational structure',
      'Key personnel',
      'IT systems',
      'Supply chain',
      'Customer concentration',
    ],
    strategic: [
      'Synergy analysis',
      'Integration plan',
      'Cultural assessment',
      'Risk mitigation',
    ],
  },
  // Add more templates...
};

/**
 * Due Diligence Workflow Service
 */
export class DueDiligenceWorkflow {
  /**
   * Create a new Due Diligence workflow
   */
  static async create(
    userId: number,
    targetCompany: string,
    ddTemplate: DDTemplate
  ) {
    const config: WorkflowConfig = {
      name: `Due Diligence: ${targetCompany}`,
      skillType: 'due_diligence',
      phases: DUE_DILIGENCE_PHASES,
      metadata: {
        targetCompany,
        ddTemplate,
        checklist: DD_CHECKLISTS[ddTemplate] || {},
      },
    };

    return await WorkflowEngine.createWorkflow(userId, config);
  }

  /**
   * Get DD checklist
   */
  static async getChecklist(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    return workflow.metadata.checklist || {};
  }

  /**
   * Upload document
   */
  static async uploadDocument(
    workflowId: string,
    document: {
      name: string;
      category: string;
      url: string;
      size: number;
      uploadedAt: string;
    }
  ) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const documents = workflow.data.documents || [];

    documents.push(document);

    return await WorkflowEngine.updateWorkflowData(workflowId, {
      documents,
    });
  }

  /**
   * Analyze documents
   */
  static async analyzeDocuments(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const documents = workflow.data.documents || [];

    // TODO: Implement AI-powered document analysis
    const analysis = {
      documentsAnalyzed: documents.length,
      findings: [
        {
          category: 'Financial',
          severity: 'high',
          finding: 'Revenue growth slowing',
          details: 'Q3 revenue down 15% YoY',
          recommendation: 'Request detailed revenue breakdown',
        },
        {
          category: 'Legal',
          severity: 'medium',
          finding: 'Pending litigation',
          details: '2 active lawsuits totaling $5M',
          recommendation: 'Review litigation details and potential outcomes',
        },
      ],
      riskScore: 6.5, // Out of 10
      overallAssessment: 'Medium risk',
      analyzedAt: new Date().toISOString(),
    };

    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);
    const analysisStep = steps.find(s => s.stepName === 'Analysis & Findings');

    if (!analysisStep) {
      throw new Error('Analysis & Findings step not found');
    }

    return await WorkflowEngine.completeStep(workflowId, analysisStep.id, analysis);
  }

  /**
   * Generate DD report
   */
  static async generateReport(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);

    const analysisStep = steps.find(s => s.stepName === 'Analysis & Findings');

    if (!analysisStep || analysisStep.status !== 'completed') {
      throw new Error('Analysis must be completed before generating report');
    }

    const report = {
      workflowId: workflow.id,
      targetCompany: workflow.metadata.targetCompany,
      ddTemplate: workflow.metadata.ddTemplate,
      executiveSummary: {
        overallAssessment: analysisStep.data.overallAssessment,
        riskScore: analysisStep.data.riskScore,
        keyFindings: analysisStep.data.findings.slice(0, 5),
      },
      detailedFindings: analysisStep.data.findings,
      recommendations: [
        'Proceed with caution',
        'Request additional financial documentation',
        'Conduct management interviews',
        'Verify customer contracts',
      ],
      nextSteps: [
        'Schedule management presentation',
        'Arrange site visit',
        'Engage legal counsel',
        'Finalize valuation',
      ],
      generatedAt: new Date().toISOString(),
    };

    return report;
  }

  /**
   * Get DD progress
   */
  static async getProgress(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const checklist = workflow.metadata.checklist || {};
    const documents = workflow.data.documents || [];

    // Calculate completion percentage
    const totalItems = Object.values(checklist).flat().length;
    const uploadedCategories = new Set(documents.map((d: any) => d.category));
    const completedItems = documents.length;

    return {
      workflowId: workflow.id,
      status: workflow.status,
      documentsUploaded: documents.length,
      totalChecklistItems: totalItems,
      completionPercentage: Math.round((completedItems / totalItems) * 100),
      categoriesCompleted: uploadedCategories.size,
      totalCategories: Object.keys(checklist).length,
    };
  }
}
