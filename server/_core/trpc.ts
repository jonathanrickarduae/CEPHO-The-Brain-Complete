import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

// ── Per-user in-memory rate limiter for tRPC procedures ──────────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of Array.from(rateLimitStore.entries())) {
      if (entry.resetAt < now) rateLimitStore.delete(key);
    }
  },
  5 * 60 * 1000
);

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }
  return { allowed: true, retryAfterMs: 0 };
}

// ── tRPC instance ─────────────────────────────────────────────────────────────
const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// ── Auth middleware ───────────────────────────────────────────────────────────
const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);

// ── Rate-limited procedures ───────────────────────────────────────────────────

/**
 * AI procedure: 30 requests per minute per user.
 * Use for any procedure that calls an LLM or performs heavy AI computation.
 */
const aiRateLimitMiddleware = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  const key = `ai:${ctx.user.id}`;
  const { allowed, retryAfterMs } = checkRateLimit(key, 30, 60 * 1000);

  if (!allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `AI rate limit exceeded. Retry in ${Math.ceil(retryAfterMs / 1000)}s.`,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const aiProcedure = t.procedure.use(aiRateLimitMiddleware);

/**
 * Mutation procedure: 60 mutations per minute per user.
 * Use for write operations that should be throttled to prevent abuse.
 */
const mutationRateLimitMiddleware = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  const key = `mutation:${ctx.user.id}`;
  const { allowed, retryAfterMs } = checkRateLimit(key, 60, 60 * 1000);

  if (!allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Request rate limit exceeded. Retry in ${Math.ceil(retryAfterMs / 1000)}s.`,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const rateLimitedProcedure = t.procedure.use(
  mutationRateLimitMiddleware
);
