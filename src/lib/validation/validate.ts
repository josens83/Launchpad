/**
 * 검증 유틸리티 함수
 * Zod 스키마를 사용한 검증 헬퍼
 */

import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/lib/errors/validation';
import { NextRequest } from 'next/server';

/**
 * 검증 결과 타입
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError };

/**
 * 데이터 검증 함수
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: ValidationError.fromZodError(error) };
    }
    throw error;
  }
}

/**
 * 안전한 검증 (에러 throw 없음)
 */
export function validateSafe<T>(
  schema: ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * 검증 또는 예외 throw
 */
export function validateOrThrow<T>(
  schema: ZodSchema<T>,
  data: unknown,
  customMessage?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw ValidationError.fromZodError(error, customMessage);
    }
    throw error;
  }
}

/**
 * API 요청 바디 검증
 */
export async function validateRequestBody<T>(
  request: NextRequest | Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    return validate(schema, body);
  } catch (error) {
    // JSON 파싱 실패
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: new ValidationError('Invalid JSON in request body', [], {
          code: 'INVALID_JSON',
        }),
      };
    }
    throw error;
  }
}

/**
 * API 요청 쿼리 파라미터 검증
 */
export function validateQueryParams<T>(
  request: NextRequest | Request,
  schema: ZodSchema<T>
): ValidationResult<T> {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  return validate(schema, params);
}

/**
 * API 요청 경로 파라미터 검증
 */
export function validatePathParams<T>(
  params: Record<string, string | string[]>,
  schema: ZodSchema<T>
): ValidationResult<T> {
  return validate(schema, params);
}

/**
 * 폼 데이터 검증 (FormData)
 */
export async function validateFormData<T>(
  request: NextRequest | Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    return validate(schema, data);
  } catch (error) {
    return {
      success: false,
      error: new ValidationError('Invalid form data', [], {
        code: 'INVALID_FORM_DATA',
      }),
    };
  }
}

/**
 * 부분 검증 (일부 필드만 검증)
 */
export function validatePartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): ValidationResult<Partial<z.infer<z.ZodObject<T>>>> {
  return validate(schema.partial(), data) as ValidationResult<Partial<z.infer<z.ZodObject<T>>>>;
}

/**
 * 배열 검증
 */
export function validateArray<T>(
  itemSchema: ZodSchema<T>,
  data: unknown,
  options?: { minItems?: number; maxItems?: number }
): ValidationResult<T[]> {
  let arraySchema = z.array(itemSchema);

  if (options?.minItems !== undefined) {
    arraySchema = arraySchema.min(
      options.minItems,
      `At least ${options.minItems} items required`
    );
  }

  if (options?.maxItems !== undefined) {
    arraySchema = arraySchema.max(
      options.maxItems,
      `Maximum ${options.maxItems} items allowed`
    );
  }

  return validate(arraySchema, data);
}

/**
 * 조건부 검증
 */
export function validateConditional<T>(
  condition: boolean,
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T | undefined> {
  if (!condition) {
    return { success: true, data: undefined };
  }
  return validate(schema, data) as ValidationResult<T | undefined>;
}

/**
 * 여러 스키마 중 하나로 검증
 */
export function validateUnion<T extends readonly [ZodSchema, ZodSchema, ...ZodSchema[]]>(
  schemas: T,
  data: unknown
): ValidationResult<z.infer<T[number]>> {
  const unionSchema = z.union(schemas);
  return validate(unionSchema, data);
}

/**
 * 검증 에러 필드 목록 추출
 */
export function getValidationErrors(
  error: ValidationError
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of error.fields) {
    errors[field.field] = field.message;
  }
  return errors;
}

/**
 * 커스텀 검증 규칙 추가
 */
export function withCustomValidation<T>(
  schema: ZodSchema<T>,
  validator: (data: T) => boolean | string | Promise<boolean | string>,
  errorMessage = 'Validation failed'
): ZodSchema<T> {
  return schema.refine(
    async (data) => {
      const result = await validator(data);
      return result === true;
    },
    { message: errorMessage }
  ) as ZodSchema<T>;
}

/**
 * 환경 변수 검증
 */
export function validateEnvVars<T extends Record<string, z.ZodTypeAny>>(
  schema: z.ZodObject<T>
): z.infer<z.ZodObject<T>> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((e) => e.path.join('.'))
      .join(', ');
    throw new Error(`Missing or invalid environment variables: ${missing}`);
  }

  return result.data;
}

/**
 * 타입 가드: 검증 성공 여부
 */
export function isValidationSuccess<T>(
  result: ValidationResult<T>
): result is { success: true; data: T } {
  return result.success;
}

/**
 * 타입 가드: 검증 실패 여부
 */
export function isValidationError<T>(
  result: ValidationResult<T>
): result is { success: false; error: ValidationError } {
  return !result.success;
}
