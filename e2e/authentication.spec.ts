import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Authentication Flow
 * Tests login, logout, and session management
 */

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    
    // Check for login form elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.getByLabel(/email/i).fill('test@cepho.ai');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/nexus|\/dashboard/);
    await expect(page.getByText(/welcome|dashboard/i)).toBeVisible();
  });

  test('should maintain session after page reload', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@cepho.ai');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/nexus|\/dashboard/);
    
    // Reload page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(/\/nexus|\/dashboard/);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@cepho.ai');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/nexus|\/dashboard/);
    
    // Logout
    await page.getByRole('button', { name: /logout|sign out/i }).click();
    
    // Should redirect to login
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });
});
