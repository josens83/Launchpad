/**
 * Base Error Class - 모든 커스텀 에러의 기반
 * 구조화된 에러 정보와 직렬화 지원
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCategory =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'network'
  | 'rate_limit'
  | 'payment'
  | 'ai_service'
  | 'database'
  | 'external_service'
  | 'internal'
  | 'unknown';

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface SerializedError {
  name: string;
  code: string;
  message: string;
  statusCode: number;
  category: ErrorCategory;
  severity: ErrorSeverity;
  isOperational: boolean;
  context?: ErrorContext;
  stack?: string;
  cause?: SerializedError;
}

export interface ErrorOptions {
  code?: string;
  statusCode?: number;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  isOperational?: boolean;
  context?: ErrorContext;
  cause?: Error;
  retryable?: boolean;
  retryAfter?: number;
}

/**
 * 기본 애플리케이션 에러 클래스
 * 모든 커스텀 에러는 이 클래스를 상속
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly isOperational: boolean;
  public readonly context: ErrorContext;
  public readonly retryable: boolean;
  public readonly retryAfter?: number;
  public readonly timestamp: Date;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message);

    this.name = this.constructor.name;
    this.code = options.code || 'INTERNAL_ERROR';
    this.statusCode = options.statusCode || 500;
    this.category = options.category || 'internal';
    this.severity = options.severity || 'medium';
    this.isOperational = options.isOperational ?? true;
    this.retryable = options.retryable ?? false;
    this.retryAfter = options.retryAfter;
    this.timestamp = new Date();

    this.context = {
      ...options.context,
      timestamp: this.timestamp.toISOString(),
    };

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // If there's a cause, chain the stack trace
    if (options.cause) {
      this.cause = options.cause;
    }
  }

  /**
   * 에러를 JSON 직렬화 가능한 객체로 변환
   */
  toJSON(): SerializedError {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      category: this.category,
      severity: this.severity,
      isOperational: this.isOperational,
      context: this.context,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
      cause: this.cause instanceof AppError ? this.cause.toJSON() : undefined,
    };
  }

  /**
   * 클라이언트에 안전하게 전송할 수 있는 형태로 변환
   * (민감한 정보 제거)
   */
  toClientSafe(): Pick<SerializedError, 'code' | 'message' | 'statusCode'> & {
    retryable: boolean;
    retryAfter?: number;
  } {
    return {
      code: this.code,
      message: this.getUserMessage(),
      statusCode: this.statusCode,
      retryable: this.retryable,
      retryAfter: this.retryAfter,
    };
  }

  /**
   * 사용자에게 표시할 메시지 반환
   * 하위 클래스에서 오버라이드 가능
   */
  getUserMessage(): string {
    return this.message;
  }

  /**
   * 에러가 특정 코드인지 확인
   */
  hasCode(code: string): boolean {
    return this.code === code;
  }

  /**
   * 에러가 재시도 가능한지 확인
   */
  canRetry(): boolean {
    return this.retryable && (!this.retryAfter || this.retryAfter > 0);
  }

  /**
   * 에러 로깅용 문자열 반환
   */
  toLogString(): string {
    const parts = [
      `[${this.severity.toUpperCase()}]`,
      `[${this.code}]`,
      this.message,
    ];

    if (this.context.requestId) {
      parts.push(`(requestId: ${this.context.requestId})`);
    }

    if (this.context.userId) {
      parts.push(`(userId: ${this.context.userId})`);
    }

    return parts.join(' ');
  }
}

/**
 * 알 수 없는 에러를 AppError로 래핑
 */
export function wrapError(error: unknown, context?: ErrorContext): AppError {
  if (error instanceof AppError) {
    // 이미 AppError인 경우, context만 병합
    if (context) {
      return new AppError(error.message, {
        code: error.code,
        statusCode: error.statusCode,
        category: error.category,
        severity: error.severity,
        isOperational: error.isOperational,
        context: { ...error.context, ...context },
        cause: error.cause instanceof Error ? error.cause : undefined,
      });
    }
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, {
      code: 'WRAPPED_ERROR',
      category: 'unknown',
      severity: 'medium',
      isOperational: false,
      context,
      cause: error,
    });
  }

  // 알 수 없는 타입의 에러
  const message = typeof error === 'string' ? error : 'An unknown error occurred';
  return new AppError(message, {
    code: 'UNKNOWN_ERROR',
    category: 'unknown',
    severity: 'high',
    isOperational: false,
    context: {
      ...context,
      metadata: { originalError: String(error) },
    },
  });
}

/**
 * 에러인지 확인하는 타입 가드
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 특정 에러 코드인지 확인
 */
export function hasErrorCode(error: unknown, code: string): boolean {
  return isAppError(error) && error.code === code;
}
