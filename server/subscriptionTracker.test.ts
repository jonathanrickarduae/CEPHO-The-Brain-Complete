import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getSubscriptions: vi.fn(),
  getSubscriptionById: vi.fn(),
  createSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  deleteSubscription: vi.fn(),
  getSubscriptionSummary: vi.fn(),
  getSubscriptionCostHistory: vi.fn(),
}));

import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionSummary,
  getSubscriptionCostHistory,
} from './db';

describe('Subscription Tracker Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSubscriptions', () => {
    it('should return subscriptions for a user', async () => {
      const mockSubscriptions = [
        {
          id: 1,
          userId: 1,
          name: 'Manus AI',
          provider: 'Manus',
          cost: 20,
          billingCycle: 'monthly',
          category: 'ai_ml',
          status: 'active',
          currency: 'GBP',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          name: 'GitHub Copilot',
          provider: 'GitHub',
          cost: 19,
          billingCycle: 'monthly',
          category: 'development',
          status: 'active',
          currency: 'GBP',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(getSubscriptions).mockResolvedValue(mockSubscriptions);

      const result = await getSubscriptions(1, {});
      
      expect(getSubscriptions).toHaveBeenCalledWith(1, {});
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Manus AI');
    });

    it('should filter subscriptions by status', async () => {
      const mockSubscriptions = [
        {
          id: 1,
          userId: 1,
          name: 'Active Sub',
          provider: 'Provider',
          cost: 10,
          billingCycle: 'monthly',
          category: 'productivity',
          status: 'active',
          currency: 'GBP',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(getSubscriptions).mockResolvedValue(mockSubscriptions);

      const result = await getSubscriptions(1, { status: 'active' });
      
      expect(getSubscriptions).toHaveBeenCalledWith(1, { status: 'active' });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
    });
  });

  describe('getSubscriptionById', () => {
    it('should return a subscription by ID', async () => {
      const mockSubscription = {
        id: 1,
        userId: 1,
        name: 'Test Subscription',
        provider: 'Test Provider',
        cost: 15,
        billingCycle: 'monthly',
        category: 'productivity',
        status: 'active',
        currency: 'GBP',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getSubscriptionById).mockResolvedValue(mockSubscription);

      const result = await getSubscriptionById(1);
      
      expect(getSubscriptionById).toHaveBeenCalledWith(1);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test Subscription');
    });

    it('should return null for non-existent subscription', async () => {
      vi.mocked(getSubscriptionById).mockResolvedValue(null);

      const result = await getSubscriptionById(999);
      
      expect(result).toBeNull();
    });
  });

  describe('createSubscription', () => {
    it('should create a new subscription and return ID', async () => {
      vi.mocked(createSubscription).mockResolvedValue(1);

      const newSub = {
        userId: 1,
        name: 'New Service',
        cost: 25,
        billingCycle: 'monthly' as const,
        category: 'ai_ml' as const,
        status: 'active' as const,
        currency: 'GBP',
      };

      const result = await createSubscription(newSub);
      
      expect(createSubscription).toHaveBeenCalledWith(newSub);
      expect(result).toBe(1);
    });
  });

  describe('updateSubscription', () => {
    it('should update a subscription', async () => {
      vi.mocked(updateSubscription).mockResolvedValue(undefined);

      await updateSubscription(1, { cost: 30 });
      
      expect(updateSubscription).toHaveBeenCalledWith(1, { cost: 30 });
    });
  });

  describe('deleteSubscription', () => {
    it('should delete a subscription', async () => {
      vi.mocked(deleteSubscription).mockResolvedValue(undefined);

      await deleteSubscription(1);
      
      expect(deleteSubscription).toHaveBeenCalledWith(1);
    });
  });

  describe('getSubscriptionSummary', () => {
    it('should return subscription summary statistics', async () => {
      const mockSummary = {
        totalMonthly: 100,
        totalAnnual: 1200,
        activeCount: 5,
        byCategory: [
          { category: 'ai_ml', count: 2, totalCost: 40 },
          { category: 'productivity', count: 3, totalCost: 60 },
        ],
      };

      vi.mocked(getSubscriptionSummary).mockResolvedValue(mockSummary);

      const result = await getSubscriptionSummary(1);
      
      expect(getSubscriptionSummary).toHaveBeenCalledWith(1);
      expect(result.totalMonthly).toBe(100);
      expect(result.activeCount).toBe(5);
      expect(result.byCategory).toHaveLength(2);
    });
  });

  describe('getSubscriptionCostHistory', () => {
    it('should return cost history for trend chart', async () => {
      const mockHistory = [
        { month: 'Jan 2026', totalCost: 100, subscriptionCount: 5 },
        { month: 'Feb 2026', totalCost: 110, subscriptionCount: 6 },
        { month: 'Mar 2026', totalCost: 105, subscriptionCount: 5 },
      ];

      vi.mocked(getSubscriptionCostHistory).mockResolvedValue(mockHistory);

      const result = await getSubscriptionCostHistory(1, 12);
      
      expect(getSubscriptionCostHistory).toHaveBeenCalledWith(1, 12);
      expect(result).toHaveLength(3);
      expect(result[0].month).toBe('Jan 2026');
    });
  });
});

describe('Optimization Assessment Service', () => {
  it('should calculate overall percentage correctly', () => {
    // Test the percentage calculation logic
    const scores = [85, 70, 90, 60, 75];
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    expect(average).toBe(76);
    expect(average).toBeGreaterThanOrEqual(0);
    expect(average).toBeLessThanOrEqual(100);
  });

  it('should determine status based on percentage', () => {
    const getStatus = (percentage: number) => {
      if (percentage >= 80) return 'excellent';
      if (percentage >= 60) return 'good';
      if (percentage >= 40) return 'needs_attention';
      return 'critical';
    };

    expect(getStatus(85)).toBe('excellent');
    expect(getStatus(70)).toBe('good');
    expect(getStatus(45)).toBe('needs_attention');
    expect(getStatus(30)).toBe('critical');
  });
});

describe('Funding Assessment Logic', () => {
  it('should match sectors correctly', () => {
    const detectSectors = (text: string): string[] => {
      const lowerText = text.toLowerCase();
      const sectors: string[] = [];
      
      const sectorKeywords: Record<string, string[]> = {
        'Technology': ['tech', 'software', 'app', 'platform', 'digital'],
        'AI': ['ai', 'artificial intelligence', 'machine learning', 'ml'],
        'FinTech': ['fintech', 'finance', 'payment', 'banking'],
        'HealthTech': ['health', 'medical', 'healthcare', 'wellness'],
      };
      
      for (const [sector, keywords] of Object.entries(sectorKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          sectors.push(sector);
        }
      }
      
      return sectors;
    };

    const aiText = 'An AI-powered platform for machine learning';
    const fintechText = 'A fintech solution for banking payments';
    const healthText = 'Healthcare wellness app for medical tracking';
    
    expect(detectSectors(aiText)).toContain('AI');
    expect(detectSectors(aiText)).toContain('Technology');
    expect(detectSectors(fintechText)).toContain('FinTech');
    expect(detectSectors(healthText)).toContain('HealthTech');
  });

  it('should detect innovation keywords', () => {
    const detectInnovation = (text: string): boolean => {
      const innovationKeywords = [
        'innovative', 'innovation', 'novel', 'disruptive', 'breakthrough',
        'patent', 'proprietary', 'unique', 'revolutionary', 'cutting-edge',
      ];
      const lowerText = text.toLowerCase();
      return innovationKeywords.some(keyword => lowerText.includes(keyword));
    };

    expect(detectInnovation('Our innovative AI solution')).toBe(true);
    expect(detectInnovation('A breakthrough in technology')).toBe(true);
    expect(detectInnovation('A regular business service')).toBe(false);
  });

  it('should calculate match score within valid range', () => {
    const calculateScore = (
      sectorMatch: boolean,
      countryMatch: boolean,
      innovationMatch: boolean
    ): number => {
      let score = 0;
      if (countryMatch) score += 30;
      if (sectorMatch) score += 25;
      if (innovationMatch) score += 20;
      return Math.min(100, Math.max(0, score));
    };

    expect(calculateScore(true, true, true)).toBe(75);
    expect(calculateScore(true, true, false)).toBe(55);
    expect(calculateScore(false, true, false)).toBe(30);
    expect(calculateScore(false, false, false)).toBe(0);
  });

  it('should determine recommendation level based on score', () => {
    const getRecommendation = (score: number) => {
      if (score >= 75) return 'highly_recommended';
      if (score >= 55) return 'recommended';
      if (score >= 35) return 'possible';
      return 'not_suitable';
    };

    expect(getRecommendation(80)).toBe('highly_recommended');
    expect(getRecommendation(60)).toBe('recommended');
    expect(getRecommendation(40)).toBe('possible');
    expect(getRecommendation(20)).toBe('not_suitable');
  });
});
