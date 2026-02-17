import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { logger } from "../utils/logger";

const log = logger.module('GoogleOAuth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "https://cepho.ai/auth/callback";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string; // Google user ID (OAuth v2 uses 'id', not 'sub')
  sub?: string; // OpenID Connect field (optional)
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

async function exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
  const tokenUrl = "https://oauth2.googleapis.com/token";
  
  const params = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
  
  const response = await fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user info: ${error}`);
  }

  return response.json();
}

async function createSessionToken(userId: string, name: string): Promise<string> {
  return sdk.createSessionToken(userId, { name, expiresInMs: ONE_YEAR_MS });
}

export function registerGoogleOAuthRoutes(app: Express) {
  // Login endpoint - redirects to Google
  app.get("/api/auth/google", (req: Request, res: Response) => {
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");

    res.redirect(authUrl.toString());
  });

  // Callback endpoint - handles Google redirect
  app.get("/auth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const error = getQueryParam(req, "error");

    if (error) {
      log.error('OAuth error from Google', error);
      res.redirect("/?error=oauth_failed");
      return;
    }

    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await exchangeCodeForToken(code);
      
      // Get user info from Google
      const userInfo = await getGoogleUserInfo(tokenResponse.access_token);
      
      log.debug('User info received from Google', { userId: userInfo.id, email: userInfo.email });
      
      // Google OAuth v2 uses 'id', OpenID Connect uses 'sub'
      const userId = userInfo.id || userInfo.sub;

      if (!userId || !userInfo.email) {
        log.error('Missing required fields from Google', undefined, { hasId: !!userInfo.id, hasSub: !!userInfo.sub, hasEmail: !!userInfo.email });
        res.status(400).json({ 
          error: "Invalid user info from Google",
          debug: {
            hasId: !!userInfo.id,
            hasSub: !!userInfo.sub,
            hasEmail: !!userInfo.email,
            fields: Object.keys(userInfo)
          }
        });
        return;
      }

      // Upsert user in database
      log.debug('Upserting user in database');
      const db = await import("../db");
      try {
        await db.upsertUser({
          openId: userId,
          name: userInfo.name || null,
          email: userInfo.email,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });
        log.info('User upserted successfully', { userId, email: userInfo.email });
      } catch (upsertError) {
        // Check if user was actually created despite the error
        log.warn('Upsert threw error, checking if user exists', upsertError);
        const existingUser = await db.getUserByOpenId(userId);
        if (!existingUser) {
          // User wasn't created, re-throw the error
          log.error('User does not exist after upsert, failing OAuth');
          throw upsertError;
        }
        log.debug('User exists despite upsert error, continuing');
      }

      // Create session token
      log.debug('Creating session token');
      const sessionToken = await createSessionToken(userId, userInfo.name);
      log.debug('Session token created');

      // Set cookie
      log.debug('Setting session cookie', { hostname: req.hostname, protocol: req.protocol, cookieName: COOKIE_NAME });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      log.debug('Cookie set successfully');

      // Redirect to home
      log.info('OAuth successful, redirecting to home', { userId, email: userInfo.email });
      res.redirect(302, "/");
    } catch (error) {
      log.error('OAuth callback failed', error);
      res.status(500).json({ 
        error: "OAuth callback failed",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.json({ success: true });
  });

  // User info endpoint
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    const token = req.cookies[COOKIE_NAME];
    
    if (!token) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    try {
      const session = await sdk.verifySession(token);
      
      if (!session) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }
      
      const db = await import("../db");
      const user = await db.getUserByOpenId(session.openId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        id: user.id,
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
      });
    } catch (error) {
      log.error('Failed to get user info', error);
      res.status(401).json({ error: "Invalid token" });
    }
  });
}
