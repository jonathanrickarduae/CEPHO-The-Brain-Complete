import { z } from 'zod';
import { router, protectedProcedure } from '../../_core/trpc';
import { integrationManager } from '../../services/integration-manager';

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
      console.log('[IntegrationRouter] initializeAll called for userId:', ctx.user.openId);
      const userId = ctx.user.openId;
      
      // Load credentials from environment variables
      const getEnv = (key: string) => process.env[key] || '';
      
      // All services with their credentials from env - ONLY those with actual API keys
      const services = [
        // AI Services
        { service: 'openai', email: 'configured', apiKey: getEnv('OPENAI_API_KEY') },
        { service: 'claude', email: 'configured', apiKey: getEnv('ANTHROPIC_API_KEY') },
        { service: 'manus', email: 'configured', apiKey: getEnv('MANUS_API_KEY') },
        { service: 'elevenlabs', email: 'configured', apiKey: getEnv('ELEVENLABS_API_KEY') },
        { service: 'synthesia', email: 'configured', apiKey: getEnv('SYNTHESIA_API_KEY') },
        
        // Productivity
        { service: 'notion', email: 'configured', apiKey: getEnv('NOTION_API_KEY') },
        { service: 'todoist', email: 'configured', apiKey: getEnv('TODOIST_API_KEY') },
        { service: 'trello', email: 'configured', apiKey: getEnv('TRELLO_API_KEY'), apiSecret: getEnv('TRELLO_API_SECRET') },
        { service: 'calendly', email: 'configured', apiKey: getEnv('CALENDLY_API_KEY') },
        { service: 'asana', email: 'configured', apiKey: getEnv('ASANA_API_KEY') },
        
        // Communication
        { service: 'zoom', email: 'configured', apiKey: getEnv('ZOOM_CLIENT_ID'), apiSecret: getEnv('ZOOM_CLIENT_SECRET'), metadata: { accountId: getEnv('ZOOM_ACCOUNT_ID') } },
        { service: 'gmail', email: getEnv('SMTP_USER'), password: getEnv('SMTP_PASS') },
        
        // Development
        { service: 'github', email: 'configured', apiKey: getEnv('GITHUB_TOKEN') },
        { service: 'supabase', email: 'configured', apiKey: getEnv('SUPABASE_SERVICE_KEY') },
      ].filter(svc => svc.apiKey || svc.password); // Only include services with actual credentials

      // Store all credentials
      console.log('[IntegrationRouter] Storing credentials for', services.length, 'services');
      let successCount = 0;
      for (const svc of services) {
        try {
          console.log('[IntegrationRouter] Storing:', svc.service);
          await integrationManager.storeCredentials(userId, svc);
          await integrationManager.updateStatus(userId, svc.service, 'connected');
          successCount++;
          console.log('[IntegrationRouter] Successfully stored:', svc.service);
        } catch (error) {
          console.error('[IntegrationRouter] Error storing', svc.service, ':', error);
        }
      }

      console.log('[IntegrationRouter] initializeAll completed. Success:', successCount, '/', services.length);
      return { success: true, count: successCount };
    }),
});
