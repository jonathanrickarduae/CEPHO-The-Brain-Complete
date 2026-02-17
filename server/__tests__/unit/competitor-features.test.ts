import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Test Command Palette functionality
describe('Command Palette', () => {
  it('should filter commands based on search query', () => {
    const commands = [
      { id: '1', name: 'Go to Dashboard', keywords: ['home', 'main'] },
      { id: '2', name: 'Go to Digital Twin', keywords: ['ai', 'assistant'] },
      { id: '3', name: 'Create Task', keywords: ['new', 'add', 'todo'] },
      { id: '4', name: 'Open Settings', keywords: ['preferences', 'config'] },
    ];

    const filterCommands = (query: string) => {
      const lowerQuery = query.toLowerCase();
      return commands.filter(cmd => 
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.keywords.some(k => k.includes(lowerQuery))
      );
    };

    expect(filterCommands('dash')).toHaveLength(1);
    expect(filterCommands('go')).toHaveLength(2);
    expect(filterCommands('ai')).toHaveLength(2); // 'ai' matches 'Digital Twin' (ai keyword) and 'main' contains 'ai'
    expect(filterCommands('xyz')).toHaveLength(0);
  });

  it('should categorize commands correctly', () => {
    const categorizeCommand = (name: string) => {
      if (name.startsWith('Go to')) return 'navigation';
      if (name.startsWith('Create') || name.startsWith('Add')) return 'action';
      if (name.startsWith('Open')) return 'settings';
      return 'other';
    };

    expect(categorizeCommand('Go to Dashboard')).toBe('navigation');
    expect(categorizeCommand('Create Task')).toBe('action');
    expect(categorizeCommand('Open Settings')).toBe('settings');
    expect(categorizeCommand('Help')).toBe('other');
  });
});

// Test Smart Scheduler functionality
describe('Smart Scheduler', () => {
  it('should calculate task priority score', () => {
    const calculatePriorityScore = (task: {
      priority: 'high' | 'medium' | 'low';
      dueDate?: Date;
      estimatedHours: number;
    }) => {
      let score = 0;
      
      // Priority weight
      if (task.priority === 'high') score += 100;
      else if (task.priority === 'medium') score += 50;
      else score += 25;
      
      // Urgency based on due date
      if (task.dueDate) {
        const daysUntilDue = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 1) score += 100;
        else if (daysUntilDue <= 3) score += 50;
        else if (daysUntilDue <= 7) score += 25;
      }
      
      // Shorter tasks get slight boost (quick wins)
      if (task.estimatedHours <= 1) score += 10;
      
      return score;
    };

    const urgentHighPriority = {
      priority: 'high' as const,
      dueDate: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
      estimatedHours: 0.5,
    };

    const lowPriorityNoDue = {
      priority: 'low' as const,
      estimatedHours: 4,
    };

    expect(calculatePriorityScore(urgentHighPriority)).toBeGreaterThan(calculatePriorityScore(lowPriorityNoDue));
    expect(calculatePriorityScore(urgentHighPriority)).toBe(210); // 100 + 100 + 10
    expect(calculatePriorityScore(lowPriorityNoDue)).toBe(25); // 25 only
  });

  it('should find available time slots', () => {
    const findAvailableSlots = (
      busySlots: Array<{ start: number; end: number }>,
      workdayStart: number,
      workdayEnd: number,
      minDuration: number
    ) => {
      const available: Array<{ start: number; end: number }> = [];
      let currentStart = workdayStart;

      const sortedBusy = [...busySlots].sort((a, b) => a.start - b.start);

      for (const busy of sortedBusy) {
        if (busy.start > currentStart && busy.start - currentStart >= minDuration) {
          available.push({ start: currentStart, end: busy.start });
        }
        currentStart = Math.max(currentStart, busy.end);
      }

      if (workdayEnd > currentStart && workdayEnd - currentStart >= minDuration) {
        available.push({ start: currentStart, end: workdayEnd });
      }

      return available;
    };

    const busySlots = [
      { start: 9, end: 10 },  // 9-10 AM meeting
      { start: 12, end: 13 }, // 12-1 PM lunch
      { start: 15, end: 16 }, // 3-4 PM meeting
    ];

    const slots = findAvailableSlots(busySlots, 9, 17, 1);
    expect(slots).toHaveLength(3);
    expect(slots[0]).toEqual({ start: 10, end: 12 }); // 10 AM - 12 PM
    expect(slots[1]).toEqual({ start: 13, end: 15 }); // 1 PM - 3 PM
    expect(slots[2]).toEqual({ start: 16, end: 17 }); // 4 PM - 5 PM
  });
});

// Test Training Studio functionality
describe('Training Studio', () => {
  it('should validate training data types', () => {
    const validateTrainingData = (data: {
      type: string;
      content: string;
    }) => {
      const validTypes = ['document', 'conversation', 'preference', 'fact'];
      if (!validTypes.includes(data.type)) return { valid: false, error: 'Invalid type' };
      if (!data.content || data.content.length < 1) return { valid: false, error: 'Content required' };
      if (data.content.length > 100000) return { valid: false, error: 'Content too large' };
      return { valid: true };
    };

    expect(validateTrainingData({ type: 'document', content: 'Test content' })).toEqual({ valid: true });
    expect(validateTrainingData({ type: 'invalid', content: 'Test' })).toEqual({ valid: false, error: 'Invalid type' });
    expect(validateTrainingData({ type: 'fact', content: '' })).toEqual({ valid: false, error: 'Content required' });
  });

  it('should categorize memories correctly', () => {
    const categorizeMemory = (key: string, value: string) => {
      const personalKeywords = ['name', 'birthday', 'age', 'location'];
      const workKeywords = ['job', 'role', 'company', 'team', 'project'];
      const preferenceKeywords = ['prefer', 'like', 'favorite', 'style'];
      
      const lowerKey = key.toLowerCase();
      
      if (personalKeywords.some(k => lowerKey.includes(k))) return 'personal';
      if (workKeywords.some(k => lowerKey.includes(k))) return 'work';
      if (preferenceKeywords.some(k => lowerKey.includes(k))) return 'preferences';
      return 'other';
    };

    expect(categorizeMemory('Full Name', 'John Doe')).toBe('personal');
    expect(categorizeMemory('Job Title', 'Engineer')).toBe('work');
    expect(categorizeMemory('Favorite Color', 'Blue')).toBe('preferences'); // 'Preferred' contains 'prefer' but also triggers personal due to order
    expect(categorizeMemory('Random Note', 'Something')).toBe('other');
  });
});

// Test Agent Builder functionality
describe('Agent Builder', () => {
  it('should validate agent configuration', () => {
    const validateAgent = (agent: {
      name: string;
      trigger: { type: string };
      actions: Array<{ type: string }>;
      autonomyLevel: string;
    }) => {
      const errors: string[] = [];
      
      if (!agent.name || agent.name.length < 2) errors.push('Name too short');
      if (!['time', 'event', 'condition', 'manual'].includes(agent.trigger.type)) {
        errors.push('Invalid trigger type');
      }
      if (agent.actions.length === 0) errors.push('At least one action required');
      if (!['observe', 'suggest', 'act'].includes(agent.autonomyLevel)) {
        errors.push('Invalid autonomy level');
      }
      
      return { valid: errors.length === 0, errors };
    };

    const validAgent = {
      name: 'Email Bot',
      trigger: { type: 'event' },
      actions: [{ type: 'email' }],
      autonomyLevel: 'suggest',
    };

    const invalidAgent = {
      name: 'X',
      trigger: { type: 'invalid' },
      actions: [],
      autonomyLevel: 'unknown',
    };

    expect(validateAgent(validAgent)).toEqual({ valid: true, errors: [] });
    expect(validateAgent(invalidAgent).valid).toBe(false);
    expect(validateAgent(invalidAgent).errors).toHaveLength(4);
  });

  it('should calculate agent success rate', () => {
    const calculateSuccessRate = (runs: Array<{ success: boolean }>) => {
      if (runs.length === 0) return 0;
      const successful = runs.filter(r => r.success).length;
      return Math.round((successful / runs.length) * 100);
    };

    expect(calculateSuccessRate([])).toBe(0);
    expect(calculateSuccessRate([{ success: true }])).toBe(100);
    expect(calculateSuccessRate([{ success: true }, { success: false }])).toBe(50);
    expect(calculateSuccessRate([
      { success: true },
      { success: true },
      { success: true },
      { success: false },
    ])).toBe(75);
  });
});

// Test Voice Commands functionality
describe('Voice Commands', () => {
  it('should match voice command patterns', () => {
    const matchCommand = (transcript: string, patterns: string[]) => {
      const lowerTranscript = transcript.toLowerCase().trim();
      return patterns.some(pattern => lowerTranscript.includes(pattern.toLowerCase()));
    };

    const dashboardPatterns = ['go to dashboard', 'open dashboard', 'show dashboard'];
    const taskPatterns = ['create task', 'new task', 'add task'];

    expect(matchCommand('Go to dashboard please', dashboardPatterns)).toBe(true);
    expect(matchCommand('OPEN DASHBOARD', dashboardPatterns)).toBe(true);
    expect(matchCommand('show me the stats', dashboardPatterns)).toBe(false);
    expect(matchCommand('Create a new task', taskPatterns)).toBe(true);
  });

  it('should detect wake word', () => {
    const detectWakeWord = (transcript: string) => {
      const lowerTranscript = transcript.toLowerCase();
      return lowerTranscript.includes('hey brain') || lowerTranscript.includes('okay brain');
    };

    expect(detectWakeWord('Hey Brain, what is my schedule?')).toBe(true);
    expect(detectWakeWord('Okay Brain')).toBe(true);
    expect(detectWakeWord('Hello there')).toBe(false);
  });

  it('should extract task name from voice command', () => {
    const extractTaskName = (transcript: string) => {
      const patterns = [
        /create (?:a )?task (?:called |named |titled )?(.+)/i,
        /add (?:a )?task (?:called |named |titled )?(.+)/i,
        /new task (?:called |named |titled )?(.+)/i,
      ];

      for (const pattern of patterns) {
        const match = transcript.match(pattern);
        if (match) return match[1].trim();
      }
      return null;
    };

    expect(extractTaskName('Create task called Review documents')).toBe('Review documents');
    expect(extractTaskName('Add a task named Send email')).toBe('Send email');
    expect(extractTaskName('New task finish report')).toBe('finish report');
    expect(extractTaskName('Random text')).toBe(null);
  });
});

// Test Collaborative Notes functionality
describe('Collaborative Notes', () => {
  it('should calculate AI contribution percentage', () => {
    const calculateContribution = (
      originalLength: number,
      aiAddedChars: number,
      totalLength: number
    ) => {
      if (totalLength === 0) return 0;
      return Math.min(100, Math.round((aiAddedChars / totalLength) * 100));
    };

    expect(calculateContribution(100, 0, 100)).toBe(0);
    expect(calculateContribution(100, 50, 150)).toBe(33);
    expect(calculateContribution(0, 100, 100)).toBe(100);
    expect(calculateContribution(50, 50, 100)).toBe(50);
  });

  it('should track version history correctly', () => {
    const createVersion = (
      content: string,
      author: 'user' | 'ai' | 'collaborative'
    ) => ({
      id: `v-${Date.now()}`,
      content,
      timestamp: new Date(),
      author,
    });

    const versions = [
      createVersion('Initial draft', 'user'),
      createVersion('Initial draft with improvements', 'collaborative'),
      createVersion('Final polished version', 'ai'),
    ];

    expect(versions).toHaveLength(3);
    expect(versions[0].author).toBe('user');
    expect(versions[1].author).toBe('collaborative');
    expect(versions[2].author).toBe('ai');
  });

  it('should parse suggestion format', () => {
    const parseSuggestion = (text: string) => {
      const match = text.match(
        /TYPE:\s*(\w+)\s*\nORIGINAL:\s*(.+?)\s*\nSUGGESTION:\s*(.+?)\s*\nCONFIDENCE:\s*([\d.]+)/i
      );
      
      if (!match) return null;
      
      return {
        type: match[1].toLowerCase(),
        original: match[2],
        suggestion: match[3],
        confidence: parseFloat(match[4]),
      };
    };

    const validSuggestion = `TYPE: expand
ORIGINAL: The meeting was good.
SUGGESTION: The meeting was productive and resulted in several actionable items.
CONFIDENCE: 0.85`;

    const result = parseSuggestion(validSuggestion);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('expand');
    expect(result?.confidence).toBe(0.85);
    expect(parseSuggestion('Invalid text')).toBeNull();
  });
});

// Test AI Draft Generator
describe('AI Draft Generator', () => {
  it('should detect draft type from context', () => {
    const detectDraftType = (context: string) => {
      const lowerContext = context.toLowerCase();
      if (lowerContext.includes('email') || lowerContext.includes('reply')) return 'email';
      if (lowerContext.includes('meeting') || lowerContext.includes('agenda')) return 'meeting';
      if (lowerContext.includes('report') || lowerContext.includes('summary')) return 'report';
      if (lowerContext.includes('message') || lowerContext.includes('slack')) return 'message';
      return 'general';
    };

    expect(detectDraftType('Draft an email to the team')).toBe('email');
    expect(detectDraftType('Create meeting agenda')).toBe('meeting');
    expect(detectDraftType('Write a summary report')).toBe('report');
    expect(detectDraftType('Send a Slack message')).toBe('message');
    expect(detectDraftType('Write something')).toBe('general');
  });

  it('should validate draft parameters', () => {
    const validateDraftParams = (params: {
      type: string;
      tone: string;
      length: string;
    }) => {
      const validTypes = ['email', 'meeting', 'report', 'message', 'general'];
      const validTones = ['professional', 'friendly', 'casual', 'formal'];
      const validLengths = ['brief', 'standard', 'detailed'];

      return {
        typeValid: validTypes.includes(params.type),
        toneValid: validTones.includes(params.tone),
        lengthValid: validLengths.includes(params.length),
      };
    };

    const validParams = { type: 'email', tone: 'professional', length: 'standard' };
    const invalidParams = { type: 'invalid', tone: 'angry', length: 'huge' };

    const validResult = validateDraftParams(validParams);
    expect(validResult.typeValid).toBe(true);
    expect(validResult.toneValid).toBe(true);
    expect(validResult.lengthValid).toBe(true);

    const invalidResult = validateDraftParams(invalidParams);
    expect(invalidResult.typeValid).toBe(false);
    expect(invalidResult.toneValid).toBe(false);
    expect(invalidResult.lengthValid).toBe(false);
  });
});
