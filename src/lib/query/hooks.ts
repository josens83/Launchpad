/**
 * React Query Custom Hooks
 * Type-safe data fetching hooks with optimistic updates
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type UseQueryOptions,
  type UseMutationOptions,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, CACHE_TIMES } from './client';
import type { Project, Script, Thumbnail, User } from '@/types';

// API Response types
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Fetch helper with error handling
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============== User Hooks ==============

export function useCurrentUser(
  options?: Omit<UseQueryOptions<User | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: () => fetchApi<User | null>('/api/user/me'),
    staleTime: STALE_TIMES.LONG,
    gcTime: CACHE_TIMES.LONG,
    ...options,
  });
}

export function useUserProfile(
  userId: string,
  options?: Omit<UseQueryOptions<User>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.user.profile(userId),
    queryFn: () => fetchApi<User>(`/api/user/${userId}`),
    enabled: !!userId,
    ...options,
  });
}

// ============== Project Hooks ==============

interface ProjectFilters {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useProjects(
  filters: ProjectFilters = {},
  options?: Omit<UseQueryOptions<Project[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      return fetchApi<Project[]>(`/api/projects?${params}`);
    },
    staleTime: STALE_TIMES.SHORT,
    ...options,
  });
}

export function useProjectsInfinite(
  filters: ProjectFilters = {},
  options?: Omit<
    UseInfiniteQueryOptions<PaginatedResponse<Project>>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.projects.list(filters), 'infinite'],
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      params.set('page', String(pageParam));
      params.set('pageSize', '20');
      return fetchApi<PaginatedResponse<Project>>(`/api/projects?${params}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    ...options,
  });
}

export function useProject(
  projectId: string,
  options?: Omit<UseQueryOptions<Project>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => fetchApi<Project>(`/api/projects/${projectId}`),
    enabled: !!projectId,
    staleTime: STALE_TIMES.MEDIUM,
    ...options,
  });
}

export function useCreateProject(
  options?: Omit<
    UseMutationOptions<Project, Error, Partial<Project>>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Project>) =>
      fetchApi<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (newProject) => {
      // Invalidate project lists
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      // Add to cache immediately
      queryClient.setQueryData(queryKeys.projects.detail(newProject.id), newProject);
    },
    ...options,
  });
}

export function useUpdateProject(
  options?: Omit<
    UseMutationOptions<Project, Error, { id: string; data: Partial<Project> }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      fetchApi<Project>(`/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(id) });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData<Project>(
        queryKeys.projects.detail(id)
      );

      // Optimistically update
      if (previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(id), {
          ...previousProject,
          ...data,
        });
      }

      return { previousProject };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(id), context.previousProject);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
    ...options,
  });
}

export function useDeleteProject(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<void>(`/api/projects/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
    ...options,
  });
}

// ============== Script Hooks ==============

interface GenerateScriptParams {
  projectId: string;
  topic: string;
  tone?: string;
  targetDuration?: number;
  language?: string;
}

export function useProjectScripts(
  projectId: string,
  options?: Omit<UseQueryOptions<Script[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.scripts.byProject(projectId),
    queryFn: () => fetchApi<Script[]>(`/api/projects/${projectId}/scripts`),
    enabled: !!projectId,
    ...options,
  });
}

export function useGenerateScript(
  options?: Omit<UseMutationOptions<Script, Error, GenerateScriptParams>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, ...params }: GenerateScriptParams) =>
      fetchApi<Script>('/api/ai/script', {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId, ...params }),
      }),
    onSuccess: (newScript, { projectId }) => {
      // Add to project scripts
      queryClient.setQueryData<Script[]>(
        queryKeys.scripts.byProject(projectId),
        (old) => [...(old || []), newScript]
      );
      // Invalidate project to update script count
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
    ...options,
  });
}

// ============== Thumbnail Hooks ==============

interface GenerateThumbnailParams {
  projectId: string;
  style: string;
  prompt?: string;
}

export function useProjectThumbnails(
  projectId: string,
  options?: Omit<UseQueryOptions<Thumbnail[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.thumbnails.byProject(projectId),
    queryFn: () => fetchApi<Thumbnail[]>(`/api/projects/${projectId}/thumbnails`),
    enabled: !!projectId,
    ...options,
  });
}

export function useGenerateThumbnail(
  options?: Omit<
    UseMutationOptions<Thumbnail, Error, GenerateThumbnailParams>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, ...params }: GenerateThumbnailParams) =>
      fetchApi<Thumbnail>('/api/ai/thumbnail', {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId, ...params }),
      }),
    onSuccess: (newThumbnail, { projectId }) => {
      queryClient.setQueryData<Thumbnail[]>(
        queryKeys.thumbnails.byProject(projectId),
        (old) => [...(old || []), newThumbnail]
      );
    },
    ...options,
  });
}

// ============== Usage Hooks ==============

interface UsageData {
  scripts_used: number;
  scripts_limit: number;
  thumbnails_used: number;
  thumbnails_limit: number;
  seo_analyses_used: number;
  seo_analyses_limit: number;
}

export function useUsage(
  options?: Omit<UseQueryOptions<UsageData>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.usage.current(),
    queryFn: () => fetchApi<UsageData>('/api/user/usage'),
    staleTime: STALE_TIMES.SHORT,
    ...options,
  });
}

// ============== Prefetching Utilities ==============

export function usePrefetchProject() {
  const queryClient = useQueryClient();

  return (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.projects.detail(projectId),
      queryFn: () => fetchApi<Project>(`/api/projects/${projectId}`),
      staleTime: STALE_TIMES.MEDIUM,
    });
  };
}
