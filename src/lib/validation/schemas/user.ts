/**
 * 사용자 관련 스키마
 */

import { z } from 'zod';
import { nonEmptyString, optionalString, urlSchema, languageCodeSchema } from './common';

/**
 * 사용자 프로필 업데이트 스키마
 */
export const userProfileUpdateSchema = z.object({
  full_name: optionalString(100),
  avatar_url: urlSchema.optional().nullable(),
  bio: optionalString(500),
  website: urlSchema.optional().nullable(),
  timezone: z.string().max(50).optional(),
  locale: languageCodeSchema.optional(),
});

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;

/**
 * 사용자 설정 업데이트 스키마
 */
export const userSettingsUpdateSchema = z.object({
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
  weekly_digest: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: languageCodeSchema.optional(),
  default_tone: z.enum([
    'professional',
    'casual',
    'educational',
    'entertaining',
  ]).optional(),
  default_language: languageCodeSchema.optional(),
});

export type UserSettingsUpdateInput = z.infer<typeof userSettingsUpdateSchema>;

/**
 * 채널 연결 스키마
 */
export const channelConnectSchema = z.object({
  youtube_channel_id: z.string().regex(/^UC[\w-]{21}[AQgw]$/, 'Invalid YouTube channel ID'),
  channel_name: nonEmptyString.refine((val) => val.length <= 100),
  channel_thumbnail: urlSchema.optional(),
  is_primary: z.boolean().default(false),
});

export type ChannelConnectInput = z.infer<typeof channelConnectSchema>;

/**
 * 채널 업데이트 스키마
 */
export const channelUpdateSchema = z.object({
  channel_name: optionalString(100),
  niche: optionalString(100),
  target_audience: optionalString(200),
  is_primary: z.boolean().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export type ChannelUpdateInput = z.infer<typeof channelUpdateSchema>;

/**
 * API 키 생성 스키마
 */
export const apiKeyCreateSchema = z.object({
  name: nonEmptyString.refine((val) => val.length <= 50, 'Name must be 50 characters or less'),
  scopes: z.array(z.enum([
    'read:projects',
    'write:projects',
    'read:scripts',
    'write:scripts',
    'read:analytics',
    'ai:generate',
  ])).min(1, 'At least one scope is required'),
  expires_in_days: z.number().int().min(1).max(365).optional(),
});

export type ApiKeyCreateInput = z.infer<typeof apiKeyCreateSchema>;

/**
 * 데이터 내보내기 요청 스키마
 */
export const dataExportSchema = z.object({
  include: z.array(z.enum([
    'profile',
    'projects',
    'scripts',
    'thumbnails',
    'analytics',
    'settings',
  ])).min(1),
  format: z.enum(['json', 'csv', 'zip']).default('json'),
});

export type DataExportInput = z.infer<typeof dataExportSchema>;

/**
 * 계정 삭제 요청 스키마
 */
export const accountDeleteSchema = z.object({
  password: z.string().min(1, 'Password is required for verification'),
  confirmation: z.literal('DELETE', { message: 'Please type DELETE to confirm' }),
  reason: optionalString(500),
  feedback: optionalString(1000),
});

export type AccountDeleteInput = z.infer<typeof accountDeleteSchema>;

/**
 * 온보딩 스키마
 */
export const onboardingSchema = z.object({
  step: z.number().int().min(1).max(5),
  data: z.discriminatedUnion('step', [
    z.object({
      step: z.literal(1),
      channel_name: nonEmptyString.refine((val) => val.length <= 100),
    }),
    z.object({
      step: z.literal(2),
      niche: nonEmptyString.refine((val) => val.length <= 100),
    }),
    z.object({
      step: z.literal(3),
      experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
    }),
    z.object({
      step: z.literal(4),
      goals: z.array(z.string().max(100)).max(5),
    }),
    z.object({
      step: z.literal(5),
      upload_frequency: z.enum(['daily', 'few_times_week', 'weekly', 'few_times_month', 'monthly']),
    }),
  ]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
