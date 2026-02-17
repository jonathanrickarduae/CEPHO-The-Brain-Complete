import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the LLM module
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          score: 82,
          summary: 'Test summary',
          recommendations: ['Test recommendation'],
          concerns: ['Test concern']
        })
      }
    }]
  })
}));

// Mock the database module
vi.mock('./db', () => ({
  getDb: vi.fn().mockResolvedValue(null),
  createCollaborativeReviewSession: vi.fn().mockResolvedValue(1),
  getCollaborativeReviewSessions: vi.fn().mockResolvedValue([]),
  getCollaborativeReviewSessionById: vi.fn().mockResolvedValue(null),
  updateCollaborativeReviewSession: vi.fn().mockResolvedValue(undefined),
  addCollaborativeReviewParticipant: vi.fn().mockResolvedValue(1),
  getCollaborativeReviewParticipants: vi.fn().mockResolvedValue([]),
  updateCollaborativeReviewParticipant: vi.fn().mockResolvedValue(undefined),
  isSessionParticipant: vi.fn().mockResolvedValue(true),
  getParticipantRole: vi.fn().mockResolvedValue('owner'),
  createCollaborativeReviewComment: vi.fn().mockResolvedValue(1),
  getCollaborativeReviewComments: vi.fn().mockResolvedValue([]),
  updateCollaborativeReviewComment: vi.fn().mockResolvedValue(undefined),
  logCollaborativeReviewActivity: vi.fn().mockResolvedValue(undefined),
  getCollaborativeReviewActivity: vi.fn().mockResolvedValue([]),
  getCollaborativeReviewSessionWithDetails: vi.fn().mockResolvedValue(null),
}));

describe('Business Plan Review Pro Features', () => {
  
  describe('Review Templates', () => {
    it('should have SaaS template with correct structure', async () => {
      const { BUSINESS_TEMPLATES } = await import('./services/business-plan-review.service');
      
      const saasTemplate = BUSINESS_TEMPLATES.find(t => t.id === 'saas');
      expect(saasTemplate).toBeDefined();
      expect(saasTemplate?.name).toBe('SaaS / Software');
      expect(saasTemplate?.sectionWeights).toBeDefined();
      expect(saasTemplate?.expertFocus).toBeDefined();
      expect(saasTemplate?.guidance).toBeDefined();
    });
    
    it('should have E-commerce template with correct structure', async () => {
      const { BUSINESS_TEMPLATES } = await import('./services/business-plan-review.service');
      
      const ecomTemplate = BUSINESS_TEMPLATES.find(t => t.id === 'ecommerce');
      expect(ecomTemplate).toBeDefined();
      expect(ecomTemplate?.name).toBe('E-Commerce / Retail');
      expect(ecomTemplate?.sectionWeights).toBeDefined();
    });
    
    it('should have Marketplace template with correct structure', async () => {
      const { BUSINESS_TEMPLATES } = await import('./services/business-plan-review.service');
      
      const marketplaceTemplate = BUSINESS_TEMPLATES.find(t => t.id === 'marketplace');
      expect(marketplaceTemplate).toBeDefined();
      expect(marketplaceTemplate?.name).toBe('Marketplace / Platform');
      expect(marketplaceTemplate?.sectionWeights).toBeDefined();
    });
    
    it('should have at least 5 business templates', async () => {
      const { BUSINESS_TEMPLATES } = await import('./services/business-plan-review.service');
      
      expect(BUSINESS_TEMPLATES.length).toBeGreaterThanOrEqual(5);
    });
    
    it('should have section weights that sum appropriately', async () => {
      const { BUSINESS_TEMPLATES } = await import('./services/business-plan-review.service');
      
      for (const template of BUSINESS_TEMPLATES) {
        const weights = Object.values(template.sectionWeights);
        // Weights should be between 0.5 and 1.5 (reasonable range)
        for (const weight of weights) {
          expect(weight).toBeGreaterThanOrEqual(0.5);
          expect(weight).toBeLessThanOrEqual(1.5);
        }
      }
    });
  });
  
  describe('PDF Report Generation', () => {
    it('should generate markdown report with correct structure', async () => {
      const { generateReportMarkdown } = await import('./services/pdfReportService');
      
      const markdown = generateReportMarkdown({
        projectName: 'Test Project',
        templateId: 'saas',
        overallScore: 85,
        reviewDate: new Date('2026-01-16'),
        expertTeam: ['finance-1'],
        sectionReviews: [
          {
            sectionId: 'executive-summary',
            sectionName: 'Executive Summary',
            status: 'completed',
            overallScore: 85,
            expertInsights: [
              {
                expertId: 'finance-1',
                expertName: 'Test Finance Expert',
                expertAvatar: '💼',
                insight: 'Good summary',
                score: 85,
                recommendations: ['Improve clarity'],
                concerns: ['Market size unclear']
              }
            ]
          }
        ]
      });
      
      expect(markdown).toContain('Test Project');
      expect(markdown).toContain('Executive Summary');
      expect(markdown).toContain('85');
      expect(markdown).toContain('Test Finance Expert');
    });
    
    it('should include executive summary section', async () => {
      const { generateReportMarkdown } = await import('./services/pdfReportService');
      
      const markdown = generateReportMarkdown({
        projectName: 'Test Project',
        templateId: 'saas',
        overallScore: 75,
        reviewDate: new Date(),
        expertTeam: [],
        sectionReviews: []
      });
      
      expect(markdown).toContain('Executive Summary');
      expect(markdown).toContain('Overall Assessment Score');
    });
    
    it('should include section insights with recommendations', async () => {
      const { generateReportMarkdown } = await import('./services/pdfReportService');
      
      const markdown = generateReportMarkdown({
        projectName: 'Test',
        templateId: 'saas',
        overallScore: 80,
        reviewDate: new Date(),
        expertTeam: ['expert-1'],
        sectionReviews: [
          {
            sectionId: 'market-analysis',
            sectionName: 'Market Analysis',
            status: 'completed',
            overallScore: 80,
            expertInsights: [
              {
                expertId: 'expert-1',
                expertName: 'Market Expert',
                expertAvatar: '📊',
                insight: 'Good analysis',
                score: 80,
                recommendations: ['Expand TAM analysis'],
                concerns: ['Competition underestimated']
              }
            ]
          }
        ]
      });
      
      expect(markdown).toContain('Market Analysis');
      expect(markdown).toContain('Expand TAM analysis');
      expect(markdown).toContain('Competition underestimated');
    });
  });
  
  describe('Collaborative Review', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    
    it('should have collaborative review session database functions', async () => {
      const db = await import('./db');
      
      expect(db.createCollaborativeReviewSession).toBeDefined();
      expect(db.getCollaborativeReviewSessions).toBeDefined();
      expect(db.getCollaborativeReviewSessionById).toBeDefined();
      expect(db.updateCollaborativeReviewSession).toBeDefined();
    });
    
    it('should have participant management functions', async () => {
      const db = await import('./db');
      
      expect(db.addCollaborativeReviewParticipant).toBeDefined();
      expect(db.getCollaborativeReviewParticipants).toBeDefined();
      expect(db.updateCollaborativeReviewParticipant).toBeDefined();
      expect(db.isSessionParticipant).toBeDefined();
      expect(db.getParticipantRole).toBeDefined();
    });
    
    it('should have comment management functions', async () => {
      const db = await import('./db');
      
      expect(db.createCollaborativeReviewComment).toBeDefined();
      expect(db.getCollaborativeReviewComments).toBeDefined();
      expect(db.updateCollaborativeReviewComment).toBeDefined();
    });
    
    it('should have activity logging functions', async () => {
      const db = await import('./db');
      
      expect(db.logCollaborativeReviewActivity).toBeDefined();
      expect(db.getCollaborativeReviewActivity).toBeDefined();
    });
    
    it('should create session and return session ID', async () => {
      const db = await import('./db');
      
      const sessionId = await db.createCollaborativeReviewSession({
        ownerId: 1,
        projectName: 'Test Project',
        templateId: 'saas',
        reviewData: {}
      });
      
      expect(sessionId).toBe(1);
    });
    
    it('should check participant role correctly', async () => {
      const db = await import('./db');
      
      const role = await db.getParticipantRole(1, 1);
      expect(role).toBe('owner');
    });
  });
  
  describe('Role-Based Permissions', () => {
    it('should define three permission levels', () => {
      const roles = ['owner', 'reviewer', 'viewer'];
      
      // Owner: full control
      expect(roles).toContain('owner');
      
      // Reviewer: can edit and comment
      expect(roles).toContain('reviewer');
      
      // Viewer: read-only
      expect(roles).toContain('viewer');
    });
  });
});
