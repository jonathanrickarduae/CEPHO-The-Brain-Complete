import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifySupabaseSession } from "./supabase-auth";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// P1-SEC-01: MOCK_ADMIN_USER removed. All unauthenticated requests will have
// ctx.user = null and will be rejected by the protectedProcedure middleware.
// This closes the critical security vulnerability where any visitor had admin access.

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Try Supabase session first
    const supabaseUser = await verifySupabaseSession(opts.req);

    if (supabaseUser) {
      // Find or create user in our database
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, supabaseUser.email!));

      if (existingUsers.length > 0) {
        user = existingUsers[0];
      } else {
        // Create new user from Supabase auth
        const [newUser] = await db
          .insert(users)
          .values({
            openId: supabaseUser.id,
            email: supabaseUser.email!,
            name:
              supabaseUser.user_metadata?.name ||
              supabaseUser.email!.split("@")[0],
            role: "user",
            themePreference: "dark",
          })
          .returning();
        user = newUser;
      }
    }
    // No Supabase session — user is unauthenticated. ctx.user remains null.
    // protectedProcedure will throw UNAUTHORIZED for all protected routes.
  } catch (error) {
    // On any auth error, treat as unauthenticated.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
