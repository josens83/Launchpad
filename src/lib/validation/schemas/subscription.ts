/**
 * 구독/결제 관련 스키마
 */

import { z } from 'zod';
import { emailSchema, optionalString } from './common';

/**
 * 플랜 타입
 */
export const planTypeSchema = z.enum(['free', 'starter', 'pro', 'team']);
export type PlanType = z.infer<typeof planTypeSchema>;

/**
 * 빌링 주기
 */
export const billingIntervalSchema = z.enum(['monthly', 'yearly']);
export type BillingInterval = z.infer<typeof billingIntervalSchema>;

/**
 * 구독 생성 스키마
 */
export const subscriptionCreateSchema = z.object({
  plan: planTypeSchema.exclude(['free']),
  billing_interval: billingIntervalSchema.default('monthly'),
  promo_code: optionalString(50),
});

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>;

/**
 * 구독 업그레이드/다운그레이드 스키마
 */
export const subscriptionChangeSchema = z.object({
  new_plan: planTypeSchema,
  billing_interval: billingIntervalSchema.optional(),
  prorate: z.boolean().default(true),
});

export type SubscriptionChangeInput = z.infer<typeof subscriptionChangeSchema>;

/**
 * 구독 취소 스키마
 */
export const subscriptionCancelSchema = z.object({
  reason: z.enum([
    'too_expensive',
    'not_using',
    'missing_features',
    'found_alternative',
    'technical_issues',
    'other',
  ]),
  feedback: optionalString(1000),
  cancel_immediately: z.boolean().default(false),
});

export type SubscriptionCancelInput = z.infer<typeof subscriptionCancelSchema>;

/**
 * 결제 수단 추가 스키마
 */
export const paymentMethodSchema = z.object({
  type: z.enum(['card', 'paypal']),
  is_default: z.boolean().default(true),
  billing_address: z.object({
    line1: z.string().max(200),
    line2: optionalString(200),
    city: z.string().max(100),
    state: optionalString(100),
    postal_code: z.string().max(20),
    country: z.string().length(2).toUpperCase(),
  }).optional(),
});

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;

/**
 * 프로모션 코드 적용 스키마
 */
export const promoCodeSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
});

export type PromoCodeInput = z.infer<typeof promoCodeSchema>;

/**
 * 인보이스 요청 스키마
 */
export const invoiceRequestSchema = z.object({
  invoice_id: z.string(),
  email: emailSchema.optional(),
  format: z.enum(['pdf', 'html']).default('pdf'),
});

export type InvoiceRequestInput = z.infer<typeof invoiceRequestSchema>;

/**
 * 팀 멤버 초대 스키마 (Team 플랜용)
 */
export const teamInviteSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'editor', 'viewer']).default('editor'),
  message: optionalString(500),
});

export type TeamInviteInput = z.infer<typeof teamInviteSchema>;

/**
 * 팀 멤버 역할 변경 스키마
 */
export const teamMemberUpdateSchema = z.object({
  member_id: z.string().uuid(),
  role: z.enum(['admin', 'editor', 'viewer']),
});

export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>;

/**
 * 사용량 조회 스키마
 */
export const usageQuerySchema = z.object({
  period: z.enum(['current', 'previous', 'all_time']).default('current'),
  feature: z.enum([
    'scripts',
    'thumbnails',
    'titles',
    'descriptions',
    'keywords',
    'all',
  ]).default('all'),
});

export type UsageQueryInput = z.infer<typeof usageQuerySchema>;
