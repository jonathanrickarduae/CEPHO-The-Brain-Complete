import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Request } from "express";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET || "";

const supabaseConfigured = !!(supabaseUrl && supabaseServiceKey);

if (!supabaseConfigured) {
  console.warn(
    "[Auth] Supabase not configured — running in simple-auth mode only"
  );
}

if (!supabaseJwtSecret && supabaseConfigured) {
  console.warn("[Auth] Missing SUPABASE_JWT_SECRET - JWT verification will fail");
}

// Only create the Supabase client if credentials are available
let supabase: SupabaseClient | null = null;
if (supabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function verifySupabaseSession(req: Request) {
  // If Supabase is not configured, skip
  if (!supabase || !supabaseConfigured) {
    return null;
  }

  // Get the access token from the Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    // Verify JWT token using the JWT secret
    const decoded = jwt.verify(token, supabaseJwtSecret) as any;

    if (!decoded || !decoded.sub) {
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
      return null;
    }

    console.log("[Auth] Session verified for user:", user.email);
    return user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        console.log("[Auth] Token expired");
      } else if (error.name === "JsonWebTokenError") {
        console.error("[Auth] JWT verification failed:", error.message);
      } else {
        console.error("[Auth] Unexpected error verifying session:", error);
      }
    } else {
      console.error("[Auth] An unknown error occurred:", error);
    }
    return null;
  }
}

export { supabase };

