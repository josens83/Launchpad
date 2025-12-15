/**
 * 공통 스키마 및 유틸리티
 */

import { z } from 'zod';
import { sanitizeText, sanitizeEmail, sanitizeUrl, sanitizeUuid } from '../sanitize';

// ============================================
// 기본 타입 스키마
// ============================================

/**
 * 정제된 문자열 (공백 트림, 기본 새니타이징)
 */
export const sanitizedString = z.string().transform(sanitizeText);

/**
 * 비어있지 않은 정제된 문자열
 */
export const nonEmptyString = z
  .string()
  .min(1, 'This field is required')
  .transform(sanitizeText);

/**
 * 이메일 스키마
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .transform(sanitizeEmail);

/**
 * UUID 스키마
 */
export const uuidSchema = z
  .string()
  .transform(sanitizeUuid)
  .refine((val): val is string => val !== null, {
    message: 'Invalid UUID format',
  });

/**
 * URL 스키마
 */
export const urlSchema = z
  .string()
  .transform(sanitizeUrl)
  .refine((val): val is string => val !== null, {
    message: 'Invalid URL format',
  });

/**
 * 선택적 URL 스키마
 */
export const optionalUrlSchema = z
  .string()
  .optional()
  .transform((val) => (val ? sanitizeUrl(val) : null));

/**
 * 양의 정수 스키마
 */
export const positiveIntSchema = z
  .number()
  .int('Must be a whole number')
  .positive('Must be a positive number');

/**
 * 양의 정수 (문자열 입력 허용)
 */
export const positiveIntFromString = z
  .union([z.number(), z.string()])
  .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
  .pipe(positiveIntSchema);

/**
 * 페이지네이션 스키마
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

/**
 * 정렬 스키마
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 날짜 범위 스키마
 */
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'Start date must be before end date' }
);

// ============================================
// 컨텐츠 관련 스키마
// ============================================

/**
 * YouTube 채널 ID 스키마
 */
export const youtubeChannelIdSchema = z
  .string()
  .regex(/^UC[\w-]{21}[AQgw]$/, 'Invalid YouTube channel ID format');

/**
 * YouTube 비디오 ID 스키마
 */
export const youtubeVideoIdSchema = z
  .string()
  .regex(/^[\w-]{11}$/, 'Invalid YouTube video ID format');

/**
 * 언어 코드 스키마
 */
export const languageCodeSchema = z
  .string()
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code format')
  .default('en');

/**
 * 톤/스타일 스키마
 */
export const toneSchema = z.enum([
  'professional',
  'casual',
  'educational',
  'entertaining',
  'inspirational',
  'conversational',
]).default('professional');

/**
 * 니치/카테고리 스키마
 */
export const nicheSchema = z
  .string()
  .max(100, 'Niche must be 100 characters or less')
  .transform(sanitizeText)
  .optional();

/**
 * 태그 배열 스키마
 */
export const tagsSchema = z
  .array(
    z.string().max(50).transform(sanitizeText)
  )
  .max(30, 'Maximum 30 tags allowed')
  .default([]);

// ============================================
// 검증 유틸리티
// ============================================

/**
 * 문자열 길이 제한 스키마 생성
 */
export function stringWithLength(min: number, max: number, fieldName = 'Field') {
  return z
    .string()
    .min(min, `${fieldName} must be at least ${min} characters`)
    .max(max, `${fieldName} must be ${max} characters or less`)
    .transform(sanitizeText);
}

/**
 * 선택적 문자열 (빈 문자열을 undefined로 변환)
 */
export function optionalString(maxLength?: number) {
  let schema = z.string();
  if (maxLength) {
    schema = schema.max(maxLength);
  }
  return schema
    .optional()
    .transform((val) => (val?.trim() ? sanitizeText(val) : undefined));
}

/**
 * 열거형 스키마 (커스텀 에러 메시지)
 */
export function enumWithMessage<T extends string>(
  values: readonly [T, ...T[]],
  fieldName = 'Value'
) {
  return z.enum(values, {
    message: `${fieldName} must be one of: ${values.join(', ')}`,
  });
}

/**
 * 숫자 범위 스키마
 */
export function numberRange(min: number, max: number, fieldName = 'Value') {
  return z
    .number()
    .min(min, `${fieldName} must be at least ${min}`)
    .max(max, `${fieldName} must be at most ${max}`);
}

/**
 * 배열 길이 제한 스키마
 */
export function arrayWithLength<T extends z.ZodTypeAny>(
  itemSchema: T,
  minItems: number,
  maxItems: number
) {
  return z
    .array(itemSchema)
    .min(minItems, `At least ${minItems} items required`)
    .max(maxItems, `Maximum ${maxItems} items allowed`);
}
