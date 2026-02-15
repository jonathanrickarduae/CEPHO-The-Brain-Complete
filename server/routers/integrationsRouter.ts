import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { integrationManager } from '../services/integration-manager';

export const integrationsRouter = router({
  // Store credentials for a service
  storeCredentials: protectedProcedure
    .input(z.object({
      service: z.string(),
      email: z.string().optional(),
      password: z.string().optional(),
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      accessToken: z.string().optional(),
      refreshToken: z.string().optional(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await integrationManager.storeCredentials(ctx.user.openId, input);
      return { success: true };
    }),

  // Get all integrations for current user
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return await integrationManager.getAllIntegrations(ctx.user.openId);
    }),

  // Test connection for a service
  testConnection: protectedProcedure
    .input(z.object({
      service: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await integrationManager.testConnection(ctx.user.openId, input.service);
      
      // Update status based on test result
      await integrationManager.updateStatus(
        ctx.user.openId,
        input.service,
        result.success ? 'connected' : 'error',
        result.error
      );

      await integrationManager.logConnection(
        ctx.user.openId,
        input.service,
        'test',
        result.success,
        result.error
      );

      return result;
    }),

  // Bulk initialize all services with credentials from environment variables
  initializeAll: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user.openId;
      
      // Load credentials from environment variables
      const getEnv = (key: string) => process.env[key] || '';
      
      // All services with their credentials from env
      const services = [
        // Services with full credentials
        { service: 'notion', email: getEnv('NOTION_EMAIL'), password: getEnv('NOTION_PASSWORD') },
        { service: 'todoist', email: getEnv('TODOIST_EMAIL'), password: getEnv('TODOIST_PASSWORD') },
        { service: 'teams', email: getEnv('TEAMS_EMAIL'), password: getEnv('TEAMS_PASSWORD') },
        { service: 'calendly', email: getEnv('CALENDLY_EMAIL'), password: getEnv('CALENDLY_PASSWORD') },
        { service: 'bitwarden', email: getEnv('BITWARDEN_EMAIL'), password: getEnv('BITWARDEN_PASSWORD') },
        { service: 'grammarly', email: getEnv('GRAMMARLY_EMAIL'), password: getEnv('GRAMMARLY_PASSWORD') },
        { service: 'toggl', email: getEnv('TOGGL_EMAIL'), password: getEnv('TOGGL_PASSWORD') },
        { service: 'zoom', email: getEnv('ZOOM_EMAIL'), password: getEnv('ZOOM_PASSWORD') },
        { service: 'zapier', email: getEnv('ZAPIER_EMAIL'), password: getEnv('ZAPIER_PASSWORD') },
        { service: 'loom', email: getEnv('LOOM_EMAIL'), password: getEnv('LOOM_PASSWORD') },
        { service: 'ideals', email: getEnv('IDEALS_EMAIL'), password: getEnv('IDEALS_PASSWORD') },
        { service: 'asana', email: getEnv('ASANA_EMAIL'), password: getEnv('ASANA_PASSWORD') },
        { service: 'github', email: getEnv('GITHUB_EMAIL'), password: getEnv('GITHUB_PASSWORD'), apiKey: getEnv('GITHUB_API_KEY') },
        { service: 'claude', email: getEnv('CLAUDE_EMAIL'), password: getEnv('CLAUDE_PASSWORD'), apiKey: getEnv('ANTHROPIC_API_KEY') },
        { service: 'supabase', email: getEnv('SUPABASE_EMAIL'), password: getEnv('SUPABASE_PASSWORD') },
        { service: 'gmail', email: getEnv('GMAIL_EMAIL'), password: getEnv('GMAIL_PASSWORD') },
        { service: 'whatsapp', email: getEnv('WHATSAPP_PHONE') },
        { service: 'grok', email: getEnv('GROK_EMAIL'), password: getEnv('GROK_PASSWORD') },
        
        // Services with API keys (mark as connected if API key exists)
        { service: 'openai', email: getEnv('OPENAI_EMAIL') || 'configured', apiKey: getEnv('OPENAI_API_KEY') },
        { service: 'copilot', email: getEnv('COPILOT_EMAIL') || 'configured' },
        { service: 'gemini', email: getEnv('GEMINI_EMAIL') || 'configured' },
        { service: 'manus', email: getEnv('MANUS_EMAIL') || 'configured' },
        { service: 'render', email: getEnv('RENDER_EMAIL') || 'configured' },
      ].filter(svc => svc.email); // Only include services with email configured

      // Store all credentials
      for (const svc of services) {
        await integrationManager.storeCredentials(userId, svc);
        await integrationManager.updateStatus(userId, svc.service, 'connected');
      }

      return { success: true, count: services.length };
    }),
});
