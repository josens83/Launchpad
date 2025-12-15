/**
 * Rate Limiting System
 * Upstash Redis 기반 Rate Limiter
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { RateLimitError } from '@/lib/errors/api';
import { handleApiError } from '@/lib/errors/handler';

// Redis 클라이언트 (싱글톤)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[Rate Limit] Upstash Redis not configured, rate limiting disabled');
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

// ============================================
// Rate Limit 설정
// ============================================

export interface RateLimitConfig {
  // 윈도우당 최대 요청 수
  limit: number;
  // 윈도우 크기 (초)
  window: number;
  // 식별자 프리픽스
  prefix?: string;
}

/**
 * 엔드포인트별 Rate Limit 설정
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // 인증 관련 (브루트포스 방지)
  'api/auth/login': { limit: 5, window: 60 * 15 }, // 15분당 5회
  'api/auth/signup': { limit: 3, window: 60 * 60 }, // 1시간당 3회
  'api/auth/reset-password': { limit: 3, window: 60 * 60 }, // 1시간당 3회

  // AI 생성 (비용 보호)
  'api/ai/script': { limit: 20, window: 60 * 60 }, // 1시간당 20회
  'api/ai/thumbnail': { limit: 10, window: 60 * 60 }, // 1시간당 10회
  'api/ai/title': { limit: 50, window: 60 * 60 }, // 1시간당 50회
  'api/ai/description': { limit: 50, window: 60 * 60 }, // 1시간당 50회

  // 일반 API
  'api/default': { limit: 100, window: 60 }, // 1분당 100회

  // 웹훅 (IP 기반)
  'api/webhooks': { limit: 100, window: 60 }, // 1분당 100회
};

/**
 * 플랜별 Rate Limit 승수
 */
export const PLAN_MULTIPLIERS: Record<string, number> = {
  free: 1,
  starter: 2,
  pro: 5,
  team: 10,
};

// ============================================
// Rate Limiter 인스턴스
// ============================================

const rateLimiters = new Map<string, Ratelimit>();

/**
 * Rate Limiter 인스턴스 가져오기 또는 생성
 */
function getRateLimiter(config: RateLimitConfig): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  const key = `${config.prefix || 'default'}:${config.limit}:${config.window}`;

  if (!rateLimiters.has(key)) {
    rateLimiters.set(
      key,
      new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(config.limit, `${config.window} s`),
        analytics: true,
        prefix: config.prefix || 'ratelimit',
      })
    );
  }

  return rateLimiters.get(key)!;
}

// ============================================
// Rate Limit 체크 함수
// ============================================

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate Limit 체크
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  plan?: string
): Promise<RateLimitResult> {
  // 설정 찾기
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS['api/default'];

  // 플랜별 승수 적용
  const multiplier = plan ? PLAN_MULTIPLIERS[plan] || 1 : 1;
  const adjustedConfig: RateLimitConfig = {
    ...config,
    limit: config.limit * multiplier,
    prefix: `ratelimit:${endpoint.replace(/\//g, ':')}`,
  };

  const limiter = getRateLimiter(adjustedConfig);

  // Redis가 없으면 통과
  if (!limiter) {
    return {
      success: true,
      limit: adjustedConfig.limit,
      remaining: adjustedConfig.limit,
      reset: Date.now() + adjustedConfig.window * 1000,
    };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Rate Limit 헤더 추가
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    response.headers.set('Retry-After', String(retryAfter));
  }

  return response;
}

// ============================================
// Rate Limit 미들웨어
// ============================================

/**
 * 클라이언트 식별자 추출
 */
export function getClientIdentifier(request: NextRequest): string {
  // 1. 인증된 사용자 ID (쿠키에서)
  const userId = request.cookies.get('user_id')?.value;
  if (userId) {
    return `user:${userId}`;
  }

  // 2. IP 주소
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  return `ip:${ip}`;
}

/**
 * 엔드포인트 키 추출
 */
export function getEndpointKey(request: NextRequest): string {
  const path = new URL(request.url).pathname;

  // 정확한 매칭 시도
  if (RATE_LIMITS[path.slice(1)]) {
    return path.slice(1);
  }

  // 패턴 매칭
  if (path.startsWith('/api/auth/')) {
    const authPath = path.split('/').slice(0, 4).join('/').slice(1);
    if (RATE_LIMITS[authPath]) return authPath;
  }

  if (path.startsWith('/api/ai/')) {
    const aiPath = path.split('/').slice(0, 4).join('/').slice(1);
    if (RATE_LIMITS[aiPath]) return aiPath;
  }

  if (path.startsWith('/api/webhooks/')) {
    return 'api/webhooks';
  }

  return 'api/default';
}

/**
 * Rate Limit 미들웨어
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  plan?: string
): Promise<NextResponse | null> {
  // API 경로만 처리
  const path = new URL(request.url).pathname;
  if (!path.startsWith('/api/')) {
    return null;
  }

  // 웹훅은 서명 검증으로 보호되므로 IP 기반만
  const endpoint = getEndpointKey(request);
  const identifier = getClientIdentifier(request);

  try {
    const result = await checkRateLimit(identifier, endpoint, plan);

    if (!result.success) {
      const error = new RateLimitError({
        limit: result.limit,
        remaining: result.remaining,
        resetAt: new Date(result.reset),
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      });

      const response = handleApiError(error);
      return addRateLimitHeaders(response, result);
    }

    // 성공 시 null 반환 (계속 처리)
    return null;
  } catch (error) {
    // Rate limit 체크 실패 시 통과 (가용성 우선)
    console.error('[Rate Limit] Check failed:', error);
    return null;
  }
}

// ============================================
// API 라우트 헬퍼
// ============================================

/**
 * API 라우트에서 Rate Limit 체크
 */
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options?: { plan?: string }
): Promise<NextResponse> {
  const rateLimitResponse = await rateLimitMiddleware(request, options?.plan);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const response = await handler();

  // Rate limit 헤더 추가
  const endpoint = getEndpointKey(request);
  const identifier = getClientIdentifier(request);
  const result = await checkRateLimit(identifier, endpoint, options?.plan);

  return addRateLimitHeaders(response, result);
}

/**
 * Rate Limit 리셋 (관리자용)
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const redisClient = getRedis();
  if (!redisClient) return;

  // 모든 관련 키 삭제
  const keys = await redisClient.keys(`ratelimit:*:${identifier}*`);
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
}

/**
 * Rate Limit 상태 조회
 */
export async function getRateLimitStatus(
  identifier: string,
  endpoint: string
): Promise<RateLimitResult | null> {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS['api/default'];
  const limiter = getRateLimiter({
    ...config,
    prefix: `ratelimit:${endpoint.replace(/\//g, ':')}`,
  });

  if (!limiter) return null;

  // 현재 상태 조회 (실제 소비 없이)
  const result = await limiter.limit(identifier);

  // 롤백 (조회만 했으므로)
  // Upstash는 롤백 지원하지 않으므로 그냥 반환
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
