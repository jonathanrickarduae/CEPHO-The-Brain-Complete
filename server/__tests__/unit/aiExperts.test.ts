import { describe, it, expect } from 'vitest';

// Import the experts data - we'll test the structure and counts
// Note: This imports from client but tests run in server context
import { 
  allExperts, 
  TOTAL_EXPERTS, 
  categories,
  getExpertsByCategory,
  getExpertById,
  corporatePartners
} from '../client/src/data/aiExperts';

describe('AI Experts Data', () => {
  describe('Expert Count Validation', () => {
    it('should have at least 275 total experts', () => {
      expect(allExperts.length).toBeGreaterThanOrEqual(275);
    });

    it('should have TOTAL_EXPERTS matching actual count', () => {
      expect(TOTAL_EXPERTS).toBe(allExperts.length);
    });

    it('should have at least 20 healthcare/biotech experts', () => {
      const healthcareExperts = getExpertsByCategory('Healthcare & Biotech');
      expect(healthcareExperts.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Expert Structure Validation', () => {
    it('all experts should have required fields', () => {
      allExperts.forEach(expert => {
        expect(expert.id).toBeDefined();
        expect(expert.name).toBeDefined();
        expect(expert.avatar).toBeDefined();
        expect(expert.specialty).toBeDefined();
        expect(expert.category).toBeDefined();
        expect(expert.compositeOf).toBeDefined();
        expect(Array.isArray(expert.compositeOf)).toBe(true);
        expect(expert.bio).toBeDefined();
        expect(expert.strengths).toBeDefined();
        expect(Array.isArray(expert.strengths)).toBe(true);
        expect(expert.weaknesses).toBeDefined();
        expect(Array.isArray(expert.weaknesses)).toBe(true);
        expect(expert.thinkingStyle).toBeDefined();
        expect(expert.performanceScore).toBeGreaterThanOrEqual(0);
        expect(expert.performanceScore).toBeLessThanOrEqual(100);
        expect(expert.status).toBeDefined();
      });
    });

    it('all expert IDs should be unique', () => {
      const ids = allExperts.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all expert names should not contain gimmicky suffixes', () => {
      const gimmickySuffixes = ['Pharma', 'Biotech', 'Cannabis', 'Diagnostics', 'Genomics', 'Hospital', 'Insurance'];
      const healthcareExperts = getExpertsByCategory('Healthcare & Biotech');
      
      healthcareExperts.forEach(expert => {
        const nameParts = expert.name.split(' ');
        const lastName = nameParts[nameParts.length - 1];
        // Healthcare experts should have proper names, not gimmicky ones
        const hasGimmickySuffix = gimmickySuffixes.some(suffix => lastName === suffix);
        expect(hasGimmickySuffix).toBe(false);
      });
    });
  });

  describe('Healthcare Expert Backend Preferences', () => {
    it('healthcare experts should have Claude as preferred backend', () => {
      const healthcareExperts = getExpertsByCategory('Healthcare & Biotech');
      const expertsWithBackend = healthcareExperts.filter(e => e.preferredBackend);
      
      // At least 80% of healthcare experts should have backend preference set
      expect(expertsWithBackend.length).toBeGreaterThanOrEqual(healthcareExperts.length * 0.8);
      
      // All those with backend preference should prefer Claude for medical reasoning
      expertsWithBackend.forEach(expert => {
        expect(expert.preferredBackend).toBe('claude');
        expect(expert.backendRationale).toBeDefined();
      });
    });
  });

  describe('Medical Cannabis Experts', () => {
    it('should have multiple cannabis specialists', () => {
      const healthcareExperts = getExpertsByCategory('Healthcare & Biotech');
      const cannabisExperts = healthcareExperts.filter(e => 
        e.specialty.toLowerCase().includes('cannabis') || 
        e.specialty.toLowerCase().includes('cannabinoid')
      );
      
      expect(cannabisExperts.length).toBeGreaterThanOrEqual(2);
    });

    it('cannabis experts should cover regulatory, clinical, and manufacturing', () => {
      const healthcareExperts = getExpertsByCategory('Healthcare & Biotech');
      const cannabisExperts = healthcareExperts.filter(e => 
        e.specialty.toLowerCase().includes('cannabis') || 
        e.specialty.toLowerCase().includes('cannabinoid')
      );
      
      const specialties = cannabisExperts.map(e => e.specialty.toLowerCase());
      
      // Should have regulatory expert
      expect(specialties.some(s => s.includes('regulatory'))).toBe(true);
      // Should have clinical/science expert
      expect(specialties.some(s => s.includes('clinical') || s.includes('science') || s.includes('formulation'))).toBe(true);
      // Should have manufacturing/cultivation expert
      expect(specialties.some(s => s.includes('cultivation') || s.includes('manufacturing'))).toBe(true);
    });
  });

  describe('UK Regulatory Experts', () => {
    it('should have MHRA specialists', () => {
      const healthcareExperts = getExpertsByCategory('Healthcare & Biotech');
      const mhraExperts = healthcareExperts.filter(e => 
        e.specialty.toLowerCase().includes('mhra') || 
        e.bio.toLowerCase().includes('mhra')
      );
      
      expect(mhraExperts.length).toBeGreaterThanOrEqual(1);
    });

    it('should have NHS/NICE specialists', () => {
      const healthcareExperts = getExpertsByCategory('Healthcare & Biotech');
      const nhsExperts = healthcareExperts.filter(e => 
        e.specialty.toLowerCase().includes('nhs') || 
        e.specialty.toLowerCase().includes('nice') ||
        e.bio.toLowerCase().includes('nhs') ||
        e.bio.toLowerCase().includes('nice')
      );
      
      expect(nhsExperts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Drug Testing & Clinical Trial Experts', () => {
    it('should have clinical trial specialists', () => {
      const healthcareExperts = getExpertsByCategory('Healthcare & Biotech');
      const trialExperts = healthcareExperts.filter(e => 
        e.specialty.toLowerCase().includes('clinical trial') || 
        e.specialty.toLowerCase().includes('phase i') ||
        e.specialty.toLowerCase().includes('biostatistics')
      );
      
      expect(trialExperts.length).toBeGreaterThanOrEqual(1);
    });

    it('should have toxicology/safety experts', () => {
      const healthcareExperts = getExpertsByCategory('Healthcare & Biotech');
      const safetyExperts = healthcareExperts.filter(e => 
        e.specialty.toLowerCase().includes('toxicology') || 
        e.specialty.toLowerCase().includes('pharmacovigilance') ||
        e.specialty.toLowerCase().includes('safety')
      );
      
      expect(safetyExperts.length).toBeGreaterThanOrEqual(2);
    });

    it('should have bioanalytical/testing method experts', () => {
      const healthcareExperts = getExpertsByCategory('Healthcare & Biotech');
      const analyticalExperts = healthcareExperts.filter(e => 
        e.specialty.toLowerCase().includes('bioanalytical') || 
        e.specialty.toLowerCase().includes('analytical') ||
        e.specialty.toLowerCase().includes('testing method')
      );
      
      expect(analyticalExperts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Categories', () => {
    it('should have Healthcare & Biotech category', () => {
      expect(categories).toContain('Healthcare & Biotech');
    });

    it('all experts should belong to a valid category', () => {
      allExperts.forEach(expert => {
        expect(categories).toContain(expert.category);
      });
    });
  });

  describe('Helper Functions', () => {
    it('getExpertById should return correct expert', () => {
      const expert = getExpertById('hc-001');
      expect(expert).toBeDefined();
      expect(expert?.category).toBe('Healthcare & Biotech');
    });

    it('getExpertsByCategory should return experts for valid category', () => {
      const experts = getExpertsByCategory('Healthcare & Biotech');
      expect(experts.length).toBeGreaterThan(0);
      experts.forEach(e => {
        expect(e.category).toBe('Healthcare & Biotech');
      });
    });
  });

  describe('Corporate Partners', () => {
    it('should have corporate partners defined', () => {
      expect(corporatePartners).toBeDefined();
      expect(corporatePartners.length).toBeGreaterThan(0);
    });
  });
});
