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

/**
 * In PIN_GATE_ONLY mode the entire app is protected by the client-side PIN
 * gate.  There is exactly one user — Jonathan Rickard — and we represent him
 * as a synthetic in-memory object so that:
 *
 *   • No DB query is needed on every request (no latency, no failure modes).
 *   • No seed script / auto-create logic is required.
 *   • The user object satisfies the full User type so every tRPC procedure
 *     that reads ctx.user works without modification.
 *
 * The `id` is set to 1 which matches the expected first-row primary key.
 * All timestamp fields are set to a fixed date so they are always valid.
 */
const PIN_GATE_ADMIN: User = {
  id: 1,
  openId: "pin-gate-admin",
  name: "Jonathan Rickard",
  email: "admin@cepho.ai",
  loginMethod: "pin",
  role: "admin",
  themePreference: "dark",
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
  lastSignedIn: new Date(),
  totpSecret: null,
  totpEnabled: false,
  totpVerifiedAt: null,
  backupCodes: null,
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // ── PIN_GATE_ONLY mode ────────────────────────────────────────────────────
    // When PIN_GATE_ONLY=true every request is treated as coming from the
    // single admin user.  Security is enforced by the client-side PinGate —
    // the server trusts all requests that reach it.
    if (process.env.PIN_GATE_ONLY === "true") {
      return { req: opts.req, res: opts.res, user: PIN_GATE_ADMIN };
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
