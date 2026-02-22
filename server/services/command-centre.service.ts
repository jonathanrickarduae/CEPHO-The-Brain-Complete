import { db } from "../db";
import { projects, tasks, experts } from "../db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

interface CommandCentreContext {
  emails: {
    unread: number;
    highPriority: number;
  };
  tasks: {
    dueToday: number;
    overdue: number;
  };
  projects: {
    active: number;
    atRisk: number;
  };
  articles: {
    new: number;
    trending: number;
  };
  documents: {
    total: number;
    recent: number;
  };
  alerts: Array<{
    title: string;
    message: string;
  }>;
}

interface CommandCentreBriefing {
  topPriorities: Array<{
    title: string;
    description: string;
    details: string;
    urgency: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    action: string;
  }>;
}

/**
 * Get Command Centre context data from real sources
 */
export async function getCommandCentreContext(userId: number): Promise<CommandCentreContext> {
  try {
    // Get user's projects
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId));
    
    // Get user's tasks
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Calculate metrics
    const context: CommandCentreContext = {
      emails: {
        unread: 0, // Would come from email integration API
        highPriority: 0, // Would come from email integration API
      },
      tasks: {
        dueToday: userTasks.filter(t => {
          if (!t.dueDate || t.status === 'completed') return false;
          const dueDate = new Date(t.dueDate);
          return dueDate >= today && dueDate < tomorrow;
        }).length,
        overdue: userTasks.filter(t => {
          if (!t.dueDate || t.status === 'completed') return false;
          return new Date(t.dueDate) < today;
        }).length,
      },
      projects: {
        active: userProjects.filter(p => p.status === 'active').length,
        atRisk: userProjects.filter(p => p.isAtRisk).length,
      },
      articles: {
        new: 0, // Would come from content aggregation API
        trending: 0, // Would come from content aggregation API
      },
      documents: {
        total: 0, // Would come from library/document API
        recent: 0, // Would come from library/document API
      },
      alerts: [],
    };
    
    // Generate alerts based on data
    if (context.tasks.overdue > 0) {
      context.alerts.push({
        title: 'Overdue Tasks',
        message: `You have ${context.tasks.overdue} overdue task${context.tasks.overdue > 1 ? 's' : ''} requiring attention`,
      });
    }
    
    if (context.projects.atRisk > 0) {
      context.alerts.push({
        title: 'Projects At Risk',
        message: `${context.projects.atRisk} project${context.projects.atRisk > 1 ? 's are' : ' is'} at risk and needs review`,
      });
    }
    
    if (context.tasks.dueToday > 3) {
      context.alerts.push({
        title: 'Heavy Workload Today',
        message: `You have ${context.tasks.dueToday} tasks due today. Consider reprioritizing.`,
      });
    }
    
    return context;
  } catch (error) {
    console.error('Error getting command centre context:', error);
    throw error;
  }
}

/**
 * Generate morning briefing with priorities and recommendations
 */
export async function getCommandCentreBriefing(userId: number): Promise<CommandCentreBriefing> {
  try {
    // Get user's tasks
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));
    
    // Get user's projects
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId));
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get high-priority tasks
    const highPriorityTasks = userTasks
      .filter(t => t.status !== 'completed' && (t.priority === 'high' || t.priority === 'urgent'))
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 3);
    
    // Convert tasks to priorities
    const topPriorities = highPriorityTasks.map(task => {
      const project = userProjects.find(p => p.id === task.projectId);
      return {
        title: task.title,
        description: task.description || 'No description provided',
        details: project ? `Part of ${project.name} project` : 'Standalone task',
        urgency: (task.priority === 'urgent' || task.priority === 'high') ? 'high' as const : 'medium' as const,
      };
    });
    
    // If less than 3 priorities, add project-based priorities
    if (topPriorities.length < 3) {
      const atRiskProjects = userProjects.filter(p => p.isAtRisk);
      for (const project of atRiskProjects.slice(0, 3 - topPriorities.length)) {
        topPriorities.push({
          title: `Review ${project.name}`,
          description: 'Project is at risk and requires attention',
          details: 'Check project status, blockers, and timeline',
          urgency: 'high' as const,
        });
      }
    }
    
    // Generate recommendations
    const recommendations: CommandCentreBriefing['recommendations'] = [];
    
    const overdueTasks = userTasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < today;
    });
    
    if (overdueTasks.length > 0) {
      recommendations.push({
        title: 'Address Overdue Tasks',
        description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider rescheduling or delegating.`,
        action: 'Review Tasks',
      });
    }
    
    const todayTasks = userTasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
    
    if (todayTasks.length > 5) {
      recommendations.push({
        title: 'Heavy Workload Today',
        description: `You have ${todayTasks.length} tasks due today. Consider prioritizing or delegating some items.`,
        action: 'Prioritize Tasks',
      });
    }
    
    const activeProjects = userProjects.filter(p => p.status === 'active');
    if (activeProjects.length > 8) {
      recommendations.push({
        title: 'Project Portfolio Review',
        description: `You're managing ${activeProjects.length} active projects. Consider a portfolio review.`,
        action: 'Review Portfolio',
      });
    }
    
    // Add time management recommendation
    recommendations.push({
      title: 'Schedule Strategic Time',
      description: 'Block time for strategic planning and high-priority work',
      action: 'Add to Calendar',
    });
    
    return {
      topPriorities,
      recommendations,
    };
  } catch (error) {
    console.error('Error generating command centre briefing:', error);
    throw error;
  }
}
