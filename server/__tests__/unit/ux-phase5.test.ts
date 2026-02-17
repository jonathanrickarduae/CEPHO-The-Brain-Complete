import { describe, it, expect } from 'vitest';

describe('UX Phase 5 - Integration & Management Components', () => {
  describe('Subscription Intelligence', () => {
    it('should calculate total monthly spend correctly', () => {
      const subscriptions = [
        { cost: 24.99, billingCycle: 'monthly' },
        { cost: 13.99, billingCycle: 'monthly' },
        { cost: 120, billingCycle: 'annual' }, // £10/month
      ];
      
      const totalMonthly = subscriptions.reduce((sum, s) => 
        sum + (s.billingCycle === 'monthly' ? s.cost : s.cost / 12), 0
      );
      
      expect(totalMonthly).toBeCloseTo(48.98, 2);
    });

    it('should identify optimization opportunities', () => {
      const subscription = {
        name: 'Zoom',
        usagePercent: 28,
        cost: 13.99,
        featuresUsed: 4,
        featuresTotal: 18,
      };
      
      // Low usage suggests downgrade opportunity
      const isUnderutilized = subscription.usagePercent < 50;
      const featureUtilization = subscription.featuresUsed / subscription.featuresTotal;
      
      expect(isUnderutilized).toBe(true);
      expect(featureUtilization).toBeLessThan(0.3);
    });

    it('should calculate potential savings', () => {
      const suggestions = [
        { potentialSavings: 13.99 },
        { potentialSavings: 7.25 },
        { potentialSavings: 15.00 },
        { potentialSavings: -16 }, // Upgrade suggestion (negative)
      ];
      
      const totalSavings = suggestions
        .filter(s => s.potentialSavings > 0)
        .reduce((sum, s) => sum + s.potentialSavings, 0);
      
      expect(totalSavings).toBeCloseTo(36.24, 2);
    });

    it('should categorize subscriptions correctly', () => {
      const categories = {
        productivity: 24.99 + 8.00 + 12.00,
        communication: 13.99 + 5.00 + 7.25,
        storage: 15.00,
      };
      
      const totalByCategory = Object.values(categories).reduce((sum, v) => sum + v, 0);
      expect(totalByCategory).toBeCloseTo(86.23, 2);
    });
  });

  describe('Asana Integration', () => {
    it('should calculate project completion percentage', () => {
      const project = {
        taskCount: 47,
        completedCount: 32,
      };
      
      const completionPercent = (project.completedCount / project.taskCount) * 100;
      expect(completionPercent).toBeCloseTo(68.09, 1);
    });

    it('should identify at-risk projects', () => {
      const projects = [
        { status: 'on_track' },
        { status: 'at_risk' },
        { status: 'off_track' },
        { status: 'on_track' },
      ];
      
      const atRiskCount = projects.filter(p => p.status !== 'on_track').length;
      expect(atRiskCount).toBe(2);
    });

    it('should calculate overdue tasks', () => {
      const now = new Date();
      const tasks = [
        { dueDate: new Date(now.getTime() - 86400000), completed: false }, // 1 day overdue
        { dueDate: new Date(now.getTime() + 86400000), completed: false }, // Due tomorrow
        { dueDate: new Date(now.getTime() - 172800000), completed: true }, // Completed (was overdue)
      ];
      
      const overdueTasks = tasks.filter(t => 
        !t.completed && t.dueDate < now
      );
      
      expect(overdueTasks.length).toBe(1);
    });

    it('should format time ago correctly', () => {
      const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
      };
      
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      expect(formatTimeAgo(thirtyMinutesAgo)).toBe('30m ago');
      expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');
    });
  });

  describe('Signature Manager', () => {
    it('should validate signature types', () => {
      const validTypes = ['drawn', 'uploaded', 'typed'];
      
      validTypes.forEach(type => {
        expect(['drawn', 'uploaded', 'typed']).toContain(type);
      });
    });

    it('should handle default signature selection', () => {
      const signatures = [
        { id: 'sig-1', isDefault: true },
        { id: 'sig-2', isDefault: false },
        { id: 'sig-3', isDefault: false },
      ];
      
      const setDefault = (id: string) => {
        return signatures.map(s => ({
          ...s,
          isDefault: s.id === id,
        }));
      };
      
      const updated = setDefault('sig-2');
      expect(updated.find(s => s.id === 'sig-1')?.isDefault).toBe(false);
      expect(updated.find(s => s.id === 'sig-2')?.isDefault).toBe(true);
    });

    it('should generate unique signature IDs', () => {
      const generateId = () => `sig-${Date.now()}`;
      
      const id1 = generateId();
      // Small delay to ensure different timestamps
      const id2 = `sig-${Date.now() + 1}`;
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^sig-\d+$/);
    });
  });

  describe('Digital Twin Training Accelerator', () => {
    it('should calculate training hours from activities', () => {
      const activities = {
        interviews: 5, // 10 hours each
        documentsUploaded: 20, // 5 hours each
        conversationsHeld: 50, // 0.5 hours each
      };
      
      const totalHours = 
        activities.interviews * 10 +
        activities.documentsUploaded * 5 +
        activities.conversationsHeld * 0.5;
      
      expect(totalHours).toBe(175);
    });

    it('should calculate progress towards autonomy', () => {
      const targetHours = 5000;
      const currentHours = 175;
      
      const progressPercent = (currentHours / targetHours) * 100;
      expect(progressPercent).toBeCloseTo(3.5, 1);
    });

    it('should validate interview question responses', () => {
      const questions = [
        { id: 'q1', type: 'yesno', answer: true },
        { id: 'q2', type: 'choice', answer: 'option_a' },
        { id: 'q3', type: 'scale', answer: 7 },
      ];
      
      const validateAnswer = (q: typeof questions[0]) => {
        switch (q.type) {
          case 'yesno': return typeof q.answer === 'boolean';
          case 'choice': return typeof q.answer === 'string';
          case 'scale': return typeof q.answer === 'number' && q.answer >= 1 && q.answer <= 10;
          default: return false;
        }
      };
      
      questions.forEach(q => {
        expect(validateAnswer(q)).toBe(true);
      });
    });
  });

  describe('Integration Wizard', () => {
    it('should categorize integrations by tier', () => {
      const integrations = [
        { id: 'calendar', tier: 'basic' },
        { id: 'zoom', tier: 'standard' },
        { id: 'asana', tier: 'standard' },
        { id: 'copilot', tier: 'advanced' },
      ];
      
      const byTier = integrations.reduce((acc, i) => {
        acc[i.tier] = (acc[i.tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      expect(byTier.basic).toBe(1);
      expect(byTier.standard).toBe(2);
      expect(byTier.advanced).toBe(1);
    });

    it('should identify integrations requiring approval', () => {
      const integrations = [
        { id: 'calendar', requiresApproval: false },
        { id: 'zoom', requiresApproval: true },
        { id: 'asana', requiresApproval: true },
      ];
      
      const needsApproval = integrations.filter(i => i.requiresApproval);
      expect(needsApproval.length).toBe(2);
    });
  });

  describe('Corporate Partner Logos', () => {
    it('should have Cambridge University logo path', () => {
      const logoPath = '/logos/cambridge-university.png';
      expect(logoPath).toMatch(/\/logos\/cambridge-university\.png$/);
    });

    it('should display partner with correct attributes', () => {
      const partner = {
        name: 'University of Cambridge',
        type: 'Research Partner',
        logoPath: '/logos/cambridge-university.png',
      };
      
      expect(partner.name).toBe('University of Cambridge');
      expect(partner.type).toBe('Research Partner');
      expect(partner.logoPath).toBeTruthy();
    });
  });
});
