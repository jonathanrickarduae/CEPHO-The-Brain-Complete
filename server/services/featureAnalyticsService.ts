/**
 * Feature Usage Analytics Service
 * Tracks which features are used most frequently to optimize the platform
 */

// Feature categories for tracking
export const FEATURE_CATEGORIES = {
  CORE: "core",
  AI_EXPERTS: "ai_experts",
  PRODUCTIVITY: "productivity",
  STRATEGY: "strategy",
  FINANCE: "finance",
  SECURITY: "security",
} as const;

export type FeatureCategory = typeof FEATURE_CATEGORIES[keyof typeof FEATURE_CATEGORIES];

// Feature definitions with metadata
export const FEATURES = {
  // Core features
  MORNING_SIGNAL: { id: "morning_signal", name: "Morning Signal", category: FEATURE_CATEGORIES.CORE },
  EVENING_REVIEW: { id: "evening_review", name: "Evening Review", category: FEATURE_CATEGORIES.CORE },
  CHIEF_OF_STAFF: { id: "chief_of_staff", name: "Chief of Staff", category: FEATURE_CATEGORIES.CORE },
  
  // AI Experts
  EXPERT_CONSULTATION: { id: "expert_consultation", name: "Expert Consultation", category: FEATURE_CATEGORIES.AI_EXPERTS },
  EXPERT_PANEL: { id: "expert_panel", name: "Expert Panel", category: FEATURE_CATEGORIES.AI_EXPERTS },
  EXPERT_LEADERBOARD: { id: "expert_leaderboard", name: "Expert Leaderboard", category: FEATURE_CATEGORIES.AI_EXPERTS },
  
  // Productivity
  LIBRARY: { id: "library", name: "Library", category: FEATURE_CATEGORIES.PRODUCTIVITY },
  DOCUMENT_UPLOAD: { id: "document_upload", name: "Document Upload", category: FEATURE_CATEGORIES.PRODUCTIVITY },
  VAULT: { id: "vault", name: "Vault", category: FEATURE_CATEGORIES.PRODUCTIVITY },
  
  // Strategy
  INNOVATION_HUB: { id: "innovation_hub", name: "Innovation Hub", category: FEATURE_CATEGORIES.STRATEGY },
  PROJECT_GENESIS: { id: "project_genesis", name: "Project Genesis", category: FEATURE_CATEGORIES.STRATEGY },
  PORTFOLIO_COMMAND: { id: "portfolio_command", name: "Portfolio Command Center", category: FEATURE_CATEGORIES.STRATEGY },
  DEVELOPMENT_PATHWAY: { id: "development_pathway", name: "Development Pathway", category: FEATURE_CATEGORIES.STRATEGY },
  
  // Finance
  SUBSCRIPTION_TRACKER: { id: "subscription_tracker", name: "Subscription Tracker", category: FEATURE_CATEGORIES.FINANCE },
  FUNDING_ASSESSMENT: { id: "funding_assessment", name: "Funding Assessment", category: FEATURE_CATEGORIES.FINANCE },
  
  // Security
  INTEGRATIONS: { id: "integrations", name: "Integrations", category: FEATURE_CATEGORIES.SECURITY },
  CONTRACT_RENEWALS: { id: "contract_renewals", name: "Contract Renewals", category: FEATURE_CATEGORIES.SECURITY },
} as const;

export type FeatureId = typeof FEATURES[keyof typeof FEATURES]["id"];

interface FeatureUsageEvent {
  featureId: FeatureId;
  userId: number;
  action: "view" | "interact" | "complete";
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// In-memory analytics store (would be persisted to DB in production)
const usageStore: FeatureUsageEvent[] = [];

/**
 * Track a feature usage event
 */
export function trackFeatureUsage(
  featureId: FeatureId,
  userId: number,
  action: "view" | "interact" | "complete" = "view",
  metadata?: Record<string, unknown>
): void {
  usageStore.push({
    featureId,
    userId,
    action,
    metadata,
    timestamp: new Date(),
  });
}

/**
 * Get usage statistics for all features
 */
export function getFeatureUsageStats(): {
  featureId: string;
  name: string;
  category: string;
  totalViews: number;
  totalInteractions: number;
  totalCompletions: number;
  uniqueUsers: number;
  lastUsed: Date | null;
}[] {
  const featureList = Object.values(FEATURES);
  
  return featureList.map((feature) => {
    const featureEvents = usageStore.filter((e) => e.featureId === feature.id);
    const views = featureEvents.filter((e) => e.action === "view").length;
    const interactions = featureEvents.filter((e) => e.action === "interact").length;
    const completions = featureEvents.filter((e) => e.action === "complete").length;
    const uniqueUsers = new Set(featureEvents.map((e) => e.userId)).size;
    const lastEvent = featureEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    return {
      featureId: feature.id,
      name: feature.name,
      category: feature.category,
      totalViews: views,
      totalInteractions: interactions,
      totalCompletions: completions,
      uniqueUsers,
      lastUsed: lastEvent?.timestamp || null,
    };
  });
}

/**
 * Get top features by usage
 */
export function getTopFeatures(limit: number = 10): {
  featureId: string;
  name: string;
  category: string;
  score: number;
}[] {
  const stats = getFeatureUsageStats();
  
  // Calculate engagement score: views + 2*interactions + 3*completions
  const scored = stats.map((s) => ({
    featureId: s.featureId,
    name: s.name,
    category: s.category,
    score: s.totalViews + s.totalInteractions * 2 + s.totalCompletions * 3,
  }));
  
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Get feature usage by category
 */
export function getUsageByCategory(): {
  category: string;
  totalUsage: number;
  featureCount: number;
  topFeature: string | null;
}[] {
  const stats = getFeatureUsageStats();
  const categories = Object.values(FEATURE_CATEGORIES);
  
  return categories.map((category) => {
    const categoryFeatures = stats.filter((s) => s.category === category);
    const totalUsage = categoryFeatures.reduce(
      (sum, f) => sum + f.totalViews + f.totalInteractions + f.totalCompletions,
      0
    );
    const topFeature = categoryFeatures.sort(
      (a, b) =>
        b.totalViews + b.totalInteractions + b.totalCompletions -
        (a.totalViews + a.totalInteractions + a.totalCompletions)
    )[0];
    
    return {
      category,
      totalUsage,
      featureCount: categoryFeatures.length,
      topFeature: topFeature?.name || null,
    };
  });
}

/**
 * Get user engagement metrics
 */
export function getUserEngagementMetrics(userId: number): {
  totalFeatureViews: number;
  totalInteractions: number;
  totalCompletions: number;
  mostUsedFeature: string | null;
  engagementScore: number;
  lastActive: Date | null;
} {
  const userEvents = usageStore.filter((e) => e.userId === userId);
  const views = userEvents.filter((e) => e.action === "view").length;
  const interactions = userEvents.filter((e) => e.action === "interact").length;
  const completions = userEvents.filter((e) => e.action === "complete").length;
  
  // Find most used feature
  const featureCounts = new Map<string, number>();
  userEvents.forEach((e) => {
    featureCounts.set(e.featureId, (featureCounts.get(e.featureId) || 0) + 1);
  });
  
  let mostUsedFeature: string | null = null;
  let maxCount = 0;
  featureCounts.forEach((count, featureId) => {
    if (count > maxCount) {
      maxCount = count;
      const feature = Object.values(FEATURES).find((f) => f.id === featureId);
      mostUsedFeature = feature?.name || featureId;
    }
  });
  
  const lastEvent = userEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  
  return {
    totalFeatureViews: views,
    totalInteractions: interactions,
    totalCompletions: completions,
    mostUsedFeature,
    engagementScore: views + interactions * 2 + completions * 3,
    lastActive: lastEvent?.timestamp || null,
  };
}

/**
 * Get feature adoption rate (percentage of users who have used each feature)
 */
export async function getFeatureAdoptionRates(): Promise<{
  featureId: string;
  name: string;
  adoptionRate: number;
  uniqueUsers: number;
}[]> {
  // Get total user count from database
  const totalUsers = 1; // Placeholder - would query actual user count
  
  const stats = getFeatureUsageStats();
  
  return stats.map((s) => ({
    featureId: s.featureId,
    name: s.name,
    adoptionRate: totalUsers > 0 ? (s.uniqueUsers / totalUsers) * 100 : 0,
    uniqueUsers: s.uniqueUsers,
  }));
}

/**
 * Generate analytics summary report
 */
export function generateAnalyticsSummary(): {
  totalEvents: number;
  totalUniqueUsers: number;
  topFeatures: { name: string; score: number }[];
  categoryBreakdown: { category: string; percentage: number }[];
  recommendations: string[];
} {
  const totalEvents = usageStore.length;
  const totalUniqueUsers = new Set(usageStore.map((e) => e.userId)).size;
  const topFeatures = getTopFeatures(5).map((f) => ({ name: f.name, score: f.score }));
  
  const categoryUsage = getUsageByCategory();
  const totalCategoryUsage = categoryUsage.reduce((sum, c) => sum + c.totalUsage, 0);
  const categoryBreakdown = categoryUsage.map((c) => ({
    category: c.category,
    percentage: totalCategoryUsage > 0 ? (c.totalUsage / totalCategoryUsage) * 100 : 0,
  }));
  
  // Generate recommendations based on usage patterns
  const recommendations: string[] = [];
  
  const lowUsageCategories = categoryBreakdown.filter((c) => c.percentage < 10);
  lowUsageCategories.forEach((c) => {
    recommendations.push(`Consider promoting ${c.category} features - currently underutilized`);
  });
  
  if (topFeatures.length > 0 && topFeatures[0].score > 100) {
    recommendations.push(`${topFeatures[0].name} is your power feature - consider expanding its capabilities`);
  }
  
  return {
    totalEvents,
    totalUniqueUsers,
    topFeatures,
    categoryBreakdown,
    recommendations,
  };
}
