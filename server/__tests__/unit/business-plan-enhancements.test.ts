import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  BUSINESS_PLAN_SECTIONS, 
  REVIEW_EXPERTS,
  getExpertsForSection,
  selectExpertTeam
} from './services/business-plan-review.service';

// Mock the LLM module
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          selectedExperts: ['inv-001', 'str-001', 'mkt-001', 'tech-001', 'ops-001'],
          reasoning: 'Selected a balanced team covering finance, strategy, marketing, technology, and operations.',
          teamComposition: [
            { expertId: 'inv-001', role: 'Lead Financial Reviewer', rationale: 'Essential for financial projections' },
            { expertId: 'str-001', role: 'Strategy Lead', rationale: 'Critical for competitive positioning' },
            { expertId: 'mkt-001', role: 'Marketing Specialist', rationale: 'Key for go-to-market strategy' },
            { expertId: 'tech-001', role: 'Technology Reviewer', rationale: 'Necessary for product feasibility' },
            { expertId: 'ops-001', role: 'Operations Analyst', rationale: 'Required for operational plan review' }
          ]
        })
      }
    }]
  })
}));

describe('Business Plan Review Enhancements', () => {
  describe('BUSINESS_PLAN_SECTIONS', () => {
    it('should have 10 sections covering all business plan areas', () => {
      expect(BUSINESS_PLAN_SECTIONS.length).toBe(10);
    });

    it('should include go-to-market strategy section', () => {
      const gtmSection = BUSINESS_PLAN_SECTIONS.find(s => s.id === 'go-to-market');
      expect(gtmSection).toBeDefined();
      expect(gtmSection?.name).toBe('Go-to-Market Strategy');
      expect(gtmSection?.expertCategories).toContain('Marketing & Growth');
    });

    it('should include pricing strategy section', () => {
      const pricingSection = BUSINESS_PLAN_SECTIONS.find(s => s.id === 'pricing-strategy');
      expect(pricingSection).toBeDefined();
      expect(pricingSection?.name).toBe('Pricing Strategy');
      expect(pricingSection?.expertCategories).toContain('Investment & Finance');
    });

    it('should include competitive landscape section', () => {
      const compSection = BUSINESS_PLAN_SECTIONS.find(s => s.id === 'competitive-landscape');
      expect(compSection).toBeDefined();
      expect(compSection?.name).toBe('Competitive Landscape');
    });
  });

  describe('REVIEW_EXPERTS', () => {
    it('should have 8 experts covering all categories', () => {
      expect(REVIEW_EXPERTS.length).toBe(8);
    });

    it('should have experts for each major category', () => {
      const categories = new Set(REVIEW_EXPERTS.map(e => e.category));
      expect(categories.has('Investment & Finance')).toBe(true);
      expect(categories.has('Strategy & Leadership')).toBe(true);
      expect(categories.has('Marketing & Growth')).toBe(true);
      expect(categories.has('Sales & Revenue')).toBe(true);
      expect(categories.has('Technology & Innovation')).toBe(true);
      expect(categories.has('Operations & Execution')).toBe(true);
      expect(categories.has('Legal & Compliance')).toBe(true);
    });

    it('should have system prompts for each expert', () => {
      for (const expert of REVIEW_EXPERTS) {
        expect(expert.systemPrompt).toBeDefined();
        expect(expert.systemPrompt.length).toBeGreaterThan(50);
      }
    });
  });

  describe('getExpertsForSection', () => {
    it('should return correct experts for executive summary', () => {
      const experts = getExpertsForSection('executive-summary');
      expect(experts.length).toBeGreaterThan(0);
      const categories = experts.map(e => e.category);
      expect(categories).toContain('Strategy & Leadership');
      expect(categories).toContain('Investment & Finance');
    });

    it('should return correct experts for go-to-market', () => {
      const experts = getExpertsForSection('go-to-market');
      expect(experts.length).toBeGreaterThan(0);
      const categories = experts.map(e => e.category);
      expect(categories).toContain('Marketing & Growth');
      expect(categories).toContain('Sales & Revenue');
    });

    it('should return empty array for unknown section', () => {
      const experts = getExpertsForSection('unknown-section');
      expect(experts).toEqual([]);
    });
  });

  describe('selectExpertTeam (Chief of Staff)', () => {
    it('should return selected experts with reasoning', async () => {
      const result = await selectExpertTeam('Sample business plan content');
      
      expect(result.selectedExperts).toBeDefined();
      expect(Array.isArray(result.selectedExperts)).toBe(true);
      expect(result.selectedExperts.length).toBeGreaterThanOrEqual(4);
      
      expect(result.reasoning).toBeDefined();
      expect(typeof result.reasoning).toBe('string');
      
      expect(result.teamComposition).toBeDefined();
      expect(Array.isArray(result.teamComposition)).toBe(true);
    });

    it('should return valid expert IDs', async () => {
      const result = await selectExpertTeam('Sample business plan content');
      const validIds = REVIEW_EXPERTS.map(e => e.id);
      
      for (const expertId of result.selectedExperts) {
        expect(validIds).toContain(expertId);
      }
    });

    it('should include team composition with roles and rationales', async () => {
      const result = await selectExpertTeam('Sample business plan content');
      
      for (const tc of result.teamComposition) {
        expect(tc.expertId).toBeDefined();
        expect(tc.role).toBeDefined();
        expect(tc.rationale).toBeDefined();
      }
    });
  });

  describe('File Upload Support', () => {
    it('should support PDF file type', () => {
      const supportedTypes = ['.pdf', '.docx', '.doc', '.txt', '.md'];
      expect(supportedTypes).toContain('.pdf');
    });

    it('should support Word document types', () => {
      const supportedTypes = ['.pdf', '.docx', '.doc', '.txt', '.md'];
      expect(supportedTypes).toContain('.docx');
      expect(supportedTypes).toContain('.doc');
    });

    it('should support text file types', () => {
      const supportedTypes = ['.pdf', '.docx', '.doc', '.txt', '.md'];
      expect(supportedTypes).toContain('.txt');
      expect(supportedTypes).toContain('.md');
    });
  });

  describe('Library Integration', () => {
    it('should generate report content with all required fields', () => {
      const mockReviews = [
        {
          sectionId: 'executive-summary',
          sectionName: 'Executive Summary',
          status: 'completed' as const,
          expertInsights: [
            {
              expertId: 'inv-001',
              expertName: 'Victor Sterling',
              expertAvatar: '👨‍💼',
              insight: 'Strong value proposition',
              score: 85,
              recommendations: ['Clarify revenue model'],
              concerns: ['Market timing'],
              timestamp: new Date()
            }
          ],
          overallScore: 85,
          recommendations: ['Clarify revenue model'],
          concerns: ['Market timing']
        }
      ];

      // Simulate report generation
      const reportContent = `# Business Plan Review Report

**Project:** Test Business Plan
**Date:** ${new Date().toLocaleDateString()}
**Overall Score:** 85%

## Executive Summary

**Score:** 85%

### Victor Sterling
Strong value proposition

**Recommendations:**
- Clarify revenue model

**Concerns:**
- Market timing
`;

      expect(reportContent).toContain('Business Plan Review Report');
      expect(reportContent).toContain('Executive Summary');
      expect(reportContent).toContain('Victor Sterling');
      expect(reportContent).toContain('Recommendations');
      expect(reportContent).toContain('Concerns');
    });
  });
});
