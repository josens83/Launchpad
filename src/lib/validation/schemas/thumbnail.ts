/**
 * 썸네일 생성 관련 스키마
 */

import { z } from 'zod';
import { sanitizeText } from '../sanitize';
import { nonEmptyString, optionalString, urlSchema } from './common';

/**
 * 썸네일 스타일 열거형
 */
export const thumbnailStyleSchema = z.enum([
  'minimal',
  'bold',
  'cinematic',
  'text-focused',
  'face-focused',
  'split-screen',
  'before-after',
  'reaction',
  'tutorial',
  'listicle',
]);

export type ThumbnailStyle = z.infer<typeof thumbnailStyleSchema>;

/**
 * 썸네일 크기 스키마
 */
export const thumbnailSizeSchema = z.enum([
  '1280x720',  // 16:9 HD
  '1920x1080', // 16:9 Full HD
]).default('1280x720');

/**
 * 색상 스키마 (HEX)
 */
const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
  .optional();

/**
 * 썸네일 생성 요청 스키마
 */
export const thumbnailGenerationSchema = z.object({
  // 필수: 프롬프트 (3-1000자)
  prompt: nonEmptyString
    .refine((val) => val.length >= 3, 'Prompt must be at least 3 characters')
    .refine((val) => val.length <= 1000, 'Prompt must be 1000 characters or less'),

  // 선택: 스타일
  style: thumbnailStyleSchema.default('bold'),

  // 선택: 크기
  size: thumbnailSizeSchema,

  // 선택: 텍스트 오버레이
  text_overlay: optionalString(100),

  // 선택: 텍스트 위치
  text_position: z.enum([
    'top-left',
    'top-center',
    'top-right',
    'center-left',
    'center',
    'center-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ]).default('center'),

  // 선택: 강조 색상
  accent_color: colorSchema,

  // 선택: 배경 색상
  background_color: colorSchema,

  // 선택: 얼굴 포함 여부
  include_face: z.boolean().default(false),

  // 선택: 감정/표현
  emotion: z.enum([
    'neutral',
    'happy',
    'surprised',
    'excited',
    'serious',
    'thinking',
  ]).optional(),

  // 선택: 참조 이미지 URL
  reference_image_url: urlSchema.optional(),

  // 선택: 브랜드 요소
  brand_elements: z.object({
    logo_url: urlSchema.optional(),
    brand_colors: z.array(colorSchema.unwrap()).max(3).optional(),
  }).optional(),

  // 선택: 품질
  quality: z.enum(['standard', 'hd']).default('standard'),
});

export type ThumbnailGenerationInput = z.infer<typeof thumbnailGenerationSchema>;

/**
 * 썸네일 업데이트 스키마
 */
export const thumbnailUpdateSchema = z.object({
  title: optionalString(200),
  is_selected: z.boolean().optional(),
  status: z.enum(['draft', 'selected', 'archived']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ThumbnailUpdateInput = z.infer<typeof thumbnailUpdateSchema>;

/**
 * 썸네일 CTR 분석 요청 스키마
 */
export const thumbnailCtrAnalysisSchema = z.object({
  image_url: urlSchema,
  title: optionalString(100),
  niche: optionalString(100),
  compare_to: z.array(urlSchema).max(5).optional(),
});

export type ThumbnailCtrAnalysisInput = z.infer<typeof thumbnailCtrAnalysisSchema>;

/**
 * 썸네일 A/B 테스트 스키마
 */
export const thumbnailAbTestSchema = z.object({
  project_id: z.string().uuid(),
  variants: z
    .array(z.string().uuid())
    .min(2, 'At least 2 variants required')
    .max(5, 'Maximum 5 variants allowed'),
  duration_days: z.number().int().min(1).max(30).default(7),
});

export type ThumbnailAbTestInput = z.infer<typeof thumbnailAbTestSchema>;
