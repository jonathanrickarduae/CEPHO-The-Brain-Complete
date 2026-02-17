/**
 * Project Service Module
 * 
 * Exports all project-related services, repositories, and types.
 */

export { ProjectService, projectService } from './project.service';
export { ProjectRepository } from './project.repository';
export type {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectDto,
  ProjectStatsDto,
  ProjectFilterDto,
} from './project.types';
