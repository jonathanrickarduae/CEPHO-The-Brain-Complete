import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Health Check Endpoints
 * Tests the monitoring and health check functionality
 */

test.describe("Health Check Endpoints", () => {
  test("basic health check should return ok", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.environment).toBeDefined();
    expect(data.uptime).toBeGreaterThan(0);
  });

  test("readiness probe should check dependencies", async ({ request }) => {
    const response = await request.get("/health/ready");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe("ready");
    expect(data.checks).toBeDefined();
    expect(data.checks.database).toBeDefined();
  });

  test("liveness probe should return memory metrics", async ({ request }) => {
    const response = await request.get("/health/live");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe("alive");
    expect(data.memory).toBeDefined();
    expect(data.memory.heapUsed).toBeGreaterThan(0);
  });

  test("startup probe should confirm server started", async ({ request }) => {
    const response = await request.get("/health/startup");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe("started");
    expect(data.startupTime).toBeGreaterThanOrEqual(0);
  });
});
