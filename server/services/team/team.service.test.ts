/**
 * Team Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { teamService } from './team.service';
import * as teamRepository from './team.repository';

vi.mock('./team.repository');

describe('TeamService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create a new team', async () => {
      const mockTeam = {
        id: 1,
        name: 'Dev Team',
        description: 'Development team',
        createdAt: new Date(),
      };

      vi.spyOn(teamRepository, 'createTeam').mockResolvedValue(mockTeam as any);

      const result = await teamService.createTeam(1, {
        name: 'Dev Team',
        description: 'Development team',
      });

      expect(result).toEqual(mockTeam);
    });
  });

  describe('addMember', () => {
    it('should add member to team', async () => {
      const mockMember = {
        id: 1,
        teamId: 1,
        userId: 2,
        role: 'member' as const,
        joinedAt: new Date(),
      };

      vi.spyOn(teamRepository, 'addMember').mockResolvedValue(mockMember as any);

      const result = await teamService.addMember(1, {
        userId: 2,
        role: 'member',
      });

      expect(result).toEqual(mockMember);
    });
  });

  describe('getTeamMembers', () => {
    it('should return team members', async () => {
      const mockMembers = [
        { id: 1, role: 'owner' as const },
        { id: 2, role: 'member' as const },
      ];

      vi.spyOn(teamRepository, 'getTeamMembers').mockResolvedValue(mockMembers as any);

      const result = await teamService.getTeamMembers(1);

      expect(result).toHaveLength(2);
    });
  });
});
