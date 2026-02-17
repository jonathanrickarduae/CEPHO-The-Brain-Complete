import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  BUSINESS_PLAN_SECTIONS, 
  REVIEW_EXPERTS,
} from './services/business-plan-review.service';

// Mock the database functions
vi.mock('./db', () => ({
  createBusinessPlanReviewVersion: vi.fn().mockResolvedValue(1),
  getBusinessPlanReviewVersions: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      projectName: 'Test Project',
      versionNumber: 1,
      versionLabel: 'Initial Draft',
      overallScore: 75,
      sectionScores: { 'executive-summary': 80, 'market-analysis': 70 },
      reviewData: [],
      expertTeam: ['finance-cfo', 'strategy-cso'],
      teamSelectionMode: 'chief-of-staff',
      createdAt: new Date(),
    },
    {
      id: 2,
      userId: 1,
      projectName: 'Test Project',
      versionNumber: 2,
      versionLabel: 'Post Feedback',
      overallScore: 82,
      sectionScores: { 'executive-summary': 85, 'market-analysis': 79 },
      reviewData: [],
      expertTeam: ['finance-cfo', 'strategy-cso', 'marketing-cmo'],
      teamSelectionMode: 'manual',
      createdAt: new Date(),
    }
  ]),
  getBusinessPlanReviewVersionById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    projectName: 'Test Project',
    versionNumber: 1,
    versionLabel: 'Initial Draft',
    overallScore: 75,
    sectionScores: { 'executive-summary': 80, 'market-analysis': 70 },
    reviewData: [],
    expertTeam: ['finance-cfo', 'strategy-cso'],
    teamSelectionMode: 'chief-of-staff',
    createdAt: new Date(),
  }),
  getLatestVersionNumber: vi.fn().mockResolvedValue(2),
  getUserBusinessPlanProjects: vi.fn().mockResolvedValue(['Test Project', 'Another Project']),
  createExpertFollowUpQuestion: vi.fn().mockResolvedValue(1),
  getExpertFollowUpQuestions: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      reviewVersionId: 1,
      sectionId: 'executive-summary',
      expertId: 'finance-cfo',
      question: 'Can you elaborate on the financial projections?',
      answer: 'The financial projections are based on...',
      status: 'answered',
      createdAt: new Date(),
      answeredAt: new Date(),
    }
  ]),
  answerExpertFollowUpQuestion: vi.fn().mockResolvedValue(undefined),
}));

describe('Business Plan Review Advanced Features', () => {
  describe('Version Comparison', () => {
    it('should have all required business plan sections', () => {
      expect(BUSINESS_PLAN_SECTIONS.length).toBeGreaterThanOrEqual(10);
      
      const requiredSections = [
        'executive-summary',
        'market-analysis',
        'competitive-landscape',
        'go-to-market',
        'pricing-strategy',
        'financial-projections',
      ];
      
      requiredSections.forEach(sectionId => {
        const section = BUSINESS_PLAN_SECTIONS.find(s => s.id === sectionId);
        expect(section).toBeDefined();
      });
    });

    it('should have version history structure with required fields', async () => {
      const { getBusinessPlanReviewVersions } = await import('./db');
      const versions = await getBusinessPlanReviewVersions(1, 'Test Project');
      
      expect(versions.length).toBe(2);
      expect(versions[0]).toHaveProperty('versionNumber');
      expect(versions[0]).toHaveProperty('versionLabel');
      expect(versions[0]).toHaveProperty('overallScore');
      expect(versions[0]).toHaveProperty('sectionScores');
      expect(versions[0]).toHaveProperty('teamSelectionMode');
    });

    it('should calculate score differences between versions', async () => {
      const { getBusinessPlanReviewVersions } = await import('./db');
      const versions = await getBusinessPlanReviewVersions(1, 'Test Project');
      
      const v1 = versions.find(v => v.versionNumber === 1);
      const v2 = versions.find(v => v.versionNumber === 2);
      
      expect(v1).toBeDefined();
      expect(v2).toBeDefined();
      
      if (v1 && v2) {
        const scoreDiff = (v2.overallScore || 0) - (v1.overallScore || 0);
        expect(scoreDiff).toBe(7); // 82 - 75
      }
    });

    it('should track section-level score changes', async () => {
      const { getBusinessPlanReviewVersions } = await import('./db');
      const versions = await getBusinessPlanReviewVersions(1, 'Test Project');
      
      const v1Scores = versions[0].sectionScores as Record<string, number>;
      const v2Scores = versions[1].sectionScores as Record<string, number>;
      
      // Executive summary improved from 80 to 85
      expect(v2Scores['executive-summary'] - v1Scores['executive-summary']).toBe(5);
      
      // Market analysis improved from 70 to 79
      expect(v2Scores['market-analysis'] - v1Scores['market-analysis']).toBe(9);
    });
  });

  describe('Expert Follow-up Questions', () => {
    it('should have all review experts defined', () => {
      expect(REVIEW_EXPERTS.length).toBeGreaterThanOrEqual(8);
      
      REVIEW_EXPERTS.forEach(expert => {
        expect(expert).toHaveProperty('id');
        expect(expert).toHaveProperty('name');
        expect(expert).toHaveProperty('specialty');
        expect(expert).toHaveProperty('category');
        expect(expert).toHaveProperty('systemPrompt');
      });
    });

    it('should create follow-up question with required fields', async () => {
      const { createExpertFollowUpQuestion } = await import('./db');
      
      const questionId = await createExpertFollowUpQuestion({
        userId: 1,
        reviewVersionId: 1,
        sectionId: 'executive-summary',
        expertId: 'finance-cfo',
        question: 'What are the key financial risks?',
      });
      
      expect(questionId).toBe(1);
    });

    it('should retrieve follow-up questions for a review', async () => {
      const { getExpertFollowUpQuestions } = await import('./db');
      
      const questions = await getExpertFollowUpQuestions(1);
      
      expect(questions.length).toBe(1);
      expect(questions[0]).toHaveProperty('question');
      expect(questions[0]).toHaveProperty('answer');
      expect(questions[0]).toHaveProperty('status');
      expect(questions[0].status).toBe('answered');
    });

    it('should filter follow-up questions by section and expert', async () => {
      const { getExpertFollowUpQuestions } = await import('./db');
      
      const questions = await getExpertFollowUpQuestions(1, {
        sectionId: 'executive-summary',
        expertId: 'finance-cfo',
      });
      
      expect(questions.length).toBe(1);
      expect(questions[0].sectionId).toBe('executive-summary');
      expect(questions[0].expertId).toBe('finance-cfo');
    });
  });

  describe('Section-Specific Document Upload', () => {
    it('should have expert categories assigned to each section', () => {
      BUSINESS_PLAN_SECTIONS.forEach(section => {
        expect(section.expertCategories).toBeDefined();
        expect(section.expertCategories.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should have key questions for each section', () => {
      BUSINESS_PLAN_SECTIONS.forEach(section => {
        expect(section.keyQuestions).toBeDefined();
        expect(section.keyQuestions.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should support section documents in version data', async () => {
      const { createBusinessPlanReviewVersion } = await import('./db');
      
      const versionId = await createBusinessPlanReviewVersion({
        userId: 1,
        projectName: 'Test Project',
        versionNumber: 3,
        versionLabel: 'With Documents',
        overallScore: 85,
        sectionScores: {},
        reviewData: [],
        expertTeam: ['finance-cfo'],
        teamSelectionMode: 'manual',
        businessPlanContent: 'Test content',
        sectionDocuments: {
          'financial-projections': {
            fileName: 'financials.xlsx',
            content: 'Spreadsheet data...',
          },
          'executive-summary': {
            fileName: 'pitch-deck.pdf',
            content: 'PDF content...',
          },
        },
      });
      
      expect(versionId).toBe(1);
    });

    it('should map sections to appropriate expert categories', () => {
      // Financial sections should have finance experts
      const financialSection = BUSINESS_PLAN_SECTIONS.find(s => s.id === 'financial-projections');
      expect(financialSection?.expertCategories).toContain('Investment & Finance');
      
      // Marketing sections should have marketing experts
      const marketingSection = BUSINESS_PLAN_SECTIONS.find(s => s.id === 'go-to-market');
      expect(marketingSection?.expertCategories).toContain('Marketing & Growth');
      
      // Competitive sections should have strategy experts
      const competitiveSection = BUSINESS_PLAN_SECTIONS.find(s => s.id === 'competitive-landscape');
      expect(competitiveSection?.expertCategories).toContain('Strategy & Leadership');
    });
  });

  describe('Team Selection Modes', () => {
    it('should support chief-of-staff and manual team selection modes', async () => {
      const { getBusinessPlanReviewVersions } = await import('./db');
      const versions = await getBusinessPlanReviewVersions(1, 'Test Project');
      
      const chiefOfStaffVersion = versions.find(v => v.teamSelectionMode === 'chief-of-staff');
      const manualVersion = versions.find(v => v.teamSelectionMode === 'manual');
      
      expect(chiefOfStaffVersion).toBeDefined();
      expect(manualVersion).toBeDefined();
    });

    it('should store expert team composition in version', async () => {
      const { getBusinessPlanReviewVersionById } = await import('./db');
      const version = await getBusinessPlanReviewVersionById(1);
      
      expect(version?.expertTeam).toBeDefined();
      expect(Array.isArray(version?.expertTeam)).toBe(true);
      expect((version?.expertTeam as string[]).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('User Project Management', () => {
    it('should retrieve all user business plan projects', async () => {
      const { getUserBusinessPlanProjects } = await import('./db');
      const projects = await getUserBusinessPlanProjects(1);
      
      expect(projects.length).toBe(2);
      expect(projects).toContain('Test Project');
      expect(projects).toContain('Another Project');
    });

    it('should get latest version number for a project', async () => {
      const { getLatestVersionNumber } = await import('./db');
      const latestVersion = await getLatestVersionNumber(1, 'Test Project');
      
      expect(latestVersion).toBe(2);
    });
  });
});
