/**
 * Google OAuth Routes
 * 
 * Handles OAuth flow for Google Calendar and Gmail integration
 */

import { Router } from "express";
import {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  getGoogleUserInfo,
  saveGoogleIntegration,
} from "../services/googleOAuthService";
import { sdk } from "../_core/sdk";

const router = Router();

/**
 * Initiate Google OAuth flow for Calendar
 */
router.get("/google-calendar", async (req, res) => {
  try {
    // Verify user is authenticated
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.redirect("/login?error=unauthorized");
    }

    const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${origin}/api/oauth/google-calendar/callback`;
    
    // Store user ID in state for callback
    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");
    
    const authUrl = getGoogleAuthUrl(redirectUri, state);
    res.redirect(authUrl);
  } catch (error) {
    console.error("Google OAuth init error:", error);
    res.redirect("/settings/integrations?error=oauth_failed");
  }
});

/**
 * Google OAuth callback for Calendar
 */
router.get("/google-calendar/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error("Google OAuth error:", error);
      return res.redirect("/settings/integrations?error=oauth_denied");
    }

    if (!code || typeof code !== "string") {
      return res.redirect("/settings/integrations?error=no_code");
    }

    // Decode state to get user ID
    let userId: number;
    try {
      const stateData = JSON.parse(Buffer.from(state as string, "base64").toString());
      userId = stateData.userId;
    } catch {
      return res.redirect("/settings/integrations?error=invalid_state");
    }

    const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${origin}/api/oauth/google-calendar/callback`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Get user info to identify the account
    const userInfo = await getGoogleUserInfo(tokens.accessToken);

    // Save integration
    await saveGoogleIntegration(userId, "google_calendar", tokens, userInfo.email);

    // Also save as general Google integration for shared token
    await saveGoogleIntegration(userId, "google", tokens, userInfo.email);

    res.redirect("/settings/integrations?success=google_calendar_connected");
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.redirect("/settings/integrations?error=callback_failed");
  }
});

/**
 * Initiate Google OAuth flow for Gmail
 */
router.get("/gmail", async (req, res) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.redirect("/login?error=unauthorized");
    }

    const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${origin}/api/oauth/gmail/callback`;
    
    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");
    
    const authUrl = getGoogleAuthUrl(redirectUri, state);
    res.redirect(authUrl);
  } catch (error) {
    console.error("Gmail OAuth init error:", error);
    res.redirect("/settings/integrations?error=oauth_failed");
  }
});

/**
 * Google OAuth callback for Gmail
 */
router.get("/gmail/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect("/settings/integrations?error=oauth_denied");
    }

    if (!code || typeof code !== "string") {
      return res.redirect("/settings/integrations?error=no_code");
    }

    let userId: number;
    try {
      const stateData = JSON.parse(Buffer.from(state as string, "base64").toString());
      userId = stateData.userId;
    } catch {
      return res.redirect("/settings/integrations?error=invalid_state");
    }

    const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${origin}/api/oauth/gmail/callback`;

    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const userInfo = await getGoogleUserInfo(tokens.accessToken);

    await saveGoogleIntegration(userId, "gmail", tokens, userInfo.email);
    await saveGoogleIntegration(userId, "google", tokens, userInfo.email);

    res.redirect("/settings/integrations?success=gmail_connected");
  } catch (error) {
    console.error("Gmail OAuth callback error:", error);
    res.redirect("/settings/integrations?error=callback_failed");
  }
});

export { router as googleOAuthRoutes };
