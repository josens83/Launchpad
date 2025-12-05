/**
 * 입력 검증 관련 에러 클래스
 * Zod 스키마 검증 에러와 연동
 */

import { ZodError, ZodIssue } from 'zod';
import { AppError, ErrorOptions } from './base';

export interface FieldError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * 검증 에러 - 입력 데이터 검증 실패
 */
export class ValidationError extends AppError {
  public readonly fields: FieldError[];

  constructor(
    message: string,
    fields: FieldError[] = [],
    options: ErrorOptions = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'VALIDATION_ERROR',
      statusCode: 400,
      category: 'validation',
      severity: 'low',
    });
    this.fields = fields;
  }

  override toClientSafe() {
    return {
      ...super.toClientSafe(),
      fields: this.fields,
    };
  }

  /**
   * Zod 에러를 ValidationError로 변환
   */
  static fromZodError(error: ZodError, customMessage?: string): ValidationError {
    const fields: FieldError[] = error.errors.map((issue: ZodIssue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
      value: undefined, // 보안상 실제 값은 노출하지 않음
    }));

    const message =
      customMessage ||
      `Validation failed: ${fields.map((f) => f.message).join(', ')}`;

    return new ValidationError(message, fields, {
      code: 'ZOD_VALIDATION_ERROR',
      context: {
        metadata: {
          issueCount: error.errors.length,
        },
      },
    });
  }

  /**
   * 단일 필드 에러 생성
   */
  static field(field: string, message: string, code = 'INVALID_FIELD'): ValidationError {
    return new ValidationError(`Invalid ${field}: ${message}`, [
      { field, message, code },
    ]);
  }

  /**
   * 필수 필드 누락 에러
   */
  static required(field: string): ValidationError {
    return new ValidationError(`${field} is required`, [
      { field, message: `${field} is required`, code: 'REQUIRED' },
    ], {
      code: 'REQUIRED_FIELD_MISSING',
    });
  }

  /**
   * 필드 길이 초과 에러
   */
  static tooLong(field: string, maxLength: number): ValidationError {
    return new ValidationError(
      `${field} exceeds maximum length of ${maxLength}`,
      [{ field, message: `Must be ${maxLength} characters or less`, code: 'TOO_LONG' }],
      { code: 'FIELD_TOO_LONG' }
    );
  }

  /**
   * 필드 길이 부족 에러
   */
  static tooShort(field: string, minLength: number): ValidationError {
    return new ValidationError(
      `${field} is too short (minimum ${minLength} characters)`,
      [{ field, message: `Must be at least ${minLength} characters`, code: 'TOO_SHORT' }],
      { code: 'FIELD_TOO_SHORT' }
    );
  }

  /**
   * 잘못된 형식 에러
   */
  static invalidFormat(field: string, expectedFormat: string): ValidationError {
    return new ValidationError(
      `Invalid ${field} format`,
      [{ field, message: `Expected format: ${expectedFormat}`, code: 'INVALID_FORMAT' }],
      { code: 'INVALID_FORMAT' }
    );
  }

  /**
   * 범위 초과 에러
   */
  static outOfRange(field: string, min: number, max: number): ValidationError {
    return new ValidationError(
      `${field} must be between ${min} and ${max}`,
      [{ field, message: `Value must be between ${min} and ${max}`, code: 'OUT_OF_RANGE' }],
      { code: 'OUT_OF_RANGE' }
    );
  }

  /**
   * 잘못된 열거형 값 에러
   */
  static invalidEnum(field: string, allowedValues: string[]): ValidationError {
    return new ValidationError(
      `Invalid ${field} value`,
      [{
        field,
        message: `Must be one of: ${allowedValues.join(', ')}`,
        code: 'INVALID_ENUM',
      }],
      { code: 'INVALID_ENUM' }
    );
  }

  /**
   * 중복 값 에러
   */
  static duplicate(field: string, value?: string): ValidationError {
    const message = value
      ? `${field} '${value}' already exists`
      : `${field} already exists`;
    return new ValidationError(message, [
      { field, message: 'This value is already in use', code: 'DUPLICATE' },
    ], {
      code: 'DUPLICATE_VALUE',
    });
  }

  /**
   * XSS 위험 콘텐츠 감지 에러
   */
  static dangerousContent(field: string): ValidationError {
    return new ValidationError(
      `Potentially dangerous content detected in ${field}`,
      [{ field, message: 'Content contains potentially dangerous characters', code: 'DANGEROUS_CONTENT' }],
      {
        code: 'DANGEROUS_CONTENT',
        severity: 'high',
      }
    );
  }

  /**
   * 특정 필드의 에러 메시지 반환
   */
  getFieldError(field: string): string | undefined {
    return this.fields.find((f) => f.field === field)?.message;
  }

  /**
   * 특정 필드에 에러가 있는지 확인
   */
  hasFieldError(field: string): boolean {
    return this.fields.some((f) => f.field === field);
  }
}

/**
 * 파일 업로드 검증 에러
 */
export class FileValidationError extends ValidationError {
  constructor(
    message: string,
    options: {
      fileName?: string;
      fileSize?: number;
      fileType?: string;
      maxSize?: number;
      allowedTypes?: string[];
    } = {}
  ) {
    const fields: FieldError[] = [];

    if (options.fileSize && options.maxSize && options.fileSize > options.maxSize) {
      fields.push({
        field: 'file',
        message: `File size (${formatBytes(options.fileSize)}) exceeds maximum (${formatBytes(options.maxSize)})`,
        code: 'FILE_TOO_LARGE',
      });
    }

    if (options.fileType && options.allowedTypes && !options.allowedTypes.includes(options.fileType)) {
      fields.push({
        field: 'file',
        message: `File type '${options.fileType}' is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
        code: 'INVALID_FILE_TYPE',
      });
    }

    super(message, fields, {
      code: 'FILE_VALIDATION_ERROR',
      context: {
        metadata: {
          fileName: options.fileName,
          fileSize: options.fileSize,
          fileType: options.fileType,
        },
      },
    });
  }

  static tooLarge(fileSize: number, maxSize: number, fileName?: string): FileValidationError {
    return new FileValidationError(
      `File is too large (${formatBytes(fileSize)}). Maximum size is ${formatBytes(maxSize)}`,
      { fileSize, maxSize, fileName }
    );
  }

  static invalidType(fileType: string, allowedTypes: string[], fileName?: string): FileValidationError {
    return new FileValidationError(
      `Invalid file type: ${fileType}`,
      { fileType, allowedTypes, fileName }
    );
  }
}

/**
 * 바이트를 사람이 읽기 쉬운 형식으로 변환
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * JSON 파싱 에러
 */
export class JsonParseError extends ValidationError {
  constructor(options: ErrorOptions = {}) {
    super('Invalid JSON format', [], {
      ...options,
      code: 'JSON_PARSE_ERROR',
    });
  }
}

/**
 * 스키마 불일치 에러
 */
export class SchemaMismatchError extends ValidationError {
  constructor(
    expectedSchema: string,
    receivedData: string,
    options: ErrorOptions = {}
  ) {
    super(`Data does not match expected schema: ${expectedSchema}`, [], {
      ...options,
      code: 'SCHEMA_MISMATCH',
      context: {
        ...options.context,
        metadata: {
          expectedSchema,
          receivedData,
        },
      },
    });
  }
}
