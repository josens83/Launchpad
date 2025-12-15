/**
 * 중앙화된 에러 핸들러
 * API, 클라이언트, 서버사이드 에러 일관된 처리
 */

import { NextResponse } from 'next/server';
import { AppError, wrapError, ErrorContext, isAppError } from './base';
import { ValidationError } from './validation';
import { getErrorMessage, SupportedLocale } from './messages';
import { ZodError } from 'zod';

/**
 * API 응답 형식
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    retryable?: boolean;
    retryAfter?: number;
    fields?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  };
  requestId?: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  requestId?: string;
  timestamp: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * API 에러 핸들러 옵션
 */
interface ErrorHandlerOptions {
  context?: ErrorContext;
  locale?: SupportedLocale;
  includeStack?: boolean;
  logError?: boolean;
}

/**
 * API 에러를 NextResponse로 변환
 */
export function handleApiError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): NextResponse<ApiErrorResponse> {
  const {
    context,
    locale = 'en',
    includeStack = process.env.NODE_ENV === 'development',
    logError = true,
  } = options;

  // Zod 에러 처리
  if (error instanceof ZodError) {
    const validationError = ValidationError.fromZodError(error);
    return createErrorResponse(validationError, { locale, includeStack });
  }

  // AppError로 변환
  const appError = wrapError(error, context);

  // 로깅
  if (logError) {
    logErrorToConsole(appError);
  }

  return createErrorResponse(appError, { locale, includeStack });
}

/**
 * 에러 응답 생성
 */
function createErrorResponse(
  error: AppError,
  options: { locale: SupportedLocale; includeStack: boolean }
): NextResponse<ApiErrorResponse> {
  const { locale } = options;
  const friendlyMessage = getErrorMessage(error.code, locale);

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: error.code,
      message: friendlyMessage.description,
      statusCode: error.statusCode,
    },
    timestamp: new Date().toISOString(),
  };

  // 재시도 정보 추가
  if (error.retryable) {
    response.error.retryable = true;
    if (error.retryAfter) {
      response.error.retryAfter = error.retryAfter;
    }
  }

  // 검증 에러 필드 정보 추가
  if (error instanceof ValidationError && error.fields.length > 0) {
    response.error.fields = error.fields;
  }

  // 요청 ID 추가
  if (error.context.requestId) {
    response.requestId = error.context.requestId;
  }

  // 헤더 설정
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Rate Limit 헤더
  if (error.code === 'RATE_LIMIT_EXCEEDED' && error.retryAfter) {
    headers['Retry-After'] = String(error.retryAfter);
    headers['X-RateLimit-Reset'] = new Date(
      Date.now() + error.retryAfter * 1000
    ).toISOString();
  }

  return NextResponse.json(response, {
    status: error.statusCode,
    headers,
  });
}

/**
 * API 성공 응답 생성
 */
export function createSuccessResponse<T>(
  data: T,
  options: { status?: number; headers?: Record<string, string> } = {}
): NextResponse<ApiSuccessResponse<T>> {
  const { status = 200, headers = {} } = options;

  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}

/**
 * 콘솔에 에러 로깅 (개발/디버깅용)
 */
function logErrorToConsole(error: AppError): void {
  const logData = {
    level: error.severity,
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    category: error.category,
    context: error.context,
    stack: error.stack,
  };

  if (error.severity === 'critical' || error.severity === 'high') {
    console.error('[ERROR]', JSON.stringify(logData, null, 2));
  } else if (error.severity === 'medium') {
    console.warn('[WARN]', JSON.stringify(logData, null, 2));
  } else {
    console.info('[INFO]', JSON.stringify(logData, null, 2));
  }
}

/**
 * 클라이언트 에러 핸들러
 * React 컴포넌트에서 사용
 */
export function handleClientError(
  error: unknown,
  options: {
    silent?: boolean;
    fallbackMessage?: string;
  } = {}
): { code: string; message: string; canRetry: boolean } {
  const { silent = false, fallbackMessage } = options;

  if (isAppError(error)) {
    if (!silent) {
      console.error(`[Client Error] ${error.code}: ${error.message}`);
    }
    return {
      code: error.code,
      message: error.getUserMessage(),
      canRetry: error.canRetry(),
    };
  }

  const message =
    error instanceof Error
      ? error.message
      : fallbackMessage || 'An unexpected error occurred';

  if (!silent) {
    console.error('[Client Error]', error);
  }

  return {
    code: 'UNKNOWN_ERROR',
    message,
    canRetry: true,
  };
}

/**
 * 에러를 fetch 응답에서 추출
 */
export async function extractErrorFromResponse(
  response: Response
): Promise<AppError> {
  try {
    const data = await response.json();

    if (data.error && typeof data.error === 'object') {
      return new AppError(data.error.message || 'Request failed', {
        code: data.error.code || `HTTP_${response.status}`,
        statusCode: response.status,
        retryable: data.error.retryable,
        retryAfter: data.error.retryAfter,
      });
    }

    return new AppError(data.message || `Request failed with status ${response.status}`, {
      code: `HTTP_${response.status}`,
      statusCode: response.status,
    });
  } catch {
    return new AppError(`Request failed with status ${response.status}`, {
      code: `HTTP_${response.status}`,
      statusCode: response.status,
    });
  }
}

/**
 * 에러 보고 (Sentry 등 외부 서비스)
 * 실제 구현은 Sentry 설정 후 교체
 */
export function reportError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const appError = isAppError(error) ? error : wrapError(error);

  // 운영 에러가 아닌 경우에만 보고 (프로그래밍 에러)
  if (!appError.isOperational) {
    // TODO: Sentry.captureException 호출
    console.error('[REPORT ERROR]', {
      error: appError.toJSON(),
      context,
    });
  }
}

/**
 * 비동기 함수 래퍼 - 에러를 자동으로 처리
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: ErrorHandlerOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return (await fn(...args)) as ReturnType<T>;
    } catch (error) {
      const appError = wrapError(error, options.context);

      if (options.logError !== false) {
        logErrorToConsole(appError);
      }

      throw appError;
    }
  };
}

/**
 * API 라우트 핸들러 래퍼
 */
export function withApiErrorHandler<T>(
  handler: (request: Request, context?: unknown) => Promise<NextResponse<T>>
): (request: Request, context?: unknown) => Promise<NextResponse<T | ApiErrorResponse>> {
  return async (request: Request, context?: unknown) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, {
        context: {
          endpoint: new URL(request.url).pathname,
          method: request.method,
        },
      });
    }
  };
}

/**
 * 에러가 특정 타입인지 체크하는 타입 가드들
 */
export function isNetworkError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.category === 'network';
  }
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.category === 'authentication' || error.category === 'authorization';
  }
  return false;
}

export function isValidationError(error: unknown): boolean {
  return error instanceof ValidationError;
}

export function isRetryableError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.retryable;
  }
  // 네트워크 에러는 기본적으로 재시도 가능
  return isNetworkError(error);
}
