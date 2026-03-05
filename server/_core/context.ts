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
 *
 * Resolution order:
 *   1. In-memory cache (avoids a DB hit on every tRPC request)
 *   2. Row matching ADMIN_EMAIL env var
 *   3. First row in the users table (seeded admin)
 *   4. AUTO-CREATE — if the table is empty, insert an admin user using
 *      ADMIN_EMAIL / ADMIN_NAME env vars so the app works on a fresh DB
 *      without requiring a manual seed step.
 */
async function getAdminUserFromDb(): Promise<User | null> {
  if (cachedAdminUser) return cachedAdminUser;
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@cepho.ai";
    const adminName = process.env.ADMIN_NAME || "Admin";

    // 1. Look up by ADMIN_EMAIL
    const byEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);
    if (byEmail.length > 0) {
      cachedAdminUser = byEmail[0];
      return cachedAdminUser;
    }

    // 2. Fallback: first user in the table
    const firstRow = await db
      .select()
      .from(users)
      .orderBy(asc(users.id))
      .limit(1);
    if (firstRow.length > 0) {
      cachedAdminUser = firstRow[0];
      return cachedAdminUser;
    }

    // 3. AUTO-CREATE: table is empty (fresh production DB, seed never ran).
    //    Insert a minimal admin user so PIN_GATE_ONLY works out of the box.
    console.log(
      `[PIN_GATE_ONLY] No users found — auto-creating admin: ${adminEmail}`
    );
    const [newAdmin] = await db
      .insert(users)
      .values({
        openId: `pin-gate-admin-${Date.now()}`,
        email: adminEmail,
        name: adminName,
        role: "admin",
        themePreference: "dark",
      })
      .returning();
    cachedAdminUser = newAdmin;
    console.log(
      `[PIN_GATE_ONLY] Admin user created (id: ${newAdmin.id}, email: ${newAdmin.email})`
    );
    return cachedAdminUser;
  } catch (err) {
    // DB not available — return null and let the request fail gracefully
    console.error("[PIN_GATE_ONLY] Failed to get/create admin user:", err);
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
