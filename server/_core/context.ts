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

// Mock admin user for PIN-gated access (no Supabase auth required)
const MOCK_ADMIN_USER = {
  id: 1,
  openId: 'mock-admin-openid',
  email: 'admin@cepho.ai',
  name: 'Victoria',
  loginMethod: 'pin',
  role: 'admin',
  themePreference: 'dark',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
} as unknown as User;

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Try Supabase session first
    const supabaseUser = await verifySupabaseSession(opts.req);
    
    if (supabaseUser) {
      // Find or create user in our database
      const existingUsers = await db.select().from(users).where(eq(users.email, supabaseUser.email!));
      
      if (existingUsers.length > 0) {
        user = existingUsers[0];
      } else {
        // Create new user from Supabase auth
        const [newUser] = await db.insert(users).values({
          openId: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
          role: 'user',
          themePreference: 'dark',
        }).returning();
        user = newUser;
      }
    } else {
      // No Supabase session — use mock admin user (PIN gate handles access control)
      user = MOCK_ADMIN_USER;
    }
  } catch (error) {
    // On any error, fall back to mock admin user so the app remains functional
    user = MOCK_ADMIN_USER;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
