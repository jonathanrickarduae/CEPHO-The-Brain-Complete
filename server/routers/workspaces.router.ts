/**
 * Workspaces Router — Multi-workspace support (p4-6)
 *
 * Provides workspace creation, listing, switching, and member management.
 * Each user starts with a personal workspace created on first login.
 */
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  workspaces,
  workspaceMembers,
  userWorkspacePrefs,
} from "../../drizzle/schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Ensure a user has a personal workspace, creating one if needed. */
async function ensurePersonalWorkspace(userId: number, userName: string) {
  const existing = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.ownerId, userId), eq(workspaces.isPersonal, true)))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const slug = `personal-${userId}`;
  const [ws] = await db
    .insert(workspaces)
    .values({
      name: `${userName}'s Workspace`,
      slug,
      ownerId: userId,
      isPersonal: true,
      plan: "free",
    })
    .returning();

  // Add owner as member
  await db.insert(workspaceMembers).values({
    workspaceId: ws.id,
    userId,
    role: "owner",
    isActive: true,
  });

  return ws;
}

/** Get the active workspace ID for a user. */
async function getActiveWorkspaceId(
  userId: number,
  userName: string
): Promise<number> {
  const prefs = await db
    .select()
    .from(userWorkspacePrefs)
    .where(eq(userWorkspacePrefs.userId, userId))
    .limit(1);

  if (prefs.length > 0 && prefs[0].activeWorkspaceId) {
    return prefs[0].activeWorkspaceId;
  }

  // Fall back to personal workspace
  const personal = await ensurePersonalWorkspace(userId, userName);
  return personal.id;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const workspacesRouter = router({
  /**
   * List all workspaces the current user belongs to.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const members = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
        isActive: workspaceMembers.isActive,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, ctx.user.id),
          eq(workspaceMembers.isActive, true)
        )
      );

    if (members.length === 0) {
      // Ensure personal workspace exists and return it as the only workspace
      const personal = await ensurePersonalWorkspace(
        ctx.user.id,
        ctx.user.name ?? "User"
      );
      const activeId = personal.id;
      return [
        {
          id: personal.id,
          name: personal.name,
          slug: personal.slug,
          description: personal.description,
          plan: personal.plan,
          logoUrl: personal.logoUrl,
          isPersonal: personal.isPersonal,
          isActive: true,
          role: "owner" as const,
          createdAt: personal.createdAt.toISOString(),
        },
      ];
    }

    const wsIds = members.map(m => m.workspaceId);
    const activeId = await getActiveWorkspaceId(
      ctx.user.id,
      ctx.user.name ?? "User"
    );

    const wsList = await Promise.all(
      wsIds.map(id =>
        db
          .select()
          .from(workspaces)
          .where(eq(workspaces.id, id))
          .limit(1)
          .then(rows => rows[0])
      )
    );

    return wsList
      .filter(Boolean)
      .sort((a, b) => (a.isPersonal ? -1 : b.isPersonal ? 1 : 0))
      .map(ws => ({
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        description: ws.description,
        plan: ws.plan,
        logoUrl: ws.logoUrl,
        isPersonal: ws.isPersonal,
        isActive: ws.id === activeId,
        role: members.find(m => m.workspaceId === ws.id)?.role ?? "member",
        createdAt: ws.createdAt.toISOString(),
      }));
  }),

  /**
   * Get the currently active workspace.
   */
  getActive: protectedProcedure.query(async ({ ctx }) => {
    const activeId = await getActiveWorkspaceId(
      ctx.user.id,
      ctx.user.name ?? "User"
    );
    const rows = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, activeId))
      .limit(1);

    if (rows.length === 0) return null;
    const ws = rows[0];

    const memberRow = await db
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, ws.id),
          eq(workspaceMembers.userId, ctx.user.id)
        )
      )
      .limit(1);

    return {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      description: ws.description,
      plan: ws.plan,
      logoUrl: ws.logoUrl,
      isPersonal: ws.isPersonal,
      role: memberRow[0]?.role ?? "member",
    };
  }),

  /**
   * Switch to a different workspace.
   */
  switchTo: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Verify user is a member
      const membership = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, input.workspaceId),
            eq(workspaceMembers.userId, ctx.user.id),
            eq(workspaceMembers.isActive, true)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this workspace",
        });
      }

      // Upsert preference
      const existing = await db
        .select()
        .from(userWorkspacePrefs)
        .where(eq(userWorkspacePrefs.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(userWorkspacePrefs)
          .set({ activeWorkspaceId: input.workspaceId })
          .where(eq(userWorkspacePrefs.userId, ctx.user.id));
      } else {
        await db.insert(userWorkspacePrefs).values({
          userId: ctx.user.id,
          activeWorkspaceId: input.workspaceId,
        });
      }

      return { success: true, activeWorkspaceId: input.workspaceId };
    }),

  /**
   * Create a new workspace.
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        slug: z
          .string()
          .min(2)
          .max(100)
          .regex(/^[a-z0-9-]+$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check slug uniqueness
      const existing = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, input.slug))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A workspace with this slug already exists",
        });
      }

      const [ws] = await db
        .insert(workspaces)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          ownerId: ctx.user.id,
          isPersonal: false,
          plan: "free",
        })
        .returning();

      // Add creator as owner member
      await db.insert(workspaceMembers).values({
        workspaceId: ws.id,
        userId: ctx.user.id,
        role: "owner",
        isActive: true,
      });

      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        plan: ws.plan,
        isPersonal: ws.isPersonal,
      };
    }),

  /**
   * Update workspace details (owner/admin only).
   */
  update: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify owner/admin
      const membership = await db
        .select({ role: workspaceMembers.role })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, input.workspaceId),
            eq(workspaceMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (
        !membership.length ||
        !["owner", "admin"].includes(membership[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Only workspace owners and admins can update workspace details",
        });
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined)
        updates.description = input.description;

      await db
        .update(workspaces)
        .set(updates)
        .where(eq(workspaces.id, input.workspaceId));

      return { success: true };
    }),

  /**
   * List members of a workspace.
   */
  listMembers: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify membership
      const membership = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, input.workspaceId),
            eq(workspaceMembers.userId, ctx.user.id),
            eq(workspaceMembers.isActive, true)
          )
        )
        .limit(1);

      if (!membership.length) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a member" });
      }

      const members = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, input.workspaceId),
            eq(workspaceMembers.isActive, true)
          )
        )
        .orderBy(desc(workspaceMembers.joinedAt));

      return members.map(m => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
      }));
    }),
});
