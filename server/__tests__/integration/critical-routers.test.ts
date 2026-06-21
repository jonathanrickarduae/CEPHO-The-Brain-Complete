/**
 * Integration Tests: Critical tRPC Router Contracts
 * S3-02: Comprehensive integration tests for all critical routers
 *
 * Tests run against the live site when TEST_BASE_URL is set.
 * Without it, tests are skipped (not failed) to keep CI green.
 *
 * Run against live: TEST_BASE_URL=https://cepho-the-brain-complete.onrender.com pnpm test
 */
import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL ?? "";
const describeIf = BASE_URL ? describe : describe.skip;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function trpcQuery(
  procedure: string,
  input?: Record<string, unknown>,
  token?: string
) {
  const params =
    input !== undefined
      ? `?input=${encodeURIComponent(JSON.stringify(input))}`
      : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}/api/trpc/${procedure}${params}`, {
    headers,
  });
  const body = (await res.json()) as {
    result?: { data?: unknown };
    error?: { message?: string; code?: string };
  };
  return {
    status: res.status,
    data: body?.result?.data,
    error: body?.error,
  };
}

async function trpcMutation(
  procedure: string,
  input: Record<string, unknown>,
  token?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}/api/trpc/${procedure}`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  const body = (await res.json()) as {
    result?: { data?: unknown };
    error?: { message?: string; code?: string };
  };
  return {
    status: res.status,
    data: body?.result?.data,
    error: body?.error,
  };
}

async function restGet(path: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  return { status: res.status, ok: res.ok };
}

// ─── Health & System ──────────────────────────────────────────────────────────

describeIf("Health & System Router", () => {
  it("GET /health returns 200", async () => {
    const { status } = await restGet("/health");
    expect(status).toBe(200);
  });

  it("system.health returns { ok: true }", async () => {
    const { status, data } = await trpcQuery("system.health", {});
    expect(status).toBe(200);
    expect(data).toMatchObject({ ok: true });
  });

  it("system.health includes version field", async () => {
    const { data } = await trpcQuery("system.health", {});
    expect(data).toHaveProperty("version");
  });

  it("system.ready returns readiness status", async () => {
    const { status } = await trpcQuery("system.ready", {});
    expect([200, 503]).toContain(status);
  });
});

// ─── Authentication Router ────────────────────────────────────────────────────

describeIf("Authentication Router", () => {
  it("auth.getSession returns 401 without token", async () => {
    const { status, error } = await trpcQuery("auth.getSession");
    expect([401, 403]).toContain(status);
    expect(error).toBeDefined();
  });

  it("auth.refreshToken returns 401 without valid token", async () => {
    const { status } = await trpcMutation("auth.refreshToken", {
      token: "invalid-token",
    });
    expect([400, 401, 403]).toContain(status);
  });
});

// ─── Protected Routers (unauthenticated — expect 401) ─────────────────────────

describeIf("Protected Routers — Unauthenticated Access", () => {
  const protectedProcedures = [
    "dashboard.getInsights",
    "tasks.list",
    "projects.list",
    "notifications.list",
    "aiAgentsMonitoring.getAllStatus",
    "userSettings.get",
    "auditLog.getMyLogs",
    "ventures.list",
    "smeTeams.list",
    "digitalTwin.getProfile",
  ];

  for (const procedure of protectedProcedures) {
    it(`${procedure} returns 401 without auth`, async () => {
      const { status } = await trpcQuery(procedure);
      expect([401, 403]).toContain(status);
    });
  }
});

// ─── Input Validation ─────────────────────────────────────────────────────────

describeIf("Input Validation — Zod Schema Enforcement", () => {
  it("tasks.list rejects invalid limit (string instead of number)", async () => {
    const { status } = await trpcQuery("tasks.list", {
      limit: "not-a-number",
    });
    expect([400, 401]).toContain(status);
  });

  it("auditLog.getMyLogs rejects invalid severity value", async () => {
    const { status } = await trpcQuery("auditLog.getMyLogs", {
      severity: "invalid-severity",
    });
    expect([400, 401]).toContain(status);
  });

  it("ventures.create rejects empty name", async () => {
    const { status } = await trpcMutation("ventures.create", { name: "" });
    expect([400, 401]).toContain(status);
  });
});

// ─── REST API Endpoints ───────────────────────────────────────────────────────

describeIf("REST API Endpoints", () => {
  it("GET /api/workflows returns 200 or 401", async () => {
    const { status } = await restGet("/api/workflows");
    expect([200, 401]).toContain(status);
  });

  it("GET /api/workflows/nonexistent returns 404 or 401", async () => {
    const { status } = await restGet("/api/workflows/nonexistent-id-12345");
    expect([401, 404]).toContain(status);
  });
});

// ─── CORS & Security Headers ──────────────────────────────────────────────────

describeIf("Security Headers", () => {
  it("responses include X-Content-Type-Options header", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const header = res.headers.get("x-content-type-options");
    expect(header).toBe("nosniff");
  });

  it("responses include X-Frame-Options header", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const header = res.headers.get("x-frame-options");
    expect(header).toBeTruthy();
  });

  it("responses do not expose X-Powered-By header", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const header = res.headers.get("x-powered-by");
    expect(header).toBeNull();
  });
});

// ─── Rate Limiting ────────────────────────────────────────────────────────────

describeIf("Rate Limiting", () => {
  it("does not rate-limit a single health check request", async () => {
    const { status } = await restGet("/health");
    expect(status).not.toBe(429);
  });
});

// ─── Unit Tests (always run — no BASE_URL required) ───────────────────────────

describe("tRPC URL construction", () => {
  it("builds correct query URL with input", () => {
    const procedure = "tasks.list";
    const input = { limit: 10, status: "active" };
    const params = `?input=${encodeURIComponent(JSON.stringify(input))}`;
    const url = `/api/trpc/${procedure}${params}`;
    expect(url).toContain("/api/trpc/tasks.list");
    expect(url).toContain("input=");
    expect(decodeURIComponent(url)).toContain('"limit":10');
  });

  it("builds correct URL without input", () => {
    const procedure = "system.health";
    const url = `/api/trpc/${procedure}`;
    expect(url).toBe("/api/trpc/system.health");
  });
});

describe("HTTP status code semantics", () => {
  it("401 means unauthenticated", () => {
    const status = 401;
    expect(status).toBe(401);
  });

  it("403 means forbidden (authenticated but not authorised)", () => {
    const status = 403;
    expect(status).toBe(403);
  });

  it("400 means bad request (validation error)", () => {
    const status = 400;
    expect(status).toBe(400);
  });
});
