/**
 * Health API Route Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js server components
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      data,
      status: options?.status || 200,
      headers: options?.headers || {},
    })),
  },
}));

// Mock Supabase
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}));

// Mock Redis
vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => ({
      ping: vi.fn().mockResolvedValue('PONG'),
    })),
  },
}));

describe('Health API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase mock chain
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValue({
      limit: vi.fn().mockReturnValue({
        single: mockSupabaseSingle,
      }),
    });
  });

  describe('GET /api/health', () => {
    it('should return healthy status when all services are up', async () => {
      mockSupabaseSingle.mockResolvedValue({ data: {}, error: null });

      const { GET } = await import('@/app/api/health/route');
      const response = await GET();

      expect(response.data.status).toBe('healthy');
      expect(response.data.checks).toBeDefined();
    });

    it('should include timestamp in response', async () => {
      mockSupabaseSingle.mockResolvedValue({ data: {}, error: null });

      const { GET } = await import('@/app/api/health/route');
      const response = await GET();

      expect(response.data.timestamp).toBeDefined();
      expect(new Date(response.data.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/health/live', () => {
    it('should return alive status', async () => {
      const { GET } = await import('@/app/api/health/live/route');
      const response = await GET();

      expect(response.data.alive).toBe(true);
    });

    it('should include process info', async () => {
      const { GET } = await import('@/app/api/health/live/route');
      const response = await GET();

      expect(response.data.pid).toBeDefined();
      expect(response.data.memory).toBeDefined();
    });

    it('should include timestamp', async () => {
      const { GET } = await import('@/app/api/health/live/route');
      const response = await GET();

      expect(response.data.timestamp).toBeDefined();
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return ready when services are available', async () => {
      mockSupabaseSingle.mockResolvedValue({ data: {}, error: null });

      const { GET } = await import('@/app/api/health/ready/route');
      const response = await GET();

      expect(response.data.ready).toBe(true);
    });

    it('should check database connectivity', async () => {
      mockSupabaseSingle.mockResolvedValue({ data: {}, error: null });

      const { GET } = await import('@/app/api/health/ready/route');
      const response = await GET();

      expect(response.data.checks.database).toBeDefined();
    });
  });
});
