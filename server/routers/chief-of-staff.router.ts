// Chief of Staff Router - Daily Briefings, Training, and Digital Twin
import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { 
  cosTrainingModules, 
  cosModuleProgress, 
  digitalTwinProfiles,
  digitalTwinGoals,
  digitalTwinPreferences 
} from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const chiefOfStaffRouter = router({
  // Morning Briefing
  getMorningBriefing: protectedProcedure
    .query(async ({ ctx }) => {
      // Get user's digital twin profile
      const profile = await db.select()
        .from(digitalTwinProfiles)
        .where(eq(digitalTwinProfiles.userId, ctx.user.id))
        .limit(1);
      
      // Get active goals
      const goals = profile.length > 0 
        ? await db.select()
            .from(digitalTwinGoals)
            .where(and(
              eq(digitalTwinGoals.profileId, profile[0].id),
              eq(digitalTwinGoals.status, 'active')
            ))
        : [];
      
      // Generate briefing based on profile and goals
      const briefing = {
        date: new Date().toISOString(),
        greeting: `Good morning, ${ctx.user.name}!`,
        summary: generateDailySummary(profile[0], goals),
        priorities: generatePriorities(goals),
        actionItems: generateActionItems(goals),
        insights: generateInsights(profile[0]),
        weather: { temp: 25, condition: 'sunny' }, // Mock data
        schedule: [], // Would integrate with calendar
      };
      
      return briefing;
    }),

  // Evening Review
  getEveningReview: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await db.select()
        .from(digitalTwinProfiles)
        .where(eq(digitalTwinProfiles.userId, ctx.user.id))
        .limit(1);
      
      const review = {
        date: new Date().toISOString(),
        greeting: `Good evening, ${ctx.user.name}!`,
        achievements: [], // Would track completed tasks
        learnings: [], // Would capture insights
        tomorrowsPlan: [], // Would generate from goals
        reflection: generateReflection(profile[0]),
      };
      
      return review;
    }),

  // Get Digital Twin Profile
  getDigitalTwin: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await db.select()
        .from(digitalTwinProfiles)
        .where(eq(digitalTwinProfiles.userId, ctx.user.id))
        .limit(1);
      
      if (!profile || profile.length === 0) {
        // Create default profile
        const newProfile = await db.insert(digitalTwinProfiles).values({
          userId: ctx.user.id,
          successDNA: {},
          learningStyle: 'visual',
          communicationPreferences: {},
          workingStyle: {},
        }).returning();
        
        return newProfile[0];
      }
      
      return profile[0];
    }),

  // Update Digital Twin
  updateDigitalTwin: protectedProcedure
    .input(z.object({
      successDNA: z.any().optional(),
      learningStyle: z.string().optional(),
      communicationPreferences: z.any().optional(),
      workingStyle: z.any().optional(),
      strengthsWeaknesses: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Get existing profile
      const existing = await db.select()
        .from(digitalTwinProfiles)
        .where(eq(digitalTwinProfiles.userId, ctx.user.id))
        .limit(1);
      
      if (existing.length === 0) {
        // Create new profile
        const newProfile = await db.insert(digitalTwinProfiles).values({
          userId: ctx.user.id,
          ...input,
        }).returning();
        
        return newProfile[0];
      }
      
      // Update existing profile
      const updated = await db.update(digitalTwinProfiles)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(digitalTwinProfiles.userId, ctx.user.id))
        .returning();
      
      return updated[0];
    }),
});

// Helper functions
function generateDailySummary(profile: any, goals: any[]): string {
  return `You have ${goals.length} active goals. Today's focus: productivity and growth.`;
}

function generatePriorities(goals: any[]): string[] {
  return goals.slice(0, 3).map(g => g.title);
}

function generateActionItems(goals: any[]): string[] {
  return ['Review project status', 'Complete pending tasks', 'Plan tomorrow'];
}

function generateInsights(profile: any): string[] {
  return [
    'Your productivity peaks in the morning',
    'Consider delegating routine tasks',
    'Schedule deep work for afternoon',
  ];
}

function generateReflection(profile: any): string {
  return 'Great progress today. Keep up the momentum!';
}
