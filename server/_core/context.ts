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

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Verify Supabase session
    const supabaseUser = await verifySupabaseSession(opts.req);
    
    if (supabaseUser) {
      // Find or create user in our database
      const existingUsers = await db.select().from(users).where(eq(users.email, supabaseUser.email!));
      
      if (existingUsers.length > 0) {
        user = existingUsers[0];
      } else {
        // Create new user from Supabase auth
        const [newUser] = await db.insert(users).values({
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
          password: '', // Not used with Supabase Auth
        }).returning();
        user = newUser;
      }
    }
  } catch (error) {
    console.error('Error in createContext:', error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
