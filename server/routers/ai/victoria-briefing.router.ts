import { router, protectedProcedure } from '../../_core/trpc';
import { z } from 'zod';
import { victoriaBriefingService } from '../../services/victoria-briefing.service';

export const victoriaBriefingRouter = router({
  
  /**
   * Get morning briefing
   */
  getMorningBriefing: protectedProcedure
    .input(z.object({
      includeAudio: z.boolean().optional(),
      includeVideo: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return await victoriaBriefingService.getCompleteBriefing(
        ctx.user.id,
        ctx.user.name || undefined,
        input
      );
    }),
  
  /**
   * Generate audio for briefing
   */
  generateAudio: protectedProcedure
    .input(z.object({
      text: z.string(),
    }))
    .mutation(async ({ input }) => {
      const audioUrl = await victoriaBriefingService.generateAudio(input.text);
      return { audioUrl };
    }),
  
  /**
   * Generate video for briefing
   */
  generateVideo: protectedProcedure
    .input(z.object({
      text: z.string(),
    }))
    .mutation(async ({ input }) => {
      const videoUrl = await victoriaBriefingService.generateVideo(input.text);
      return { videoUrl };
    }),
});
