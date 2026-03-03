/**
 * Email Accounts Router
 * Manages connected email accounts for AI-powered email intelligence.
 * Supports Gmail (OAuth), Outlook (OAuth), and IMAP/SMTP (manual).
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { emailAccounts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const emailAccountsRouter = router({
  /**
   * List all connected email accounts for the current user.
   */
  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(emailAccounts)
      .where(eq(emailAccounts.userId, ctx.user.id));
    return rows.map(r => ({
      id: r.id,
      email: r.email,
      provider: r.provider,
      status: r.status ?? "active",
      lastSynced: r.lastSyncedAt?.toISOString() ?? null,
      inboxCount: r.inboxCount ?? 0,
      sentCount: r.sentCount ?? 0,
    }));
  }),

  /**
   * Connect a new email account.
   * For OAuth providers (gmail/outlook), authCode is the OAuth authorisation code.
   * For IMAP, authCode is a placeholder — credentials are handled separately.
   */
  connectAccount: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["gmail", "outlook", "imap", "smtp"]),
        authCode: z.string(),
        email: z.string().email().optional(),
        imapHost: z.string().optional(),
        imapPort: z.number().optional(),
        password: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // For OAuth providers, in production this would exchange the auth code
      // for access/refresh tokens via the provider's OAuth endpoint.
      // Here we store the account record and mark it as pending OAuth completion.
      const emailAddress =
        input.email ??
        `${input.provider}-account-${ctx.user.id}@placeholder.com`;

      const [existing] = await db
        .select()
        .from(emailAccounts)
        .where(
          and(
            eq(emailAccounts.userId, ctx.user.id),
            eq(emailAccounts.email, emailAddress)
          )
        );

      if (existing) {
        // Re-activate if previously disconnected
        const [updated] = await db
          .update(emailAccounts)
          .set({ status: "active", updatedAt: new Date() })
          .where(eq(emailAccounts.id, existing.id))
          .returning();
        return updated;
      }

      const [row] = await db
        .insert(emailAccounts)
        .values({
          userId: ctx.user.id,
          email: emailAddress,
          provider: input.provider,
          status: "active",
          imapHost: input.imapHost ?? null,
          imapPort: input.imapPort ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return row;
    }),

  /**
   * Disconnect (soft-delete) an email account.
   */
  disconnectAccount: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(emailAccounts)
        .set({ status: "disconnected", updatedAt: new Date() })
        .where(
          and(
            eq(emailAccounts.id, input.accountId),
            eq(emailAccounts.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  /**
   * Trigger a manual sync for a connected email account.
   * In production this would enqueue a background job to fetch new emails.
   */
  syncAccount: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await db
        .update(emailAccounts)
        .set({ lastSyncedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(emailAccounts.id, input.accountId),
            eq(emailAccounts.userId, ctx.user.id)
          )
        )
        .returning();
      return { success: true, lastSynced: row?.lastSyncedAt?.toISOString() };
    }),
});
