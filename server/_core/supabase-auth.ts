import { createClient } from "@supabase/supabase-js";
import { Request } from "express";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
}

if (!supabaseJwtSecret) {
  console.error("Missing SUPABASE_JWT_SECRET - JWT verification will fail");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function verifySupabaseSession(req: Request) {
  // Get the access token from the Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    console.log("[Auth] No token provided");
    return null;
  }

  try {
    // Verify JWT token using the JWT secret
    const decoded = jwt.verify(token, supabaseJwtSecret) as any;

    if (!decoded || !decoded.sub) {
      console.log("[Auth] Invalid token payload");
      return null;
    }

    // Get user details from Supabase using the user ID from the token
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(decoded.sub);

    if (error) {
      console.error("[Auth] Error fetching user:", error.message);
      return null;
    }

    if (!user) {
      console.log("[Auth] No user found for token");
      return null;
    }

    console.log("[Auth] Session verified successfully for user:", user.email);
    return user;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      console.log("[Auth] Token expired");
    } else if (error.name === "JsonWebTokenError") {
      console.error("[Auth] JWT verification failed:", error.message);
    } else {
      console.error("[Auth] Unexpected error verifying session:", error);
    }
    return null;
  }
}

export { supabase };
