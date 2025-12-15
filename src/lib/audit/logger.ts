/**
 * Audit Logger
 * GDPR-compliant audit logging for security-sensitive operations
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Audit action types
 */
export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.signup'
  | 'user.password_change'
  | 'user.email_change'
  | 'user.profile_update'
  | 'user.delete'
  | 'data.export'
  | 'data.delete'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'payment.processed'
  | 'payment.failed'
  | 'api_key.created'
  | 'api_key.revoked'
  | 'consent.granted'
  | 'consent.revoked'
  | 'admin.impersonate'
  | 'admin.action';

/**
 * Audit actor types
 */
export type ActorType = 'user' | 'system' | 'webhook' | 'admin';

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  action: AuditAction;
  actor: {
    id: string;
    type: ActorType;
    email?: string;
  };
  target?: {
    type: string;
    id: string;
  };
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  result: 'success' | 'failure';
  error_message?: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();

    // Create tamper-evident hash
    const hashData = JSON.stringify({
      action: entry.action,
      actor: entry.actor,
      target: entry.target,
      timestamp: new Date().toISOString(),
    });

    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(hashData)
    );
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Insert audit log
    const { error } = await supabase.from('audit_logs').insert({
      action: entry.action,
      actor_id: entry.actor.id,
      actor_type: entry.actor.type,
      actor_email: entry.actor.email,
      target_type: entry.target?.type,
      target_id: entry.target?.id,
      metadata: entry.metadata || {},
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      result: entry.result,
      error_message: entry.error_message,
      integrity_hash: hash,
    });

    if (error) {
      // Log to console as fallback (don't throw to prevent disrupting main flow)
      console.error('[Audit Log Error]', error);
      console.log('[Audit Event]', JSON.stringify(entry));
    }
  } catch (error) {
    // Fallback to console logging
    console.error('[Audit Log Error]', error);
    console.log('[Audit Event]', JSON.stringify(entry));
  }
}

/**
 * Create audit logger with pre-filled actor information
 */
export function createAuditLogger(actor: AuditLogEntry['actor']) {
  return {
    log: (
      action: AuditAction,
      options?: Omit<AuditLogEntry, 'action' | 'actor'>
    ) =>
      logAuditEvent({
        action,
        actor,
        result: 'success',
        ...options,
      }),

    logSuccess: (
      action: AuditAction,
      options?: Omit<AuditLogEntry, 'action' | 'actor' | 'result'>
    ) =>
      logAuditEvent({
        action,
        actor,
        result: 'success',
        ...options,
      }),

    logFailure: (
      action: AuditAction,
      errorMessage: string,
      options?: Omit<AuditLogEntry, 'action' | 'actor' | 'result' | 'error_message'>
    ) =>
      logAuditEvent({
        action,
        actor,
        result: 'failure',
        error_message: errorMessage,
        ...options,
      }),
  };
}

/**
 * Get audit log for a specific user (for GDPR data export)
 */
export async function getUserAuditLog(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<{ data: unknown[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .eq('actor_id', userId)
    .order('created_at', { ascending: false });

  if (options?.startDate) {
    query = query.gte('created_at', options.startDate.toISOString());
  }

  if (options?.endDate) {
    query = query.lte('created_at', options.endDate.toISOString());
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('[Audit Log Query Error]', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Helper to extract request metadata for audit logging
 */
export function getRequestMetadata(request: Request): {
  ip_address?: string;
  user_agent?: string;
} {
  return {
    ip_address:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined,
    user_agent: request.headers.get('user-agent') || undefined,
  };
}
