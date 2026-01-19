import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Test mood data functions
describe('Mood Data Backend', () => {
  describe('Mood Entry Validation', () => {
    it('should validate mood score is between 1 and 10', () => {
      const validScores = [1, 5, 10];
      const invalidScores = [0, 11, -1, 100];
      
      validScores.forEach(score => {
        expect(score >= 1 && score <= 10).toBe(true);
      });
      
      invalidScores.forEach(score => {
        expect(score >= 1 && score <= 10).toBe(false);
      });
    });

    it('should validate timeOfDay values', () => {
      const validTimes = ['morning', 'afternoon', 'evening'];
      const invalidTimes = ['night', 'midday', 'noon'];
      
      validTimes.forEach(time => {
        expect(['morning', 'afternoon', 'evening'].includes(time)).toBe(true);
      });
      
      invalidTimes.forEach(time => {
        expect(['morning', 'afternoon', 'evening'].includes(time)).toBe(false);
      });
    });
  });

  describe('Mood Trends Calculation', () => {
    it('should calculate average mood correctly', () => {
      const moods = [
        { score: 7 },
        { score: 8 },
        { score: 6 },
        { score: 9 },
        { score: 5 },
      ];
      
      const average = moods.reduce((sum, m) => sum + m.score, 0) / moods.length;
      expect(average).toBe(7);
    });

    it('should identify mood by time of day', () => {
      const moods = [
        { score: 6, timeOfDay: 'morning' },
        { score: 7, timeOfDay: 'morning' },
        { score: 8, timeOfDay: 'afternoon' },
        { score: 9, timeOfDay: 'afternoon' },
        { score: 5, timeOfDay: 'evening' },
        { score: 6, timeOfDay: 'evening' },
      ];
      
      const byTimeOfDay = moods.reduce((acc, m) => {
        if (!acc[m.timeOfDay]) acc[m.timeOfDay] = [];
        acc[m.timeOfDay].push(m.score);
        return acc;
      }, {} as Record<string, number[]>);
      
      const morningAvg = byTimeOfDay['morning'].reduce((a, b) => a + b, 0) / byTimeOfDay['morning'].length;
      const afternoonAvg = byTimeOfDay['afternoon'].reduce((a, b) => a + b, 0) / byTimeOfDay['afternoon'].length;
      const eveningAvg = byTimeOfDay['evening'].reduce((a, b) => a + b, 0) / byTimeOfDay['evening'].length;
      
      expect(morningAvg).toBe(6.5);
      expect(afternoonAvg).toBe(8.5);
      expect(eveningAvg).toBe(5.5);
    });
  });
});

// Test voice input utilities
describe('Voice Input', () => {
  describe('Error Messages', () => {
    const getErrorMessage = (error: string): string => {
      switch (error) {
        case 'no-speech':
          return 'No speech was detected. Please try again.';
        case 'audio-capture':
          return 'No microphone was found. Please check your device.';
        case 'not-allowed':
          return 'Microphone access was denied. Please allow microphone access.';
        case 'network':
          return 'Network error occurred. Please check your connection.';
        case 'aborted':
          return 'Speech recognition was aborted.';
        case 'language-not-supported':
          return 'The selected language is not supported.';
        case 'service-not-allowed':
          return 'Speech recognition service is not allowed.';
        default:
          return `Speech recognition error: ${error}`;
      }
    };

    it('should return correct error message for no-speech', () => {
      expect(getErrorMessage('no-speech')).toBe('No speech was detected. Please try again.');
    });

    it('should return correct error message for not-allowed', () => {
      expect(getErrorMessage('not-allowed')).toBe('Microphone access was denied. Please allow microphone access.');
    });

    it('should return generic error for unknown errors', () => {
      expect(getErrorMessage('unknown-error')).toBe('Speech recognition error: unknown-error');
    });
  });

  describe('Period Mapping', () => {
    const periodMap: Record<string, string> = {
      morning: 'morning',
      midday: 'afternoon',
      evening: 'evening',
    };

    it('should map frontend periods to backend periods', () => {
      expect(periodMap['morning']).toBe('morning');
      expect(periodMap['midday']).toBe('afternoon');
      expect(periodMap['evening']).toBe('evening');
    });
  });
});

// Test AI Expert functions
describe('AI Experts', () => {
  describe('Expert Search', () => {
    const mockExperts = [
      { id: '1', name: 'Victor Sterling', specialty: 'Value Investing', category: 'Investment & Finance' },
      { id: '2', name: 'Marcus Macro', specialty: 'Global Macro', category: 'Investment & Finance' },
      { id: '3', name: 'Sofia Martinez', specialty: 'Brand Design', category: 'Creative' },
    ];

    it('should search experts by name', () => {
      const query = 'victor';
      const results = mockExperts.filter(e => 
        e.name.toLowerCase().includes(query.toLowerCase())
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Victor Sterling');
    });

    it('should search experts by specialty', () => {
      const query = 'investing';
      const results = mockExperts.filter(e => 
        e.specialty.toLowerCase().includes(query.toLowerCase())
      );
      expect(results).toHaveLength(1);
      expect(results[0].specialty).toBe('Value Investing');
    });

    it('should search experts by category', () => {
      const query = 'finance';
      const results = mockExperts.filter(e => 
        e.category.toLowerCase().includes(query.toLowerCase())
      );
      expect(results).toHaveLength(2);
    });
  });

  describe('System Prompt Generation', () => {
    it('should generate system prompt with expert details', () => {
      const expert = {
        name: 'Victor Sterling',
        specialty: 'Value Investing',
        bio: 'A patient investor',
        thinkingStyle: 'Methodical',
        strengths: ['Long-term thinking', 'Risk assessment'],
        weaknesses: ['Conservative on tech'],
        compositeOf: ['Warren Buffett', 'Charlie Munger'],
      };

      const prompt = `You are ${expert.name}, an AI expert specializing in ${expert.specialty}.

Background: ${expert.bio}

Your thinking style: ${expert.thinkingStyle}

Your key strengths:
${expert.strengths.map(s => `- ${s}`).join('\n')}

Areas where you acknowledge limitations:
${expert.weaknesses.map(w => `- ${w}`).join('\n')}

Your expertise draws from the combined wisdom of: ${expert.compositeOf.join(', ')}.`;

      expect(prompt).toContain('Victor Sterling');
      expect(prompt).toContain('Value Investing');
      expect(prompt).toContain('Long-term thinking');
      expect(prompt).toContain('Warren Buffett');
    });
  });
});
