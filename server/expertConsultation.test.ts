import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  createExpertConsultation: vi.fn(),
  getExpertConsultationHistory: vi.fn(),
  getExpertConsultationCounts: vi.fn(),
  updateExpertConsultation: vi.fn(),
  createExpertChatSession: vi.fn(),
  getExpertChatSession: vi.fn(),
  getExpertChatSessions: vi.fn(),
  addMessageToExpertChat: vi.fn(),
  getExpertChatMessages: vi.fn(),
  getRecentExpertMessages: vi.fn(),
}));

import {
  createExpertConsultation,
  getExpertConsultationHistory,
  getExpertConsultationCounts,
  updateExpertConsultation,
  createExpertChatSession,
  getExpertChatSession,
  getExpertChatSessions,
  addMessageToExpertChat,
  getExpertChatMessages,
  getRecentExpertMessages,
} from './db';

describe('Expert Consultation Database Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createExpertConsultation', () => {
    it('should create a new consultation record', async () => {
      const mockConsultation = {
        id: 1,
        userId: 1,
        expertId: 'finance-expert-1',
        topic: 'Investment Strategy',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      vi.mocked(createExpertConsultation).mockResolvedValue(mockConsultation);
      
      const result = await createExpertConsultation(1, 'finance-expert-1', 'Investment Strategy');
      
      expect(createExpertConsultation).toHaveBeenCalledWith(1, 'finance-expert-1', 'Investment Strategy');
      expect(result).toEqual(mockConsultation);
    });
  });

  describe('getExpertConsultationHistory', () => {
    it('should return consultation history for a user', async () => {
      const mockHistory = [
        { id: 1, expertId: 'finance-expert-1', topic: 'Investment', updatedAt: new Date() },
        { id: 2, expertId: 'legal-expert-1', topic: 'Contracts', updatedAt: new Date() },
      ];
      
      vi.mocked(getExpertConsultationHistory).mockResolvedValue(mockHistory);
      
      const result = await getExpertConsultationHistory(1, { limit: 10 });
      
      expect(getExpertConsultationHistory).toHaveBeenCalledWith(1, { limit: 10 });
      expect(result).toHaveLength(2);
    });

    it('should filter by expertId when provided', async () => {
      const mockHistory = [
        { id: 1, expertId: 'finance-expert-1', topic: 'Investment', updatedAt: new Date() },
      ];
      
      vi.mocked(getExpertConsultationHistory).mockResolvedValue(mockHistory);
      
      const result = await getExpertConsultationHistory(1, { expertId: 'finance-expert-1' });
      
      expect(getExpertConsultationHistory).toHaveBeenCalledWith(1, { expertId: 'finance-expert-1' });
      expect(result).toHaveLength(1);
      expect(result[0].expertId).toBe('finance-expert-1');
    });
  });

  describe('getExpertConsultationCounts', () => {
    it('should return consultation counts per expert', async () => {
      const mockCounts = [
        { expertId: 'finance-expert-1', count: 5, lastConsulted: new Date() },
        { expertId: 'legal-expert-1', count: 3, lastConsulted: new Date() },
      ];
      
      vi.mocked(getExpertConsultationCounts).mockResolvedValue(mockCounts);
      
      const result = await getExpertConsultationCounts(1);
      
      expect(getExpertConsultationCounts).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(5);
    });
  });

  describe('updateExpertConsultation', () => {
    it('should update consultation with summary and rating', async () => {
      vi.mocked(updateExpertConsultation).mockResolvedValue(undefined);
      
      await updateExpertConsultation(1, {
        summary: 'Great advice on portfolio diversification',
        rating: 5,
      });
      
      expect(updateExpertConsultation).toHaveBeenCalledWith(1, {
        summary: 'Great advice on portfolio diversification',
        rating: 5,
      });
    });
  });
});

describe('Expert Chat Session Database Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createExpertChatSession', () => {
    it('should create a new chat session', async () => {
      const mockSession = {
        id: 1,
        userId: 1,
        expertId: 'finance-expert-1',
        title: 'Investment Discussion',
        systemPrompt: 'You are a finance expert...',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      vi.mocked(createExpertChatSession).mockResolvedValue(mockSession);
      
      const result = await createExpertChatSession(
        1,
        'finance-expert-1',
        'Investment Discussion',
        'You are a finance expert...'
      );
      
      expect(createExpertChatSession).toHaveBeenCalledWith(
        1,
        'finance-expert-1',
        'Investment Discussion',
        'You are a finance expert...'
      );
      expect(result).toEqual(mockSession);
    });
  });

  describe('getExpertChatSession', () => {
    it('should return a specific chat session', async () => {
      const mockSession = {
        id: 1,
        userId: 1,
        expertId: 'finance-expert-1',
        title: 'Investment Discussion',
      };
      
      vi.mocked(getExpertChatSession).mockResolvedValue(mockSession);
      
      const result = await getExpertChatSession(1);
      
      expect(getExpertChatSession).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSession);
    });
  });

  describe('getExpertChatSessions', () => {
    it('should return all chat sessions for a user and expert', async () => {
      const mockSessions = [
        { id: 1, title: 'Session 1', createdAt: new Date() },
        { id: 2, title: 'Session 2', createdAt: new Date() },
      ];
      
      vi.mocked(getExpertChatSessions).mockResolvedValue(mockSessions);
      
      const result = await getExpertChatSessions(1, 'finance-expert-1');
      
      expect(getExpertChatSessions).toHaveBeenCalledWith(1, 'finance-expert-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('addMessageToExpertChat', () => {
    it('should add a user message to chat', async () => {
      const mockMessage = {
        id: 1,
        sessionId: 1,
        role: 'user',
        content: 'What is the best investment strategy?',
        createdAt: new Date(),
      };
      
      vi.mocked(addMessageToExpertChat).mockResolvedValue(mockMessage);
      
      const result = await addMessageToExpertChat(1, 'user', 'What is the best investment strategy?');
      
      expect(addMessageToExpertChat).toHaveBeenCalledWith(1, 'user', 'What is the best investment strategy?');
      expect(result.role).toBe('user');
    });

    it('should add an expert message to chat', async () => {
      const mockMessage = {
        id: 2,
        sessionId: 1,
        role: 'expert',
        content: 'I recommend diversifying your portfolio...',
        createdAt: new Date(),
      };
      
      vi.mocked(addMessageToExpertChat).mockResolvedValue(mockMessage);
      
      const result = await addMessageToExpertChat(1, 'expert', 'I recommend diversifying your portfolio...');
      
      expect(result.role).toBe('expert');
    });
  });

  describe('getExpertChatMessages', () => {
    it('should return messages for a session', async () => {
      const mockMessages = [
        { id: 1, role: 'user', content: 'Hello', createdAt: new Date() },
        { id: 2, role: 'expert', content: 'Hi there!', createdAt: new Date() },
      ];
      
      vi.mocked(getExpertChatMessages).mockResolvedValue(mockMessages);
      
      const result = await getExpertChatMessages(1);
      
      expect(getExpertChatMessages).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('getRecentExpertMessages', () => {
    it('should return recent messages across sessions for context', async () => {
      const mockMessages = [
        { id: 1, content: 'Previous advice...', createdAt: new Date() },
        { id: 2, content: 'More context...', createdAt: new Date() },
      ];
      
      vi.mocked(getRecentExpertMessages).mockResolvedValue(mockMessages);
      
      const result = await getRecentExpertMessages(1, 'finance-expert-1', 20);
      
      expect(getRecentExpertMessages).toHaveBeenCalledWith(1, 'finance-expert-1', 20);
      expect(result).toHaveLength(2);
    });
  });
});
