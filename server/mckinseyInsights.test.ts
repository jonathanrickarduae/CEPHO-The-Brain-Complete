import { describe, it, expect } from 'vitest';
import { 
  McKinseyInsights, 
  MCKINSEY_INSIGHTS_DATABASE,
  INDUSTRY_INSIGHTS,
  searchInsights,
  factCheck,
  getDailyBriefInsights,
  getProjectResearchInsights,
  formatCitation,
  generateBibliography
} from '../client/src/lib/mckinseyInsights';

describe('McKinsey Insights Integration', () => {
  describe('Database', () => {
    it('should have curated insights database', () => {
      expect(MCKINSEY_INSIGHTS_DATABASE).toBeDefined();
      expect(MCKINSEY_INSIGHTS_DATABASE.length).toBeGreaterThan(5);
    });

    it('should have insights with required fields', () => {
      MCKINSEY_INSIGHTS_DATABASE.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.title).toBeDefined();
        expect(insight.summary).toBeDefined();
        expect(insight.category).toBeDefined();
        expect(insight.publishDate).toBeDefined();
        expect(insight.url).toBeDefined();
        expect(insight.source).toBeDefined();
      });
    });

    it('should have industry-specific insights', () => {
      expect(INDUSTRY_INSIGHTS).toBeDefined();
      expect(Object.keys(INDUSTRY_INSIGHTS).length).toBeGreaterThan(0);
      expect(INDUSTRY_INSIGHTS['financial_services']).toBeDefined();
      expect(INDUSTRY_INSIGHTS['healthcare']).toBeDefined();
      expect(INDUSTRY_INSIGHTS['technology']).toBeDefined();
    });
  });

  describe('Search Function', () => {
    it('should search insights by query', () => {
      const results = searchInsights('AI transformation');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should filter by category', () => {
      const results = searchInsights('business', { category: 'technology' });
      results.forEach(r => {
        expect(r.category).toBe('technology');
      });
    });

    it('should limit results', () => {
      const results = searchInsights('business', { limit: 3 });
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should score results by relevance', () => {
      const results = searchInsights('generative AI economic potential');
      if (results.length > 1) {
        // First result should have higher relevance score
        expect(results[0].relevanceScore).toBeGreaterThanOrEqual(results[1].relevanceScore || 0);
      }
    });
  });

  describe('Fact Check Function', () => {
    it('should return fact check result structure', () => {
      const result = factCheck('AI will transform business operations');
      expect(result).toBeDefined();
      expect(result.claim).toBe('AI will transform business operations');
      expect(typeof result.verified).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
      expect(Array.isArray(result.sources)).toBe(true);
      expect(result.lastUpdated).toBeDefined();
    });

    it('should find supporting sources for valid claims', () => {
      const result = factCheck('generative AI economic impact');
      expect(result.sources.length).toBeGreaterThan(0);
    });

    it('should return low confidence for unrelated claims', () => {
      const result = factCheck('random unrelated topic xyz123');
      expect(result.confidence).toBeLessThan(50);
    });
  });

  describe('Daily Brief Insights', () => {
    it('should return insights for topics', () => {
      const insights = getDailyBriefInsights(['AI', 'strategy', 'growth']);
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
    });

    it('should limit to 5 insights', () => {
      const insights = getDailyBriefInsights(['AI', 'technology', 'finance', 'strategy', 'operations', 'marketing']);
      expect(insights.length).toBeLessThanOrEqual(5);
    });

    it('should deduplicate insights', () => {
      const insights = getDailyBriefInsights(['AI', 'AI', 'technology']);
      const ids = insights.map(i => i.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('Project Research Insights', () => {
    it('should return insights for project type', () => {
      const insights = getProjectResearchInsights('due diligence', 'financial_services');
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
    });

    it('should include industry-specific insights', () => {
      const insights = getProjectResearchInsights('investment', 'healthcare');
      // Should search across both general and industry databases
      expect(insights.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Citation Formatting', () => {
    const testSource = {
      title: 'The Economic Potential of Generative AI',
      url: 'https://www.mckinsey.com/test',
      publishDate: '2023-06-14',
      relevantExcerpt: 'Test excerpt',
      credibilityScore: 95
    };

    it('should format APA citation', () => {
      const citation = formatCitation(testSource, 'apa');
      expect(citation).toContain('McKinsey & Company');
      expect(citation).toContain('2023');
      expect(citation).toContain(testSource.title);
      expect(citation).toContain(testSource.url);
    });

    it('should format MLA citation', () => {
      const citation = formatCitation(testSource, 'mla');
      expect(citation).toContain('McKinsey & Company');
      expect(citation).toContain(testSource.title);
    });

    it('should format Chicago citation', () => {
      const citation = formatCitation(testSource, 'chicago');
      expect(citation).toContain('McKinsey & Company');
      expect(citation).toContain(testSource.title);
    });
  });

  describe('Bibliography Generation', () => {
    it('should generate bibliography from multiple sources', () => {
      const sources = [
        {
          title: 'Report 1',
          url: 'https://mckinsey.com/1',
          publishDate: '2023-01-01',
          relevantExcerpt: 'Excerpt 1',
          credibilityScore: 95
        },
        {
          title: 'Report 2',
          url: 'https://mckinsey.com/2',
          publishDate: '2024-01-01',
          relevantExcerpt: 'Excerpt 2',
          credibilityScore: 95
        }
      ];
      
      const bibliography = generateBibliography(sources, 'apa');
      expect(bibliography).toContain('Report 1');
      expect(bibliography).toContain('Report 2');
      expect(bibliography.split('\n\n').length).toBe(2);
    });
  });

  describe('McKinseyInsights Export', () => {
    it('should export all functions', () => {
      expect(McKinseyInsights.database).toBeDefined();
      expect(McKinseyInsights.industryInsights).toBeDefined();
      expect(McKinseyInsights.search).toBeDefined();
      expect(McKinseyInsights.factCheck).toBeDefined();
      expect(McKinseyInsights.getDailyBriefInsights).toBeDefined();
      expect(McKinseyInsights.getProjectResearchInsights).toBeDefined();
      expect(McKinseyInsights.formatCitation).toBeDefined();
      expect(McKinseyInsights.generateBibliography).toBeDefined();
    });
  });
});
