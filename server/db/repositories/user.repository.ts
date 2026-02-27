/**
 * User Repository
 *
 * Provides database operations for the users table.
 */
import { eq } from "drizzle-orm";
import { db } from "../connection";
import { users, type User, type InsertUser } from "../../../drizzle/schema";

/**
 * Find a user by their OpenID identifier.
 */
export async function getUserByOpenId(openId: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Insert or update a user record.
 * Uses openId as the conflict target.
 */
export async function upsertUser(data: InsertUser): Promise<User> {
  const result = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.openId,
      set: {
        name: data.name,
        email: data.email,
        loginMethod: data.loginMethod,
        role: data.role,
        themePreference: data.themePreference,
        lastSignedIn: data.lastSignedIn,
      },
    })
    .returning();
  return result[0];
}
