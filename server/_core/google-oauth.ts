import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

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
      
      // Google OAuth v2 uses 'id', OpenID Connect uses 'sub'
      const userId = userInfo.id || userInfo.sub;

      if (!userId || !userInfo.email) {
        console.error('[Google OAuth] Missing required fields. id:', userInfo.id, 'sub:', userInfo.sub, 'email:', userInfo.email);
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
      console.log('[Google OAuth] Step 1: Importing database module...');
      const db = await import("../db");
      console.log('[Google OAuth] Step 2: Upserting user...');
      try {
        await db.upsertUser({
          openId: userId,
          name: userInfo.name || null,
          email: userInfo.email,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });
        console.log('[Google OAuth] Step 3: User upserted successfully');
      } catch (upsertError) {
        // Check if user was actually created despite the error
        console.log('[Google OAuth] Step 3: Upsert threw error, checking if user exists...');
        console.error('[Google OAuth] Upsert error details:', upsertError);
        const existingUser = await db.getUserByOpenId(userId);
        if (!existingUser) {
          // User wasn't created, re-throw the error
          console.error('[Google OAuth] User does not exist, failing OAuth');
          throw upsertError;
        }
        console.log('[Google OAuth] User exists despite error, continuing...');
      }

      // Create session token
      console.log('[Google OAuth] Step 4: Creating session token...');
      const sessionToken = await createSessionToken(userId, userInfo.name);
      console.log('[Google OAuth] Step 5: Session token created');

      // Set cookie
      console.log('[Google OAuth] Step 6: Setting cookie...');
      console.log('[Google OAuth] Request hostname:', req.hostname);
      console.log('[Google OAuth] Request protocol:', req.protocol);
      console.log('[Google OAuth] Request headers:', JSON.stringify(req.headers, null, 2));
      const cookieOptions = getSessionCookieOptions(req);
      console.log('[Google OAuth] Cookie options:', JSON.stringify(cookieOptions, null, 2));
      console.log('[Google OAuth] Cookie name:', COOKIE_NAME);
      console.log('[Google OAuth] Session token (first 20 chars):', sessionToken.substring(0, 20));
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      console.log('[Google OAuth] Step 7: Cookie set with maxAge:', ONE_YEAR_MS);

      // Redirect to home
      console.log('[Google OAuth] Step 8: Redirecting to /');
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Google OAuth] Callback failed:", error);
      console.error("[Google OAuth] Error stack:", error instanceof Error ? error.stack : 'N/A');
      console.error("[Google OAuth] Error message:", error instanceof Error ? error.message : String(error));
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
      console.error("[Auth] Failed to get user:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });
}
