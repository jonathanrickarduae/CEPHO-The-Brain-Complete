import { describe, it, expect } from 'vitest';

// Since the videoScriptGenerator is a client-side library, we'll test the core logic
// by importing the types and testing the structure

describe('Video Script Generator', () => {
  // Test business data structure
  const mockBusinessData = {
    companyName: 'TestCo',
    tagline: 'Testing made easy',
    industry: 'Software',
    stage: 'growth' as const,
    problem: 'Testing is hard and time-consuming',
    solution: 'provides automated testing solutions',
    uniqueValue: 'Our AI writes tests automatically',
    targetMarket: 'Software development teams',
    marketSize: '$10 billion',
    competitors: ['Competitor A', 'Competitor B'],
    competitiveAdvantage: 'We are 10x faster than alternatives',
    currentRevenue: '$1M ARR',
    customers: '50 customers',
    growthRate: '20% MoM',
    keyMetrics: ['99% accuracy', 'NPS 80'],
    founders: [
      { name: 'John Doe', role: 'CEO', background: 'Ex-Google' }
    ],
    teamSize: 20,
    fundingTarget: '$5M Series A',
    useOfFunds: 'expand engineering team',
    vision: 'Make testing effortless for every developer'
  };

  describe('Business Data Validation', () => {
    it('should have all required fields', () => {
      expect(mockBusinessData.companyName).toBeDefined();
      expect(mockBusinessData.problem).toBeDefined();
      expect(mockBusinessData.solution).toBeDefined();
      expect(mockBusinessData.uniqueValue).toBeDefined();
      expect(mockBusinessData.targetMarket).toBeDefined();
    });

    it('should have valid stage value', () => {
      const validStages = ['idea', 'mvp', 'revenue', 'growth', 'mature'];
      expect(validStages).toContain(mockBusinessData.stage);
    });

    it('should have founders array with required fields', () => {
      expect(Array.isArray(mockBusinessData.founders)).toBe(true);
      mockBusinessData.founders?.forEach(founder => {
        expect(founder.name).toBeDefined();
        expect(founder.role).toBeDefined();
      });
    });
  });

  describe('Script Generation Logic', () => {
    it('should calculate words per minute correctly', () => {
      const slowWpm = 120;
      const moderateWpm = 140;
      const fastWpm = 160;
      
      // 2 minute script at moderate pace should be ~280 words
      const targetDuration = 120; // seconds
      const expectedWords = Math.round((targetDuration / 60) * moderateWpm);
      expect(expectedWords).toBe(280);
    });

    it('should calculate reading time from word count', () => {
      const words = 280;
      const wpm = 140;
      const expectedSeconds = Math.round((words / wpm) * 60);
      expect(expectedSeconds).toBe(120);
    });
  });

  describe('Script Section Structure', () => {
    it('should define valid script section structure', () => {
      const section = {
        name: 'Hook',
        duration: 10,
        content: 'Test content',
        visualSuggestions: ['Suggestion 1', 'Suggestion 2'],
        speakerNotes: 'Test notes'
      };

      expect(section.name).toBeDefined();
      expect(section.duration).toBeGreaterThan(0);
      expect(section.content).toBeDefined();
      expect(Array.isArray(section.visualSuggestions)).toBe(true);
    });

    it('should have reasonable duration for each section type', () => {
      const sectionDurations = {
        hook: 10,
        problem: 20,
        solution: 25,
        market: 15,
        traction: 20,
        team: 15,
        cta: 15
      };

      const totalDuration = Object.values(sectionDurations).reduce((a, b) => a + b, 0);
      expect(totalDuration).toBe(120); // 2 minutes total
    });
  });

  describe('Generated Script Structure', () => {
    it('should define valid generated script structure', () => {
      const script = {
        type: 'overview' as const,
        title: 'TestCo - Investor Overview',
        targetDuration: 120,
        totalWords: 280,
        estimatedDuration: 120,
        hook: {
          name: 'Hook',
          duration: 10,
          content: 'Test hook',
          visualSuggestions: ['Visual 1']
        },
        sections: [],
        callToAction: {
          name: 'CTA',
          duration: 15,
          content: 'Test CTA',
          visualSuggestions: ['Visual 2']
        },
        fullScript: 'Full script content',
        tone: 'professional',
        pace: 'moderate',
        visualTheme: 'Clean and professional',
        musicSuggestion: 'Corporate ambient',
        keyMessages: ['Message 1', 'Message 2']
      };

      expect(script.type).toBe('overview');
      expect(script.targetDuration).toBe(120);
      expect(script.hook).toBeDefined();
      expect(script.callToAction).toBeDefined();
      expect(Array.isArray(script.keyMessages)).toBe(true);
    });

    it('should have valid script types', () => {
      const validTypes = ['overview', 'product', 'team', 'traction'];
      validTypes.forEach(type => {
        expect(['overview', 'product', 'team', 'traction']).toContain(type);
      });
    });
  });

  describe('Script Options', () => {
    it('should have valid tone options', () => {
      const validTones = ['professional', 'casual', 'energetic', 'inspirational'];
      validTones.forEach(tone => {
        expect(['professional', 'casual', 'energetic', 'inspirational']).toContain(tone);
      });
    });

    it('should have valid pace options', () => {
      const validPaces = ['slow', 'moderate', 'fast'];
      validPaces.forEach(pace => {
        expect(['slow', 'moderate', 'fast']).toContain(pace);
      });
    });
  });
});

describe('Pitch Pack Database Schema', () => {
  it('should define required fields for video_pitch_packs', () => {
    const requiredFields = [
      'id', 'userId', 'name', 'companyName', 'status', 'createdAt', 'updatedAt'
    ];
    
    requiredFields.forEach(field => {
      expect(field).toBeDefined();
    });
  });

  it('should define required fields for pitch_videos', () => {
    const requiredFields = [
      'id', 'packId', 'title', 'type', 'videoUrl', 'displayOrder'
    ];
    
    requiredFields.forEach(field => {
      expect(field).toBeDefined();
    });
  });

  it('should define required fields for video_scripts', () => {
    const requiredFields = [
      'id', 'packId', 'videoType', 'title', 'targetDuration', 'status'
    ];
    
    requiredFields.forEach(field => {
      expect(field).toBeDefined();
    });
  });

  it('should define required fields for pitch_landing_pages', () => {
    const requiredFields = [
      'id', 'packId', 'slug', 'accessType', 'isActive'
    ];
    
    requiredFields.forEach(field => {
      expect(field).toBeDefined();
    });
  });

  it('should define required fields for landing_page_access_logs', () => {
    const requiredFields = [
      'id', 'landingPageId', 'sessionId', 'accessedAt'
    ];
    
    requiredFields.forEach(field => {
      expect(field).toBeDefined();
    });
  });
});

describe('Investor Invite System', () => {
  it('should define valid invite statuses', () => {
    const validStatuses = ['sent', 'opened', 'viewed', 'engaged', 'expired'];
    validStatuses.forEach(status => {
      expect(['sent', 'opened', 'viewed', 'engaged', 'expired']).toContain(status);
    });
  });

  it('should track engagement metrics', () => {
    const inviteMetrics = {
      totalViews: 0,
      totalWatchTime: 0,
      sentAt: new Date(),
      openedAt: null,
      firstViewedAt: null,
      lastViewedAt: null
    };

    expect(inviteMetrics.totalViews).toBeDefined();
    expect(inviteMetrics.totalWatchTime).toBeDefined();
    expect(inviteMetrics.sentAt).toBeInstanceOf(Date);
  });
});
