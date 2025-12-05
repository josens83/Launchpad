/**
 * Health Check E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Health Check Endpoints', () => {
  test('GET /api/health should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
  });

  test('GET /api/health/live should return alive status', async ({ request }) => {
    const response = await request.get('/api/health/live');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.alive).toBe(true);
    expect(body.pid).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });

  test('GET /api/health/ready should return ready status', async ({ request }) => {
    const response = await request.get('/api/health/ready');

    // May be 200 or 503 depending on service availability
    expect([200, 503]).toContain(response.status());

    const body = await response.json();
    expect(body).toHaveProperty('ready');
    expect(body).toHaveProperty('checks');
  });

  test('health endpoints should respond quickly', async ({ request }) => {
    const startTime = Date.now();
    await request.get('/api/health/live');
    const endTime = Date.now();

    // Liveness check should respond within 1 second
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
