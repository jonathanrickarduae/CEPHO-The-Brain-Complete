/**
 * Simple Email/Password Authentication
 * Temporary replacement for OAuth
 */

import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../_core/db";
import { users } from "../_core/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Hardcoded user for immediate access (will be replaced with DB lookup)
const ADMIN_USER = {
  email: "jonathanrickarduae@gmail.com",
  password: "Cepho44", // Will be hashed
  name: "Jonathan Rickard",
  id: 1,
};

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if it's the admin user
    if (email.toLowerCase() === ADMIN_USER.email.toLowerCase()) {
      if (password === ADMIN_USER.password) {
        // Find or create user in database
        let user = await db.query.users.findFirst({
          where: eq(users.email, ADMIN_USER.email),
        });

        if (!user) {
          // Create user if doesn't exist
          const [newUser] = await db.insert(users).values({
            email: ADMIN_USER.email,
            name: ADMIN_USER.name,
            openId: `email_${Date.now()}`, // Temporary openId
          }).returning();
          user = newUser;
        }

        // Generate JWT token
        const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
        const token = jwt.sign(
          {
            openId: user.openId,
            appId: user.appId || "",
            name: user.name || ADMIN_USER.name,
            email: user.email,
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
            id: user.id,
            email: user.email,
            name: user.name,
          },
        });
      }
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

    const user = await db.query.users.findFirst({
      where: eq(users.openId, decoded.openId),
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
