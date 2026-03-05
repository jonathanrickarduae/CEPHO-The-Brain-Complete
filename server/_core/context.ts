import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifySupabaseSession } from "./supabase-auth";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";
import jwt from "jsonwebtoken";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Cached admin user for PIN_GATE_ONLY mode — avoids a DB hit on every request.
let cachedAdminUser: User | null = null;

/**
 * Load the admin user from the DB for PIN_GATE_ONLY mode.
 * Looks up by ADMIN_EMAIL env var, falls back to the first user in the table.
 */
async function getAdminUserFromDb(): Promise<User | null> {
  if (cachedAdminUser) return cachedAdminUser;
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, adminEmail))
        .limit(1);
      if (rows.length > 0) {
        cachedAdminUser = rows[0];
        return cachedAdminUser;
      }
    }
    // Fallback: first user in the table (seeded admin)
    const rows = await db.select().from(users).orderBy(asc(users.id)).limit(1);
    if (rows.length > 0) {
      cachedAdminUser = rows[0];
      return cachedAdminUser;
    }
  } catch {
    // DB not available — return null
  }
  return null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // ── PIN_GATE_ONLY mode ────────────────────────────────────────────────────
    // When the app uses the PinGate as the sole authentication layer (no
    // Supabase Auth, no email/password login), every request is treated as
    // coming from the admin user.  Security is enforced by the client-side
    // PinGate — the server trusts all requests that reach it.
    if (process.env.PIN_GATE_ONLY === "true") {
      user = await getAdminUserFromDb();
      return { req: opts.req, res: opts.res, user };
    }

    // ── Supabase JWT ──────────────────────────────────────────────────────────
    const supabaseUser = await verifySupabaseSession(opts.req);
    if (supabaseUser) {
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, supabaseUser.email ?? ""));
      if (existingUsers.length > 0) {
        user = existingUsers[0];
      } else {
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

    // ── session_token cookie (simple-auth) ────────────────────────────────────
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
  } catch {
    user = null;
  }

  return { req: opts.req, res: opts.res, user };
}
