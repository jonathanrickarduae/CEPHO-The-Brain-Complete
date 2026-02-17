import { ProjectRepository } from './project.repository';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectDto,
  ProjectStatsDto,
  ProjectFilterDto,
} from './project.types';
import { logger } from '../../utils/logger';

const log = logger.module('ProjectService');

/**
 * Project Service
 * 
 * Handles business logic for project management:
 * - Creating and managing projects
 * - Tracking progress and status
 * - Managing blockers and priorities
 * - Project statistics and reporting
 */
export class ProjectService {
  constructor(private repository: ProjectRepository) {}

  /**
   * Create a new project
   */
  async createProject(userId: number, data: CreateProjectDto): Promise<ProjectDto> {
    // Validation
    this.validateProjectName(data.name);

    const project = await this.repository.create({
      userId,
      name: data.name,
      description: data.description || null,
      status: data.status || 'not_started',
      priority: data.priority || 'medium',
      progress: 0,
      dueDate: data.dueDate || null,
      blockerDescription: null,
      assignedExperts: data.assignedExperts ? JSON.stringify(data.assignedExperts) : null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });

    log.info({ userId, projectId: project.id, name: data.name }, 'Project created');

    return this.toDto(project);
  }

  /**
   * Get project by ID
   */
  async getProject(userId: number, projectId: number): Promise<ProjectDto | null> {
    const project = await this.repository.findById(projectId, userId);
    return project ? this.toDto(project) : null;
  }

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: number, filter?: ProjectFilterDto): Promise<ProjectDto[]> {
    let projects;

    if (filter?.status) {
      projects = await this.repository.findByStatus(userId, filter.status);
    } else if (filter?.priority) {
      projects = await this.repository.findByPriority(userId, filter.priority);
    } else {
      projects = await this.repository.findByUserId(userId);
    }

    // Filter by assigned expert if specified
    if (filter?.assignedExpert) {
      projects = projects.filter(p => {
        if (!p.assignedExperts) return false;
        const experts = typeof p.assignedExperts === 'string' 
          ? JSON.parse(p.assignedExperts) 
          : p.assignedExperts;
        return experts.includes(filter.assignedExpert);
      });
    }

    return projects.map(p => this.toDto(p));
  }

  /**
   * Get overdue projects
   */
  async getOverdueProjects(userId: number): Promise<ProjectDto[]> {
    const projects = await this.repository.findOverdue(userId);
    return projects.map(p => this.toDto(p));
  }

  /**
   * Update project
   */
  async updateProject(
    userId: number,
    projectId: number,
    data: UpdateProjectDto
  ): Promise<ProjectDto | null> {
    // Validation
    if (data.name) {
      this.validateProjectName(data.name);
    }
    if (data.progress !== undefined) {
      this.validateProgress(data.progress);
    }

    const updateData: any = { ...data };
    
    // Convert arrays to JSON strings for storage
    if (data.assignedExperts) {
      updateData.assignedExperts = JSON.stringify(data.assignedExperts);
    }
    if (data.metadata) {
      updateData.metadata = JSON.stringify(data.metadata);
    }

    const updated = await this.repository.update(projectId, userId, updateData);

    if (updated) {
      log.info({ userId, projectId, updates: Object.keys(data) }, 'Project updated');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Update project progress
   */
  async updateProgress(
    userId: number,
    projectId: number,
    progress: number
  ): Promise<ProjectDto | null> {
    this.validateProgress(progress);

    const updated = await this.repository.update(projectId, userId, {
      progress,
      // Auto-complete if progress reaches 100
      status: progress === 100 ? 'complete' : undefined,
    });

    if (updated) {
      log.info({ userId, projectId, progress }, 'Project progress updated');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Mark project as blocked
   */
  async blockProject(
    userId: number,
    projectId: number,
    blockerDescription: string
  ): Promise<ProjectDto | null> {
    const updated = await this.repository.update(projectId, userId, {
      status: 'blocked',
      blockerDescription,
    });

    if (updated) {
      log.warn({ userId, projectId, blocker: blockerDescription }, 'Project blocked');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Unblock project
   */
  async unblockProject(userId: number, projectId: number): Promise<ProjectDto | null> {
    const updated = await this.repository.update(projectId, userId, {
      status: 'in_progress',
      blockerDescription: null,
    });

    if (updated) {
      log.info({ userId, projectId }, 'Project unblocked');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Complete project
   */
  async completeProject(userId: number, projectId: number): Promise<ProjectDto | null> {
    const updated = await this.repository.update(projectId, userId, {
      status: 'complete',
      progress: 100,
    });

    if (updated) {
      log.info({ userId, projectId }, 'Project completed');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Delete project
   */
  async deleteProject(userId: number, projectId: number): Promise<boolean> {
    const deleted = await this.repository.delete(projectId, userId);

    if (deleted) {
      log.info({ userId, projectId }, 'Project deleted');
    }

    return deleted;
  }

  /**
   * Get project statistics
   */
  async getProjectStats(userId: number): Promise<ProjectStatsDto> {
    const counts = await this.repository.countByStatus(userId);
    const overdueProjects = await this.repository.findOverdue(userId);

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return {
      total,
      notStarted: counts.not_started || 0,
      inProgress: counts.in_progress || 0,
      blocked: counts.blocked || 0,
      review: counts.review || 0,
      complete: counts.complete || 0,
      overdue: overdueProjects.length,
    };
  }

  /**
   * Assign expert to project
   */
  async assignExpert(
    userId: number,
    projectId: number,
    expertId: string
  ): Promise<ProjectDto | null> {
    const project = await this.repository.findById(projectId, userId);
    if (!project) return null;

    const currentExperts = project.assignedExperts 
      ? (typeof project.assignedExperts === 'string' 
        ? JSON.parse(project.assignedExperts) 
        : project.assignedExperts)
      : [];

    if (!currentExperts.includes(expertId)) {
      currentExperts.push(expertId);
    }

    const updated = await this.repository.update(projectId, userId, {
      assignedExperts: JSON.stringify(currentExperts),
    });

    if (updated) {
      log.info({ userId, projectId, expertId }, 'Expert assigned to project');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Remove expert from project
   */
  async removeExpert(
    userId: number,
    projectId: number,
    expertId: string
  ): Promise<ProjectDto | null> {
    const project = await this.repository.findById(projectId, userId);
    if (!project) return null;

    const currentExperts = project.assignedExperts 
      ? (typeof project.assignedExperts === 'string' 
        ? JSON.parse(project.assignedExperts) 
        : project.assignedExperts)
      : [];

    const updatedExperts = currentExperts.filter((id: string) => id !== expertId);

    const updated = await this.repository.update(projectId, userId, {
      assignedExperts: JSON.stringify(updatedExperts),
    });

    if (updated) {
      log.info({ userId, projectId, expertId }, 'Expert removed from project');
    }

    return updated ? this.toDto(updated) : null;
  }

  // Private helper methods

  private validateProjectName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Project name is required');
    }
    if (name.length > 200) {
      throw new Error('Project name must be 200 characters or less');
    }
  }

  private validateProgress(progress: number): void {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
  }

  private toDto(project: any): ProjectDto {
    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      dueDate: project.dueDate,
      blockerDescription: project.blockerDescription,
      assignedExperts: project.assignedExperts 
        ? (typeof project.assignedExperts === 'string' 
          ? JSON.parse(project.assignedExperts) 
          : project.assignedExperts)
        : null,
      metadata: project.metadata 
        ? (typeof project.metadata === 'string' 
          ? JSON.parse(project.metadata) 
          : project.metadata)
        : null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}

// Export singleton instance
import { ProjectRepository as ProjectRepo } from './project.repository';
export const projectService = new ProjectService(new ProjectRepo());
