import { WorkflowEngine, WorkflowConfig, WorkflowPhase } from '../services/workflow-engine';

/**
 * Data Room Workflow - Secure Document Repository
 * 
 * This workflow creates and manages secure data rooms for
 * fundraising, M&A, or due diligence processes.
 */

export const DATA_ROOM_PHASES: WorkflowPhase[] = [
  {
    phaseNumber: 1,
    phaseName: 'Setup',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Room Creation',
        description: 'Create data room with structure and permissions',
        validations: [
          {
            type: 'required_field',
            rule: 'room_name',
            message: 'Data room name is required',
          },
        ],
        deliverables: ['Data Room Structure'],
      },
      {
        stepNumber: 2,
        stepName: 'Document Upload',
        description: 'Upload and organize documents into categories',
        validations: [
          {
            type: 'minimum_count',
            rule: 'documents >= 5',
            message: 'At least 5 documents required',
          },
        ],
        deliverables: ['Document Index'],
      },
      {
        stepNumber: 3,
        stepName: 'Access Management',
        description: 'Configure user access and permissions',
        validations: [
          {
            type: 'minimum_count',
            rule: 'users >= 1',
            message: 'At least one user must have access',
          },
        ],
        deliverables: ['Access Control List'],
      },
      {
        stepNumber: 4,
        stepName: 'Activity Tracking',
        description: 'Monitor document access and user activity',
        validations: [],
        deliverables: ['Activity Report', 'Analytics Dashboard'],
      },
    ],
  },
];

/**
 * Data Room Categories
 */
export const DATA_ROOM_CATEGORIES = [
  'Corporate Documents',
  'Financial Statements',
  'Legal Agreements',
  'Intellectual Property',
  'Customer Contracts',
  'Employee Information',
  'Tax Documents',
  'Insurance Policies',
  'Real Estate',
  'Technology & IT',
  'Marketing Materials',
  'Operational Documents',
];

/**
 * Access Permission Levels
 */
export enum AccessLevel {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  NO_ACCESS = 'no_access',
}

/**
 * Data Room Workflow Service
 */
export class DataRoomWorkflow {
  /**
   * Create a new Data Room workflow
   */
  static async create(
    userId: number,
    roomName: string,
    purpose: string
  ) {
    const config: WorkflowConfig = {
      name: `Data Room: ${roomName}`,
      skillType: 'data_room',
      phases: DATA_ROOM_PHASES,
      metadata: {
        roomName,
        purpose,
        categories: DATA_ROOM_CATEGORIES,
        createdBy: userId,
      },
    };

    return await WorkflowEngine.createWorkflow(userId, config);
  }

  /**
   * Create data room structure
   */
  static async createStructure(
    workflowId: string,
    categories: string[]
  ) {
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);
    const creationStep = steps.find(s => s.stepName === 'Room Creation');

    if (!creationStep) {
      throw new Error('Room Creation step not found');
    }

    const structure = categories.map(category => ({
      category,
      documents: [],
      createdAt: new Date().toISOString(),
    }));

    return await WorkflowEngine.completeStep(workflowId, creationStep.id, {
      structure,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Upload document to data room
   */
  static async uploadDocument(
    workflowId: string,
    document: {
      name: string;
      category: string;
      url: string;
      size: number;
      confidential: boolean;
    }
  ) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const documents = workflow.data.documents || [];

    documents.push({
      ...document,
      id: documents.length + 1,
      uploadedAt: new Date().toISOString(),
      uploadedBy: workflow.userId,
      views: 0,
      downloads: 0,
    });

    return await WorkflowEngine.updateWorkflowData(workflowId, {
      documents,
    });
  }

  /**
   * Grant user access
   */
  static async grantAccess(
    workflowId: string,
    user: {
      email: string;
      name: string;
      accessLevel: AccessLevel;
      categories?: string[];
    }
  ) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const accessList = workflow.data.accessList || [];

    accessList.push({
      ...user,
      grantedAt: new Date().toISOString(),
      grantedBy: workflow.userId,
      lastAccess: null,
    });

    return await WorkflowEngine.updateWorkflowData(workflowId, {
      accessList,
    });
  }

  /**
   * Track document access
   */
  static async trackAccess(
    workflowId: string,
    documentId: number,
    userId: number,
    action: 'view' | 'download'
  ) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const activityLog = workflow.data.activityLog || [];

    activityLog.push({
      documentId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      ipAddress: '0.0.0.0', // FUTURE: Capture actual client IP address
    });

    // Update document stats
    const documents = workflow.data.documents || [];
    const document = documents.find((d: any) => d.id === documentId);

    if (document) {
      if (action === 'view') {
        document.views = (document.views || 0) + 1;
      } else if (action === 'download') {
        document.downloads = (document.downloads || 0) + 1;
      }
      document.lastAccessed = new Date().toISOString();
    }

    return await WorkflowEngine.updateWorkflowData(workflowId, {
      activityLog,
      documents,
    });
  }

  /**
   * Generate activity report
   */
  static async generateActivityReport(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const activityLog = workflow.data.activityLog || [];
    const documents = workflow.data.documents || [];
    const accessList = workflow.data.accessList || [];

    // Aggregate statistics
    const totalViews = documents.reduce((sum: number, d: any) => sum + (d.views || 0), 0);
    const totalDownloads = documents.reduce((sum: number, d: any) => sum + (d.downloads || 0), 0);
    const mostViewedDocs = documents
      .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    const userActivity = accessList.map((user: any) => {
      const userActions = activityLog.filter((log: any) => log.userId === user.id);
      return {
        user: user.name,
        email: user.email,
        views: userActions.filter((a: any) => a.action === 'view').length,
        downloads: userActions.filter((a: any) => a.action === 'download').length,
        lastAccess: user.lastAccess,
      };
    });

    return {
      workflowId: workflow.id,
      roomName: workflow.metadata.roomName,
      summary: {
        totalDocuments: documents.length,
        totalUsers: accessList.length,
        totalViews,
        totalDownloads,
        totalActivities: activityLog.length,
      },
      mostViewedDocuments: mostViewedDocs,
      userActivity,
      recentActivity: activityLog.slice(-20).reverse(),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get data room status
   */
  static async getStatus(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const documents = workflow.data.documents || [];
    const accessList = workflow.data.accessList || [];

    return {
      workflowId: workflow.id,
      roomName: workflow.metadata.roomName,
      status: workflow.status,
      documentsCount: documents.length,
      usersCount: accessList.length,
      categories: DATA_ROOM_CATEGORIES.map(category => ({
        name: category,
        documentCount: documents.filter((d: any) => d.category === category).length,
      })),
      createdAt: workflow.createdAt,
      lastUpdated: workflow.updatedAt,
    };
  }
}
