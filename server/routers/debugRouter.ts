import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';

export const debugRouter = router({
  checkAIStatus: protectedProcedure
    .query(async () => {
      return {
        environment: {
          OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
          OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0,
          OPENAI_API_KEY_PREFIX: process.env.OPENAI_API_KEY?.substring(0, 7) || 'none',
          ANTHROPIC_API_KEY_EXISTS: !!process.env.ANTHROPIC_API_KEY,
          AI_ENABLED: process.env.AI_ENABLED,
          NODE_ENV: process.env.NODE_ENV,
        },
        timestamp: new Date().toISOString(),
      };
    }),
});
