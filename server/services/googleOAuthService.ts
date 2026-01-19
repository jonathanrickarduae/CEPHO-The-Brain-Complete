/**
 * Google OAuth Service
 * 
 * Handles OAuth 2.0 flow for Google Calendar and Gmail integration
 */

import { ENV } from "../_core/env";
import { getDb } from "../db";
import { integrations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

// Scopes for calendar and email access
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

/**
 * Generate the Google OAuth authorization URL
 */
export function getGoogleAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: ENV.googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    ...(state && { state }),
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Get user info from Google
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  email: string;
  name: string;
  picture?: string;
}> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get user info");
  }

  const data = await response.json();
  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

/**
 * Save or update Google integration for a user
 */
export async function saveGoogleIntegration(
  userId: number,
  provider: "google" | "google_calendar" | "gmail",
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  },
  accountEmail: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

  // Check if integration already exists
  const existing = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.provider, provider)))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(integrations)
      .set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: expiresAt,
        providerAccountId: accountEmail,
        status: "active",
        lastSyncAt: new Date(),
        syncError: null,
      })
      .where(eq(integrations.id, existing[0].id));
  } else {
    // Create new
    await db.insert(integrations).values({
      userId,
      provider,
      providerAccountId: accountEmail,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: expiresAt,
      scopes: SCOPES.split(" "),
      status: "active",
      lastSyncAt: new Date(),
    });
  }
}

/**
 * Get valid access token for a user (refreshes if expired)
 */
export async function getValidAccessToken(
  userId: number,
  provider: "google" | "google_calendar" | "gmail"
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [integration] = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.provider, provider)))
    .limit(1);

  if (!integration || !integration.accessToken) {
    return null;
  }

  // Check if token is expired (with 5 minute buffer)
  const isExpired = integration.tokenExpiresAt && 
    new Date(integration.tokenExpiresAt).getTime() < Date.now() + 5 * 60 * 1000;

  if (isExpired && integration.refreshToken) {
    try {
      const newTokens = await refreshAccessToken(integration.refreshToken);
      const expiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);

      await db
        .update(integrations)
        .set({
          accessToken: newTokens.accessToken,
          tokenExpiresAt: expiresAt,
        })
        .where(eq(integrations.id, integration.id));

      return newTokens.accessToken;
    } catch (error) {
      console.error("Failed to refresh Google token:", error);
      await db
        .update(integrations)
        .set({ status: "expired", syncError: "Token refresh failed" })
        .where(eq(integrations.id, integration.id));
      return null;
    }
  }

  return integration.accessToken;
}

/**
 * Disconnect Google integration
 */
export async function disconnectGoogleIntegration(
  userId: number,
  provider: "google" | "google_calendar" | "gmail"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(integrations)
    .set({
      status: "revoked",
      accessToken: null,
      refreshToken: null,
    })
    .where(and(eq(integrations.userId, userId), eq(integrations.provider, provider)));
}
