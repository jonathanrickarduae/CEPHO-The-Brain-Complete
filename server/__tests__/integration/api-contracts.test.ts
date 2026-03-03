/**
 * API Contract Tests (Remediation Task 2.9)
 *
 * Validates that the API responses conform to their documented contracts.
 * These are lightweight contract tests (not full Pact consumer-driven tests)
 * that verify shape, types, and required fields without needing a live server
 * in the standard test run.
 *
 * When TEST_BASE_URL is set, they run against the live server.
 * Otherwise they are skipped to keep the unit test suite fast.
 */

import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL;

// ── Contract schemas ──────────────────────────────────────────────────────────

interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
  environment: string;
  version: string;
}

interface TrpcHealthResponse {
  result: {
    data: {
      ok: boolean;
      timestamp: string;
      version: string;
    };
  };
}

interface CsrfResponse {
  csrfToken: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function get(path: string) {
  const res = await fetch(`${BASE_URL}${path}`);
  return { status: res.status, body: await res.json().catch(() => null) };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe.skipIf(!BASE_URL)("API Contract Tests — REST Endpoints", () => {
  it("GET /health — returns correct contract", async () => {
    const { status, body } = await get("/health");

    expect(status).toBe(200);

    // Required fields
    const health = body as HealthResponse;
    expect(typeof health.status).toBe("string");
    expect(health.status).toBe("ok");
    expect(typeof health.uptime).toBe("number");
    expect(health.uptime).toBeGreaterThan(0);
    expect(typeof health.timestamp).toBe("string");
    // timestamp must be a valid ISO date
    expect(new Date(health.timestamp).toISOString()).toBe(health.timestamp);
    expect(typeof health.environment).toBe("string");
    expect(typeof health.version).toBe("string");
  });

  it("GET /api/csrf-token — returns CSRF token", async () => {
    const { status, body } = await get("/api/csrf-token");

    expect(status).toBe(200);
    const csrf = body as CsrfResponse;
    expect(typeof csrf.csrfToken).toBe("string");
    expect(csrf.csrfToken.length).toBeGreaterThan(10);
  });

  it("GET /api/auth/me — returns 401 when unauthenticated", async () => {
    const { status } = await get("/api/auth/me");
    expect(status).toBe(401);
  });

  it("GET /api/docs — Swagger UI is accessible", async () => {
    const res = await fetch(`${BASE_URL}/api/docs`);
    // Should be 200 or 301 redirect to /api/docs/
    expect([200, 301, 302]).toContain(res.status);
  });
});

describe.skipIf(!BASE_URL)("API Contract Tests — tRPC Endpoints", () => {
  it("system.health — returns ok:true with correct shape", async () => {
    const { status, body } = await get("/api/trpc/system.health?input=%7B%7D");

    expect(status).toBe(200);
    const trpc = body as TrpcHealthResponse;
    expect(trpc.result?.data?.ok).toBe(true);
    expect(typeof trpc.result?.data?.timestamp).toBe("string");
    expect(typeof trpc.result?.data?.version).toBe("string");
  });

  it("tRPC batch endpoint is accessible", async () => {
    const res = await fetch(`${BASE_URL}/api/trpc/system.health`, {
      method: "GET",
    });
    expect([200, 401]).toContain(res.status);
  });
});

describe.skipIf(!BASE_URL)("API Contract Tests — Security Headers", () => {
  let headers: Headers;

  beforeAll(async () => {
    const res = await fetch(`${BASE_URL}/health`);
    headers = res.headers;
  });

  it("X-Content-Type-Options header is set", () => {
    expect(headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("X-Frame-Options header is set", () => {
    const xfo = headers.get("x-frame-options");
    expect(xfo).toBeTruthy();
    expect(["DENY", "SAMEORIGIN"]).toContain(xfo);
  });

  it("X-Request-Id header is present", () => {
    const reqId = headers.get("x-request-id");
    expect(reqId).toBeTruthy();
    expect(typeof reqId).toBe("string");
  });

  it("Content-Security-Policy header is set", () => {
    const csp = headers.get("content-security-policy");
    expect(csp).toBeTruthy();
  });
});
