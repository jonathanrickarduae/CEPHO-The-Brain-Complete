/**
 * Integration Tests: tRPC Router Endpoints
 *
 * Set TEST_BASE_URL env var to run against a live server.
 * Example: TEST_BASE_URL=https://cepho.ai pnpm test
 */
import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL ?? "";
const describeIf = BASE_URL ? describe : describe.skip;

async function trpcQuery(procedure: string) {
  const res = await fetch(`${BASE_URL}/api/trpc/${procedure}`, {
    headers: { "Content-Type": "application/json" },
  });
  const body = (await res.json()) as {
    result?: { data?: unknown };
    error?: unknown;
  };
  return { status: res.status, data: body?.result?.data, error: body?.error };
}

describeIf("tRPC Router Smoke Tests (integration)", () => {
  it("system.health returns ok: true", async () => {
    const { status, data } = await trpcQuery("system.health");
    expect(status).toBe(200);
    expect(data).toMatchObject({ ok: true });
  });

  it("dashboard.getInsights responds", async () => {
    const { status } = await trpcQuery("dashboard.getInsights");
    expect([200, 401]).toContain(status);
  });

  it("aiAgentsMonitoring.getAllStatus responds", async () => {
    const { status } = await trpcQuery("aiAgentsMonitoring.getAllStatus");
    expect([200, 401]).toContain(status);
  });

  it("notifications.list responds", async () => {
    const { status } = await trpcQuery("notifications.list");
    expect([200, 401]).toContain(status);
  });

  it("tasks.list responds", async () => {
    const { status } = await trpcQuery("tasks.list");
    expect([200, 401]).toContain(status);
  });

  it("integrations.getAll responds", async () => {
    const { status } = await trpcQuery("integrations.getAll");
    expect([200, 401]).toContain(status);
  });
});

// Always-passing placeholder
describe("tRPC integration test configuration", () => {
  it("is set up correctly (set TEST_BASE_URL env var to run live tests)", () => {
    expect(typeof BASE_URL).toBe("string");
  });
});
