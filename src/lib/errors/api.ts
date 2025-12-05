/**
 * API 관련 에러 클래스
 * HTTP 요청/응답 에러 처리
 */

import { AppError, ErrorOptions, ErrorContext } from './base';

/**
 * HTTP 에러 - 모든 HTTP 관련 에러의 기반
 */
export class HttpError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    options: Omit<ErrorOptions, 'statusCode'> = {}
  ) {
    super(message, {
      ...options,
      statusCode,
      category: options.category || 'network',
    });
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends HttpError {
  constructor(message = 'Bad request', options: Omit<ErrorOptions, 'statusCode'> = {}) {
    super(message, 400, {
      ...options,
      code: options.code || 'BAD_REQUEST',
      category: 'validation',
      severity: 'low',
    });
  }
}

/**
 * 401 Unauthorized - 인증되지 않음
 */
export class UnauthorizedError extends HttpError {
  constructor(message = 'Authentication required', options: Omit<ErrorOptions, 'statusCode'> = {}) {
    super(message, 401, {
      ...options,
      code: options.code || 'UNAUTHORIZED',
      category: 'authentication',
      severity: 'medium',
    });
  }
}

/**
 * 403 Forbidden - 권한 없음
 */
export class ForbiddenError extends HttpError {
  constructor(message = 'Access denied', options: Omit<ErrorOptions, 'statusCode'> = {}) {
    super(message, 403, {
      ...options,
      code: options.code || 'FORBIDDEN',
      category: 'authorization',
      severity: 'medium',
    });
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends HttpError {
  public readonly resource: string;

  constructor(
    resource = 'Resource',
    options: Omit<ErrorOptions, 'statusCode'> = {}
  ) {
    super(`${resource} not found`, 404, {
      ...options,
      code: options.code || 'NOT_FOUND',
      category: 'validation',
      severity: 'low',
    });
    this.resource = resource;
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends HttpError {
  constructor(message = 'Resource conflict', options: Omit<ErrorOptions, 'statusCode'> = {}) {
    super(message, 409, {
      ...options,
      code: options.code || 'CONFLICT',
      category: 'validation',
      severity: 'low',
    });
  }
}

/**
 * 429 Too Many Requests - Rate Limit 초과
 */
export class RateLimitError extends HttpError {
  public readonly limit: number;
  public readonly remaining: number;
  public readonly resetAt: Date;

  constructor(
    options: Omit<ErrorOptions, 'statusCode'> & {
      limit?: number;
      remaining?: number;
      resetAt?: Date;
      retryAfter?: number;
    } = {}
  ) {
    const retryAfter = options.retryAfter || 60;
    super(`Rate limit exceeded. Please try again in ${retryAfter} seconds`, 429, {
      ...options,
      code: options.code || 'RATE_LIMIT_EXCEEDED',
      category: 'rate_limit',
      severity: 'medium',
      retryable: true,
      retryAfter,
    });
    this.limit = options.limit || 0;
    this.remaining = options.remaining || 0;
    this.resetAt = options.resetAt || new Date(Date.now() + retryAfter * 1000);
  }

  override toClientSafe() {
    return {
      ...super.toClientSafe(),
      limit: this.limit,
      remaining: this.remaining,
      resetAt: this.resetAt.toISOString(),
    };
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends HttpError {
  constructor(message = 'Internal server error', options: Omit<ErrorOptions, 'statusCode'> = {}) {
    super(message, 500, {
      ...options,
      code: options.code || 'INTERNAL_ERROR',
      category: 'internal',
      severity: 'high',
      isOperational: false,
    });
  }

  override getUserMessage(): string {
    // 내부 서버 에러는 일반적인 메시지만 노출
    return 'An unexpected error occurred. Please try again later.';
  }
}

/**
 * 502 Bad Gateway - 외부 서비스 에러
 */
export class BadGatewayError extends HttpError {
  public readonly service: string;

  constructor(
    service: string,
    options: Omit<ErrorOptions, 'statusCode'> = {}
  ) {
    super(`External service error: ${service}`, 502, {
      ...options,
      code: options.code || 'BAD_GATEWAY',
      category: 'external_service',
      severity: 'high',
      retryable: true,
      retryAfter: options.retryAfter || 5,
    });
    this.service = service;
  }

  override getUserMessage(): string {
    return `Service temporarily unavailable. Please try again in a moment.`;
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends HttpError {
  constructor(
    message = 'Service temporarily unavailable',
    options: Omit<ErrorOptions, 'statusCode'> = {}
  ) {
    super(message, 503, {
      ...options,
      code: options.code || 'SERVICE_UNAVAILABLE',
      category: 'internal',
      severity: 'critical',
      retryable: true,
      retryAfter: options.retryAfter || 30,
    });
  }
}

/**
 * 504 Gateway Timeout
 */
export class GatewayTimeoutError extends HttpError {
  public readonly service: string;
  public readonly timeoutMs: number;

  constructor(
    service: string,
    timeoutMs: number,
    options: Omit<ErrorOptions, 'statusCode'> = {}
  ) {
    super(`Request to ${service} timed out after ${timeoutMs}ms`, 504, {
      ...options,
      code: options.code || 'GATEWAY_TIMEOUT',
      category: 'external_service',
      severity: 'high',
      retryable: true,
      retryAfter: options.retryAfter || 5,
    });
    this.service = service;
    this.timeoutMs = timeoutMs;
  }

  override getUserMessage(): string {
    return 'Request timed out. Please try again.';
  }
}

/**
 * 네트워크 에러 - 연결 실패, DNS 실패 등
 */
export class NetworkError extends AppError {
  public readonly originalCode?: string;

  constructor(
    message = 'Network error occurred',
    options: ErrorOptions & { originalCode?: string } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'NETWORK_ERROR',
      statusCode: options.statusCode || 0,
      category: 'network',
      severity: 'medium',
      retryable: true,
      retryAfter: options.retryAfter || 3,
    });
    this.originalCode = options.originalCode;
  }

  override getUserMessage(): string {
    return 'Network connection error. Please check your internet connection and try again.';
  }
}

/**
 * 타임아웃 에러
 */
export class TimeoutError extends AppError {
  public readonly timeoutMs: number;
  public readonly operation: string;

  constructor(
    operation: string,
    timeoutMs: number,
    options: ErrorOptions = {}
  ) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, {
      ...options,
      code: options.code || 'TIMEOUT',
      statusCode: 408,
      category: 'network',
      severity: 'medium',
      retryable: true,
      retryAfter: options.retryAfter || 3,
    });
    this.timeoutMs = timeoutMs;
    this.operation = operation;
  }

  override getUserMessage(): string {
    return 'Request timed out. Please try again.';
  }
}

/**
 * HTTP 응답을 기반으로 적절한 에러 생성
 */
export function createHttpError(
  status: number,
  message?: string,
  context?: ErrorContext
): HttpError {
  const options = { context };

  switch (status) {
    case 400:
      return new BadRequestError(message, options);
    case 401:
      return new UnauthorizedError(message, options);
    case 403:
      return new ForbiddenError(message, options);
    case 404:
      return new NotFoundError(message || 'Resource', options);
    case 409:
      return new ConflictError(message, options);
    case 429:
      return new RateLimitError(options);
    case 500:
      return new InternalServerError(message, options);
    case 502:
      return new BadGatewayError(message || 'external service', options);
    case 503:
      return new ServiceUnavailableError(message, options);
    case 504:
      return new GatewayTimeoutError(message || 'service', 30000, options);
    default:
      return new HttpError(message || `HTTP Error ${status}`, status, options);
  }
}
