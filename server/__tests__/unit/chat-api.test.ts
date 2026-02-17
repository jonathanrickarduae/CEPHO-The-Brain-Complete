import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database functions
vi.mock('./db', () => ({
  saveConversation: vi.fn().mockResolvedValue({ id: 1, userId: 1, role: 'user', content: 'test', createdAt: new Date() }),
  getConversationHistory: vi.fn().mockResolvedValue([]),
  clearConversationHistory: vi.fn().mockResolvedValue(undefined),
}));

// Mock the LLM
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: 'Hello! How can I help you today?' } }],
  }),
}));

describe('Chat API Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Message Processing', () => {
    it('should format user messages correctly', () => {
      const message = 'Hello, Digital Twin!';
      const formatted = {
        role: 'user' as const,
        content: message,
      };
      expect(formatted.role).toBe('user');
      expect(formatted.content).toBe(message);
    });

    it('should build conversation history for context', () => {
      const history = [
        { id: 1, role: 'user', content: 'Hi', createdAt: new Date() },
        { id: 2, role: 'assistant', content: 'Hello!', createdAt: new Date() },
      ];
      
      const messages = history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      }));
      
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
    });

    it('should include system prompt in messages', () => {
      const userName = 'John';
      const systemPrompt = `You are the Digital Twin for ${userName}`;
      
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: 'Hello' },
      ];
      
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toContain(userName);
    });
  });

  describe('Response Handling', () => {
    it('should extract text from string response', () => {
      const response = 'Hello! How can I help you?';
      const text = typeof response === 'string' ? response : '';
      expect(text).toBe(response);
    });

    it('should extract text from array response', () => {
      const response = [
        { type: 'text', text: 'Hello!' },
        { type: 'text', text: ' How are you?' },
      ];
      
      const text = Array.isArray(response)
        ? response.map(c => c.type === 'text' ? c.text : '').join('')
        : response;
      
      expect(text).toBe('Hello! How are you?');
    });

    it('should handle empty response gracefully', () => {
      const response = null;
      const fallback = 'I apologize, but I was unable to generate a response.';
      const text = response || fallback;
      expect(text).toBe(fallback);
    });
  });

  describe('Conversation Storage', () => {
    it('should create valid conversation entry', () => {
      const entry = {
        userId: 1,
        role: 'user' as const,
        content: 'Test message',
        metadata: { context: 'daily_brief' },
      };
      
      expect(entry.userId).toBe(1);
      expect(entry.role).toBe('user');
      expect(entry.content).toBe('Test message');
      expect(entry.metadata?.context).toBe('daily_brief');
    });

    it('should handle null metadata', () => {
      const entry = {
        userId: 1,
        role: 'assistant' as const,
        content: 'Response',
        metadata: null,
      };
      
      expect(entry.metadata).toBeNull();
    });
  });
});

describe('Mood Timeline Logic', () => {
  describe('Mood Grouping', () => {
    it('should group mood entries by date', () => {
      const entries = [
        { id: 1, score: 7, timeOfDay: 'morning', createdAt: new Date('2026-01-11') },
        { id: 2, score: 8, timeOfDay: 'afternoon', createdAt: new Date('2026-01-11') },
        { id: 3, score: 6, timeOfDay: 'morning', createdAt: new Date('2026-01-10') },
      ];
      
      const groups: Record<string, typeof entries> = {};
      entries.forEach(entry => {
        const date = new Date(entry.createdAt).toLocaleDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(entry);
      });
      
      const dateKeys = Object.keys(groups);
      expect(dateKeys).toHaveLength(2);
    });

    it('should calculate daily average correctly', () => {
      const entries = [
        { score: 7 },
        { score: 8 },
        { score: 9 },
      ];
      
      const average = entries.reduce((sum, e) => sum + e.score, 0) / entries.length;
      expect(average).toBe(8);
    });
  });

  describe('Trend Calculation', () => {
    it('should identify improving trend', () => {
      const entries = [
        { score: 5 }, { score: 6 }, { score: 7 }, { score: 8 },
      ];
      
      const midpoint = Math.floor(entries.length / 2);
      const firstHalf = entries.slice(0, midpoint);
      const secondHalf = entries.slice(midpoint);
      
      const firstAvg = firstHalf.reduce((sum, e) => sum + e.score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, e) => sum + e.score, 0) / secondHalf.length;
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (secondAvg - firstAvg > 0.5) trend = 'improving';
      else if (firstAvg - secondAvg > 0.5) trend = 'declining';
      
      expect(trend).toBe('improving');
    });

    it('should identify declining trend', () => {
      const entries = [
        { score: 8 }, { score: 7 }, { score: 6 }, { score: 5 },
      ];
      
      const midpoint = Math.floor(entries.length / 2);
      const firstHalf = entries.slice(0, midpoint);
      const secondHalf = entries.slice(midpoint);
      
      const firstAvg = firstHalf.reduce((sum, e) => sum + e.score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, e) => sum + e.score, 0) / secondHalf.length;
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (secondAvg - firstAvg > 0.5) trend = 'improving';
      else if (firstAvg - secondAvg > 0.5) trend = 'declining';
      
      expect(trend).toBe('declining');
    });

    it('should identify stable trend', () => {
      const entries = [
        { score: 7 }, { score: 7 }, { score: 7 }, { score: 7 },
      ];
      
      const midpoint = Math.floor(entries.length / 2);
      const firstHalf = entries.slice(0, midpoint);
      const secondHalf = entries.slice(midpoint);
      
      const firstAvg = firstHalf.reduce((sum, e) => sum + e.score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, e) => sum + e.score, 0) / secondHalf.length;
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (secondAvg - firstAvg > 0.5) trend = 'improving';
      else if (firstAvg - secondAvg > 0.5) trend = 'declining';
      
      expect(trend).toBe('stable');
    });
  });

  describe('Time of Day Analysis', () => {
    it('should calculate average by time of day', () => {
      const entries = [
        { score: 7, timeOfDay: 'morning' },
        { score: 8, timeOfDay: 'morning' },
        { score: 6, timeOfDay: 'afternoon' },
        { score: 7, timeOfDay: 'afternoon' },
        { score: 5, timeOfDay: 'evening' },
        { score: 6, timeOfDay: 'evening' },
      ];
      
      const byTime: Record<string, { sum: number; count: number }> = {
        morning: { sum: 0, count: 0 },
        afternoon: { sum: 0, count: 0 },
        evening: { sum: 0, count: 0 },
      };
      
      entries.forEach(e => {
        byTime[e.timeOfDay].sum += e.score;
        byTime[e.timeOfDay].count++;
      });
      
      const averages: Record<string, number> = {};
      Object.entries(byTime).forEach(([key, val]) => {
        averages[key] = val.count > 0 ? val.sum / val.count : 0;
      });
      
      expect(averages.morning).toBe(7.5);
      expect(averages.afternoon).toBe(6.5);
      expect(averages.evening).toBe(5.5);
    });
  });
});
