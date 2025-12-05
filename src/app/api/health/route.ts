/**
 * Health Check Endpoints
 * 서비스 상태 모니터링용
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks?: Record<string, ServiceCheck>;
}

interface ServiceCheck {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

// 서버 시작 시간 기록
const startTime = Date.now();

/**
 * GET /api/health
 * 기본 헬스 체크 (빠른 응답)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const detailed = url.searchParams.get('detailed') === 'true';

  if (detailed) {
    return getDetailedHealth();
  }

  return NextResponse.json<HealthStatus>({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
}

/**
 * 상세 헬스 체크
 */
async function getDetailedHealth(): Promise<NextResponse<HealthStatus>> {
  const checks: Record<string, ServiceCheck> = {};
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // 1. 데이터베이스 체크
  checks.database = await checkDatabase();
  if (checks.database.status === 'down') {
    overallStatus = 'unhealthy';
  } else if (checks.database.status === 'degraded') {
    overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
  }

  // 2. Redis 체크 (Rate Limiting)
  checks.redis = await checkRedis();
  if (checks.redis.status === 'down') {
    overallStatus = overallStatus === 'unhealthy' ? 'unhealthy' : 'degraded';
  }

  // 3. 외부 API 체크 (선택적)
  checks.anthropic = await checkExternalApi(
    'https://api.anthropic.com',
    'Anthropic API'
  );
  checks.openai = await checkExternalApi(
    'https://api.openai.com/v1',
    'OpenAI API'
  );

  return NextResponse.json<HealthStatus>(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      checks,
    },
    {
      status: overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503,
    }
  );
}

/**
 * 데이터베이스 연결 체크
 */
async function checkDatabase(): Promise<ServiceCheck> {
  const start = Date.now();

  try {
    const supabase = await createClient();

    // 간단한 쿼리 실행
    const { error } = await supabase.from('users').select('id').limit(1);

    const latency = Date.now() - start;

    if (error) {
      return {
        status: 'down',
        latency,
        message: error.message,
      };
    }

    // 지연 시간 기준 (500ms 이상이면 degraded)
    if (latency > 500) {
      return {
        status: 'degraded',
        latency,
        message: 'High latency detected',
      };
    }

    return {
      status: 'up',
      latency,
    };
  } catch (error) {
    return {
      status: 'down',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Redis 연결 체크
 */
async function checkRedis(): Promise<ServiceCheck> {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return {
      status: 'degraded',
      message: 'Redis not configured',
    };
  }

  const start = Date.now();

  try {
    const response = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        signal: AbortSignal.timeout(3000),
      }
    );

    const latency = Date.now() - start;

    if (!response.ok) {
      return {
        status: 'down',
        latency,
        message: `HTTP ${response.status}`,
      };
    }

    return {
      status: 'up',
      latency,
    };
  } catch (error) {
    return {
      status: 'down',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * 외부 API 연결 체크
 */
async function checkExternalApi(
  url: string,
  name: string
): Promise<ServiceCheck> {
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - start;

    // 401/403은 인증 필요하지만 서비스는 가동 중
    if (response.ok || response.status === 401 || response.status === 403) {
      return {
        status: 'up',
        latency,
      };
    }

    return {
      status: 'degraded',
      latency,
      message: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      status: 'down',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
