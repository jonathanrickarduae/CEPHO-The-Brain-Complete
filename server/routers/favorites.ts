import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { favoriteContacts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const favoritesRouter = router({
  // Get all favorites for the current user
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new Error("Not authenticated");
    }

    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const favorites = await db
      .select()
      .from(favoriteContacts)
      .where(
        and(
          eq(favoriteContacts.userId, ctx.user.id),
          eq(favoriteContacts.isFavorited, true)
        )
      )
      .orderBy(favoriteContacts.order);

    return favorites;
  }),

  // Add a contact to favorites
  add: publicProcedure
    .input(
      z.object({
        contactType: z.enum(["expert", "corporate_partner", "ai_expert", "colleague"]),
        contactId: z.string(),
        contactName: z.string(),
        contactAvatar: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new Error("Not authenticated");
      }

      // Check if already exists
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const existing = await db
        .select()
        .from(favoriteContacts)
        .where(
          and(
            eq(favoriteContacts.userId, ctx.user.id),
            eq(favoriteContacts.contactId, input.contactId)
          )
        );

      if (existing.length > 0) {
        // Update existing
        await db
          .update(favoriteContacts)
          .set({ isFavorited: true, updatedAt: new Date() })
          .where(eq(favoriteContacts.id, existing[0].id));

        return existing[0];
      }

      // Create new
      await db.insert(favoriteContacts).values({
        userId: ctx.user.id,
        contactType: input.contactType,
        contactId: input.contactId,
        contactName: input.contactName,
        contactAvatar: input.contactAvatar,
        isFavorited: true,
        order: 0,
      });

      // Fetch the newly created record
      const created = await db
        .select()
        .from(favoriteContacts)
        .where(
          and(
            eq(favoriteContacts.userId, ctx.user.id),
            eq(favoriteContacts.contactId, input.contactId)
          )
        );

      return created[0];
    }),

  // Remove a contact from favorites
  remove: publicProcedure
    .input(z.object({ contactId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new Error("Not authenticated");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      await db
        .update(favoriteContacts)
        .set({ isFavorited: false, updatedAt: new Date() })
        .where(
          and(
            eq(favoriteContacts.userId, ctx.user.id),
            eq(favoriteContacts.contactId, input.contactId)
          )
        );

      return { success: true };
    }),

  // Update order of favorites
  updateOrder: publicProcedure
    .input(
      z.object({
        favorites: z.array(
          z.object({
            contactId: z.string(),
            order: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new Error("Not authenticated");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      for (const fav of input.favorites) {
        await db
          .update(favoriteContacts)
          .set({ order: fav.order, updatedAt: new Date() })
          .where(
            and(
              eq(favoriteContacts.userId, ctx.user.id),
              eq(favoriteContacts.contactId, fav.contactId)
            )
          );
      }

      return { success: true };
    }),
});
