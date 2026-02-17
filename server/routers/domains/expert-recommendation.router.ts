/**
 * Expertrecommendation Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/expert-recommendation
 */

import { router } from "../_core/trpc";
import { z } from "zod";

export const expertRecommendationRouter = router({
    // Get recommended experts based on consultation history and context
    getRecommendations: protectedProcedure
      .input(z.object({
        context: z.string().optional(), // Current project or topic context
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const limit = input.limit || 5;
        
        // Get user's consultation history
        const consultations = await getExpertConsultationHistory(ctx.user.id, { limit: 50 });
        
        // Get consultation counts per expert
        const counts = await getExpertConsultationCounts(ctx.user.id);
        
        // Build recommendation logic
        const recommendations: Array<{
          expertId: string;
          expertName: string;
          specialty: string;
          reason: string;
          score: number;
          category: string;
          avatar: string;
          performanceScore: number;
        }> = [];
        
        // Analyze consultation patterns
        const categoryFrequency: Record<string, number> = {};
        const consultedExperts = new Set<string>();
        const expertConsultCount: Record<string, number> = {};
        
        for (const c of consultations) {
          consultedExperts.add(c.expertId);
          expertConsultCount[c.expertId] = (expertConsultCount[c.expertId] || 0) + 1;
          
          // Track categories from expert names in consultations
          if (c.expertName) {
            const name = c.expertName.toLowerCase();
            // Infer category from consultation patterns
            if (name.includes('finance') || name.includes('invest') || name.includes('capital')) {
              categoryFrequency['Finance & Investment'] = (categoryFrequency['Finance & Investment'] || 0) + 1;
            }
            if (name.includes('strategy') || name.includes('business') || name.includes('ceo')) {
              categoryFrequency['Strategy & Business'] = (categoryFrequency['Strategy & Business'] || 0) + 1;
            }
            if (name.includes('tech') || name.includes('ai') || name.includes('data')) {
              categoryFrequency['Technology & AI'] = (categoryFrequency['Technology & AI'] || 0) + 1;
            }
            if (name.includes('legal') || name.includes('compliance') || name.includes('law')) {
              categoryFrequency['Legal & Compliance'] = (categoryFrequency['Legal & Compliance'] || 0) + 1;
            }
          }
        }
        
        // Find top categories
        const topCategories = Object.entries(categoryFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat]) => cat);
        
        // Curated expert recommendations from different categories
        const expertPool = [
          // Finance & Investment
          { id: 'warren-sage', name: 'Warren Sage', specialty: 'Value Investing', category: 'Finance & Investment', avatar: '💰', performanceScore: 98, reason: 'Master of value investing principles' },
          { id: 'capital-maven', name: 'Capital Maven', specialty: 'Venture Capital', category: 'Finance & Investment', avatar: '🚀', performanceScore: 95, reason: 'Expert in startup funding strategies' },
          // Strategy & Business
          { id: 'strategy-oracle', name: 'Strategy Oracle', specialty: 'Business Strategy', category: 'Strategy & Business', avatar: '🎯', performanceScore: 96, reason: 'Strategic planning and execution expert' },
          { id: 'growth-architect', name: 'Growth Architect', specialty: 'Scaling Businesses', category: 'Strategy & Business', avatar: '📈', performanceScore: 94, reason: 'Specialist in rapid business scaling' },
          // Technology & AI
          { id: 'tech-visionary', name: 'Tech Visionary', specialty: 'AI & Innovation', category: 'Technology & AI', avatar: '🤖', performanceScore: 97, reason: 'Cutting-edge AI implementation expert' },
          { id: 'data-sage', name: 'Data Sage', specialty: 'Data Analytics', category: 'Technology & AI', avatar: '📊', performanceScore: 93, reason: 'Data-driven decision making specialist' },
          // Legal & Compliance
          { id: 'legal-guardian', name: 'Legal Guardian', specialty: 'Corporate Law', category: 'Legal & Compliance', avatar: '⚖️', performanceScore: 95, reason: 'Expert in corporate legal matters' },
          { id: 'compliance-chief', name: 'Compliance Chief', specialty: 'Regulatory Compliance', category: 'Legal & Compliance', avatar: '📋', performanceScore: 92, reason: 'Regulatory navigation specialist' },
          // Marketing & Sales
          { id: 'brand-master', name: 'Brand Master', specialty: 'Brand Strategy', category: 'Marketing & Sales', avatar: '🎨', performanceScore: 94, reason: 'Brand building and positioning expert' },
          { id: 'sales-dynamo', name: 'Sales Dynamo', specialty: 'Sales Strategy', category: 'Marketing & Sales', avatar: '💼', performanceScore: 93, reason: 'High-performance sales methodology expert' },
          // Healthcare & Biotech
          { id: 'health-innovator', name: 'Health Innovator', specialty: 'Healthcare Strategy', category: 'Healthcare & Biotech', avatar: '🏥', performanceScore: 96, reason: 'Healthcare industry transformation expert' },
          // Operations
          { id: 'ops-optimizer', name: 'Ops Optimizer', specialty: 'Operations Excellence', category: 'Operations', avatar: '⚙️', performanceScore: 94, reason: 'Operational efficiency specialist' },
        ];
        
        // Filter and score recommendations
        for (const expert of expertPool) {
          if (!consultedExperts.has(expert.id)) {
            let score = expert.performanceScore; // Start with performance score
            let reason = expert.reason;
            
            // Boost if in top categories (user's preferred areas)
            if (topCategories.includes(expert.category)) {
              score += 15;
              reason = `${expert.reason} - Matches your interests`;
            }
            
            // Boost based on context match
            if (input.context) {
              const contextLower = input.context.toLowerCase();
              const categoryWords = expert.category.toLowerCase().split(/[\s&]+/);
              const specialtyWords = expert.specialty.toLowerCase().split(/[\s&]+/);
              
              if (categoryWords.some(w => contextLower.includes(w)) ||
                  specialtyWords.some(w => contextLower.includes(w))) {
                score += 10;
                reason = `${expert.reason} - Relevant to your current focus`;
              }
            }
            
            // Add diversity bonus for categories not yet consulted
            if (!topCategories.includes(expert.category) && consultations.length > 5) {
              // Slight boost to encourage exploring new areas
              score += 5;
            }
            
            recommendations.push({
              expertId: expert.id,
              expertName: expert.name,
              specialty: expert.specialty,
              reason,
              score,
              category: expert.category,
              avatar: expert.avatar,
              performanceScore: expert.performanceScore,
            });
          }
        }
        
        // Sort by score and return top recommendations
        return recommendations
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      }),

    // Get personalized insights based on consultation history
    getInsights: protectedProcedure
      .query(async ({ ctx }) => {
        const consultations = await getExpertConsultationHistory(ctx.user.id, { limit: 100 });
        const counts = await getExpertConsultationCounts(ctx.user.id);
        
        // Calculate insights
        const totalConsultations = consultations.length;
        const uniqueExperts = counts.length;
        const mostConsulted = counts[0] || null;
        
        // Recent activity
        const recentConsultations = consultations.slice(0, 5);
        
        return {
          totalConsultations,
          uniqueExperts,
          mostConsulted: mostConsulted ? {
            expertId: mostConsulted.expertId,
            count: mostConsulted.count,
          } : null,
          recentActivity: recentConsultations.map(c => ({
            expertId: c.expertId,
            expertName: c.expertName,
            topic: c.topic,
            date: c.createdAt,
          })),
        };
      }),
});
