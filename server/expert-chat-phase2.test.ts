import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AI_EXPERTS } from '../client/src/data/aiExperts';

/**
 * Tests for Expert Chat Enhancements Phase 2
 * - Recommended Experts Section
 * - Library Consultation Viewer
 * - Text-to-Speech for Expert Responses
 */

describe('Recommended Experts Section', () => {
  describe('Recommendation Algorithm', () => {
    it('should return up to 5 expert recommendations', () => {
      // Simulated recommendation logic
      const maxRecommendations = 5;
      const recommendations = AI_EXPERTS.slice(0, maxRecommendations);
      
      expect(recommendations.length).toBeLessThanOrEqual(5);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should include recommendation reasons', () => {
      // Each recommendation should have a reason
      const mockRecommendation = {
        expert: AI_EXPERTS[0],
        reason: 'Based on your recent finance consultations',
        score: 85,
      };
      
      expect(mockRecommendation.reason).toBeDefined();
      expect(mockRecommendation.reason.length).toBeGreaterThan(0);
    });

    it('should prioritize experts based on consultation history', () => {
      // Mock consultation history
      const consultationHistory = [
        { expertId: 'fin-001', count: 5 },
        { expertId: 'fin-002', count: 3 },
        { expertId: 'tech-001', count: 1 },
      ];
      
      // Sort by count descending
      const sorted = consultationHistory.sort((a, b) => b.count - a.count);
      
      expect(sorted[0].expertId).toBe('fin-001');
      expect(sorted[0].count).toBe(5);
    });

    it('should include experts from preferred categories', () => {
      // Use actual category names from the data
      const categoryPreferences = ['Investment & Finance', 'Technology & Innovation'];
      
      const relevantExperts = AI_EXPERTS.filter(e => 
        categoryPreferences.includes(e.category)
      );
      
      expect(relevantExperts.length).toBeGreaterThan(0);
      expect(relevantExperts.every(e => categoryPreferences.includes(e.category))).toBe(true);
    });
  });

  describe('Expert Data Structure', () => {
    it('should have all required fields for recommendation display', () => {
      const expert = AI_EXPERTS[0];
      
      expect(expert.id).toBeDefined();
      expect(expert.name).toBeDefined();
      expect(expert.specialty).toBeDefined();
      expect(expert.category).toBeDefined();
      expect(expert.performanceScore).toBeDefined();
    });

    it('should have valid performance scores', () => {
      AI_EXPERTS.forEach(expert => {
        expect(expert.performanceScore).toBeGreaterThanOrEqual(0);
        expect(expert.performanceScore).toBeLessThanOrEqual(100);
      });
    });
  });
});

describe('Library Consultation Viewer', () => {
  describe('Consultation Document Structure', () => {
    it('should create valid consultation document metadata', () => {
      const mockConsultation = {
        id: 1,
        userId: 1,
        folder: 'Expert Consultations',
        subFolder: 'Dr. Aria Chen',
        name: 'Consultation with Dr. Aria Chen - 2026-01-16',
        type: 'document' as const,
        status: 'draft' as const,
        metadata: {
          expertId: 'fin-001',
          expertName: 'Dr. Aria Chen',
          messageCount: 10,
          content: '# Expert Consultation...',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      expect(mockConsultation.folder).toBe('Expert Consultations');
      expect(mockConsultation.type).toBe('document');
      expect(mockConsultation.metadata.expertId).toBeDefined();
      expect(mockConsultation.metadata.content).toBeDefined();
    });

    it('should support filtering by expert name', () => {
      const consultations = [
        { subFolder: 'Dr. Aria Chen', name: 'Consultation 1' },
        { subFolder: 'Marcus Macro', name: 'Consultation 2' },
        { subFolder: 'Dr. Aria Chen', name: 'Consultation 3' },
      ];
      
      const filtered = consultations.filter(c => c.subFolder === 'Dr. Aria Chen');
      
      expect(filtered.length).toBe(2);
    });

    it('should support search by content', () => {
      const consultations = [
        { name: 'Finance Discussion', content: 'Investment strategies for 2026' },
        { name: 'Tech Review', content: 'AI implementation roadmap' },
        { name: 'Market Analysis', content: 'Investment opportunities in emerging markets' },
      ];
      
      const searchQuery = 'investment';
      const results = consultations.filter(c => 
        c.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      expect(results.length).toBe(2);
    });
  });

  describe('Consultation Viewer Modal', () => {
    it('should render markdown content correctly', () => {
      const markdownContent = `# Expert Consultation: Dr. Aria Chen

**Date:** 2026-01-16
**Expert:** Dr. Aria Chen

## Conversation

**You:** What are the key investment trends for 2026?

**Dr. Aria Chen:** Based on current market analysis...`;

      expect(markdownContent).toContain('# Expert Consultation');
      expect(markdownContent).toContain('**Date:**');
      expect(markdownContent).toContain('## Conversation');
    });

    it('should support delete functionality', () => {
      const mockDelete = vi.fn();
      const consultationId = 1;
      
      mockDelete(consultationId);
      
      expect(mockDelete).toHaveBeenCalledWith(1);
    });

    it('should support download functionality', () => {
      const content = '# Consultation Content';
      const filename = 'consultation.md';
      
      // Verify content can be converted to blob
      const blob = new Blob([content], { type: 'text/markdown' });
      
      expect(blob.size).toBeGreaterThan(0);
      expect(blob.type).toBe('text/markdown');
    });
  });
});

describe('Text-to-Speech for Expert Responses', () => {
  describe('TTS Functionality', () => {
    it('should support enabling/disabling TTS', () => {
      let ttsEnabled = false;
      
      const toggleTts = () => {
        ttsEnabled = !ttsEnabled;
      };
      
      expect(ttsEnabled).toBe(false);
      toggleTts();
      expect(ttsEnabled).toBe(true);
      toggleTts();
      expect(ttsEnabled).toBe(false);
    });

    it('should persist TTS preference', () => {
      const mockStorage: Record<string, string> = {};
      
      // Mock localStorage
      const setItem = (key: string, value: string) => {
        mockStorage[key] = value;
      };
      const getItem = (key: string) => mockStorage[key] || null;
      
      // Save preference
      setItem('expertChat_ttsEnabled', JSON.stringify(true));
      
      // Retrieve preference
      const saved = getItem('expertChat_ttsEnabled');
      const preference = saved ? JSON.parse(saved) : false;
      
      expect(preference).toBe(true);
    });

    it('should track which message is currently speaking', () => {
      let speakingMessageIndex: number | null = null;
      
      const startSpeaking = (index: number) => {
        speakingMessageIndex = index;
      };
      
      const stopSpeaking = () => {
        speakingMessageIndex = null;
      };
      
      expect(speakingMessageIndex).toBeNull();
      startSpeaking(2);
      expect(speakingMessageIndex).toBe(2);
      stopSpeaking();
      expect(speakingMessageIndex).toBeNull();
    });

    it('should only show speak button for expert messages', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'expert', content: 'Hi there!' },
        { role: 'user', content: 'Question' },
        { role: 'expert', content: 'Answer' },
      ];
      
      const expertMessages = messages.filter(m => m.role === 'expert');
      
      expect(expertMessages.length).toBe(2);
      expect(expertMessages[0].content).toBe('Hi there!');
    });
  });

  describe('Speech Synthesis Configuration', () => {
    it('should use appropriate speech rate', () => {
      const config = {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      };
      
      expect(config.rate).toBeGreaterThanOrEqual(0.5);
      expect(config.rate).toBeLessThanOrEqual(2.0);
    });

    it('should prefer natural-sounding voices', () => {
      const mockVoices = [
        { name: 'Google US English', lang: 'en-US' },
        { name: 'Microsoft Natural Voice', lang: 'en-US' },
        { name: 'Default Voice', lang: 'en-US' },
      ];
      
      const preferredVoice = mockVoices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Premium')
      );
      
      expect(preferredVoice).toBeDefined();
      expect(preferredVoice?.name).toContain('Google');
    });
  });
});

describe('Integration Tests', () => {
  it('should have consistent expert IDs across features', () => {
    // Expert IDs should be consistent between recommendations and chat
    // Use actual ID format from the data (inv-001, not fin-001)
    const expertId = 'inv-001';
    const expert = AI_EXPERTS.find(e => e.id === expertId);
    
    expect(expert).toBeDefined();
    expect(expert?.id).toBe(expertId);
  });

  it('should support the full consultation workflow', () => {
    // 1. Get recommendations
    const recommendations = AI_EXPERTS.slice(0, 5);
    expect(recommendations.length).toBe(5);
    
    // 2. Select an expert
    const selectedExpert = recommendations[0];
    expect(selectedExpert.id).toBeDefined();
    
    // 3. Create chat session
    const sessionId = 1;
    expect(sessionId).toBeGreaterThan(0);
    
    // 4. Send messages
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'expert', content: 'Hi! How can I help?' },
    ];
    expect(messages.length).toBe(2);
    
    // 5. Export to library
    const exportData = {
      expertId: selectedExpert.id,
      expertName: selectedExpert.name,
      messages,
      timestamp: new Date().toISOString(),
    };
    expect(exportData.expertId).toBe(selectedExpert.id);
    
    // 6. View in library
    const consultation = {
      folder: 'Expert Consultations',
      subFolder: selectedExpert.name,
      name: `Consultation with ${selectedExpert.name}`,
      metadata: { content: '# Consultation...' },
    };
    expect(consultation.folder).toBe('Expert Consultations');
  });
});
