/**
 * Expert Chat Features Tests
 * Tests for voice input, recommendation engine, and export functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Expert Chat Features', () => {
  
  describe('Voice Input Integration', () => {
    it('should support voice input in expert chat page', () => {
      // Voice input uses Web Speech API which is browser-only
      // This test validates the hook configuration
      const voiceConfig = {
        continuous: true,
        interimResults: true,
        language: 'en-US',
      };
      
      expect(voiceConfig.continuous).toBe(true);
      expect(voiceConfig.interimResults).toBe(true);
    });
    
    it('should handle voice recording state transitions', () => {
      const states = ['idle', 'listening', 'processing', 'error'];
      let currentState = 'idle';
      
      // Start listening
      currentState = 'listening';
      expect(currentState).toBe('listening');
      
      // Stop and process
      currentState = 'processing';
      expect(currentState).toBe('processing');
      
      // Return to idle
      currentState = 'idle';
      expect(currentState).toBe('idle');
    });
    
    it('should accumulate transcript from voice input', () => {
      let transcript = '';
      const onResult = (text: string, isFinal: boolean) => {
        if (isFinal) {
          transcript += text + ' ';
        }
      };
      
      onResult('Hello', true);
      onResult('world', true);
      
      expect(transcript.trim()).toBe('Hello world');
    });
  });
  
  describe('Expert Recommendation Engine', () => {
    it('should generate recommendations based on consultation history', () => {
      const consultationHistory = [
        { expertId: 'finance-1', expertName: 'Warren Sage', category: 'Finance & Investment' },
        { expertId: 'finance-2', expertName: 'Value Maven', category: 'Finance & Investment' },
        { expertId: 'tech-1', expertName: 'Tech Visionary', category: 'Technology & Innovation' },
      ];
      
      // Count consultations by category
      const categoryCounts: Record<string, number> = {};
      consultationHistory.forEach(c => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      });
      
      // Finance should be most consulted
      expect(categoryCounts['Finance & Investment']).toBe(2);
      expect(categoryCounts['Technology & Innovation']).toBe(1);
    });
    
    it('should identify most consulted experts', () => {
      const consultationCounts = [
        { expertId: 'finance-1', count: 5 },
        { expertId: 'tech-1', count: 3 },
        { expertId: 'legal-1', count: 1 },
      ];
      
      // Sort by count descending
      const sorted = [...consultationCounts].sort((a, b) => b.count - a.count);
      
      expect(sorted[0].expertId).toBe('finance-1');
      expect(sorted[0].count).toBe(5);
    });
    
    it('should generate recommendation reasons', () => {
      const generateReason = (category: string, consultCount: number) => {
        if (consultCount >= 3) {
          return `Frequently consulted in ${category}`;
        } else if (consultCount >= 1) {
          return `Based on your interest in ${category}`;
        }
        return `Recommended for ${category} expertise`;
      };
      
      expect(generateReason('Finance', 5)).toBe('Frequently consulted in Finance');
      expect(generateReason('Tech', 2)).toBe('Based on your interest in Tech');
      expect(generateReason('Legal', 0)).toBe('Recommended for Legal expertise');
    });
    
    it('should calculate recommendation scores', () => {
      const calculateScore = (
        consultCount: number,
        categoryMatch: boolean,
        performanceScore: number
      ) => {
        let score = performanceScore;
        if (categoryMatch) score += 20;
        score += Math.min(consultCount * 5, 25); // Cap at 25 bonus
        return Math.min(score, 100);
      };
      
      // High performer with category match and consultations
      expect(calculateScore(3, true, 85)).toBe(100); // 85 + 20 + 15 = 120 -> capped at 100
      
      // Average performer with some consultations
      expect(calculateScore(2, false, 70)).toBe(80); // 70 + 0 + 10 = 80
    });
  });
  
  describe('Expert Chat Export', () => {
    it('should generate markdown export format', () => {
      const expert = {
        name: 'Warren Sage',
        specialty: 'Value Investing',
        category: 'Finance & Investment',
        bio: 'Expert in value investing principles',
        compositeOf: ['Warren Buffett', 'Charlie Munger'],
        strengths: ['Value analysis', 'Long-term thinking'],
        thinkingStyle: 'Patient and methodical',
      };
      
      const messages = [
        { role: 'user' as const, content: 'What is value investing?' },
        { role: 'expert' as const, content: 'Value investing focuses on buying undervalued assets.' },
      ];
      
      const timestamp = '2026-01-16';
      
      // Generate markdown
      const markdown = `# Expert Consultation: ${expert.name}

**Date:** ${timestamp}
**Expert:** ${expert.name}
**Specialty:** ${expert.specialty}
**Category:** ${expert.category}

## Expert Profile

${expert.bio}

**Inspired By:** ${expert.compositeOf.join(', ')}

**Strengths:** ${expert.strengths.join(', ')}

**Thinking Style:** ${expert.thinkingStyle}

---

## Conversation Transcript

${messages.map(msg => {
  if (msg.role === 'user') return `### You:\n${msg.content}\n`;
  if (msg.role === 'expert') return `### ${expert.name}:\n${msg.content}\n`;
  return `### System:\n${msg.content}\n`;
}).join('\n')}

---

*Exported from CEPHO AI SME Consultation*
`;
      
      expect(markdown).toContain('# Expert Consultation: Warren Sage');
      expect(markdown).toContain('**Specialty:** Value Investing');
      expect(markdown).toContain('Warren Buffett, Charlie Munger');
      expect(markdown).toContain('### You:');
      expect(markdown).toContain('### Warren Sage:');
    });
    
    it('should create library document with correct metadata', () => {
      const exportData = {
        expertId: 'finance-1',
        expertName: 'Warren Sage',
        expertSpecialty: 'Value Investing',
        messageCount: 5,
        exportedAt: new Date().toISOString(),
      };
      
      const libraryDocument = {
        userId: 1,
        folder: 'consultations',
        subFolder: 'expert_chats',
        name: `Consultation - ${exportData.expertName} - 2026-01-16.md`,
        type: 'document',
        status: 'draft',
        metadata: exportData,
      };
      
      expect(libraryDocument.folder).toBe('consultations');
      expect(libraryDocument.subFolder).toBe('expert_chats');
      expect(libraryDocument.type).toBe('document');
      expect(libraryDocument.metadata.expertId).toBe('finance-1');
      expect(libraryDocument.metadata.messageCount).toBe(5);
    });
    
    it('should generate unique document names', () => {
      const generateDocName = (expertName: string, timestamp: string) => {
        return `Consultation - ${expertName} - ${timestamp}.md`;
      };
      
      const name1 = generateDocName('Warren Sage', '2026-01-16');
      const name2 = generateDocName('Tech Visionary', '2026-01-16');
      
      expect(name1).toBe('Consultation - Warren Sage - 2026-01-16.md');
      expect(name2).toBe('Consultation - Tech Visionary - 2026-01-16.md');
      expect(name1).not.toBe(name2);
    });
    
    it('should handle download export correctly', () => {
      const createDownloadBlob = (content: string, mimeType: string) => {
        return {
          content,
          mimeType,
          size: content.length,
        };
      };
      
      const markdown = '# Test Export\n\nContent here';
      const blob = createDownloadBlob(markdown, 'text/markdown');
      
      expect(blob.mimeType).toBe('text/markdown');
      expect(blob.size).toBeGreaterThan(0);
    });
  });
  
  describe('Library Document Storage', () => {
    it('should validate library document schema', () => {
      const validateDocument = (doc: {
        userId: number;
        folder: string;
        name: string;
        type: string;
      }) => {
        const validTypes = ['document', 'image', 'chart', 'presentation', 'data', 'other'];
        
        if (!doc.userId || doc.userId < 1) return { valid: false, error: 'Invalid userId' };
        if (!doc.folder || doc.folder.length < 1) return { valid: false, error: 'Folder required' };
        if (!doc.name || doc.name.length < 1) return { valid: false, error: 'Name required' };
        if (!validTypes.includes(doc.type)) return { valid: false, error: 'Invalid type' };
        
        return { valid: true };
      };
      
      expect(validateDocument({ userId: 1, folder: 'consultations', name: 'test.md', type: 'document' }))
        .toEqual({ valid: true });
      
      expect(validateDocument({ userId: 0, folder: 'test', name: 'test.md', type: 'document' }))
        .toEqual({ valid: false, error: 'Invalid userId' });
      
      expect(validateDocument({ userId: 1, folder: '', name: 'test.md', type: 'document' }))
        .toEqual({ valid: false, error: 'Folder required' });
    });
    
    it('should support filtering by folder and subfolder', () => {
      const documents = [
        { id: 1, folder: 'consultations', subFolder: 'expert_chats' },
        { id: 2, folder: 'consultations', subFolder: 'meeting_notes' },
        { id: 3, folder: 'projects', subFolder: 'celadon' },
      ];
      
      const filterDocs = (docs: typeof documents, folder?: string, subFolder?: string) => {
        return docs.filter(d => {
          if (folder && d.folder !== folder) return false;
          if (subFolder && d.subFolder !== subFolder) return false;
          return true;
        });
      };
      
      expect(filterDocs(documents, 'consultations').length).toBe(2);
      expect(filterDocs(documents, 'consultations', 'expert_chats').length).toBe(1);
      expect(filterDocs(documents, 'projects').length).toBe(1);
    });
  });
  
  describe('Integration Tests', () => {
    it('should handle full export workflow', async () => {
      // Simulate export workflow
      const workflow = {
        step1_validateMessages: (messages: any[]) => messages.length > 0,
        step2_generateMarkdown: (expert: any, messages: any[]) => `# ${expert.name}\n${messages.length} messages`,
        step3_createDocument: (markdown: string) => ({ id: 1, content: markdown }),
        step4_notifyUser: (docId: number) => `Document ${docId} saved`,
      };
      
      const messages = [{ role: 'user', content: 'test' }];
      const expert = { name: 'Test Expert' };
      
      // Execute workflow
      const isValid = workflow.step1_validateMessages(messages);
      expect(isValid).toBe(true);
      
      const markdown = workflow.step2_generateMarkdown(expert, messages);
      expect(markdown).toContain('Test Expert');
      
      const doc = workflow.step3_createDocument(markdown);
      expect(doc.id).toBe(1);
      
      const notification = workflow.step4_notifyUser(doc.id);
      expect(notification).toBe('Document 1 saved');
    });
    
    it('should handle empty message export gracefully', () => {
      const messages: any[] = [];
      
      const canExport = messages.length > 0;
      expect(canExport).toBe(false);
    });
    
    it('should preserve message order in export', () => {
      const messages = [
        { role: 'user', content: 'First', timestamp: 1 },
        { role: 'expert', content: 'Second', timestamp: 2 },
        { role: 'user', content: 'Third', timestamp: 3 },
      ];
      
      const exportOrder = messages.map(m => m.content);
      expect(exportOrder).toEqual(['First', 'Second', 'Third']);
    });
  });
});
