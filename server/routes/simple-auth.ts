/**
 * Simple Email/Password Authentication
 * Credentials are loaded from environment variables — never hardcoded.
 *
 * Required env vars:
 *   ADMIN_EMAIL    - The admin user's email address
 *   ADMIN_PASSWORD - The admin user's password (store a strong value in Render)
 *   ADMIN_NAME     - Display name (optional, defaults to "Admin")
 *   JWT_SECRET     - Secret used to sign JWT tokens
 */

import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * Load admin credentials from environment variables at request time.
 * Logs a critical warning if credentials are not configured.
 */
function getAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error(
      "[Auth] CRITICAL: ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set. " +
      "The server will not accept logins until these are configured."
    );
    return null;
  }

  return { email, password, name, id: 1, openId: "admin_001", appId: "cepho_app" };
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const adminUser = getAdminUser();
    if (!adminUser) {
      return res.status(503).json({ error: "Authentication is not configured. Contact the administrator." });
    }

    if (
      email.toLowerCase() !== adminUser.email.toLowerCase() ||
      password !== adminUser.password
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[Auth] JWT_SECRET is not set — cannot issue tokens.");
      return res.status(503).json({ error: "Authentication misconfigured. Contact the administrator." });
    }

    const token = jwt.sign(
      {
        openId: adminUser.openId,
        appId: adminUser.appId,
        name: adminUser.name,
        email: adminUser.email,
        id: adminUser.id,
      },
      secret,
      { expiresIn: "7d" }
    );

    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
      },
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("session_token");
  res.json({ success: true });
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.session_token;
    
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(503).json({ error: "Authentication misconfigured." });
    }
    const decoded = jwt.verify(token, secret) as any;

    return res.json({
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      openId: decoded.openId,
      appId: decoded.appId,
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
