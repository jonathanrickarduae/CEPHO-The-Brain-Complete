/**
 * Project Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { projectService } from './project.service';
import * as projectRepository from './project.repository';

vi.mock('./project.repository');

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const mockProject = {
        id: 1,
        userId: 1,
        name: 'Test Project',
        description: 'Test Description',
        status: 'not_started' as const,
        priority: 'medium' as const,
        progress: 0,
        createdAt: new Date(),
      };

      vi.spyOn(projectRepository, 'createProject').mockResolvedValue(mockProject);

      const result = await projectService.createProject(1, {
        name: 'Test Project',
        description: 'Test Description',
      });

      expect(result).toEqual(mockProject);
    });
  });

  describe('updateProject', () => {
    it('should update project progress', async () => {
      const mockProject = {
        id: 1,
        progress: 50,
        status: 'in_progress' as const,
      };

      vi.spyOn(projectRepository, 'updateProject').mockResolvedValue(mockProject as any);

      const result = await projectService.updateProject(1, { progress: 50 });

      expect(result.progress).toBe(50);
    });
  });

  describe('getProjectsByStatus', () => {
    it('should return projects filtered by status', async () => {
      const mockProjects = [
        { id: 1, status: 'in_progress' as const },
        { id: 2, status: 'in_progress' as const },
      ];

      vi.spyOn(projectRepository, 'getProjectsByStatus').mockResolvedValue(mockProjects as any);

      const result = await projectService.getProjectsByStatus(1, 'in_progress');

      expect(result).toHaveLength(2);
    });
  });
});
