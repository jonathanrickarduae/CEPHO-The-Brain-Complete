import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Application Navigation
 * Tests routing and page navigation
 */

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/");
    await page.getByLabel(/email/i).fill("test@cepho.ai");
    await page.getByLabel(/password/i).fill("test123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/nexus|\/dashboard/);
  });

  test("should navigate to Nexus Dashboard", async ({ page }) => {
    await page.goto("/nexus");
    await expect(page).toHaveURL("/nexus");
    await expect(
      page.getByRole("heading", { name: /nexus|command center/i })
    ).toBeVisible();
  });

  test("should navigate to Chief of Staff Dashboard", async ({ page }) => {
    await page.goto("/operations");
    await expect(page).toHaveURL("/operations");
    await expect(
      page.getByRole("heading", { name: /chief of staff|operations/i })
    ).toBeVisible();
  });

  test("should navigate to Innovation Hub", async ({ page }) => {
    await page.goto("/innovation");
    await expect(page).toHaveURL("/innovation");
    await expect(
      page.getByRole("heading", { name: /innovation hub/i })
    ).toBeVisible();
  });

  test("should navigate to Project Genesis", async ({ page }) => {
    await page.goto("/project-genesis");
    await expect(page).toHaveURL("/project-genesis");
    await expect(
      page.getByRole("heading", { name: /project genesis/i })
    ).toBeVisible();
  });

  test("should navigate to Document Library", async ({ page }) => {
    await page.goto("/documents");
    await expect(page).toHaveURL("/documents");
    await expect(
      page.getByRole("heading", { name: /document library/i })
    ).toBeVisible();
  });

  test("should navigate to AI Agents", async ({ page }) => {
    await page.goto("/ai-agents");
    await expect(page).toHaveURL("/ai-agents");
    await expect(
      page.getByRole("heading", { name: /ai agents/i })
    ).toBeVisible();
  });

  test("should navigate to Integrations", async ({ page }) => {
    await page.goto("/integrations");
    await expect(page).toHaveURL("/integrations");
    await expect(
      page.getByRole("heading", { name: /integrations/i })
    ).toBeVisible();
  });

  test("should navigate to Settings", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL("/settings");
    await expect(
      page.getByRole("heading", { name: /settings/i })
    ).toBeVisible();
  });

  test("should handle 404 for invalid routes", async ({ page }) => {
    await page.goto("/invalid-route-that-does-not-exist");
    // Should either show 404 page or redirect to dashboard
    const url = page.url();
    expect(
      url.includes("/404") ||
        url.includes("/nexus") ||
        url.includes("/dashboard")
    ).toBeTruthy();
  });
});
