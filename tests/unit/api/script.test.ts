/**
 * Script Generation API Route Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Next.js server components
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, options) => ({
        data,
        status: options?.status || 200,
        headers: options?.headers || {},
      })),
    },
  };
});

// Mock Supabase
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockRpc = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

// Mock Claude AI
const mockGenerateScript = vi.fn();
vi.mock('@/lib/ai/claude', () => ({
  generateScript: mockGenerateScript,
}));

describe('Script Generation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase mock chain
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
    });
    mockRpc.mockResolvedValue({ error: null });
  });

  describe('POST /api/ai/script', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const { POST } = await import('@/app/api/ai/script/route');

      const request = new NextRequest('http://localhost/api/ai/script', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test topic' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(response.data.error).toBe('Unauthorized');
    });

    it('should return 400 if topic is missing', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });
      mockSingle.mockResolvedValue({ data: { plan: 'free' } });

      const { POST } = await import('@/app/api/ai/script/route');

      const request = new NextRequest('http://localhost/api/ai/script', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Topic is required');
    });

    it('should return 403 if monthly limit is reached', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });
      mockSingle
        .mockResolvedValueOnce({ data: { plan: 'free' } })
        .mockResolvedValueOnce({ data: { count: 5 } }); // Free plan has 5 scripts/month

      const { POST } = await import('@/app/api/ai/script/route');

      const request = new NextRequest('http://localhost/api/ai/script', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test topic' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(403);
      expect(response.data.error).toContain('limit reached');
    });

    it('should generate script successfully', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });
      mockSingle
        .mockResolvedValueOnce({ data: { plan: 'pro' } })
        .mockResolvedValueOnce({ data: { count: 0 } });

      const mockScriptResult = {
        content: 'Generated script content',
        metadata: {
          word_count: 100,
          estimated_duration: '1:00',
        },
      };
      mockGenerateScript.mockResolvedValue(mockScriptResult);

      const { POST } = await import('@/app/api/ai/script/route');

      const request = new NextRequest('http://localhost/api/ai/script', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Test topic',
          tone: 'casual',
          target_duration: 10,
          language: 'en',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockScriptResult);
    });

    it('should increment usage after successful generation', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });
      mockSingle
        .mockResolvedValueOnce({ data: { plan: 'pro' } })
        .mockResolvedValueOnce({ data: { count: 0 } });
      mockGenerateScript.mockResolvedValue({ content: 'Script' });

      const { POST } = await import('@/app/api/ai/script/route');

      const request = new NextRequest('http://localhost/api/ai/script', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test topic' }),
      });

      await POST(request);

      expect(mockRpc).toHaveBeenCalledWith('increment_usage', {
        p_user_id: 'user-1',
        p_type: 'script',
        p_count: 1,
      });
    });

    it('should handle generation errors', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });
      mockSingle
        .mockResolvedValueOnce({ data: { plan: 'pro' } })
        .mockResolvedValueOnce({ data: { count: 0 } });
      mockGenerateScript.mockRejectedValue(new Error('AI service error'));

      const { POST } = await import('@/app/api/ai/script/route');

      const request = new NextRequest('http://localhost/api/ai/script', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test topic' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Failed to generate script');
    });

    it('should use default values for optional parameters', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });
      mockSingle
        .mockResolvedValueOnce({ data: { plan: 'pro' } })
        .mockResolvedValueOnce({ data: { count: 0 } });
      mockGenerateScript.mockResolvedValue({ content: 'Script' });

      const { POST } = await import('@/app/api/ai/script/route');

      const request = new NextRequest('http://localhost/api/ai/script', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test topic' }),
      });

      await POST(request);

      expect(mockGenerateScript).toHaveBeenCalledWith({
        topic: 'Test topic',
        niche: 'general',
        tone: 'casual',
        target_duration: 10,
        include_hook: true,
        include_cta: true,
        language: 'en',
      });
    });
  });
});
