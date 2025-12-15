/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

import { z } from 'zod';

/**
 * Server-side environment variable schema
 */
const serverEnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key required'),

  // Optional: AI Services (at least one should be configured)
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Optional: Rate Limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Optional: Payments
  LEMON_SQUEEZY_API_KEY: z.string().optional(),
  LEMON_SQUEEZY_WEBHOOK_SECRET: z.string().optional(),

  // Optional: Monitoring
  SENTRY_DSN: z.string().url().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Client-side environment variable schema
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key required'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validate server environment variables
 * Call this at server startup
 */
export function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error('❌ Invalid environment variables:\n' + errors);

    // In production, throw error to prevent startup
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables. Check server logs.');
    }

    // In development, log warning but continue
    console.warn('⚠️ Continuing with missing environment variables in development mode');
  }

  // Validate AI service configuration
  const hasAI = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
  if (!hasAI && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ No AI service configured (ANTHROPIC_API_KEY or OPENAI_API_KEY)');
  }

  return result.success ? result.data : (process.env as unknown as ServerEnv);
}

/**
 * Validate client environment variables
 */
export function validateClientEnv(): ClientEnv {
  const clientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

  const result = clientEnvSchema.safeParse(clientEnv);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error('Invalid client environment variables:\n' + errors);
  }

  return result.data;
}

/**
 * Get validated environment (memoized)
 */
let cachedServerEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cachedServerEnv) {
    cachedServerEnv = validateServerEnv();
  }
  return cachedServerEnv;
}
