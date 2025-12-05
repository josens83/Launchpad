/**
 * 프로젝트 관련 스키마
 */

import { z } from 'zod';
import { sanitizeText } from '../sanitize';
import { nonEmptyString, nicheSchema, optionalString, tagsSchema, uuidSchema } from './common';

/**
 * 프로젝트 상태 열거형
 */
export const projectStatusSchema = z.enum([
  'idea',
  'scripting',
  'recording',
  'editing',
  'thumbnail',
  'seo',
  'scheduled',
  'published',
  'archived',
]);

export type ProjectStatus = z.infer<typeof projectStatusSchema>;

/**
 * 프로젝트 생성 스키마
 */
export const projectCreateSchema = z.object({
  title: nonEmptyString
    .refine((val) => val.length >= 3, 'Title must be at least 3 characters')
    .refine((val) => val.length <= 200, 'Title must be 200 characters or less'),
  description: optionalString(2000),
  niche: nicheSchema,
  channel_id: uuidSchema.optional(),
  target_publish_date: z.coerce.date().optional(),
  target_duration: z.number().int().min(1).max(720).optional(),
  tags: tagsSchema,
  status: projectStatusSchema.default('idea'),
  metadata: z.record(z.unknown()).optional(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

/**
 * 프로젝트 업데이트 스키마
 */
export const projectUpdateSchema = z.object({
  title: optionalString(200),
  description: optionalString(2000),
  niche: nicheSchema,
  target_publish_date: z.coerce.date().optional().nullable(),
  target_duration: z.number().int().min(1).max(720).optional().nullable(),
  tags: tagsSchema.optional(),
  status: projectStatusSchema.optional(),
  youtube_video_id: z.string().regex(/^[\w-]{11}$/).optional().nullable(),
  youtube_url: z.string().url().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

/**
 * 프로젝트 필터 스키마
 */
export const projectFilterSchema = z.object({
  status: projectStatusSchema.optional(),
  channel_id: uuidSchema.optional(),
  niche: nicheSchema,
  tag: z.string().max(50).transform(sanitizeText).optional(),
  search: z.string().max(100).transform(sanitizeText).optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
});

export type ProjectFilterInput = z.infer<typeof projectFilterSchema>;

/**
 * 프로젝트 복제 스키마
 */
export const projectDuplicateSchema = z.object({
  project_id: uuidSchema,
  new_title: nonEmptyString.refine((val) => val.length <= 200).optional(),
  include_script: z.boolean().default(true),
  include_thumbnails: z.boolean().default(false),
  include_seo: z.boolean().default(true),
});

export type ProjectDuplicateInput = z.infer<typeof projectDuplicateSchema>;

/**
 * 프로젝트 일괄 작업 스키마
 */
export const projectBatchActionSchema = z.object({
  project_ids: z.array(uuidSchema).min(1).max(50),
  action: z.enum(['archive', 'unarchive', 'delete', 'change_status']),
  status: projectStatusSchema.optional(),
}).refine(
  (data) => data.action !== 'change_status' || data.status !== undefined,
  { message: 'Status is required for change_status action', path: ['status'] }
);

export type ProjectBatchActionInput = z.infer<typeof projectBatchActionSchema>;
