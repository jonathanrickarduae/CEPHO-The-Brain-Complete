/**
 * Project Service Types and DTOs
 * 
 * Data Transfer Objects for project management services.
 */

/**
 * DTO for creating a project
 */
export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: 'not_started' | 'in_progress' | 'blocked' | 'review' | 'complete';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: Date;
  assignedExperts?: string[];
  metadata?: Record<string, any>;
}

/**
 * DTO for updating a project
 */
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: 'not_started' | 'in_progress' | 'blocked' | 'review' | 'complete';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  progress?: number;
  dueDate?: Date;
  blockerDescription?: string;
  assignedExperts?: string[];
  metadata?: Record<string, any>;
}

/**
 * DTO for project response
 */
export interface ProjectDto {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'blocked' | 'review' | 'complete';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  dueDate: Date | null;
  blockerDescription: string | null;
  assignedExperts: string[] | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for project statistics
 */
export interface ProjectStatsDto {
  total: number;
  notStarted: number;
  inProgress: number;
  blocked: number;
  review: number;
  complete: number;
  overdue: number;
}

/**
 * DTO for project filter options
 */
export interface ProjectFilterDto {
  status?: 'not_started' | 'in_progress' | 'blocked' | 'review' | 'complete';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedExpert?: string;
}
