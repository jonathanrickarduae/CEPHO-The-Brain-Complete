import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "https://cepho.ai/auth/callback";
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub: string; // Google user ID
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

function createSessionToken(userId: string, name: string): string {
  return jwt.sign(
    {
      userId,
      name,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn: "365d" }
  );
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
      console.error("[Google OAuth] Error:", error);
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
      
      console.log('[Google OAuth] User info received:', JSON.stringify(userInfo, null, 2));

      if (!userInfo.sub || !userInfo.email) {
        console.error('[Google OAuth] Missing required fields. sub:', userInfo.sub, 'email:', userInfo.email);
        res.status(400).json({ 
          error: "Invalid user info from Google",
          debug: {
            hasSub: !!userInfo.sub,
            hasEmail: !!userInfo.email,
            fields: Object.keys(userInfo)
          }
        });
        return;
      }

      // Upsert user in database
      const db = await import("../db");
      await db.upsertUser({
        openId: userInfo.sub,
        name: userInfo.name || null,
        email: userInfo.email,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = createSessionToken(userInfo.sub, userInfo.name);

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to home
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
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
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; name: string };
      
      const db = await import("../db");
      const user = await db.getUserByOpenId(decoded.userId);

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
      console.error("[Auth] Failed to get user:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });
}
