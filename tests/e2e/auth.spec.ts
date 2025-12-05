/**
 * Authentication E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe('Landing Page', () => {
    test('should display login button', async ({ page }) => {
      await page.goto('/');

      // Check for login/sign-up call to action
      const loginButton = page.getByRole('button', { name: /sign|login|get started/i });
      await expect(loginButton).toBeVisible();
    });

    test('should have correct page title', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveTitle(/youtube|creator/i);
    });

    test('should show feature highlights', async ({ page }) => {
      await page.goto('/');

      // Check for key features
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/script|thumbnail|seo/i);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users from dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Should be redirected to login or home page
      await expect(page).toHaveURL(/\/(login|auth|$)/);
    });

    test('should redirect unauthenticated users from projects', async ({ page }) => {
      await page.goto('/projects');

      // Should be redirected to login or home page
      await expect(page).toHaveURL(/\/(login|auth|$)/);
    });

    test('should redirect unauthenticated users from settings', async ({ page }) => {
      await page.goto('/settings');

      // Should be redirected to login or home page
      await expect(page).toHaveURL(/\/(login|auth|$)/);
    });
  });

  test.describe('Error Pages', () => {
    test('should show 404 page for invalid routes', async ({ page }) => {
      await page.goto('/this-page-does-not-exist');

      // Should show 404 page
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/404|not found/i);
    });

    test('should have navigation back to home on 404', async ({ page }) => {
      await page.goto('/invalid-page');

      // Should have a link back to home
      const homeLink = page.getByRole('link', { name: /home|back/i });
      await expect(homeLink).toBeVisible();
    });
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should still be functional
    const mainContent = page.locator('main, [role="main"], body');
    await expect(mainContent).toBeVisible();
  });

  test('should be tablet responsive', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Page should still be functional
    const mainContent = page.locator('main, [role="main"], body');
    await expect(mainContent).toBeVisible();
  });
});
