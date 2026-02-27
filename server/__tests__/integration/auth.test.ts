/**
 * Integration Tests: Auth Endpoints
 *
 * Set TEST_BASE_URL env var to run against a live server.
 * Example: TEST_BASE_URL=https://cepho.ai pnpm test
 */
import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL ?? "";
const describeIf = BASE_URL ? describe : describe.skip;

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { status: res.status, body, headers: res.headers };
}

describeIf("Auth Endpoints (integration)", () => {
  it("GET /api/auth/me returns 401 when not authenticated", async () => {
    const { status } = await request("/api/auth/me");
    expect(status).toBe(401);
  });

  it("POST /api/auth/login returns 401 for wrong credentials", async () => {
    const { status } = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "wrong@test.com",
        password: "wrongpassword",
      }),
    });
    expect([400, 401, 403]).toContain(status);
  });

  it("GET /health returns 200 with status ok", async () => {
    const { status, body } = await request("/health");
    expect(status).toBe(200);
    expect(body).toMatchObject({ status: "ok" });
  });

  it("GET /api/trpc/system.health returns ok: true", async () => {
    const { status, body } = await request("/api/trpc/system.health");
    expect(status).toBe(200);
    const result = body as { result?: { data?: { ok?: boolean } } };
    expect(result?.result?.data?.ok).toBe(true);
  });
});

// Always-passing placeholder so the file is not empty when skipped
describe("Integration test configuration", () => {
  it("is set up correctly (set TEST_BASE_URL env var to run live tests)", () => {
    expect(typeof BASE_URL).toBe("string");
  });
});
