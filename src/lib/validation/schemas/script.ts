/**
 * 스크립트 생성 관련 스키마
 */

import { z } from 'zod';
import { sanitizeText } from '../sanitize';
import {
  nonEmptyString,
  toneSchema,
  nicheSchema,
  languageCodeSchema,
  numberRange,
  optionalString,
} from './common';

/**
 * 스크립트 생성 요청 스키마
 */
export const scriptGenerationSchema = z.object({
  // 필수: 토픽 (1-500자)
  topic: nonEmptyString
    .refine((val) => val.length >= 3, 'Topic must be at least 3 characters')
    .refine((val) => val.length <= 500, 'Topic must be 500 characters or less'),

  // 선택: 니치/카테고리
  niche: nicheSchema,

  // 선택: 톤/스타일
  tone: toneSchema,

  // 선택: 목표 영상 길이 (분, 1-180)
  target_duration: numberRange(1, 180, 'Duration')
    .default(10)
    .describe('Target video duration in minutes'),

  // 선택: 후킹 인트로 포함
  include_hook: z.boolean().default(true),

  // 선택: CTA 포함
  include_cta: z.boolean().default(true),

  // 선택: 언어
  language: languageCodeSchema,

  // 선택: 추가 지시사항
  additional_instructions: optionalString(1000),

  // 선택: 타겟 오디언스
  target_audience: optionalString(200),

  // 선택: 키워드 (SEO용)
  keywords: z
    .array(z.string().max(50).transform(sanitizeText))
    .max(10, 'Maximum 10 keywords allowed')
    .optional(),
});

export type ScriptGenerationInput = z.infer<typeof scriptGenerationSchema>;

/**
 * 스크립트 업데이트 스키마
 */
export const scriptUpdateSchema = z.object({
  title: optionalString(200),
  content: optionalString(50000),
  hook: optionalString(1000),
  cta: optionalString(1000),
  status: z.enum(['draft', 'review', 'final', 'archived']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ScriptUpdateInput = z.infer<typeof scriptUpdateSchema>;

/**
 * 스크립트 재생성 요청 스키마
 */
export const scriptRegenerateSchema = z.object({
  script_id: z.string().uuid('Invalid script ID'),
  section: z.enum(['hook', 'intro', 'body', 'conclusion', 'cta', 'full']).optional(),
  feedback: optionalString(500),
});

export type ScriptRegenerateInput = z.infer<typeof scriptRegenerateSchema>;

/**
 * 스크립트 섹션 스키마
 */
export const scriptSectionSchema = z.object({
  type: z.enum(['hook', 'intro', 'body', 'conclusion', 'cta']),
  content: nonEmptyString.refine(
    (val) => val.length <= 10000,
    'Section content too long'
  ),
  timestamp: z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
  notes: optionalString(500),
});

export type ScriptSection = z.infer<typeof scriptSectionSchema>;

/**
 * 스크립트 분석 요청 스키마
 */
export const scriptAnalysisSchema = z.object({
  content: nonEmptyString.refine(
    (val) => val.length >= 100,
    'Script must be at least 100 characters'
  ).refine(
    (val) => val.length <= 50000,
    'Script must be 50,000 characters or less'
  ),
  analyze_for: z
    .array(
      z.enum([
        'readability',
        'engagement',
        'seo',
        'sentiment',
        'pacing',
        'cta_effectiveness',
      ])
    )
    .min(1)
    .default(['readability', 'engagement']),
});

export type ScriptAnalysisInput = z.infer<typeof scriptAnalysisSchema>;

/**
 * 스크립트 내보내기 스키마
 */
export const scriptExportSchema = z.object({
  script_id: z.string().uuid('Invalid script ID'),
  format: z.enum(['txt', 'pdf', 'docx', 'srt', 'json']).default('txt'),
  include_timestamps: z.boolean().default(false),
  include_notes: z.boolean().default(true),
});

export type ScriptExportInput = z.infer<typeof scriptExportSchema>;
