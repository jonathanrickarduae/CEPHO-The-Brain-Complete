import { WorkflowEngine, WorkflowConfig, WorkflowPhase } from '../services/workflow-engine';

/**
 * Digital Twin Workflow - Daily AI Assistant
 * 
 * This workflow provides continuous daily support through morning briefings,
 * task prioritization, progress tracking, and evening reviews.
 */

export const DIGITAL_TWIN_PHASES: WorkflowPhase[] = [
  {
    phaseNumber: 1,
    phaseName: 'Daily Cycle',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Morning Briefing',
        description: 'Daily summary of tasks, priorities, and insights',
        validations: [],
        deliverables: ['Morning Briefing Report'],
      },
      {
        stepNumber: 2,
        stepName: 'Task Prioritization',
        description: 'Organize and prioritize tasks for the day',
        validations: [],
        deliverables: ['Prioritized Task List'],
      },
      {
        stepNumber: 3,
        stepName: 'Progress Tracking',
        description: 'Monitor task completion and workflow progress',
        validations: [],
        deliverables: ['Progress Report'],
      },
      {
        stepNumber: 4,
        stepName: 'Evening Review',
        description: 'End-of-day summary and preparation for tomorrow',
        validations: [],
        deliverables: ['Evening Review Report'],
      },
    ],
  },
];

/**
 * Digital Twin Workflow Service
 */
export class DigitalTwinWorkflow {
  /**
   * Create a new Digital Twin workflow (daily cycle)
   */
  static async create(userId: number, date: string) {
    const config: WorkflowConfig = {
      name: `Digital Twin: ${date}`,
      skillType: 'digital_twin',
      phases: DIGITAL_TWIN_PHASES,
      metadata: {
        date,
        userId,
        cycleType: 'daily',
      },
    };

    return await WorkflowEngine.createWorkflow(userId, config);
  }

  /**
   * Generate morning briefing
   */
  static async generateMorningBriefing(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);

    // TODO: Integrate with actual user data
    const briefing = {
      date: workflow.metadata.date,
      greeting: this.getGreeting(),
      summary: {
        tasksToday: 8,
        meetings: 3,
        deadlines: 2,
        priorities: ['Complete Project Genesis Phase 2', 'Review financial model', 'Team standup'],
      },
      insights: [
        'You have 3 high-priority tasks due today',
        'Your Project Genesis workflow is 40% complete',
        'Financial modeling workflow needs attention',
      ],
      recommendations: [
        'Focus on Project Genesis tasks first',
        'Block 2 hours for deep work',
        'Review meeting agenda before 10am',
      ],
      weather: 'Sunny, 72°F', // FUTURE: Integrate weather API
      news: [
        'Market update: Tech stocks up 2%',
        'Industry news: New AI regulations announced',
      ],
      generatedAt: new Date().toISOString(),
    };

    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);
    const briefingStep = steps.find(s => s.stepName === 'Morning Briefing');

    if (briefingStep) {
      await WorkflowEngine.completeStep(workflowId, briefingStep.id, briefing);
    }

    return briefing;
  }

  /**
   * Prioritize tasks
   */
  static async prioritizeTasks(
    workflowId: string,
    tasks: Array<{
      id: number;
      title: string;
      description: string;
      deadline?: string;
      estimatedTime?: number;
    }>
  ) {
    // AI-powered task prioritization
    const prioritizedTasks = tasks.map(task => {
      // Calculate priority score based on multiple factors
      let priorityScore = 0;

      // Deadline urgency
      if (task.deadline) {
        const daysUntilDeadline = Math.ceil(
          (new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDeadline <= 1) priorityScore += 50;
        else if (daysUntilDeadline <= 3) priorityScore += 30;
        else if (daysUntilDeadline <= 7) priorityScore += 15;
      }

      // Estimated time (shorter tasks get slight boost)
      if (task.estimatedTime && task.estimatedTime <= 30) {
        priorityScore += 10;
      }

      // TODO: Add more factors (dependencies, impact, etc.)

      return {
        ...task,
        priorityScore,
        priority: priorityScore >= 50 ? 'high' : priorityScore >= 30 ? 'medium' : 'low',
      };
    });

    // Sort by priority score
    prioritizedTasks.sort((a, b) => b.priorityScore - a.priorityScore);

    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);
    const prioritizationStep = steps.find(s => s.stepName === 'Task Prioritization');

    if (prioritizationStep) {
      await WorkflowEngine.completeStep(workflowId, prioritizationStep.id, {
        tasks: prioritizedTasks,
        prioritizedAt: new Date().toISOString(),
      });
    }

    return prioritizedTasks;
  }

  /**
   * Track progress
   */
  static async trackProgress(
    workflowId: string,
    completedTasks: number[],
    notes?: string
  ) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const prioritizationStep = await WorkflowEngine.getWorkflowSteps(workflowId).then(steps =>
      steps.find(s => s.stepName === 'Task Prioritization')
    );

    const allTasks = prioritizationStep?.data?.tasks || [];
    const completedCount = completedTasks.length;
    const totalCount = allTasks.length;
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const progress = {
      completedTasks,
      completedCount,
      totalCount,
      completionRate,
      notes,
      trackedAt: new Date().toISOString(),
    };

    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);
    const trackingStep = steps.find(s => s.stepName === 'Progress Tracking');

    if (trackingStep) {
      await WorkflowEngine.completeStep(workflowId, trackingStep.id, progress);
    }

    return progress;
  }

  /**
   * Generate evening review
   */
  static async generateEveningReview(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);

    const trackingStep = steps.find(s => s.stepName === 'Progress Tracking');
    const progress = trackingStep?.data || {};

    const review = {
      date: workflow.metadata.date,
      summary: {
        tasksCompleted: progress.completedCount || 0,
        tasksTotal: progress.totalCount || 0,
        completionRate: progress.completionRate || 0,
      },
      accomplishments: [
        'Completed Project Genesis Phase 2',
        'Reviewed financial model',
        'Attended team standup',
      ],
      challenges: [
        'Financial modeling took longer than expected',
        'Meeting ran over time',
      ],
      insights: [
        'You were most productive between 9am-11am',
        'Deep work sessions were effective',
        'Consider blocking more focus time tomorrow',
      ],
      tomorrowPreview: {
        tasks: 6,
        meetings: 2,
        priorities: ['Start Phase 3', 'Client presentation', 'Code review'],
      },
      recommendations: [
        'Start with high-priority tasks first',
        'Schedule 90-minute deep work block',
        'Review presentation materials tonight',
      ],
      generatedAt: new Date().toISOString(),
    };

    const reviewStep = steps.find(s => s.stepName === 'Evening Review');

    if (reviewStep) {
      await WorkflowEngine.completeStep(workflowId, reviewStep.id, review);
    }

    return review;
  }

  /**
   * Get greeting based on time of day
   */
  private static getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  /**
   * Get Digital Twin status
   */
  static async getStatus(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);

    const completedSteps = steps.filter(s => s.status === 'completed');

    return {
      workflowId: workflow.id,
      date: workflow.metadata.date,
      status: workflow.status,
      currentStep: workflow.currentStep,
      completedSteps: completedSteps.length,
      totalSteps: steps.length,
      cycleProgress: Math.round((completedSteps.length / steps.length) * 100),
    };
  }

  /**
   * Get weekly summary
   */
  static async getWeeklySummary(userId: number, startDate: string, endDate: string) {
    // TODO: Aggregate data from multiple daily workflows
    const workflows = await WorkflowEngine.getUserWorkflows(userId, 'digital_twin');

    const weeklyData = {
      period: `${startDate} to ${endDate}`,
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      topAccomplishments: [],
      insights: [
        'Your productivity peaks in the morning',
        'You completed 85% of high-priority tasks',
        'Average focus time: 3.5 hours per day',
      ],
      recommendations: [
        'Continue blocking morning time for deep work',
        'Consider delegating low-priority tasks',
        'Schedule regular breaks to maintain energy',
      ],
      generatedAt: new Date().toISOString(),
    };

    return weeklyData;
  }
}
