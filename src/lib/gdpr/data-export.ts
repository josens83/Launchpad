/**
 * GDPR Data Export & Deletion
 * Handle user data portability and right to erasure
 */

import { createClient } from '@/lib/supabase/server';

export interface UserDataExport {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    plan: string;
    created_at: string;
    updated_at: string;
  };
  projects: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    scripts: Array<{
      id: string;
      content: string;
      version: number;
      created_at: string;
    }>;
    thumbnails: Array<{
      id: string;
      url: string;
      prompt: string;
      created_at: string;
    }>;
  }>;
  usage_history: Array<{
    type: string;
    count: number;
    month: string;
  }>;
  consent_records: Array<{
    category: string;
    granted: boolean;
    timestamp: string;
  }>;
  export_metadata: {
    exported_at: string;
    format_version: string;
    requested_by: string;
  };
}

/**
 * Export all user data in GDPR-compliant format
 */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  const supabase = await createClient();

  // Fetch user profile
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) throw new Error('Failed to fetch user data');

  // Fetch projects with scripts and thumbnails
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      status,
      created_at,
      updated_at,
      scripts (
        id,
        content,
        version,
        created_at
      ),
      thumbnails (
        id,
        url,
        prompt,
        created_at
      )
    `)
    .eq('user_id', userId);

  if (projectsError) throw new Error('Failed to fetch projects');

  // Fetch usage history
  const { data: usage, error: usageError } = await supabase
    .from('usage')
    .select('type, count, month')
    .eq('user_id', userId);

  if (usageError) throw new Error('Failed to fetch usage history');

  // Fetch consent records
  const { data: consent, error: consentError } = await supabase
    .from('consent_records')
    .select('category, granted, timestamp')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  // Consent records might not exist
  const consentRecords = consentError ? [] : consent || [];

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      plan: user.plan,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    projects: projects || [],
    usage_history: usage || [],
    consent_records: consentRecords,
    export_metadata: {
      exported_at: new Date().toISOString(),
      format_version: '1.0.0',
      requested_by: userId,
    },
  };
}

/**
 * Delete all user data (Right to Erasure / Right to be Forgotten)
 */
export async function deleteUserData(userId: string): Promise<{
  success: boolean;
  deletedItems: {
    projects: number;
    scripts: number;
    thumbnails: number;
    usage_records: number;
    consent_records: number;
  };
}> {
  const supabase = await createClient();

  const deletedItems = {
    projects: 0,
    scripts: 0,
    thumbnails: 0,
    usage_records: 0,
    consent_records: 0,
  };

  // Get project IDs first
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId);

  const projectIds = projects?.map((p) => p.id) || [];

  // Delete scripts
  if (projectIds.length > 0) {
    const { count: scriptCount } = await supabase
      .from('scripts')
      .delete()
      .in('project_id', projectIds)
      .select('*', { count: 'exact', head: true });
    deletedItems.scripts = scriptCount || 0;
  }

  // Delete thumbnails
  if (projectIds.length > 0) {
    const { count: thumbnailCount } = await supabase
      .from('thumbnails')
      .delete()
      .in('project_id', projectIds)
      .select('*', { count: 'exact', head: true });
    deletedItems.thumbnails = thumbnailCount || 0;
  }

  // Delete projects
  const { count: projectCount } = await supabase
    .from('projects')
    .delete()
    .eq('user_id', userId)
    .select('*', { count: 'exact', head: true });
  deletedItems.projects = projectCount || 0;

  // Delete usage records
  const { count: usageCount } = await supabase
    .from('usage')
    .delete()
    .eq('user_id', userId)
    .select('*', { count: 'exact', head: true });
  deletedItems.usage_records = usageCount || 0;

  // Delete consent records
  const { count: consentCount } = await supabase
    .from('consent_records')
    .delete()
    .eq('user_id', userId)
    .select('*', { count: 'exact', head: true });
  deletedItems.consent_records = consentCount || 0;

  // Note: User account deletion should be handled separately
  // via Supabase Auth admin functions

  return {
    success: true,
    deletedItems,
  };
}

/**
 * Record consent change for audit trail
 */
export async function recordConsentChange(
  userId: string,
  category: string,
  granted: boolean
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('consent_records').insert({
    user_id: userId,
    category,
    granted,
    timestamp: new Date().toISOString(),
    ip_address: null, // Can be added if needed for audit
    user_agent: null, // Can be added if needed for audit
  });
}

/**
 * Anonymize user data (alternative to full deletion)
 */
export async function anonymizeUserData(userId: string): Promise<void> {
  const supabase = await createClient();

  // Update user with anonymized data
  await supabase
    .from('users')
    .update({
      email: `anonymized-${userId}@deleted.user`,
      name: 'Deleted User',
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Anonymize projects
  await supabase
    .from('projects')
    .update({
      title: 'Deleted Project',
      description: null,
    })
    .eq('user_id', userId);
}
