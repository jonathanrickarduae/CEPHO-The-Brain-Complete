/**
 * Settings Router — Full Implementation (Appendix G)
 * Covers: get, update, updateTheme, updateLanguage, updateNotifications,
 *         changePIN, toggle2FA, inviteUser, removeUser
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcrypt";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { userSettings, users } from "../../drizzle/schema";
import { supabase as supabaseAdmin } from "../_core/supabase-auth";
import { writeAuditLog } from "./auditLog.router";

const DEFAULT_SETTINGS = {
  theme: "dark",
  governanceMode: "standard",
  dailyBriefTime: "07:00",
  eveningReviewTime: "18:00",
  twinAutonomyLevel: 1,
  notificationsEnabled: true,
  sidebarCollapsed: false,
  onboardingComplete: false,
};

export const settingsRouter = router({
  // ── GET ──────────────────────────────────────────────────────────────────
  get: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .limit(1);

    if (rows.length === 0) {
      const [created] = await db
        .insert(userSettings)
        .values({ userId: ctx.user.id, ...DEFAULT_SETTINGS })
        .returning();
      return created;
    }
    return rows[0];
  }),

  // ── UPDATE (generic) ─────────────────────────────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        theme: z.string().optional(),
        governanceMode: z.string().optional(),
        dailyBriefTime: z.string().optional(),
        eveningReviewTime: z.string().optional(),
        twinAutonomyLevel: z.number().min(1).max(10).optional(),
        notificationsEnabled: z.boolean().optional(),
        sidebarCollapsed: z.boolean().optional(),
        onboardingComplete: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1);

      if (existing.length === 0) {
        const [created] = await db
          .insert(userSettings)
          .values({ userId: ctx.user.id, ...DEFAULT_SETTINGS, ...input })
          .returning();
        return created;
      }

      const [updated] = await db
        .update(userSettings)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(userSettings.userId, ctx.user.id))
        .returning();
      return updated;
    }),

  // ── UPDATE THEME ─────────────────────────────────────────────────────────
  updateTheme: protectedProcedure
    .input(z.object({ theme: z.enum(["dark", "light", "system"]) }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(userSettings)
        .set({ theme: input.theme, updatedAt: new Date() })
        .where(eq(userSettings.userId, ctx.user.id));
      // Also update users.themePreference
      await db
        .update(users)
        .set({ themePreference: input.theme, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.id));
      return { success: true, theme: input.theme };
    }),

  // ── UPDATE LANGUAGE ───────────────────────────────────────────────────────
  updateLanguage: protectedProcedure
    .input(z.object({ language: z.string().min(2).max(10) }))
    .mutation(async ({ input, ctx }) => {
      // Store language preference in userSettings metadata
      const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1);

      const currentMeta =
        (existing[0]?.metadata as Record<string, unknown>) ?? {};
      await db
        .update(userSettings)
        .set({
          metadata: { ...currentMeta, language: input.language },
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, ctx.user.id));
      return { success: true, language: input.language };
    }),

  // ── UPDATE NOTIFICATIONS ──────────────────────────────────────────────────
  updateNotifications: protectedProcedure
    .input(
      z.object({
        notificationsEnabled: z.boolean().optional(),
        emailDigest: z.boolean().optional(),
        pushEnabled: z.boolean().optional(),
        briefingAlerts: z.boolean().optional(),
        taskReminders: z.boolean().optional(),
        agentAlerts: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1);

      const currentMeta =
        (existing[0]?.metadata as Record<string, unknown>) ?? {};
      const notifPrefs: Record<string, unknown> = {
        ...((currentMeta.notifPrefs as Record<string, unknown>) ?? {}),
      };
      if (input.emailDigest !== undefined)
        notifPrefs.emailDigest = input.emailDigest;
      if (input.pushEnabled !== undefined)
        notifPrefs.pushEnabled = input.pushEnabled;
      if (input.briefingAlerts !== undefined)
        notifPrefs.briefingAlerts = input.briefingAlerts;
      if (input.taskReminders !== undefined)
        notifPrefs.taskReminders = input.taskReminders;
      if (input.agentAlerts !== undefined)
        notifPrefs.agentAlerts = input.agentAlerts;

      await db
        .update(userSettings)
        .set({
          notificationsEnabled:
            input.notificationsEnabled ?? existing[0]?.notificationsEnabled,
          metadata: { ...currentMeta, notifPrefs },
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, ctx.user.id));
      return { success: true };
    }),

  // ── CHANGE PIN ────────────────────────────────────────────────────────────
  changePIN: protectedProcedure
    .input(
      z.object({
        currentPIN: z.string().min(4).max(12),
        newPIN: z.string().min(4).max(12),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get the user's current bcrypt-hashed PIN
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!userRows[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Users table stores PIN in metadata (since schema doesn't have a pin column)
      const meta = userRows[0] as Record<string, unknown>;
      const storedHash = (meta.pinHash as string) ?? null;

      if (storedHash) {
        const isValid = await bcrypt.compare(input.currentPIN, storedHash);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Current PIN is incorrect",
          });
        }
      }

      const newHash = await bcrypt.hash(input.newPIN, 12);

      // Store the new PIN hash in userSettings metadata
      const settingsRows = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1);

      const currentMeta =
        (settingsRows[0]?.metadata as Record<string, unknown>) ?? {};
      await db
        .update(userSettings)
        .set({
          metadata: { ...currentMeta, pinHash: newHash },
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, ctx.user.id));

      // Audit log
      writeAuditLog({
        userId: ctx.user.id,
        action: "settings.changePIN",
        resourceType: "user",
        resourceId: String(ctx.user.id),
        severity: "warning",
      }).catch(() => {});

      return { success: true };
    }),

  // ── TOGGLE 2FA ────────────────────────────────────────────────────────────
  toggle2FA: protectedProcedure
    .input(z.object({ enable: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      if (!supabaseAdmin) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Admin client not configured",
        });
      }

      if (input.enable) {
        // Enable TOTP MFA via Supabase Auth — user must complete enrollment in the client
        // We just record the intent; actual TOTP enrollment happens client-side
        await db
          .update(users)
          .set({ totpEnabled: true, updatedAt: new Date() })
          .where(eq(users.id, ctx.user.id));
        return {
          success: true,
          enabled: true,
          message:
            "2FA enabled. Complete TOTP enrollment in the authenticator app.",
        };
      } else {
        // Disable TOTP
        await db
          .update(users)
          .set({ totpEnabled: false, totpSecret: null, updatedAt: new Date() })
          .where(eq(users.id, ctx.user.id));
        // Audit log
        writeAuditLog({
          userId: ctx.user.id,
          action: "settings.toggle2FA",
          resourceType: "user",
          resourceId: String(ctx.user.id),
          metadata: { enabled: input.enable },
          severity: "warning",
        }).catch(() => {});

        return { success: true, enabled: false };
      }
    }),

  // ── INVITE USER ───────────────────────────────────────────────────────────
  inviteUser: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["admin", "member", "viewer"]).default("member"),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!supabaseAdmin) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Admin client not configured",
        });
      }

      // Only admins can invite users
      const inviterRows = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!inviterRows[0] || inviterRows[0].role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can invite users",
        });
      }

      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        input.email,
        {
          data: {
            role: input.role,
            invitedBy: ctx.user.id,
          },
          redirectTo: `${process.env.VITE_APP_URL ?? "https://cepho.ai"}/accept-invite`,
        }
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      // Audit log
      writeAuditLog({
        userId: ctx.user.id,
        action: "settings.inviteUser",
        resourceType: "user",
        metadata: { email: input.email, role: input.role },
        severity: "info",
      }).catch(() => {});

      return {
        success: true,
        userId: data.user?.id,
        email: input.email,
        role: input.role,
      };
    }),

  // ── REMOVE USER ───────────────────────────────────────────────────────────
  removeUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!supabaseAdmin) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Admin client not configured",
        });
      }

      // Only admins can remove users; cannot remove yourself
      const adminRows = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!adminRows[0] || adminRows[0].role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can remove users",
        });
      }

      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot remove your own account",
        });
      }

      // Get the user's Supabase openId
      const targetRows = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!targetRows[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Delete from Supabase Auth
      const { error } = await supabaseAdmin.auth.admin.deleteUser(
        targetRows[0].openId
      );
      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      // Delete from local users table
      await db.delete(users).where(eq(users.id, input.userId));

      // Audit log
      writeAuditLog({
        userId: ctx.user.id,
        action: "settings.removeUser",
        resourceType: "user",
        resourceId: String(input.userId),
        severity: "critical",
      }).catch(() => {});

      return { success: true, removedUserId: input.userId };
    }),
});
