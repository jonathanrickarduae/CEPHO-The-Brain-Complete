import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Request } from "express";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET || "";

const supabaseConfigured = !!(supabaseUrl && supabaseServiceKey);

if (!supabaseConfigured) {
}

if (!supabaseJwtSecret && supabaseConfigured) {
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
      return null;
    }

    if (!user) {
      return null;
    }
    return user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
      } else if (error.name === "JsonWebTokenError") {
      } else {
      }
    } else {
    }
    return null;
  }
}

export { supabase };

