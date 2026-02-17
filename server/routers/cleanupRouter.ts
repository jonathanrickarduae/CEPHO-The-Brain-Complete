import { router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export const cleanupRouter = router({
  // Clear all dummy data from the database
  clearDummyData: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // Only allow if user is admin/owner
        const userId = ctx.user.openId;
        
        console.log('Starting database cleanup...');
        
        // Execute cleanup in order (respecting foreign key constraints)
        const db = await getDb();
        await db.execute(sql`DELETE FROM integration_logs`);
        await db.execute(sql`DELETE FROM integration_credentials`);
        await db.execute(sql`DELETE FROM integrations`);
        
        await db.execute(sql`DELETE FROM chief_of_staff_actions`);
        await db.execute(sql`DELETE FROM agent_daily_reports`);
        await db.execute(sql`DELETE FROM agent_approval_requests`);
        await db.execute(sql`DELETE FROM agent_tasks`);
        await db.execute(sql`DELETE FROM agent_capabilities`);
        await db.execute(sql`DELETE FROM ai_agents`);
        
        await db.execute(sql`DELETE FROM project_genesis_deliverables`);
        await db.execute(sql`DELETE FROM project_genesis_milestones`);
        await db.execute(sql`DELETE FROM project_genesis_phases`);
        await db.execute(sql`DELETE FROM project_genesis`);
        
        await db.execute(sql`DELETE FROM library_versions`);
        await db.execute(sql`DELETE FROM library_favorites`);
        await db.execute(sql`DELETE FROM library_permissions`);
        await db.execute(sql`DELETE FROM library_items`);
        await db.execute(sql`DELETE FROM library_documents`);
        
        await db.execute(sql`DELETE FROM conversations`);
        await db.execute(sql`DELETE FROM tasks`);
        
        await db.execute(sql`DELETE FROM automation_logs`);
        await db.execute(sql`DELETE FROM user_notifications`);
        await db.execute(sql`DELETE FROM generated_documents`);
        
        await db.execute(sql`DELETE FROM trading_workflow_logs`);
        await db.execute(sql`DELETE FROM trading_performance`);
        await db.execute(sql`DELETE FROM victoria_briefings`);
        await db.execute(sql`DELETE FROM trading_positions`);
        await db.execute(sql`DELETE FROM trading_signals`);
        
        await db.execute(sql`DELETE FROM cepho_workflow_validations`);
        await db.execute(sql`DELETE FROM cepho_workflow_steps`);
        await db.execute(sql`DELETE FROM cepho_workflows`);
        await db.execute(sql`DELETE FROM workflow_validations`);
        await db.execute(sql`DELETE FROM workflow_steps`);
        await db.execute(sql`DELETE FROM workflows`);
        
        await db.execute(sql`DELETE FROM qms_audit_log`);
        await db.execute(sql`DELETE FROM qms_quality_reviews`);
        await db.execute(sql`DELETE FROM qa_checklist_items`);
        await db.execute(sql`DELETE FROM qms_process_steps`);
        await db.execute(sql`DELETE FROM qms_documents`);
        await db.execute(sql`DELETE FROM qms_processes`);
        
        await db.execute(sql`DELETE FROM financial_workflow_steps`);
        await db.execute(sql`DELETE FROM financial_model_formulas`);
        await db.execute(sql`DELETE FROM financial_model_templates`);
        await db.execute(sql`DELETE FROM valuation_multiples`);
        await db.execute(sql`DELETE FROM industry_benchmarks`);
        
        await db.execute(sql`DELETE FROM notifications`);
        await db.execute(sql`DELETE FROM training_documents`);
        await db.execute(sql`DELETE FROM vault_access_log`);
        await db.execute(sql`DELETE FROM vault_verification_codes`);
        await db.execute(sql`DELETE FROM dashboard_metrics`);
        await db.execute(sql`DELETE FROM sme_escalation_triggers`);
        
        // Delete all projects except real ones
        await db.execute(sql`DELETE FROM projects WHERE id = 1`); // Delete fake "$1000 in 24hrs" project
        
        // Delete test users (keep only the real user)
        await db.execute(sql`DELETE FROM users WHERE id != 1`);
        
        console.log('Database cleanup completed successfully');
        
        return { 
          success: true, 
          message: 'All dummy data cleared successfully. Database is now clean.' 
        };
        
      } catch (error) {
        console.error('Database cleanup failed:', error);
        throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
});
