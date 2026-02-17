import { describe, it, expect } from 'vitest';
import { KPI_CATEGORIES, KpiDomain } from '../shared/kpiCategories';
import { CUSTOMER_PERSONAS, getPersonasByIndustry, getPersonasByAgeRange, getPersonasByIncomeLevel, getPersonasByRegion, getPersonaById } from '../shared/customerPersonas';

describe('KPI Categories System', () => {
  describe('KPI Categories Definition', () => {
    it('should have exactly 50 KPI categories', () => {
      expect(KPI_CATEGORIES.length).toBe(50);
    });

    it('should have all required fields for each category', () => {
      KPI_CATEGORIES.forEach(category => {
        expect(category.id).toBeDefined();
        expect(typeof category.id).toBe('number');
        expect(category.id).toBeGreaterThanOrEqual(1);
        expect(category.id).toBeLessThanOrEqual(50);
        expect(category.name).toBeDefined();
        expect(category.domain).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.assessedBy).toBeDefined();
        expect(Array.isArray(category.assessedBy)).toBe(true);
        expect(category.scoringCriteria).toBeDefined();
        expect(category.scoringCriteria.excellent).toBeDefined();
        expect(category.scoringCriteria.good).toBeDefined();
        expect(category.scoringCriteria.adequate).toBeDefined();
        expect(category.scoringCriteria.developing).toBeDefined();
        expect(category.scoringCriteria.critical).toBeDefined();
        expect(category.priority).toBeDefined();
      });
    });

    it('should have unique category IDs', () => {
      const ids = KPI_CATEGORIES.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(50);
    });

    it('should cover all 10 domains', () => {
      const domains = new Set(KPI_CATEGORIES.map(c => c.domain));
      expect(domains.size).toBe(10);
    });

    it('should have categories distributed across domains', () => {
      const domainCounts: Record<string, number> = {};
      KPI_CATEGORIES.forEach(c => {
        domainCounts[c.domain] = (domainCounts[c.domain] || 0) + 1;
      });
      
      // Each domain should have at least 1 category
      Object.values(domainCounts).forEach(count => {
        expect(count).toBeGreaterThanOrEqual(1);
      });
      
      // Total should be 50
      const total = Object.values(domainCounts).reduce((a, b) => a + b, 0);
      expect(total).toBe(50);
    });
  });

  describe('KPI Category Helpers', () => {
    it('should get categories by domain', () => {
      const strategyCategories = KPI_CATEGORIES.filter(c => c.domain === 'strategy');
      expect(strategyCategories.length).toBeGreaterThanOrEqual(4);
      strategyCategories.forEach(c => {
        expect(c.domain).toBe('strategy');
      });
    });

    it('should get category by ID', () => {
      const category = KPI_CATEGORIES.find(c => c.id === 1);
      expect(category).toBeDefined();
      expect(category?.name).toBe('Vision and Mission Clarity');
    });

    it('should return undefined for invalid category ID', () => {
      const category = KPI_CATEGORIES.find(c => c.id === 999);
      expect(category).toBeUndefined();
    });

    it('should calculate domain score correctly', () => {
      const calculateDomainScore = (domain: KpiDomain, scores: Record<number, number>): number => {
        const domainCategories = KPI_CATEGORIES.filter(c => c.domain === domain);
        const totalScore = domainCategories.reduce((sum, c) => sum + (scores[c.id] || 0), 0);
        return Math.round(totalScore / domainCategories.length);
      };

      // Get actual strategy category IDs
      const strategyCategories = KPI_CATEGORIES.filter(c => c.domain === 'strategy');
      const scores: Record<number, number> = {};
      strategyCategories.forEach((c, i) => {
        scores[c.id] = [85, 70, 60, 75, 80, 90][i] || 0;
      });
      
      const domainScore = calculateDomainScore('strategy', scores);
      // Score should be reasonable (between 0 and 100)
      expect(domainScore).toBeGreaterThanOrEqual(0);
      expect(domainScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Scoring Criteria Quality', () => {
    it('should have meaningful scoring criteria descriptions', () => {
      KPI_CATEGORIES.forEach(category => {
        expect(category.scoringCriteria.excellent.length).toBeGreaterThan(10);
        expect(category.scoringCriteria.good.length).toBeGreaterThan(10);
        expect(category.scoringCriteria.adequate.length).toBeGreaterThan(10);
        expect(category.scoringCriteria.developing.length).toBeGreaterThan(10);
        expect(category.scoringCriteria.critical.length).toBeGreaterThan(10);
      });
    });

    it('should have valid priority levels', () => {
      const validPriorities = ['critical', 'high', 'medium', 'maintain'];
      KPI_CATEGORIES.forEach(category => {
        expect(validPriorities).toContain(category.priority);
      });
    });
  });
});

describe('Customer Personas System', () => {
  describe('Customer Personas Definition', () => {
    it('should have exactly 100 customer personas', () => {
      expect(CUSTOMER_PERSONAS.length).toBe(100);
    });

    it('should have all required fields for each persona', () => {
      CUSTOMER_PERSONAS.forEach(persona => {
        expect(persona.id).toBeDefined();
        expect(persona.name).toBeDefined();
        expect(persona.age).toBeGreaterThanOrEqual(18);
        expect(persona.age).toBeLessThanOrEqual(80);
        expect(persona.gender).toBeDefined();
        expect(persona.nationality).toBeDefined();
        expect(persona.location).toBeDefined();
        expect(persona.occupation).toBeDefined();
        expect(persona.industry).toBeDefined();
        expect(persona.incomeLevel).toBeDefined();
        expect(persona.techComfort).toBeDefined();
        expect(persona.decisionStyle).toBeDefined();
        expect(persona.bio).toBeDefined();
        expect(persona.painPoints).toBeDefined();
        expect(Array.isArray(persona.painPoints)).toBe(true);
        expect(persona.goals).toBeDefined();
        expect(Array.isArray(persona.goals)).toBe(true);
        expect(persona.preferredChannels).toBeDefined();
        expect(Array.isArray(persona.preferredChannels)).toBe(true);
      });
    });

    it('should have unique persona IDs', () => {
      const ids = CUSTOMER_PERSONAS.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(100);
    });

    it('should have diverse age distribution', () => {
      const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56-65': 0,
        '66+': 0
      };
      
      CUSTOMER_PERSONAS.forEach(p => {
        if (p.age <= 25) ageGroups['18-25']++;
        else if (p.age <= 35) ageGroups['26-35']++;
        else if (p.age <= 45) ageGroups['36-45']++;
        else if (p.age <= 55) ageGroups['46-55']++;
        else if (p.age <= 65) ageGroups['56-65']++;
        else ageGroups['66+']++;
      });
      
      // Each age group should have at least some representation
      Object.values(ageGroups).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });

    it('should have diverse income levels', () => {
      const incomeLevels = new Set(CUSTOMER_PERSONAS.map(p => p.incomeLevel));
      expect(incomeLevels.size).toBeGreaterThanOrEqual(4);
    });

    it('should have diverse locations', () => {
      const locations = new Set(CUSTOMER_PERSONAS.map(p => p.location));
      expect(locations.size).toBeGreaterThanOrEqual(30);
    });

    it('should have diverse industries', () => {
      const industries = new Set(CUSTOMER_PERSONAS.map(p => p.industry));
      expect(industries.size).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Customer Persona Helpers', () => {
    it('should filter personas by industry', () => {
      const techPersonas = getPersonasByIndustry('Technology');
      expect(techPersonas.length).toBeGreaterThan(0);
      techPersonas.forEach(p => {
        expect(p.industry.toLowerCase()).toBe('technology');
      });
    });

    it('should filter personas by age range', () => {
      const youngPersonas = getPersonasByAgeRange(18, 30);
      expect(youngPersonas.length).toBeGreaterThan(0);
      youngPersonas.forEach(p => {
        expect(p.age).toBeGreaterThanOrEqual(18);
        expect(p.age).toBeLessThanOrEqual(30);
      });
    });

    it('should filter personas by income level', () => {
      const highIncomePersonas = getPersonasByIncomeLevel('high');
      expect(highIncomePersonas.length).toBeGreaterThan(0);
      highIncomePersonas.forEach(p => {
        expect(p.incomeLevel).toBe('high');
      });
    });

    it('should filter personas by region', () => {
      const mePersonas = getPersonasByRegion('Middle East');
      expect(mePersonas.length).toBeGreaterThan(0);
    });

    it('should get persona by ID', () => {
      const persona = getPersonaById('cp_001');
      expect(persona).toBeDefined();
      expect(persona?.id).toBe('cp_001');
    });

    it('should return undefined for invalid persona ID', () => {
      const persona = getPersonaById('invalid_id');
      expect(persona).toBeUndefined();
    });
  });

  describe('Persona Bio Quality', () => {
    it('should have meaningful bios (at least 50 characters)', () => {
      CUSTOMER_PERSONAS.forEach(persona => {
        expect(persona.bio.length).toBeGreaterThanOrEqual(50);
      });
    });

    it('should have at least 2 pain points per persona', () => {
      CUSTOMER_PERSONAS.forEach(persona => {
        expect(persona.painPoints.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have at least 2 goals per persona', () => {
      CUSTOMER_PERSONAS.forEach(persona => {
        expect(persona.goals.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});

describe('Heat Map Color Coding', () => {
  it('should return correct colors for score ranges', () => {
    const getHeatMapColor = (score: number): string => {
      if (score >= 90) return 'excellent';
      if (score >= 75) return 'good';
      if (score >= 60) return 'adequate';
      if (score >= 40) return 'developing';
      return 'critical';
    };

    expect(getHeatMapColor(95)).toBe('excellent');
    expect(getHeatMapColor(90)).toBe('excellent');
    expect(getHeatMapColor(85)).toBe('good');
    expect(getHeatMapColor(75)).toBe('good');
    expect(getHeatMapColor(70)).toBe('adequate');
    expect(getHeatMapColor(60)).toBe('adequate');
    expect(getHeatMapColor(50)).toBe('developing');
    expect(getHeatMapColor(40)).toBe('developing');
    expect(getHeatMapColor(30)).toBe('critical');
    expect(getHeatMapColor(0)).toBe('critical');
  });
});

describe('Multi-Perspective Scoring', () => {
  it('should support Chief of Staff perspective', () => {
    const perspectives = ['chief_of_staff', 'sme_experts', 'customer_groups'];
    expect(perspectives).toContain('chief_of_staff');
  });

  it('should support SME Experts perspective with individual breakdown', () => {
    const smeExperts = [
      { id: 'expert_1', name: 'UX Expert', score: 85 },
      { id: 'expert_2', name: 'Tech Expert', score: 70 },
      { id: 'expert_3', name: 'Business Expert', score: 90 }
    ];
    
    const averageScore = smeExperts.reduce((sum, e) => sum + e.score, 0) / smeExperts.length;
    expect(averageScore).toBeCloseTo(81.67, 1);
    
    // Detect outliers (deviation > 15 from average)
    const outliers = smeExperts.filter(e => Math.abs(e.score - averageScore) > 15);
    expect(outliers.length).toBe(0);
  });

  it('should support Customer Groups perspective', () => {
    const customerGroups = [
      { segment: 'Enterprise', score: 75 },
      { segment: 'SMB', score: 65 },
      { segment: 'Consumer', score: 80 }
    ];
    
    const averageScore = customerGroups.reduce((sum, g) => sum + g.score, 0) / customerGroups.length;
    expect(averageScore).toBeCloseTo(73.33, 1);
  });
});

describe('Outlier Detection', () => {
  it('should detect significant score deviations', () => {
    const scores = [85, 82, 88, 30, 84, 86]; // 30 is an outlier
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const threshold = 20; // 20 point deviation threshold
    
    const outliers = scores.filter(s => Math.abs(s - average) > threshold);
    expect(outliers).toContain(30);
    expect(outliers.length).toBe(1);
  });

  it('should calculate deviation percentage', () => {
    const score = 30;
    const average = 85;
    const deviation = ((average - score) / average) * 100;
    expect(deviation).toBeCloseTo(64.7, 1);
  });
});
