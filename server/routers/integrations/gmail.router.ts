import { router, protectedProcedure } from '../../_core/trpc';
import { z } from 'zod';
import { gmailService } from '../../services/gmail.service';
import { emailAnalysisService } from '../../services/email-analysis.service';
import { getDb } from '../../db';
import { emails, emailAccounts } from '../../../drizzle/schema/email.schema';
import { eq, and, desc, or } from 'drizzle-orm';

export const gmailRouter = router({
  
  /**
   * Get OAuth authorization URL
   */
  getAuthUrl: protectedProcedure
    .input(z.object({
      emailAddress: z.string().email().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const authUrl = gmailService.getAuthUrl(ctx.user.id, input.emailAddress);
      return { authUrl };
    }),

  /**
   * Handle OAuth callback (exchange code for tokens)
   */
  handleCallback: protectedProcedure
    .input(z.object({
      code: z.string(),
      company: z.string().optional(),
      isPrimary: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Exchange code for tokens
      const tokens = await gmailService.getTokensFromCode(input.code);
      
      // Get user's email address
      const emailAddress = await gmailService.getUserEmail(tokens.accessToken);
      
      // Save account
      const account = await gmailService.saveEmailAccount(
        ctx.user.id,
        emailAddress,
        tokens,
        {
          company: input.company,
          isPrimary: input.isPrimary,
        }
      );
      
      // Trigger initial sync
      try {
        await gmailService.syncAccount(account);
      } catch (error) {
        // Don't fail if initial sync fails
        console.error('Initial sync failed:', error);
      }
      
      return {
        success: true,
        account: {
          id: account.id,
          emailAddress: account.emailAddress,
          company: account.company,
          isPrimary: account.isPrimary,
        },
      };
    }),

  /**
   * Get all connected email accounts
   */
  getAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      const accounts = await gmailService.getEmailAccounts(ctx.user.id);
      
      return accounts.map(account => ({
        id: account.id,
        emailAddress: account.emailAddress,
        company: account.company,
        isPrimary: account.isPrimary,
        isActive: account.isActive,
        syncEnabled: account.syncEnabled,
        lastSyncAt: account.lastSyncAt,
        lastSyncStatus: account.lastSyncStatus,
        createdAt: account.createdAt,
      }));
    }),

  /**
   * Sync a specific account
   */
  syncAccount: protectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Get account
      const accounts = await db
        .select()
        .from(emailAccounts)
        .where(and(
          eq(emailAccounts.id, input.accountId),
          eq(emailAccounts.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (accounts.length === 0) {
        throw new Error('Account not found');
      }
      
      const savedCount = await gmailService.syncAccount(accounts[0]);
      
      return {
        success: true,
        emailsSynced: savedCount,
      };
    }),

  /**
   * Sync all accounts
   */
  syncAllAccounts: protectedProcedure
    .mutation(async ({ ctx }) => {
      const result = await gmailService.syncAllAccounts(ctx.user.id);
      return result;
    }),

  /**
   * Get emails with filtering and pagination
   */
  getEmails: protectedProcedure
    .input(z.object({
      accountId: z.string().uuid().optional(),
      priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
      category: z.string().optional(),
      isRead: z.boolean().optional(),
      isStarred: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      let query = db
        .select()
        .from(emails)
        .where(eq(emails.userId, ctx.user.id));
      
      // Apply filters
      const conditions = [eq(emails.userId, ctx.user.id)];
      
      if (input.accountId) {
        conditions.push(eq(emails.accountId, input.accountId));
      }
      
      if (input.priority) {
        conditions.push(eq(emails.priority, input.priority));
      }
      
      if (input.category) {
        conditions.push(eq(emails.category, input.category));
      }
      
      if (input.isRead !== undefined) {
        conditions.push(eq(emails.isRead, input.isRead));
      }
      
      if (input.isStarred !== undefined) {
        conditions.push(eq(emails.isStarred, input.isStarred));
      }
      
      const results = await db
        .select()
        .from(emails)
        .where(and(...conditions))
        .orderBy(desc(emails.receivedAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return results;
    }),

  /**
   * Get a single email by ID
   */
  getEmail: protectedProcedure
    .input(z.object({
      emailId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const results = await db
        .select()
        .from(emails)
        .where(and(
          eq(emails.id, input.emailId),
          eq(emails.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (results.length === 0) {
        throw new Error('Email not found');
      }
      
      return results[0];
    }),

  /**
   * Mark email as read/unread
   */
  markAsRead: protectedProcedure
    .input(z.object({
      emailId: z.string().uuid(),
      isRead: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db
        .update(emails)
        .set({ isRead: input.isRead, updatedAt: new Date() })
        .where(and(
          eq(emails.id, input.emailId),
          eq(emails.userId, ctx.user.id)
        ));
      
      return { success: true };
    }),

  /**
   * Star/unstar email
   */
  toggleStar: protectedProcedure
    .input(z.object({
      emailId: z.string().uuid(),
      isStarred: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db
        .update(emails)
        .set({ isStarred: input.isStarred, updatedAt: new Date() })
        .where(and(
          eq(emails.id, input.emailId),
          eq(emails.userId, ctx.user.id)
        ));
      
      return { success: true };
    }),

  /**
   * Analyze unanalyzed emails
   */
  analyzeEmails: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const analyzed = await emailAnalysisService.analyzeUnanalyzedEmails(
        ctx.user.id,
        input.limit
      );
      
      return {
        success: true,
        analyzed,
      };
    }),

  /**
   * Get email statistics
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const stats = await emailAnalysisService.getEmailStats(ctx.user.id);
      return stats;
    }),

  /**
   * Get top senders
   */
  getTopSenders: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const topSenders = await emailAnalysisService.getTopSenders(
        ctx.user.id,
        input.limit
      );
      return topSenders;
    }),

  /**
   * Extract action items from emails
   */
  getActionItems: protectedProcedure
    .input(z.object({
      emailIds: z.array(z.string().uuid()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const actionItems = await emailAnalysisService.extractActionItems(
        ctx.user.id,
        input.emailIds
      );
      return actionItems;
    }),

  /**
   * Delete email account
   */
  deleteAccount: protectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Verify ownership and delete
      await db
        .delete(emailAccounts)
        .where(and(
          eq(emailAccounts.id, input.accountId),
          eq(emailAccounts.userId, ctx.user.id)
        ));
      
      return { success: true };
    }),

  /**
   * Toggle account sync
   */
  toggleSync: protectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      syncEnabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db
        .update(emailAccounts)
        .set({ syncEnabled: input.syncEnabled, updatedAt: new Date() })
        .where(and(
          eq(emailAccounts.id, input.accountId),
          eq(emailAccounts.userId, ctx.user.id)
        ));
      
      return { success: true };
    }),

  /**
   * Connect Gmail account (alias for getAuthUrl as mutation)
   */
  connect: protectedProcedure
    .mutation(async ({ ctx }) => {
      const authUrl = gmailService.getAuthUrl(ctx.user.id);
      return { authUrl };
    }),

  /**
   * Disconnect Gmail account (alias for deleteAccount)
   */
  disconnect: protectedProcedure
    .input(z.object({
      accountId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Get account by numeric ID
      const accounts = await db
        .select()
        .from(emailAccounts)
        .where(and(
          eq(emailAccounts.userId, ctx.user.id)
        ))
        .limit(100);
      
      const account = accounts[input.accountId];
      if (!account) {
        throw new Error('Account not found');
      }
      
      // Delete account
      await db
        .delete(emailAccounts)
        .where(and(
          eq(emailAccounts.id, account.id),
          eq(emailAccounts.userId, ctx.user.id)
        ));
      
      return { success: true };
    }),

  /**
   * Sync emails for account (alias for syncAccount with number ID)
   */
  syncEmails: protectedProcedure
    .input(z.object({
      accountId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Get all accounts for user
      const accounts = await db
        .select()
        .from(emailAccounts)
        .where(eq(emailAccounts.userId, ctx.user.id))
        .limit(100);
      
      const account = accounts[input.accountId];
      if (!account) {
        throw new Error('Account not found');
      }
      
      // Sync account
      await gmailService.syncAccount(account);
      
      return { success: true };
    }),
});
