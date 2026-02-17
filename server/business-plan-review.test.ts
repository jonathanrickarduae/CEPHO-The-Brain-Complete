import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  BUSINESS_PLAN_SECTIONS, 
  REVIEW_EXPERTS, 
  getExpertsForSection,
  generateConsolidatedReport,
  type SectionReview
} from './services/business-plan-review.service';

describe('Business Plan Review Service', () => {
  describe('BUSINESS_PLAN_SECTIONS', () => {
    it('should have 10 business plan sections', () => {
      expect(BUSINESS_PLAN_SECTIONS.length).toBe(10);
    });

    it('should have required fields for each section', () => {
      for (const section of BUSINESS_PLAN_SECTIONS) {
        expect(section.id).toBeDefined();
        expect(section.name).toBeDefined();
        expect(section.description).toBeDefined();
        expect(section.expertCategories).toBeDefined();
        expect(section.expertCategories.length).toBeGreaterThan(0);
        expect(section.keyQuestions).toBeDefined();
        expect(section.keyQuestions.length).toBeGreaterThan(0);
      }
    });

    it('should include key business plan sections', () => {
      const sectionIds = BUSINESS_PLAN_SECTIONS.map(s => s.id);
      expect(sectionIds).toContain('executive-summary');
      expect(sectionIds).toContain('market-analysis');
      expect(sectionIds).toContain('competitive-landscape');
      expect(sectionIds).toContain('go-to-market');
      expect(sectionIds).toContain('pricing-strategy');
      expect(sectionIds).toContain('financial-projections');
      expect(sectionIds).toContain('risk-assessment');
      expect(sectionIds).toContain('funding-requirements');
    });
  });

  describe('REVIEW_EXPERTS', () => {
    it('should have 8 review experts', () => {
      expect(REVIEW_EXPERTS.length).toBe(8);
    });

    it('should have required fields for each expert', () => {
      for (const expert of REVIEW_EXPERTS) {
        expect(expert.id).toBeDefined();
        expect(expert.name).toBeDefined();
        expect(expert.specialty).toBeDefined();
        expect(expert.category).toBeDefined();
        expect(expert.avatar).toBeDefined();
        expect(expert.systemPrompt).toBeDefined();
      }
    });

    it('should cover all required expert categories', () => {
      const categories = [...new Set(REVIEW_EXPERTS.map(e => e.category))];
      expect(categories).toContain('Investment & Finance');
      expect(categories).toContain('Strategy & Leadership');
      expect(categories).toContain('Marketing & Growth');
      expect(categories).toContain('Sales & Revenue');
      expect(categories).toContain('Technology & Innovation');
      expect(categories).toContain('Operations & Execution');
      expect(categories).toContain('Legal & Compliance');
    });
  });

  describe('getExpertsForSection', () => {
    it('should return experts for executive-summary section', () => {
      const experts = getExpertsForSection('executive-summary');
      expect(experts.length).toBeGreaterThan(0);
      
      // Executive summary should have Strategy & Leadership and Investment & Finance experts
      const categories = experts.map(e => e.category);
      expect(categories.some(c => c === 'Strategy & Leadership' || c === 'Investment & Finance')).toBe(true);
    });

    it('should return experts for go-to-market section', () => {
      const experts = getExpertsForSection('go-to-market');
      expect(experts.length).toBeGreaterThan(0);
      
      // GTM should have Marketing & Growth and Sales & Revenue experts
      const categories = experts.map(e => e.category);
      expect(categories.some(c => c === 'Marketing & Growth' || c === 'Sales & Revenue')).toBe(true);
    });

    it('should return experts for pricing-strategy section', () => {
      const experts = getExpertsForSection('pricing-strategy');
      expect(experts.length).toBeGreaterThan(0);
      
      // Pricing should have Investment & Finance and Sales & Revenue experts
      const categories = experts.map(e => e.category);
      expect(categories.some(c => c === 'Investment & Finance' || c === 'Sales & Revenue')).toBe(true);
    });

    it('should return empty array for unknown section', () => {
      const experts = getExpertsForSection('unknown-section');
      expect(experts).toEqual([]);
    });

    it('should return experts for risk-assessment section', () => {
      const experts = getExpertsForSection('risk-assessment');
      expect(experts.length).toBeGreaterThan(0);
      
      // Risk assessment should have Legal & Compliance and Investment & Finance experts
      const categories = experts.map(e => e.category);
      expect(categories.some(c => c === 'Legal & Compliance' || c === 'Investment & Finance')).toBe(true);
    });
  });

  describe('generateConsolidatedReport', () => {
    const mockReviews: SectionReview[] = [
      {
        sectionId: 'executive-summary',
        sectionName: 'Executive Summary',
        status: 'completed',
        expertInsights: [
          {
            expertId: 'inv-001',
            expertName: 'Victor Sterling',
            expertAvatar: '👨‍💼',
            insight: 'The executive summary effectively communicates the value proposition.',
            score: 85,
            recommendations: ['Strengthen the opening hook', 'Add quantified market opportunity'],
            concerns: ['Value proposition could be clearer'],
            timestamp: new Date()
          }
        ],
        overallScore: 85,
        recommendations: ['Strengthen the opening hook', 'Add quantified market opportunity'],
        concerns: ['Value proposition could be clearer']
      },
      {
        sectionId: 'market-analysis',
        sectionName: 'Market Analysis',
        status: 'completed',
        expertInsights: [
          {
            expertId: 'str-001',
            expertName: 'Alexandra Strategy',
            expertAvatar: '🎯',
            insight: 'Market analysis demonstrates solid research methodology.',
            score: 80,
            recommendations: ['Include primary research data'],
            concerns: ['Market size assumptions need validation'],
            timestamp: new Date()
          }
        ],
        overallScore: 80,
        recommendations: ['Include primary research data'],
        concerns: ['Market size assumptions need validation']
      }
    ];

    it('should generate a markdown report', () => {
      const report = generateConsolidatedReport(mockReviews);
      expect(report).toContain('# Business Plan Review Report');
      expect(report).toContain('## Overall Assessment');
      expect(report).toContain('## Section-by-Section Analysis');
    });

    it('should include overall score in report', () => {
      const report = generateConsolidatedReport(mockReviews);
      // Average of 85 and 80 is 82.5, rounded to 83 or 82
      expect(report).toMatch(/Overall Score: \d+%/);
    });

    it('should include section names in report', () => {
      const report = generateConsolidatedReport(mockReviews);
      expect(report).toContain('Executive Summary');
      expect(report).toContain('Market Analysis');
    });

    it('should include expert insights in report', () => {
      const report = generateConsolidatedReport(mockReviews);
      expect(report).toContain('Victor Sterling');
      expect(report).toContain('Alexandra Strategy');
    });

    it('should include recommendations in report', () => {
      const report = generateConsolidatedReport(mockReviews);
      expect(report).toContain('Strengthen the opening hook');
      expect(report).toContain('Include primary research data');
    });

    it('should include concerns in report', () => {
      const report = generateConsolidatedReport(mockReviews);
      expect(report).toContain('Value proposition could be clearer');
      expect(report).toContain('Market size assumptions need validation');
    });
  });

  describe('Section-Expert Category Mapping', () => {
    it('should map financial sections to finance experts', () => {
      const financialSections = ['financial-projections', 'funding-requirements', 'pricing-strategy'];
      
      for (const sectionId of financialSections) {
        const experts = getExpertsForSection(sectionId);
        const hasFinanceExpert = experts.some(e => e.category === 'Investment & Finance');
        expect(hasFinanceExpert).toBe(true);
      }
    });

    it('should map strategy sections to strategy experts', () => {
      const strategySections = ['executive-summary', 'market-analysis', 'competitive-landscape'];
      
      for (const sectionId of strategySections) {
        const experts = getExpertsForSection(sectionId);
        const hasStrategyExpert = experts.some(e => e.category === 'Strategy & Leadership');
        expect(hasStrategyExpert).toBe(true);
      }
    });

    it('should map marketing sections to marketing experts', () => {
      const marketingSections = ['go-to-market', 'competitive-landscape'];
      
      for (const sectionId of marketingSections) {
        const experts = getExpertsForSection(sectionId);
        const hasMarketingExpert = experts.some(e => e.category === 'Marketing & Growth');
        expect(hasMarketingExpert).toBe(true);
      }
    });

    it('should map technology sections to tech experts', () => {
      const techSections = ['product-technology'];
      
      for (const sectionId of techSections) {
        const experts = getExpertsForSection(sectionId);
        const hasTechExpert = experts.some(e => e.category === 'Technology & Innovation');
        expect(hasTechExpert).toBe(true);
      }
    });

    it('should map legal sections to legal experts', () => {
      const legalSections = ['risk-assessment'];
      
      for (const sectionId of legalSections) {
        const experts = getExpertsForSection(sectionId);
        const hasLegalExpert = experts.some(e => e.category === 'Legal & Compliance');
        expect(hasLegalExpert).toBe(true);
      }
    });
  });
});
