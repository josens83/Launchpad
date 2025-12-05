/**
 * Sentry 에러 추적 설정
 * 클라이언트/서버 공통 설정
 */

import * as Sentry from '@sentry/nextjs';
import { isAppError, AppError } from '@/lib/errors/base';

// Sentry 초기화 옵션
export const sentryOptions: Sentry.BrowserOptions | Sentry.NodeOptions = {
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 환경 설정
  environment: process.env.NODE_ENV || 'development',

  // 트레이스 샘플링 (프로덕션에서는 낮게)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 세션 리플레이 (클라이언트만)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // 디버그 모드 (개발 환경)
  debug: process.env.NODE_ENV === 'development',

  // 에러 필터링
  beforeSend(event, hint) {
    const error = hint.originalException;

    // 운영 에러는 보내지 않음 (예상된 에러)
    if (isAppError(error) && error.isOperational) {
      // 심각한 운영 에러만 보고
      if (error.severity !== 'critical' && error.severity !== 'high') {
        return null;
      }
    }

    // 특정 에러 무시
    const ignoreMessages = [
      'ResizeObserver loop',
      'Non-Error promise rejection',
      'Load failed',
      'Network request failed',
    ];

    if (
      event.message &&
      ignoreMessages.some((msg) => event.message?.includes(msg))
    ) {
      return null;
    }

    return event;
  },

  // 민감한 데이터 제거
  beforeSendTransaction(event) {
    // URL에서 토큰 제거
    if (event.request?.url) {
      event.request.url = event.request.url.replace(
        /token=[^&]+/g,
        'token=[REDACTED]'
      );
    }
    return event;
  },

  // 무시할 에러 패턴
  ignoreErrors: [
    // 브라우저 확장 프로그램
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // 네트워크 에러 (일시적)
    'Network Error',
    'Failed to fetch',
    'Load failed',
    // 취소된 요청
    'AbortError',
    'cancelled',
  ],
};

/**
 * 에러 캡처 유틸리티
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
): string | undefined {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.error('[Sentry Not Configured]', error);
    return undefined;
  }

  const scope = new Sentry.Scope();

  // AppError 정보 추가
  if (isAppError(error)) {
    scope.setTag('error.code', error.code);
    scope.setTag('error.category', error.category);
    scope.setTag('error.severity', error.severity);
    scope.setLevel(mapSeverityToSentryLevel(error.severity));

    if (error.context) {
      scope.setContext('error_context', error.context);
    }
  }

  // 추가 컨텍스트
  if (context) {
    scope.setContext('additional_context', context);
  }

  return Sentry.captureException(error, scope);
}

/**
 * 메시지 캡처
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): string | undefined {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log(`[Sentry Not Configured] ${level}: ${message}`);
    return undefined;
  }

  const scope = new Sentry.Scope();
  scope.setLevel(level);

  if (context) {
    scope.setContext('message_context', context);
  }

  return Sentry.captureMessage(message, scope);
}

/**
 * 사용자 설정
 */
export function setUser(user: {
  id: string;
  email?: string;
  plan?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    // 커스텀 필드
    plan: user.plan,
  });
}

/**
 * 사용자 초기화
 */
export function clearUser(): void {
  Sentry.setUser(null);
}

/**
 * 커스텀 태그 설정
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * 컨텍스트 설정
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  Sentry.setContext(name, context);
}

/**
 * 브레드크럼 추가
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * 트랜잭션 시작
 */
export function startTransaction(
  name: string,
  op: string
): Sentry.Span | undefined {
  return Sentry.startInactiveSpan({ name, op });
}

/**
 * 심각도 매핑
 */
function mapSeverityToSentryLevel(
  severity: 'low' | 'medium' | 'high' | 'critical'
): Sentry.SeverityLevel {
  switch (severity) {
    case 'critical':
      return 'fatal';
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'info';
  }
}

/**
 * Performance 모니터링 래퍼
 */
export async function withPerformanceMonitoring<T>(
  name: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const span = startTransaction(name, operation);

  try {
    const result = await fn();
    span?.end();
    return result;
  } catch (error) {
    span?.setStatus({ code: 2, message: 'error' });
    span?.end();
    throw error;
  }
}
