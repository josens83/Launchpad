/**
 * React Query Client Configuration
 * Centralized query client with optimized defaults
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Default stale times (in milliseconds)
export const STALE_TIMES = {
  INSTANT: 0,
  SHORT: 1000 * 30, // 30 seconds
  MEDIUM: 1000 * 60 * 5, // 5 minutes
  LONG: 1000 * 60 * 30, // 30 minutes
  VERY_LONG: 1000 * 60 * 60, // 1 hour
} as const;

// Cache times
export const CACHE_TIMES = {
  SHORT: 1000 * 60 * 5, // 5 minutes
  MEDIUM: 1000 * 60 * 15, // 15 minutes
  LONG: 1000 * 60 * 60, // 1 hour
  VERY_LONG: 1000 * 60 * 60 * 24, // 24 hours
} as const;

// Query keys factory
export const queryKeys = {
  // User queries
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: (id: string) => [...queryKeys.user.all, 'profile', id] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
  },

  // Project queries
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },

  // Script queries
  scripts: {
    all: ['scripts'] as const,
    byProject: (projectId: string) =>
      [...queryKeys.scripts.all, 'project', projectId] as const,
    detail: (id: string) => [...queryKeys.scripts.all, 'detail', id] as const,
  },

  // Thumbnail queries
  thumbnails: {
    all: ['thumbnails'] as const,
    byProject: (projectId: string) =>
      [...queryKeys.thumbnails.all, 'project', projectId] as const,
    detail: (id: string) => [...queryKeys.thumbnails.all, 'detail', id] as const,
  },

  // Usage queries
  usage: {
    all: ['usage'] as const,
    current: () => [...queryKeys.usage.all, 'current'] as const,
    history: (range: string) => [...queryKeys.usage.all, 'history', range] as const,
  },

  // Subscription queries
  subscription: {
    all: ['subscription'] as const,
    current: () => [...queryKeys.subscription.all, 'current'] as const,
    plans: () => [...queryKeys.subscription.all, 'plans'] as const,
  },
} as const;

/**
 * Create and configure Query Client
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 30 seconds
        staleTime: STALE_TIMES.SHORT,
        // Keep unused data in cache for 15 minutes
        gcTime: CACHE_TIMES.MEDIUM,
        // Retry failed queries 3 times
        retry: 3,
        // Exponential backoff for retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus in production only
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        // Don't refetch on reconnect immediately
        refetchOnReconnect: 'always',
        // Show previous data while fetching new data
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        // Retry mutations once on network errors
        retry: 1,
        // Reset on unmount
        gcTime: 0,
      },
    },
  });
}

// Singleton client for server-side
let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  }

  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
}

// Re-export for convenience
export { QueryClientProvider, ReactQueryDevtools };
