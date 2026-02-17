// Expert Evolution Service
// Handles feedback aggregation, expert performance tracking, and overnight evolution

export interface ExpertFeedback {
  id: string;
  expertId: string;
  conversationId: string;
  rating: number;
  quickFeedback?: 'helpful' | 'not_helpful';
  textFeedback?: string;
  improvements?: string[];
  timestamp: Date;
}

export interface ExpertPerformance {
  expertId: string;
  expertName: string;
  category: string;
  averageRating: number;
  totalConversations: number;
  recentRatings: number[];
  trend: 'up' | 'down' | 'stable';
  status: 'active' | 'needs_improvement' | 'under_review' | 'suspended' | 'promoted';
  lastUpdated: Date;
  feedbackSummary: {
    commonImprovements: string[];
    positiveThemes: string[];
    negativeThemes: string[];
  };
  evolutionHistory: {
    date: Date;
    action: string;
    reason: string;
  }[];
}

export interface EvolutionAction {
  expertId: string;
  action: 'enhance' | 'retrain' | 'demote' | 'promote' | 'suspend' | 'restore';
  reason: string;
  changes?: {
    promptAdjustments?: string[];
    knowledgeAdditions?: string[];
    behaviorModifications?: string[];
  };
}

// Simulated expert performance data
const expertPerformanceData: Map<string, ExpertPerformance> = new Map();

// Initialize with some sample data
const initializeSampleData = () => {
  const sampleExperts = [
    { id: 'pe_partner', name: 'PE Partner', category: 'Investment & Finance', avgRating: 8.5 },
    { id: 'cfo_expert', name: 'CFO Expert', category: 'Investment & Finance', avgRating: 7.8 },
    { id: 'strategy_consultant', name: 'Strategy Consultant', category: 'Entrepreneurship & Strategy', avgRating: 8.2 },
    { id: 'ma_lawyer', name: 'M&A Lawyer', category: 'Legal & Compliance', avgRating: 7.5 },
    { id: 'tech_cto', name: 'CTO', category: 'Technology & AI', avgRating: 6.8 },
    { id: 'market_analyst', name: 'Market Analyst', category: 'Marketing & Brand', avgRating: 7.2 },
    { id: 'hr_director', name: 'HR Director', category: 'HR & Talent', avgRating: 5.5 },
    { id: 'tax_advisor', name: 'Tax Advisor', category: 'Tax & Accounting', avgRating: 8.0 },
  ];

  sampleExperts.forEach(expert => {
    const status = expert.avgRating < 6 ? 'needs_improvement' : 
                   expert.avgRating >= 8 ? 'active' : 'active';
    const trend = expert.avgRating >= 8 ? 'up' : 
                  expert.avgRating < 6 ? 'down' : 'stable';

    expertPerformanceData.set(expert.id, {
      expertId: expert.id,
      expertName: expert.name,
      category: expert.category,
      averageRating: expert.avgRating,
      totalConversations: Math.floor(Math.random() * 50) + 10,
      recentRatings: [expert.avgRating - 0.2, expert.avgRating, expert.avgRating + 0.1, expert.avgRating - 0.1, expert.avgRating + 0.2],
      trend,
      status,
      lastUpdated: new Date(),
      feedbackSummary: {
        commonImprovements: expert.avgRating < 7 ? ['more_specific', 'better_sources'] : [],
        positiveThemes: expert.avgRating >= 7 ? ['thorough analysis', 'clear communication'] : [],
        negativeThemes: expert.avgRating < 6 ? ['too generic', 'slow responses'] : [],
      },
      evolutionHistory: [],
    });
  });
};

initializeSampleData();

export const expertEvolutionService = {
  // Submit feedback for an expert
  submitFeedback: async (feedback: Omit<ExpertFeedback, 'id'>): Promise<void> => {
    const id = `feedback_${Date.now()}`;
    const fullFeedback: ExpertFeedback = { ...feedback, id };
    
    // Update expert performance
    const performance = expertPerformanceData.get(feedback.expertId);
    if (performance) {
      // Update ratings
      performance.recentRatings.push(feedback.rating);
      if (performance.recentRatings.length > 10) {
        performance.recentRatings.shift();
      }
      
      // Recalculate average
      const sum = performance.recentRatings.reduce((a, b) => a + b, 0);
      const newAverage = sum / performance.recentRatings.length;
      
      // Determine trend
      const oldAverage = performance.averageRating;
      if (newAverage > oldAverage + 0.2) {
        performance.trend = 'up';
      } else if (newAverage < oldAverage - 0.2) {
        performance.trend = 'down';
      } else {
        performance.trend = 'stable';
      }
      
      performance.averageRating = newAverage;
      performance.totalConversations += 1;
      performance.lastUpdated = new Date();
      
      // Update status based on new average
      if (newAverage < 5) {
        performance.status = 'under_review';
      } else if (newAverage < 6) {
        performance.status = 'needs_improvement';
      } else if (newAverage >= 8.5) {
        performance.status = 'promoted';
      } else {
        performance.status = 'active';
      }
      
      // Track improvements requested
      if (feedback.improvements) {
        feedback.improvements.forEach(imp => {
          if (!performance.feedbackSummary.commonImprovements.includes(imp)) {
            performance.feedbackSummary.commonImprovements.push(imp);
          }
        });
      }
      
      expertPerformanceData.set(feedback.expertId, performance);
    }
    
    console.log('Feedback submitted:', fullFeedback);
  },

  // Get performance data for an expert
  getExpertPerformance: async (expertId: string): Promise<ExpertPerformance | null> => {
    return expertPerformanceData.get(expertId) || null;
  },

  // Get all experts performance for Chief of Staff dashboard
  getAllExpertsPerformance: async (): Promise<ExpertPerformance[]> => {
    return Array.from(expertPerformanceData.values());
  },

  // Get experts that need attention (low ratings, declining trend)
  getExpertsNeedingAttention: async (): Promise<ExpertPerformance[]> => {
    return Array.from(expertPerformanceData.values()).filter(
      expert => expert.status === 'needs_improvement' || 
                expert.status === 'under_review' ||
                expert.trend === 'down'
    );
  },

  // Apply evolution action to an expert
  applyEvolutionAction: async (action: EvolutionAction): Promise<void> => {
    const performance = expertPerformanceData.get(action.expertId);
    if (!performance) return;

    // Record the action in history
    performance.evolutionHistory.push({
      date: new Date(),
      action: action.action,
      reason: action.reason,
    });

    // Update status based on action
    switch (action.action) {
      case 'enhance':
        performance.status = 'active';
        performance.feedbackSummary.commonImprovements = [];
        break;
      case 'retrain':
        performance.status = 'under_review';
        break;
      case 'demote':
        performance.status = 'needs_improvement';
        break;
      case 'promote':
        performance.status = 'promoted';
        break;
      case 'suspend':
        performance.status = 'suspended';
        break;
      case 'restore':
        performance.status = 'active';
        break;
    }

    performance.lastUpdated = new Date();
    expertPerformanceData.set(action.expertId, performance);
    
    console.log('Evolution action applied:', action);
  },

  // Overnight processing - Chief of Staff reviews all feedback and makes recommendations
  runOvernightProcessing: async (): Promise<{
    processed: number;
    actionsRecommended: EvolutionAction[];
    summary: string;
  }> => {
    const allExperts = Array.from(expertPerformanceData.values());
    const actionsRecommended: EvolutionAction[] = [];

    allExperts.forEach(expert => {
      // Auto-recommend actions based on performance
      if (expert.averageRating < 4 && expert.status !== 'suspended') {
        actionsRecommended.push({
          expertId: expert.expertId,
          action: 'suspend',
          reason: `Average rating dropped to ${expert.averageRating.toFixed(1)}. Recommend suspension pending review.`,
        });
      } else if (expert.averageRating < 6 && expert.status === 'active') {
        actionsRecommended.push({
          expertId: expert.expertId,
          action: 'retrain',
          reason: `Performance below threshold (${expert.averageRating.toFixed(1)}). Common issues: ${expert.feedbackSummary.commonImprovements.join(', ')}`,
          changes: {
            promptAdjustments: expert.feedbackSummary.commonImprovements.map(imp => `Address: ${imp}`),
          },
        });
      } else if (expert.averageRating >= 9 && expert.trend === 'up') {
        actionsRecommended.push({
          expertId: expert.expertId,
          action: 'promote',
          reason: `Exceptional performance (${expert.averageRating.toFixed(1)}) with upward trend. Recommend increased authority.`,
        });
      }
    });

    const summary = `Overnight processing complete. Reviewed ${allExperts.length} experts. ` +
      `${actionsRecommended.length} actions recommended. ` +
      `${allExperts.filter(e => e.status === 'needs_improvement').length} experts need improvement. ` +
      `${allExperts.filter(e => e.averageRating >= 8).length} experts performing well.`;

    return {
      processed: allExperts.length,
      actionsRecommended,
      summary,
    };
  },

  // Generate morning brief for Chief of Staff
  generateMorningBrief: async (): Promise<{
    expertsReviewed: number;
    actionsApplied: number;
    topPerformers: string[];
    needsAttention: string[];
    changes: string[];
  }> => {
    const allExperts = Array.from(expertPerformanceData.values());
    
    const topPerformers = allExperts
      .filter(e => e.averageRating >= 8)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3)
      .map(e => `${e.expertName} (${e.averageRating.toFixed(1)})`);

    const needsAttention = allExperts
      .filter(e => e.status === 'needs_improvement' || e.status === 'under_review')
      .map(e => `${e.expertName} - ${e.status.replace('_', ' ')}`);

    const recentChanges = allExperts
      .filter(e => e.evolutionHistory.length > 0)
      .flatMap(e => e.evolutionHistory.slice(-1).map(h => 
        `${e.expertName}: ${h.action} - ${h.reason.substring(0, 50)}...`
      ));

    return {
      expertsReviewed: allExperts.length,
      actionsApplied: allExperts.reduce((sum, e) => sum + e.evolutionHistory.length, 0),
      topPerformers,
      needsAttention,
      changes: recentChanges,
    };
  },
};

export default expertEvolutionService;
