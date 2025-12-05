/**
 * 인증 관련 스키마
 */

import { z } from 'zod';
import { sanitizePassword, sanitizeText } from '../sanitize';
import { emailSchema, nonEmptyString } from './common';

/**
 * 비밀번호 강도 검증
 */
const passwordStrengthSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or less')
  .refine((val) => /[a-z]/.test(val), 'Password must contain a lowercase letter')
  .refine((val) => /[A-Z]/.test(val), 'Password must contain an uppercase letter')
  .refine((val) => /[0-9]/.test(val), 'Password must contain a number')
  .transform(sanitizePassword);

/**
 * 로그인 스키마
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').transform(sanitizePassword),
  remember_me: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * 회원가입 스키마
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordStrengthSchema,
  password_confirm: z.string(),
  full_name: nonEmptyString
    .refine((val) => val.length >= 2, 'Name must be at least 2 characters')
    .refine((val) => val.length <= 100, 'Name must be 100 characters or less'),
  accept_terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
  newsletter: z.boolean().default(false),
}).refine(
  (data) => data.password === data.password_confirm,
  {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  }
);

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * 비밀번호 재설정 요청 스키마
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

/**
 * 비밀번호 재설정 스키마
 */
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordStrengthSchema,
  password_confirm: z.string(),
}).refine(
  (data) => data.password === data.password_confirm,
  {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  }
);

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

/**
 * 비밀번호 변경 스키마
 */
export const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: passwordStrengthSchema,
  new_password_confirm: z.string(),
}).refine(
  (data) => data.new_password === data.new_password_confirm,
  {
    message: 'New passwords do not match',
    path: ['new_password_confirm'],
  }
).refine(
  (data) => data.current_password !== data.new_password,
  {
    message: 'New password must be different from current password',
    path: ['new_password'],
  }
);

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

/**
 * OAuth 콜백 스키마
 */
export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;

/**
 * 이메일 인증 스키마
 */
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  type: z.enum(['signup', 'email_change']).default('signup'),
});

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;

/**
 * 세션 정보 스키마
 */
export const sessionSchema = z.object({
  user_id: z.string().uuid(),
  email: emailSchema,
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_at: z.coerce.date(),
});

export type SessionInfo = z.infer<typeof sessionSchema>;
