/**
 * Expert Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { expertService } from './expert.service';
import * as expertRepository from './expert.repository';

vi.mock('./expert.repository');

describe('ExpertService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createChatSession', () => {
    it('should create a new chat session', async () => {
      const mockSession = {
        id: 1,
        userId: 1,
        expertId: 'cto',
        expertName: 'Chief Technology Officer',
        status: 'active' as const,
        createdAt: new Date(),
      };

      vi.spyOn(expertRepository, 'createChatSession').mockResolvedValue(mockSession);

      const result = await expertService.createChatSession(1, {
        expertId: 'cto',
        expertName: 'Chief Technology Officer',
        systemPrompt: 'You are a CTO',
      });

      expect(result).toEqual(mockSession);
      expect(expertRepository.createChatSession).toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should send a message in a chat session', async () => {
      const mockMessage = {
        id: 1,
        sessionId: 1,
        role: 'user' as const,
        content: 'Hello',
        createdAt: new Date(),
      };

      vi.spyOn(expertRepository, 'createMessage').mockResolvedValue(mockMessage);

      const result = await expertService.sendMessage(1, {
        sessionId: 1,
        message: 'Hello',
        expertId: 'cto',
        expertData: {},
      });

      expect(result).toEqual(mockMessage);
    });
  });

  describe('getChatHistory', () => {
    it('should return chat history for a session', async () => {
      const mockHistory = [
        { id: 1, role: 'user' as const, content: 'Hello', createdAt: new Date() },
        { id: 2, role: 'assistant' as const, content: 'Hi!', createdAt: new Date() },
      ];

      vi.spyOn(expertRepository, 'getChatHistory').mockResolvedValue(mockHistory as any);

      const result = await expertService.getChatHistory(1);

      expect(result).toEqual(mockHistory);
    });
  });

  describe('getExpertPerformance', () => {
    it('should calculate expert performance metrics', async () => {
      const mockData = {
        totalSessions: 10,
        averageScore: 4.5,
        totalProjects: 5,
      };

      vi.spyOn(expertRepository, 'getExpertStats').mockResolvedValue(mockData);

      const result = await expertService.getExpertPerformance('cto');

      expect(result).toHaveProperty('totalSessions');
      expect(result).toHaveProperty('averageScore');
    });
  });
});
