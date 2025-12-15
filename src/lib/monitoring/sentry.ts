/**
 * Sentry 에러 추적 설정 (Stub)
 *
 * Note: @sentry/nextjs is not yet fully compatible with Next.js 16.
 * This file provides a compatible interface that logs to console.
 * When Sentry adds Next.js 16 support, re-add the package and restore implementation.
 */

import { isAppError } from '@/lib/errors/base';

// Types (mirroring Sentry types)
export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export interface Breadcrumb {
  type?: string;
  level?: SeverityLevel;
  event_id?: string;
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

export interface Span {
  end: () => void;
  setStatus: (status: { code: number; message: string }) => void;
}

/**
 * 에러 캡처 유틸리티
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
): string | undefined {
  // Log to console in development/when Sentry is not configured
  const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  if (isAppError(error)) {
    console.error(`[Error ${errorId}]`, {
      code: error.code,
      category: error.category,
      severity: error.severity,
      message: error.message,
      context: error.context,
      additionalContext: context,
    });
  } else {
    console.error(`[Error ${errorId}]`, error, context);
  }

  return errorId;
}

/**
 * 메시지 캡처
 */
export function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
  context?: Record<string, unknown>
): string | undefined {
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const logFn = level === 'error' || level === 'fatal'
    ? console.error
    : level === 'warning'
    ? console.warn
    : console.log;

  logFn(`[${level.toUpperCase()} ${messageId}]`, message, context);

  return messageId;
}

/**
 * 사용자 설정
 */
export function setUser(user: {
  id: string;
  email?: string;
  plan?: string;
} | null): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Sentry Stub] setUser:', user);
  }
}

/**
 * 사용자 초기화
 */
export function clearUser(): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Sentry Stub] clearUser');
  }
}

/**
 * 커스텀 태그 설정
 */
export function setTag(key: string, value: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Sentry Stub] setTag:', key, value);
  }
}

/**
 * 컨텍스트 설정
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Sentry Stub] setContext:', name, context);
  }
}

/**
 * 브레드크럼 추가
 */
export function addBreadcrumb(breadcrumb: Breadcrumb): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Sentry Stub] addBreadcrumb:', breadcrumb);
  }
}

/**
 * 트랜잭션 시작
 */
export function startTransaction(
  name: string,
  op: string
): Span | undefined {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Sentry Stub] startTransaction:', name, op);
  }

  return {
    end: () => {},
    setStatus: () => {},
  };
}

/**
 * Performance 모니터링 래퍼
 */
export async function withPerformanceMonitoring<T>(
  name: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Perf] ${name} (${operation}): ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[Perf Error] ${name} (${operation}): ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}
