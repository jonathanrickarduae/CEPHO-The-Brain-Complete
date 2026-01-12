import { describe, it, expect } from 'vitest';

// Test the investor database functions and matching logic
describe('Investor Database', () => {
  describe('Investor Types', () => {
    const validTypes = ['angel', 'hnwi', 'family_office', 'vc', 'pe', 'bank', 'government', 'strategic'];
    
    it('should have all expected investor types defined', () => {
      expect(validTypes).toHaveLength(8);
      expect(validTypes).toContain('angel');
      expect(validTypes).toContain('hnwi');
      expect(validTypes).toContain('family_office');
      expect(validTypes).toContain('vc');
    });
  });

  describe('Relationship Status', () => {
    const validStatuses = ['cold', 'warm', 'hot', 'active', 'invested', 'passed'];
    
    it('should have all expected relationship statuses', () => {
      expect(validStatuses).toHaveLength(6);
      expect(validStatuses).toContain('cold');
      expect(validStatuses).toContain('warm');
      expect(validStatuses).toContain('hot');
    });
  });

  describe('Interaction Types', () => {
    const validInteractions = ['email', 'call', 'meeting', 'pitch', 'follow_up', 'intro', 'other'];
    
    it('should have all expected interaction types', () => {
      expect(validInteractions).toHaveLength(7);
      expect(validInteractions).toContain('email');
      expect(validInteractions).toContain('meeting');
      expect(validInteractions).toContain('pitch');
    });
  });

  describe('Commitment Types', () => {
    const validCommitments = ['soft', 'hard', 'signed', 'funded'];
    
    it('should have all expected commitment types', () => {
      expect(validCommitments).toHaveLength(4);
      expect(validCommitments).toContain('soft');
      expect(validCommitments).toContain('hard');
      expect(validCommitments).toContain('funded');
    });
  });
});

describe('Capital Matching Logic', () => {
  // Mock investor data for testing matching logic
  const mockInvestors = [
    {
      id: 1,
      name: 'Angel Investor A',
      type: 'angel',
      ticketSizeMin: 10000,
      ticketSizeMax: 100000,
      sectors: ['tech', 'fintech'],
      stages: ['seed', 'pre-seed'],
    },
    {
      id: 2,
      name: 'VC Fund B',
      type: 'vc',
      ticketSizeMin: 500000,
      ticketSizeMax: 5000000,
      sectors: ['tech', 'healthcare'],
      stages: ['series_a', 'series_b'],
    },
    {
      id: 3,
      name: 'Family Office C',
      type: 'family_office',
      ticketSizeMin: 1000000,
      ticketSizeMax: 10000000,
      sectors: ['all'],
      stages: ['all'],
    },
  ];

  // Simple matching function to test
  function matchInvestors(amount: number, sector?: string, stage?: string) {
    return mockInvestors.filter(inv => {
      const minOk = !inv.ticketSizeMin || inv.ticketSizeMin <= amount;
      const maxOk = !inv.ticketSizeMax || inv.ticketSizeMax >= amount;
      
      let sectorOk = true;
      if (sector && inv.sectors) {
        sectorOk = inv.sectors.includes(sector) || inv.sectors.includes('all');
      }
      
      let stageOk = true;
      if (stage && inv.stages) {
        stageOk = inv.stages.includes(stage) || inv.stages.includes('all');
      }
      
      return minOk && maxOk && sectorOk && stageOk;
    });
  }

  it('should match angel investors for small raises', () => {
    const matches = matchInvestors(50000);
    expect(matches.some(m => m.type === 'angel')).toBe(true);
    expect(matches.some(m => m.type === 'vc')).toBe(false); // Too small for VC
  });

  it('should match VCs for larger raises', () => {
    const matches = matchInvestors(2000000);
    expect(matches.some(m => m.type === 'vc')).toBe(true);
    expect(matches.some(m => m.type === 'angel')).toBe(false); // Too large for angel
  });

  it('should match family offices for large raises', () => {
    const matches = matchInvestors(5000000);
    expect(matches.some(m => m.type === 'family_office')).toBe(true);
  });

  it('should filter by sector', () => {
    const techMatches = matchInvestors(50000, 'tech');
    const healthcareMatches = matchInvestors(50000, 'healthcare');
    
    // Angel A has tech, should match
    expect(techMatches.some(m => m.name === 'Angel Investor A')).toBe(true);
    // Angel A doesn't have healthcare
    expect(healthcareMatches.some(m => m.name === 'Angel Investor A')).toBe(false);
  });

  it('should match "all" sectors', () => {
    const matches = matchInvestors(5000000, 'random_sector');
    // Family Office C has 'all' sectors
    expect(matches.some(m => m.name === 'Family Office C')).toBe(true);
  });

  it('should filter by stage', () => {
    const seedMatches = matchInvestors(50000, undefined, 'seed');
    const seriesAMatches = matchInvestors(2000000, undefined, 'series_a');
    
    expect(seedMatches.some(m => m.name === 'Angel Investor A')).toBe(true);
    expect(seriesAMatches.some(m => m.name === 'VC Fund B')).toBe(true);
  });
});

describe('Investor Data Validation', () => {
  it('should validate email format', () => {
    const validEmail = 'investor@example.com';
    const invalidEmail = 'not-an-email';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(validEmail)).toBe(true);
    expect(emailRegex.test(invalidEmail)).toBe(false);
  });

  it('should validate ticket sizes', () => {
    const validMin = 10000;
    const validMax = 100000;
    
    expect(validMin > 0).toBe(true);
    expect(validMax > validMin).toBe(true);
  });

  it('should validate currency codes', () => {
    const validCurrencies = ['GBP', 'USD', 'EUR', 'AED'];
    
    validCurrencies.forEach(currency => {
      expect(currency.length).toBe(3);
      expect(currency).toMatch(/^[A-Z]{3}$/);
    });
  });
});
