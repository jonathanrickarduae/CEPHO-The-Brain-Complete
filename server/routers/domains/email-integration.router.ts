import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getEmailStats,
  getUrgentEmailsWithDrafts,
  generateEmailResponse,
  analyzeEmail,
  getEmailIntegrationStatus,
  connectEmailAccount,
} from "../../services/email-integration.service";

/**
 * Email Integration Router
 * Handles email management for Chief of Staff
 */
export const emailIntegrationRouter = router({
  /**
   * Get email statistics
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const stats = await getEmailStats(ctx.user.id);
        return {
          success: true,
          stats,
        };
      } catch (error) {
        console.error("Email stats error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get email statistics",
          cause: error,
        });
      }
    }),

  /**
   * Get urgent emails with AI-drafted responses
   */
  getUrgentWithDrafts: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const emails = await getUrgentEmailsWithDrafts(ctx.user.id);
        return {
          success: true,
          emails,
        };
      } catch (error) {
        console.error("Urgent emails error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get urgent emails",
          cause: error,
        });
      }
    }),

  /**
   * Generate AI response for an email
   */
  generateResponse: protectedProcedure
    .input(z.object({
      emailId: z.string(),
      emailBody: z.string(),
      emailSubject: z.string(),
      fromEmail: z.string(),
      fromName: z.string(),
      context: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const email = {
          id: input.emailId,
          from: {
            email: input.fromEmail,
            name: input.fromName,
          },
          subject: input.emailSubject,
          body: input.emailBody,
          preview: input.emailBody.substring(0, 200),
          receivedAt: new Date().toISOString(),
          isRead: false,
          isImportant: false,
          labels: [],
        };

        const response = await generateEmailResponse(email, input.context);

        return {
          success: true,
          response,
        };
      } catch (error) {
        console.error("Email response generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate email response",
          cause: error,
        });
      }
    }),

  /**
   * Get email integration status
   */
  getIntegrationStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const status = await getEmailIntegrationStatus(ctx.user.id);
        return {
          success: true,
          ...status,
        };
      } catch (error) {
        console.error("Email integration status error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get integration status",
          cause: error,
        });
      }
    }),

  /**
   * Connect email account
   */
  connectAccount: protectedProcedure
    .input(z.object({
      provider: z.enum(['gmail', 'outlook']),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await connectEmailAccount(ctx.user.id, input.provider);
        return {
          success: true,
          authUrl: result.authUrl,
        };
      } catch (error: any) {
        console.error("Email account connection error:", error);

        if (error.message?.includes('not yet configured')) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Email integration requires OAuth credentials to be configured.",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect email account",
          cause: error,
        });
      }
    }),
});
