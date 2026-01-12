import { describe, it, expect } from 'vitest';
import {
  PROJECT_BLUEPRINTS,
  BLUEPRINT_CATEGORIES,
  SME_EXPERTS,
  INVESTOR_CATEGORIES,
  getBlueprintById,
  getBlueprintsByCategory,
  matchInvestors,
  type ProjectBlueprint,
  type CapitalMatchCriteria,
} from '@/lib/projectBlueprints';

describe('Project Blueprints Library', () => {
  describe('PROJECT_BLUEPRINTS', () => {
    it('should have all 9 project types defined', () => {
      const expectedTypes = [
        'new_business',
        'due_diligence',
        'investor_presentation',
        'strategic_investment',
        'go_to_market',
        'deep_research',
        'financial_model',
        'legal_compliance',
        'custom',
      ];
      
      expectedTypes.forEach(type => {
        expect(PROJECT_BLUEPRINTS[type]).toBeDefined();
        expect(PROJECT_BLUEPRINTS[type].id).toBe(type);
      });
    });

    it('each blueprint should have required fields', () => {
      Object.values(PROJECT_BLUEPRINTS).forEach((blueprint: ProjectBlueprint) => {
        expect(blueprint.id).toBeDefined();
        expect(blueprint.name).toBeDefined();
        expect(blueprint.description).toBeDefined();
        expect(blueprint.category).toBeDefined();
        expect(blueprint.estimatedDuration).toBeDefined();
        expect(blueprint.complexity).toBeDefined();
        expect(blueprint.intakeQuestions).toBeDefined();
        expect(Array.isArray(blueprint.intakeQuestions)).toBe(true);
        expect(blueprint.processSteps).toBeDefined();
        expect(Array.isArray(blueprint.processSteps)).toBe(true);
        expect(blueprint.deliverables).toBeDefined();
        expect(Array.isArray(blueprint.deliverables)).toBe(true);
        expect(blueprint.recommendedTeam).toBeDefined();
        expect(blueprint.qaGates).toBeDefined();
        expect(blueprint.successCriteria).toBeDefined();
      });
    });

    it('each blueprint should have at least 3 intake questions', () => {
      Object.values(PROJECT_BLUEPRINTS).forEach((blueprint: ProjectBlueprint) => {
        expect(blueprint.intakeQuestions.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('each blueprint should have at least 2 process steps', () => {
      Object.values(PROJECT_BLUEPRINTS).forEach((blueprint: ProjectBlueprint) => {
        expect(blueprint.processSteps.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('each blueprint should have at least 1 deliverable', () => {
      Object.values(PROJECT_BLUEPRINTS).forEach((blueprint: ProjectBlueprint) => {
        expect(blueprint.deliverables.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('BLUEPRINT_CATEGORIES', () => {
    it('should have 5 categories defined', () => {
      expect(BLUEPRINT_CATEGORIES.length).toBe(5);
    });

    it('each category should have required fields', () => {
      BLUEPRINT_CATEGORIES.forEach(category => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.blueprints).toBeDefined();
        expect(Array.isArray(category.blueprints)).toBe(true);
        expect(category.blueprints.length).toBeGreaterThan(0);
      });
    });

    it('all blueprint references should be valid', () => {
      BLUEPRINT_CATEGORIES.forEach(category => {
        category.blueprints.forEach(blueprintId => {
          expect(PROJECT_BLUEPRINTS[blueprintId]).toBeDefined();
        });
      });
    });
  });

  describe('SME_EXPERTS', () => {
    it('should have experts defined', () => {
      expect(Object.keys(SME_EXPERTS).length).toBeGreaterThan(0);
    });

    it('each expert should have required fields', () => {
      Object.values(SME_EXPERTS).forEach((expert: any) => {
        expect(expert.id).toBeDefined();
        expect(expert.name).toBeDefined();
        expect(expert.expertise).toBeDefined();
        expect(Array.isArray(expert.expertise)).toBe(true);
        expect(expert.thinkingStyle).toBeDefined();
      });
    });
  });

  describe('getBlueprintById', () => {
    it('should return blueprint for valid id', () => {
      const blueprint = getBlueprintById('new_business');
      expect(blueprint).toBeDefined();
      expect(blueprint?.id).toBe('new_business');
    });

    it('should return undefined for invalid id', () => {
      const blueprint = getBlueprintById('nonexistent_blueprint');
      expect(blueprint).toBeUndefined();
    });
  });

  describe('getBlueprintsByCategory', () => {
    it('should return blueprints for valid category', () => {
      const blueprints = getBlueprintsByCategory('capital');
      expect(blueprints.length).toBeGreaterThan(0);
      blueprints.forEach(bp => {
        expect(bp).toBeDefined();
      });
    });

    it('should return empty array for invalid category', () => {
      const blueprints = getBlueprintsByCategory('nonexistent_category');
      expect(blueprints).toEqual([]);
    });
  });

  describe('INVESTOR_CATEGORIES', () => {
    it('should have investor categories defined', () => {
      expect(Object.keys(INVESTOR_CATEGORIES).length).toBeGreaterThan(0);
    });

    it('each category should have required fields', () => {
      Object.values(INVESTOR_CATEGORIES).forEach((category: any) => {
        expect(category.name).toBeDefined();
        expect(category.ticketRange).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.bestFor).toBeDefined();
        expect(Array.isArray(category.bestFor)).toBe(true);
      });
    });
  });

  describe('matchInvestors', () => {
    it('should return matches for small amount (angel range)', () => {
      const criteria: CapitalMatchCriteria = {
        amount: 50000,
        currency: 'GBP',
        location: 'UK',
      };
      const matches = matchInvestors(criteria);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some(m => m.category === 'angel')).toBe(true);
    });

    it('should return matches for medium amount (HNWI range)', () => {
      const criteria: CapitalMatchCriteria = {
        amount: 500000,
        currency: 'GBP',
        location: 'UK',
      };
      const matches = matchInvestors(criteria);
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should return matches for large amount (VC/family office range)', () => {
      const criteria: CapitalMatchCriteria = {
        amount: 5000000,
        currency: 'GBP',
        location: 'UK',
      };
      const matches = matchInvestors(criteria);
      expect(matches.length).toBeGreaterThan(0);
    });

    it('each match should have category and reasoning', () => {
      const criteria: CapitalMatchCriteria = {
        amount: 100000,
        currency: 'GBP',
        location: 'UK',
      };
      const matches = matchInvestors(criteria);
      matches.forEach(match => {
        expect(match.category).toBeDefined();
        expect(match.reasoning).toBeDefined();
      });
    });
  });

  describe('Blueprint Intake Questions', () => {
    it('new_business blueprint should have SME-sourced questions', () => {
      const blueprint = PROJECT_BLUEPRINTS['new_business'];
      const questionsWithSME = blueprint.intakeQuestions.filter(q => q.smeSource);
      expect(questionsWithSME.length).toBeGreaterThan(0);
    });

    it('due_diligence blueprint should ask about data room access', () => {
      const blueprint = PROJECT_BLUEPRINTS['due_diligence'];
      const dataRoomQuestion = blueprint.intakeQuestions.find(
        q => q.question.toLowerCase().includes('data room') || 
             q.question.toLowerCase().includes('access')
      );
      expect(dataRoomQuestion).toBeDefined();
    });

    it('investor_presentation blueprint should ask about existing materials', () => {
      const blueprint = PROJECT_BLUEPRINTS['investor_presentation'];
      const materialsQuestion = blueprint.intakeQuestions.find(
        q => q.question.toLowerCase().includes('material') || 
             q.question.toLowerCase().includes('existing') ||
             q.question.toLowerCase().includes('deck')
      );
      expect(materialsQuestion).toBeDefined();
    });
  });

  describe('Blueprint Process Steps', () => {
    it('each process step should have assigned SMEs', () => {
      Object.values(PROJECT_BLUEPRINTS).forEach((blueprint: ProjectBlueprint) => {
        blueprint.processSteps.forEach(step => {
          expect(step.assignedSMEs).toBeDefined();
          expect(Array.isArray(step.assignedSMEs)).toBe(true);
        });
      });
    });

    it('each process step should have outputs defined', () => {
      Object.values(PROJECT_BLUEPRINTS).forEach((blueprint: ProjectBlueprint) => {
        blueprint.processSteps.forEach(step => {
          expect(step.outputs).toBeDefined();
          expect(Array.isArray(step.outputs)).toBe(true);
        });
      });
    });
  });

  describe('Blueprint QA Gates', () => {
    it('each blueprint should have at least one QA gate', () => {
      Object.values(PROJECT_BLUEPRINTS).forEach((blueprint: ProjectBlueprint) => {
        expect(blueprint.qaGates.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('each QA gate should have criteria defined', () => {
      Object.values(PROJECT_BLUEPRINTS).forEach((blueprint: ProjectBlueprint) => {
        blueprint.qaGates.forEach(gate => {
          expect(gate.criteria).toBeDefined();
          expect(Array.isArray(gate.criteria)).toBe(true);
          expect(gate.criteria.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
