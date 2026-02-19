/**
 * Simple Email/Password Authentication
 * Temporary replacement for OAuth - NO DATABASE DEPENDENCY
 */

import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// Hardcoded user for immediate access
const ADMIN_USER = {
  email: "jonathanrickarduae@gmail.com",
  password: "Cepho44",
  name: "Jonathan Rickard",
  id: 1,
  openId: "hardcoded_admin_001",
  appId: "cepho_app",
};

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if it's the admin user
    if (email.toLowerCase() === ADMIN_USER.email.toLowerCase() && password === ADMIN_USER.password) {
      // Generate JWT token
      const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
      const token = jwt.sign(
        {
          openId: ADMIN_USER.openId,
          appId: ADMIN_USER.appId,
          name: ADMIN_USER.name,
          email: ADMIN_USER.email,
          id: ADMIN_USER.id,
        },
        secret,
        { expiresIn: "7d" }
      );

      // Set cookie
      res.cookie("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        success: true,
        user: {
          id: ADMIN_USER.id,
          email: ADMIN_USER.email,
          name: ADMIN_USER.name,
        },
      });
    }

    return res.status(401).json({ error: "Invalid credentials" });
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

    const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
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
