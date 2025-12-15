/**
 * AI 서비스 관련 에러 클래스
 * Claude, OpenAI 등 AI API 에러 처리
 */

import { AppError, ErrorOptions } from './base';

export type AIProvider = 'claude' | 'openai' | 'dall-e' | 'whisper' | 'unknown';

export type AIServiceType =
  | 'script_generation'
  | 'title_generation'
  | 'description_generation'
  | 'tag_generation'
  | 'thumbnail_generation'
  | 'transcription'
  | 'translation'
  | 'content_analysis'
  | 'ctr_prediction';

/**
 * AI 서비스 에러 기본 클래스
 */
export class AIServiceError extends AppError {
  public readonly provider: AIProvider;
  public readonly serviceType?: AIServiceType;
  public readonly modelId?: string;

  constructor(
    message: string,
    options: ErrorOptions & {
      provider?: AIProvider;
      serviceType?: AIServiceType;
      modelId?: string;
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'AI_SERVICE_ERROR',
      statusCode: options.statusCode || 502,
      category: 'ai_service',
      severity: options.severity || 'high',
    });
    this.provider = options.provider || 'unknown';
    this.serviceType = options.serviceType;
    this.modelId = options.modelId;
  }

  /**
   * API 연결 실패
   */
  static connectionFailed(provider: AIProvider): AIServiceError {
    return new AIServiceError(`Failed to connect to ${provider} API`, {
      code: 'AI_CONNECTION_FAILED',
      provider,
      retryable: true,
      retryAfter: 5,
    });
  }

  /**
   * API 타임아웃
   */
  static timeout(provider: AIProvider, timeoutMs: number): AIServiceError {
    return new AIServiceError(
      `${provider} API request timed out after ${timeoutMs}ms`,
      {
        code: 'AI_TIMEOUT',
        provider,
        retryable: true,
        retryAfter: 3,
        context: {
          metadata: { timeoutMs },
        },
      }
    );
  }

  /**
   * Rate limit 초과
   */
  static rateLimited(provider: AIProvider, retryAfter?: number): AIServiceError {
    return new AIServiceError(
      `${provider} API rate limit exceeded. Please try again later.`,
      {
        code: 'AI_RATE_LIMITED',
        provider,
        statusCode: 429,
        retryable: true,
        retryAfter: retryAfter || 60,
      }
    );
  }

  /**
   * 잘못된 API 키
   */
  static invalidApiKey(provider: AIProvider): AIServiceError {
    return new AIServiceError(`Invalid ${provider} API key`, {
      code: 'AI_INVALID_API_KEY',
      provider,
      statusCode: 401,
      severity: 'critical',
      isOperational: false,
    });
  }

  /**
   * 할당량 초과
   */
  static quotaExceeded(provider: AIProvider): AIServiceError {
    return new AIServiceError(
      `${provider} API quota exceeded. Please check your account.`,
      {
        code: 'AI_QUOTA_EXCEEDED',
        provider,
        statusCode: 402,
        severity: 'critical',
      }
    );
  }

  /**
   * 모델 사용 불가
   */
  static modelUnavailable(provider: AIProvider, modelId: string): AIServiceError {
    return new AIServiceError(`Model ${modelId} is currently unavailable`, {
      code: 'AI_MODEL_UNAVAILABLE',
      provider,
      modelId,
      retryable: true,
      retryAfter: 30,
    });
  }

  /**
   * 콘텐츠 정책 위반
   */
  static contentPolicyViolation(
    provider: AIProvider,
    reason?: string
  ): AIServiceError {
    return new AIServiceError(
      reason ||
        'Your request was flagged by content policy. Please modify your input.',
      {
        code: 'AI_CONTENT_POLICY_VIOLATION',
        provider,
        statusCode: 400,
        severity: 'medium',
      }
    );
  }

  /**
   * 입력 길이 초과
   */
  static inputTooLong(
    provider: AIProvider,
    maxTokens: number,
    actualTokens?: number
  ): AIServiceError {
    const message = actualTokens
      ? `Input too long (${actualTokens} tokens). Maximum: ${maxTokens} tokens.`
      : `Input exceeds maximum length of ${maxTokens} tokens.`;
    return new AIServiceError(message, {
      code: 'AI_INPUT_TOO_LONG',
      provider,
      statusCode: 400,
      severity: 'low',
      context: {
        metadata: { maxTokens, actualTokens },
      },
    });
  }

  /**
   * 응답 파싱 실패
   */
  static parseError(provider: AIProvider, reason?: string): AIServiceError {
    return new AIServiceError(
      reason || `Failed to parse ${provider} API response`,
      {
        code: 'AI_PARSE_ERROR',
        provider,
        retryable: true,
        retryAfter: 3,
      }
    );
  }

  /**
   * 스트림 에러
   */
  static streamError(provider: AIProvider, reason?: string): AIServiceError {
    return new AIServiceError(
      reason || `Error in ${provider} response stream`,
      {
        code: 'AI_STREAM_ERROR',
        provider,
        retryable: true,
        retryAfter: 3,
      }
    );
  }

  /**
   * 서비스 오버로드
   */
  static overloaded(provider: AIProvider): AIServiceError {
    return new AIServiceError(`${provider} service is currently overloaded`, {
      code: 'AI_OVERLOADED',
      provider,
      statusCode: 503,
      retryable: true,
      retryAfter: 30,
    });
  }

  /**
   * 잘못된 요청 형식
   */
  static invalidRequest(provider: AIProvider, reason?: string): AIServiceError {
    return new AIServiceError(
      reason || `Invalid request format for ${provider} API`,
      {
        code: 'AI_INVALID_REQUEST',
        provider,
        statusCode: 400,
        severity: 'low',
      }
    );
  }
}

/**
 * 스크립트 생성 에러
 */
export class ScriptGenerationError extends AIServiceError {
  constructor(message: string, options: ErrorOptions & { provider?: AIProvider } = {}) {
    super(message, {
      ...options,
      code: options.code || 'SCRIPT_GENERATION_ERROR',
      serviceType: 'script_generation',
    });
  }

  /**
   * 빈 응답
   */
  static emptyResponse(): ScriptGenerationError {
    return new ScriptGenerationError(
      'Script generation returned empty result. Please try again.',
      {
        code: 'SCRIPT_EMPTY_RESPONSE',
        provider: 'claude',
        retryable: true,
      }
    );
  }

  /**
   * 형식 오류
   */
  static invalidFormat(reason?: string): ScriptGenerationError {
    return new ScriptGenerationError(
      reason || 'Generated script has invalid format',
      {
        code: 'SCRIPT_INVALID_FORMAT',
        provider: 'claude',
        retryable: true,
      }
    );
  }

  /**
   * 토픽 부적절
   */
  static inappropriateTopic(): ScriptGenerationError {
    return new ScriptGenerationError(
      'The topic you entered is not appropriate for content generation.',
      {
        code: 'SCRIPT_INAPPROPRIATE_TOPIC',
        provider: 'claude',
        statusCode: 400,
      }
    );
  }
}

/**
 * 썸네일 생성 에러
 */
export class ThumbnailGenerationError extends AIServiceError {
  constructor(message: string, options: ErrorOptions & { provider?: AIProvider } = {}) {
    super(message, {
      ...options,
      code: options.code || 'THUMBNAIL_GENERATION_ERROR',
      provider: options.provider || 'dall-e',
      serviceType: 'thumbnail_generation',
    });
  }

  /**
   * 이미지 생성 실패
   */
  static generationFailed(reason?: string): ThumbnailGenerationError {
    return new ThumbnailGenerationError(
      reason || 'Failed to generate thumbnail. Please try with different settings.',
      {
        code: 'THUMBNAIL_GENERATION_FAILED',
        retryable: true,
      }
    );
  }

  /**
   * 부적절한 콘텐츠 요청
   */
  static inappropriateContent(): ThumbnailGenerationError {
    return new ThumbnailGenerationError(
      'The requested image content violates our content policy.',
      {
        code: 'THUMBNAIL_INAPPROPRIATE_CONTENT',
        statusCode: 400,
      }
    );
  }

  /**
   * 이미지 크기 오류
   */
  static invalidSize(size: string): ThumbnailGenerationError {
    return new ThumbnailGenerationError(`Invalid image size: ${size}`, {
      code: 'THUMBNAIL_INVALID_SIZE',
      statusCode: 400,
      context: {
        metadata: { requestedSize: size },
      },
    });
  }

  /**
   * 이미지 URL 만료
   */
  static urlExpired(): ThumbnailGenerationError {
    return new ThumbnailGenerationError(
      'Generated image URL has expired. Please regenerate.',
      {
        code: 'THUMBNAIL_URL_EXPIRED',
        retryable: true,
      }
    );
  }
}

/**
 * 제목 생성 에러
 */
export class TitleGenerationError extends AIServiceError {
  constructor(message: string, options: ErrorOptions & { provider?: AIProvider } = {}) {
    super(message, {
      ...options,
      code: options.code || 'TITLE_GENERATION_ERROR',
      provider: options.provider || 'claude',
      serviceType: 'title_generation',
    });
  }

  /**
   * 빈 응답
   */
  static emptyResponse(): TitleGenerationError {
    return new TitleGenerationError(
      'Title generation returned empty result. Please try again.',
      {
        code: 'TITLE_EMPTY_RESPONSE',
        provider: 'claude',
        retryable: true,
      }
    );
  }

  /**
   * 형식 오류
   */
  static invalidFormat(reason?: string): TitleGenerationError {
    return new TitleGenerationError(
      reason || 'Generated titles have invalid format',
      {
        code: 'TITLE_INVALID_FORMAT',
        provider: 'claude',
        retryable: true,
      }
    );
  }
}

/**
 * 설명 생성 에러
 */
export class DescriptionGenerationError extends AIServiceError {
  constructor(message: string, options: ErrorOptions & { provider?: AIProvider } = {}) {
    super(message, {
      ...options,
      code: options.code || 'DESCRIPTION_GENERATION_ERROR',
      provider: options.provider || 'claude',
      serviceType: 'description_generation',
    });
  }

  /**
   * 빈 응답
   */
  static emptyResponse(): DescriptionGenerationError {
    return new DescriptionGenerationError(
      'Description generation returned empty result. Please try again.',
      {
        code: 'DESCRIPTION_EMPTY_RESPONSE',
        provider: 'claude',
        retryable: true,
      }
    );
  }

  /**
   * 형식 오류
   */
  static invalidFormat(reason?: string): DescriptionGenerationError {
    return new DescriptionGenerationError(
      reason || 'Generated description has invalid format',
      {
        code: 'DESCRIPTION_INVALID_FORMAT',
        provider: 'claude',
        retryable: true,
      }
    );
  }
}

/**
 * 트랜스크립션 에러
 */
export class TranscriptionError extends AIServiceError {
  constructor(message: string, options: ErrorOptions & { provider?: AIProvider } = {}) {
    super(message, {
      ...options,
      code: options.code || 'TRANSCRIPTION_ERROR',
      provider: options.provider || 'whisper',
      serviceType: 'transcription',
    });
  }

  /**
   * 지원하지 않는 오디오 형식
   */
  static unsupportedFormat(format: string): TranscriptionError {
    return new TranscriptionError(`Unsupported audio format: ${format}`, {
      code: 'TRANSCRIPTION_UNSUPPORTED_FORMAT',
      statusCode: 400,
      context: {
        metadata: { format },
      },
    });
  }

  /**
   * 오디오 파일 너무 큼
   */
  static fileTooLarge(sizeMB: number, maxMB: number): TranscriptionError {
    return new TranscriptionError(
      `Audio file too large (${sizeMB}MB). Maximum size: ${maxMB}MB`,
      {
        code: 'TRANSCRIPTION_FILE_TOO_LARGE',
        statusCode: 400,
        context: {
          metadata: { sizeMB, maxMB },
        },
      }
    );
  }

  /**
   * 오디오 품질 부족
   */
  static poorQuality(): TranscriptionError {
    return new TranscriptionError(
      'Audio quality is too poor for accurate transcription.',
      {
        code: 'TRANSCRIPTION_POOR_QUALITY',
        statusCode: 400,
      }
    );
  }

  /**
   * 언어 감지 실패
   */
  static languageDetectionFailed(): TranscriptionError {
    return new TranscriptionError('Could not detect audio language.', {
      code: 'TRANSCRIPTION_LANGUAGE_DETECTION_FAILED',
      retryable: true,
    });
  }
}

/**
 * AI Provider 에러를 AIServiceError로 변환
 */
export function convertProviderError(
  error: unknown,
  provider: AIProvider,
  serviceType?: AIServiceType
): AIServiceError {
  if (error instanceof AIServiceError) {
    return error;
  }

  // Anthropic/Claude 에러 처리
  if (isAnthropicError(error)) {
    const status = error.status || 500;
    const message = error.message || 'Claude API error';

    if (status === 401) {
      return AIServiceError.invalidApiKey('claude');
    }
    if (status === 429) {
      return AIServiceError.rateLimited('claude');
    }
    if (status === 529 || message.includes('overloaded')) {
      return AIServiceError.overloaded('claude');
    }

    return new AIServiceError(message, {
      code: `CLAUDE_ERROR_${status}`,
      provider: 'claude',
      serviceType,
      statusCode: status >= 500 ? 502 : status,
    });
  }

  // OpenAI 에러 처리
  if (isOpenAIError(error)) {
    const status = error.status || 500;
    const message = error.message || 'OpenAI API error';
    const code = error.code;

    if (status === 401) {
      return AIServiceError.invalidApiKey('openai');
    }
    if (status === 429) {
      return AIServiceError.rateLimited('openai');
    }
    if (code === 'content_policy_violation') {
      return AIServiceError.contentPolicyViolation('openai', message);
    }

    return new AIServiceError(message, {
      code: `OPENAI_ERROR_${status}`,
      provider: 'openai',
      serviceType,
      statusCode: status >= 500 ? 502 : status,
    });
  }

  // 일반 에러
  const message = error instanceof Error ? error.message : 'AI service error';
  return new AIServiceError(message, {
    code: 'AI_UNKNOWN_ERROR',
    provider,
    serviceType,
    cause: error instanceof Error ? error : undefined,
  });
}

// 타입 가드
function isAnthropicError(error: unknown): error is { status?: number; message?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error || 'message' in error)
  );
}

function isOpenAIError(
  error: unknown
): error is { status?: number; message?: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error || 'message' in error || 'code' in error)
  );
}
