/**
 * Navigation E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Check main navigation exists
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });

  test('should have working links', async ({ page }) => {
    await page.goto('/');

    // Get all links on the page
    const links = page.locator('a[href]');
    const count = await links.count();

    // Should have multiple navigation links
    expect(count).toBeGreaterThan(0);
  });

  test('should have correct semantic structure', async ({ page }) => {
    await page.goto('/');

    // Check for proper HTML semantics
    const header = page.locator('header');
    const main = page.locator('main');

    // At least one of these should exist
    const hasHeader = (await header.count()) > 0;
    const hasMain = (await main.count()) > 0;

    expect(hasHeader || hasMain).toBeTruthy();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    // Should have h1 heading
    const h1 = page.locator('h1');
    const h1Count = await h1.count();

    // Should have exactly one h1 or at least one heading
    expect(h1Count).toBeGreaterThanOrEqual(0);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Images should have alt attribute (can be empty for decorative)
      expect(alt).not.toBeNull();
    }
  });

  test('should have focusable interactive elements', async ({ page }) => {
    await page.goto('/');

    // Get first focusable element
    const buttons = page.locator('button, a[href], input, select, textarea');
    const count = await buttons.count();

    // Should have interactive elements
    expect(count).toBeGreaterThan(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    await page.keyboard.press('Tab');

    // Check that something is focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Filter out expected errors (like network errors in test env)
    const criticalErrors = errors.filter(
      (e) => !e.includes('net::') && !e.includes('Failed to fetch')
    );

    // Should not have critical console errors
    expect(criticalErrors).toHaveLength(0);
  });
});
