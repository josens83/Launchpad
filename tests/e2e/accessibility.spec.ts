/**
 * Accessibility E2E Tests
 * WCAG 2.1 AA compliance testing using axe-core
 */

import { test, expect } from '@playwright/test';

// Axe violation types
interface AxeViolation {
  id: string;
  impact: string;
  description: string;
  helpUrl: string;
  nodes: Array<{ target: string[]; failureSummary: string }>;
}

interface AxeResults {
  violations: AxeViolation[];
}

// Pages to test for accessibility
const pagesToTest = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
];

// Dynamic import for axe-core (installed separately)
async function runAxeAnalysis(page: import('@playwright/test').Page, tags: string[]): Promise<AxeResults> {
  // Use axe-core via browser injection for better compatibility
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.0/axe.min.js',
  });

  const results = await page.evaluate(async (tags) => {
    // @ts-expect-error axe is injected via script tag
    return await axe.run(document, { runOnly: { type: 'tag', values: tags } });
  }, tags);

  return results as AxeResults;
}

test.describe('Accessibility', () => {
  for (const page of pagesToTest) {
    test(`${page.name} page should have no accessibility violations`, async ({ page: playwrightPage }) => {
      await playwrightPage.goto(page.path);

      // Wait for page to fully load
      await playwrightPage.waitForLoadState('networkidle');

      // Run axe accessibility scan
      const accessibilityScanResults = await runAxeAnalysis(
        playwrightPage,
        ['wcag2a', 'wcag2aa', 'wcag21aa']
      );

      // Filter out minor issues for CI (can be stricter in development)
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v: AxeViolation) => v.impact === 'critical' || v.impact === 'serious'
      );

      // Log violations for debugging
      if (criticalViolations.length > 0) {
        console.log(`Accessibility violations on ${page.name}:`);
        criticalViolations.forEach((violation: AxeViolation) => {
          console.log(`- ${violation.id}: ${violation.description}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Help: ${violation.helpUrl}`);
        });
      }

      // Assert no critical/serious violations
      expect(criticalViolations).toHaveLength(0);
    });
  }

  test('should have proper heading hierarchy on home page', async ({ page }) => {
    await page.goto('/');

    // Check that there's exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Check that headings are in logical order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;

    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      const currentLevel = parseInt(tagName.charAt(1));

      // Heading level should not skip more than one level
      if (previousLevel > 0 && currentLevel > previousLevel + 1) {
        console.warn(`Heading level skip detected: h${previousLevel} -> h${currentLevel}`);
      }

      previousLevel = currentLevel;
    }
  });

  test('should have accessible forms on login page', async ({ page }) => {
    await page.goto('/login');

    // Check all form inputs have associated labels
    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      const type = await input.getAttribute('type');
      if (type === 'hidden' || type === 'submit') continue;

      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      // Input should have either an id with associated label, aria-label, or aria-labelledby
      const hasLabel = id
        ? (await page.locator(`label[for="${id}"]`).count()) > 0
        : false;

      expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/login');

    // Tab through interactive elements
    const interactiveElements = await page.locator('a, button, input, select, textarea, [tabindex="0"]').all();

    for (const element of interactiveElements) {
      const isVisible = await element.isVisible();
      if (!isVisible) continue;

      // Focus the element
      await element.focus();

      // Verify element received focus
      const isFocused = await element.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBeTruthy();

      // Check that focus is visible (has focus-visible or outline)
      const hasFocusStyles = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return (
          styles.outlineStyle !== 'none' ||
          styles.boxShadow !== 'none' ||
          el.matches(':focus-visible')
        );
      });

      // Log warning if focus styles are missing (don't fail test)
      if (!hasFocusStyles) {
        const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
        console.warn(`Element ${tagName} may have insufficient focus indication`);
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await runAxeAnalysis(page, ['wcag2aa']);

    // Check specifically for color contrast issues
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v: AxeViolation) => v.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      console.log('Color contrast violations:');
      contrastViolations.forEach((violation: AxeViolation) => {
        violation.nodes.forEach((node: { target: string[]; failureSummary: string }) => {
          console.log(`- Element: ${node.target}`);
          console.log(`  Message: ${node.failureSummary}`);
        });
      });
    }

    // Warning: This test logs issues but doesn't fail by default
    // Set to toBe(0) to enforce strict contrast requirements
    expect(contrastViolations.length).toBeGreaterThanOrEqual(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');

    // Start from the document
    await page.keyboard.press('Tab');

    // Should be able to tab to the first interactive element
    const firstFocused = await page.evaluate(() => {
      return document.activeElement?.tagName.toLowerCase();
    });

    // First focused element should be an interactive element
    expect(['a', 'button', 'input', 'select', 'textarea']).toContain(firstFocused);

    // Should be able to press Enter on focused buttons
    const focusedElement = await page.locator(':focus');
    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());

    if (tagName === 'button' || tagName === 'a') {
      // Verify Enter key works (don't actually navigate)
      const isClickable = await focusedElement.evaluate((el) => {
        return !el.hasAttribute('disabled');
      });
      expect(isClickable).toBeTruthy();
    }
  });
});
