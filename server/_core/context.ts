import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifySupabaseSession } from "./supabase-auth";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

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
    // Try Supabase session first (Authorization: Bearer <jwt>)
    const supabaseUser = await verifySupabaseSession(opts.req);

    if (supabaseUser) {
      // Find or create user in our database
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, supabaseUser.email ?? ""));

      if (existingUsers.length > 0) {
        user = existingUsers[0];
      } else {
        // Create new user from Supabase auth
        const [newUser] = await db
          .insert(users)
          .values({
            openId: supabaseUser.id,
            email: supabaseUser.email ?? "",
            name:
              supabaseUser.user_metadata?.name ||
              (supabaseUser.email ?? "").split("@")[0],
            role: "user",
            themePreference: "dark",
          })
          .returning();
        user = newUser;
      }
    }

    // Fallback: verify session_token cookie set by simple-auth (/api/auth/login)
    if (!user) {
      const sessionToken = opts.req.cookies?.session_token as
        | string
        | undefined;
      const jwtSecret = process.env.JWT_SECRET;
      if (sessionToken && jwtSecret) {
        try {
          const decoded = jwt.verify(sessionToken, jwtSecret) as {
            id?: number;
            email?: string;
            openId?: string;
          };
          if (decoded?.email) {
            const cookieUsers = await db
              .select()
              .from(users)
              .where(eq(users.email, decoded.email))
              .limit(1);
            if (cookieUsers.length > 0) {
              user = cookieUsers[0];
            }
          }
        } catch {
          // Invalid or expired cookie token — remain unauthenticated
        }
      }
    }

    // No valid session — user is unauthenticated. ctx.user remains null.
    // protectedProcedure will throw UNAUTHORIZED for all protected routes.
  } catch {
    // On any auth error, treat as unauthenticated.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
