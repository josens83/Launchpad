/**
 * SEO 관련 스키마
 */

import { z } from 'zod';
import { sanitizeText } from '../sanitize';
import { nonEmptyString, nicheSchema, languageCodeSchema, optionalString, tagsSchema } from './common';

/**
 * 제목 생성 요청 스키마
 */
export const titleGenerationSchema = z.object({
  topic: nonEmptyString
    .refine((val) => val.length >= 3, 'Topic must be at least 3 characters')
    .refine((val) => val.length <= 300, 'Topic must be 300 characters or less'),
  niche: nicheSchema,
  style: z.enum([
    'clickbait',
    'educational',
    'how-to',
    'listicle',
    'question',
    'comparison',
    'news',
  ]).default('educational'),
  language: languageCodeSchema,
  count: z.number().int().min(1).max(20).default(5),
  keywords: tagsSchema,
  max_length: z.number().int().min(30).max(100).default(60),
});

export type TitleGenerationInput = z.infer<typeof titleGenerationSchema>;

/**
 * 설명 생성 요청 스키마
 */
export const descriptionGenerationSchema = z.object({
  title: nonEmptyString
    .refine((val) => val.length <= 100, 'Title must be 100 characters or less'),
  topic: optionalString(300),
  niche: nicheSchema,
  style: z.enum([
    'informative',
    'engaging',
    'professional',
    'casual',
  ]).default('informative'),
  language: languageCodeSchema,
  include_timestamps: z.boolean().default(false),
  include_links: z.boolean().default(true),
  include_hashtags: z.boolean().default(true),
  max_length: z.number().int().min(100).max(5000).default(2000),
  keywords: tagsSchema,
  chapters: z.array(z.object({
    timestamp: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/),
    title: z.string().max(100).transform(sanitizeText),
  })).max(20).optional(),
});

export type DescriptionGenerationInput = z.infer<typeof descriptionGenerationSchema>;

/**
 * 태그 생성 요청 스키마
 */
export const tagGenerationSchema = z.object({
  title: nonEmptyString.refine((val) => val.length <= 100),
  description: optionalString(2000),
  niche: nicheSchema,
  language: languageCodeSchema,
  count: z.number().int().min(5).max(30).default(15),
  include_long_tail: z.boolean().default(true),
  competitor_tags: tagsSchema,
});

export type TagGenerationInput = z.infer<typeof tagGenerationSchema>;

/**
 * 키워드 리서치 요청 스키마
 */
export const keywordResearchSchema = z.object({
  seed_keyword: nonEmptyString
    .refine((val) => val.length >= 2, 'Keyword must be at least 2 characters')
    .refine((val) => val.length <= 100, 'Keyword must be 100 characters or less'),
  niche: nicheSchema,
  language: languageCodeSchema,
  region: z.string().length(2).toUpperCase().default('US'),
  include_questions: z.boolean().default(true),
  include_related: z.boolean().default(true),
  include_trending: z.boolean().default(true),
  difficulty_filter: z.enum(['easy', 'medium', 'hard', 'all']).default('all'),
  min_search_volume: z.number().int().min(0).default(100),
  max_results: z.number().int().min(10).max(100).default(50),
});

export type KeywordResearchInput = z.infer<typeof keywordResearchSchema>;

/**
 * 경쟁자 분석 요청 스키마
 */
export const competitorAnalysisSchema = z.object({
  video_url: z.string().url('Invalid YouTube video URL'),
  analyze: z.array(
    z.enum([
      'title',
      'description',
      'tags',
      'thumbnail',
      'engagement',
      'comments',
    ])
  ).min(1).default(['title', 'description', 'tags']),
});

export type CompetitorAnalysisInput = z.infer<typeof competitorAnalysisSchema>;

/**
 * SEO 점수 분석 스키마
 */
export const seoScoreAnalysisSchema = z.object({
  title: nonEmptyString.refine((val) => val.length <= 100),
  description: optionalString(5000),
  tags: tagsSchema,
  target_keyword: optionalString(100),
  niche: nicheSchema,
});

export type SeoScoreAnalysisInput = z.infer<typeof seoScoreAnalysisSchema>;
