import { getDb } from '../db';
import { desc, eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger';

const log = logger.module('ProjectGenesisAggregation');

export interface AggregatedProject {
  id: number;
  name: string;
  description?: string;
  status: string;
  phase: string;
  progress: number;
  startDate?: Date;
  targetDate?: Date;
  lastUpdated: Date;
  keyMilestones?: any[];
  risks?: any[];
  nextActions?: string[];
}

export interface ProjectGenesisSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projects: AggregatedProject[];
  upcomingMilestones: any[];
  criticalRisks: any[];
}

export class ProjectGenesisAggregationService {
  
  /**
   * Get all projects for a user
   */
  async getProjects(userId: string): Promise<AggregatedProject[]> {
    const db = await getDb();
    if (!db) {
      log.error('Database not available');
      return [];
    }
    
    try {
      // Check if project_genesis table exists
      const tableCheck = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'project_genesis'
        );
      `);
      
      if (!tableCheck.rows[0]?.exists) {
        log.warn('project_genesis table does not exist yet');
        return [];
      }
      
      const result = await db.execute({
        sql: `
          SELECT 
            id, project_name, description, status, current_phase, 
            progress_percentage, start_date, target_completion_date,
            updated_at, key_milestones, identified_risks, next_actions
          FROM project_genesis
          WHERE user_id = $1
          ORDER BY updated_at DESC
        `,
        args: [userId],
      });
      
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.project_name,
        description: row.description,
        status: row.status,
        phase: row.current_phase,
        progress: row.progress_percentage || 0,
        startDate: row.start_date ? new Date(row.start_date) : undefined,
        targetDate: row.target_completion_date ? new Date(row.target_completion_date) : undefined,
        lastUpdated: new Date(row.updated_at),
        keyMilestones: row.key_milestones,
        risks: row.identified_risks,
        nextActions: row.next_actions,
      }));
    } catch (error: any) {
      log.error('Failed to get projects:', error);
      return [];
    }
  }
  
  /**
   * Get Project Genesis summary
   */
  async getSummary(userId: string): Promise<ProjectGenesisSummary> {
    const projects = await this.getProjects(userId);
    
    const activeProjects = projects.filter(p => 
      p.status === 'active' || p.status === 'in_progress'
    ).length;
    
    const completedProjects = projects.filter(p => 
      p.status === 'completed'
    ).length;
    
    // Extract upcoming milestones
    const upcomingMilestones: any[] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    for (const project of projects) {
      if (project.keyMilestones && Array.isArray(project.keyMilestones)) {
        for (const milestone of project.keyMilestones) {
          if (milestone.dueDate) {
            const dueDate = new Date(milestone.dueDate);
            if (dueDate >= now && dueDate <= thirtyDaysFromNow) {
              upcomingMilestones.push({
                ...milestone,
                projectName: project.name,
                projectId: project.id,
              });
            }
          }
        }
      }
    }
    
    // Sort milestones by due date
    upcomingMilestones.sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    
    // Extract critical risks
    const criticalRisks: any[] = [];
    for (const project of projects) {
      if (project.risks && Array.isArray(project.risks)) {
        for (const risk of project.risks) {
          if (risk.severity === 'high' || risk.severity === 'critical') {
            criticalRisks.push({
              ...risk,
              projectName: project.name,
              projectId: project.id,
            });
          }
        }
      }
    }
    
    return {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      projects,
      upcomingMilestones,
      criticalRisks,
    };
  }
  
  /**
   * Get context for Chief of Staff
   */
  async getContext(userId: string): Promise<string> {
    const summary = await this.getSummary(userId);
    
    if (summary.totalProjects === 0) {
      return 'No projects in Project Genesis yet.';
    }
    
    const context = `
## Project Genesis

**Total Projects:** ${summary.totalProjects}
**Active Projects:** ${summary.activeProjects}
**Completed Projects:** ${summary.completedProjects}

**Active Projects:**
${summary.projects
  .filter(p => p.status === 'active' || p.status === 'in_progress')
  .map(project => `
- **${project.name}**
  Status: ${project.status} | Phase: ${project.phase} | Progress: ${project.progress}%
  ${project.targetDate ? `Target Date: ${project.targetDate.toLocaleDateString()}` : ''}
  ${project.description ? `Description: ${project.description}` : ''}
  ${project.nextActions && project.nextActions.length > 0 ? `Next Actions: ${project.nextActions.join(', ')}` : ''}
`).join('\n') || '(none)'}

**Upcoming Milestones (Next 30 Days):**
${summary.upcomingMilestones.slice(0, 5).map(m => `
- **${m.name}** (${m.projectName})
  Due: ${new Date(m.dueDate).toLocaleDateString()}
  ${m.description ? `Description: ${m.description}` : ''}
`).join('\n') || '(none)'}

**Critical Risks:**
${summary.criticalRisks.slice(0, 5).map(r => `
- **${r.name}** (${r.projectName})
  Severity: ${r.severity}
  ${r.description ? `Description: ${r.description}` : ''}
  ${r.mitigation ? `Mitigation: ${r.mitigation}` : ''}
`).join('\n') || '(none)'}
`;
    
    return context.trim();
  }
}

export const projectGenesisAggregationService = new ProjectGenesisAggregationService();
