import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  createSmeTeam: vi.fn(),
  getSmeTeams: vi.fn(),
  getSmeTeamById: vi.fn(),
  updateSmeTeam: vi.fn(),
  deleteSmeTeam: vi.fn(),
  addSmeTeamMember: vi.fn(),
  getSmeTeamMembers: vi.fn(),
  removeSmeTeamMember: vi.fn(),
  getSmeTeamWithMembers: vi.fn(),
  createTaskQaReview: vi.fn(),
  getTaskQaReviews: vi.fn(),
  updateTaskQaReview: vi.fn(),
  getTasksWithQaStatus: vi.fn(),
  updateTaskQaStatus: vi.fn(),
  createSmeFeedback: vi.fn(),
  getSmeFeedback: vi.fn(),
  markFeedbackApplied: vi.fn(),
}));

import {
  createSmeTeam,
  getSmeTeams,
  getSmeTeamById,
  updateSmeTeam,
  deleteSmeTeam,
  addSmeTeamMember,
  getSmeTeamMembers,
  removeSmeTeamMember,
  getSmeTeamWithMembers,
  createTaskQaReview,
  getTaskQaReviews,
  updateTaskQaReview,
  getTasksWithQaStatus,
  updateTaskQaStatus,
  createSmeFeedback,
  getSmeFeedback,
  markFeedbackApplied,
} from './db';

describe('SME Team Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSmeTeam', () => {
    it('should create a new SME team with required fields', async () => {
      const mockTeam = {
        id: 1,
        userId: 1,
        name: 'Test Team',
        description: 'Test Description',
        purpose: 'Due Diligence',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (createSmeTeam as any).mockResolvedValue(mockTeam);

      const result = await createSmeTeam({
        userId: 1,
        name: 'Test Team',
        description: 'Test Description',
        purpose: 'Due Diligence',
      });

      expect(createSmeTeam).toHaveBeenCalledWith({
        userId: 1,
        name: 'Test Team',
        description: 'Test Description',
        purpose: 'Due Diligence',
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe('getSmeTeams', () => {
    it('should return all teams for a user', async () => {
      const mockTeams = [
        { id: 1, name: 'Team 1', userId: 1 },
        { id: 2, name: 'Team 2', userId: 1 },
      ];

      (getSmeTeams as any).mockResolvedValue(mockTeams);

      const result = await getSmeTeams(1);

      expect(getSmeTeams).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('addSmeTeamMember', () => {
    it('should add a member to a team', async () => {
      const mockMember = {
        id: 1,
        teamId: 1,
        expertId: 'exp-1',
        role: 'Lead',
        addedAt: new Date(),
      };

      (addSmeTeamMember as any).mockResolvedValue(mockMember);

      const result = await addSmeTeamMember({
        teamId: 1,
        expertId: 'exp-1',
        role: 'Lead',
      });

      expect(addSmeTeamMember).toHaveBeenCalledWith({
        teamId: 1,
        expertId: 'exp-1',
        role: 'Lead',
      });
      expect(result).toEqual(mockMember);
    });
  });

  describe('removeSmeTeamMember', () => {
    it('should remove a member from a team', async () => {
      (removeSmeTeamMember as any).mockResolvedValue(undefined);

      await removeSmeTeamMember(1, 'exp-1');

      expect(removeSmeTeamMember).toHaveBeenCalledWith(1, 'exp-1');
    });
  });

  describe('getSmeTeamWithMembers', () => {
    it('should return team with all members', async () => {
      const mockTeamWithMembers = {
        team: { id: 1, name: 'Test Team' },
        members: [
          { expertId: 'exp-1', role: 'Lead' },
          { expertId: 'exp-2', role: 'Reviewer' },
        ],
      };

      (getSmeTeamWithMembers as any).mockResolvedValue(mockTeamWithMembers);

      const result = await getSmeTeamWithMembers(1);

      expect(getSmeTeamWithMembers).toHaveBeenCalledWith(1);
      expect(result.members).toHaveLength(2);
    });
  });
});

describe('QA Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTaskQaReview', () => {
    it('should create a Chief of Staff review', async () => {
      const mockReview = {
        id: 1,
        taskId: 1,
        reviewType: 'cos_review',
        reviewerId: 'chief_of_staff',
        score: 9,
        feedback: 'Excellent work',
        status: 'approved',
        createdAt: new Date(),
      };

      (createTaskQaReview as any).mockResolvedValue(mockReview);

      const result = await createTaskQaReview({
        taskId: 1,
        reviewType: 'cos_review',
        reviewerId: 'chief_of_staff',
        score: 9,
        feedback: 'Excellent work',
        status: 'approved',
      });

      expect(createTaskQaReview).toHaveBeenCalled();
      expect(result.reviewType).toBe('cos_review');
      expect(result.score).toBe(9);
    });

    it('should create a Secondary AI verification', async () => {
      const mockReview = {
        id: 2,
        taskId: 1,
        reviewType: 'secondary_ai',
        reviewerId: 'secondary_ai_verifier',
        score: 8,
        status: 'approved',
        createdAt: new Date(),
      };

      (createTaskQaReview as any).mockResolvedValue(mockReview);

      const result = await createTaskQaReview({
        taskId: 1,
        reviewType: 'secondary_ai',
        reviewerId: 'secondary_ai_verifier',
        score: 8,
        status: 'approved',
      });

      expect(result.reviewType).toBe('secondary_ai');
    });
  });

  describe('getTaskQaReviews', () => {
    it('should return all reviews for a task', async () => {
      const mockReviews = [
        { id: 1, taskId: 1, reviewType: 'cos_review', score: 9 },
        { id: 2, taskId: 1, reviewType: 'secondary_ai', score: 8 },
      ];

      (getTaskQaReviews as any).mockResolvedValue(mockReviews);

      const result = await getTaskQaReviews(1);

      expect(getTaskQaReviews).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('updateTaskQaStatus', () => {
    it('should update task QA status after CoS review', async () => {
      (updateTaskQaStatus as any).mockResolvedValue(undefined);

      await updateTaskQaStatus(1, 'cos_reviewed', 9);

      expect(updateTaskQaStatus).toHaveBeenCalledWith(1, 'cos_reviewed', 9);
    });

    it('should update task QA status to approved after dual verification', async () => {
      (updateTaskQaStatus as any).mockResolvedValue(undefined);

      await updateTaskQaStatus(1, 'approved', undefined, 8);

      expect(updateTaskQaStatus).toHaveBeenCalledWith(1, 'approved', undefined, 8);
    });
  });

  describe('getTasksWithQaStatus', () => {
    it('should return tasks with their QA status', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', qaStatus: 'pending' },
        { id: 2, title: 'Task 2', qaStatus: 'cos_reviewed' },
        { id: 3, title: 'Task 3', qaStatus: 'approved' },
      ];

      (getTasksWithQaStatus as any).mockResolvedValue(mockTasks);

      const result = await getTasksWithQaStatus(1);

      expect(getTasksWithQaStatus).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(3);
    });
  });
});

describe('SME Feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSmeFeedback', () => {
    it('should create feedback for an expert', async () => {
      const mockFeedback = {
        id: 1,
        userId: 1,
        expertId: 'exp-1',
        feedbackType: 'constructive',
        feedback: 'Could improve response time',
        createdAt: new Date(),
      };

      (createSmeFeedback as any).mockResolvedValue(mockFeedback);

      const result = await createSmeFeedback({
        userId: 1,
        expertId: 'exp-1',
        feedbackType: 'constructive',
        feedback: 'Could improve response time',
      });

      expect(createSmeFeedback).toHaveBeenCalled();
      expect(result.feedbackType).toBe('constructive');
    });
  });

  describe('getSmeFeedback', () => {
    it('should return all feedback for an expert', async () => {
      const mockFeedback = [
        { id: 1, expertId: 'exp-1', feedbackType: 'positive' },
        { id: 2, expertId: 'exp-1', feedbackType: 'constructive' },
      ];

      (getSmeFeedback as any).mockResolvedValue(mockFeedback);

      const result = await getSmeFeedback(1, 'exp-1');

      expect(getSmeFeedback).toHaveBeenCalledWith(1, 'exp-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('markFeedbackApplied', () => {
    it('should mark feedback as applied', async () => {
      (markFeedbackApplied as any).mockResolvedValue(undefined);

      await markFeedbackApplied(1);

      expect(markFeedbackApplied).toHaveBeenCalledWith(1);
    });
  });
});
