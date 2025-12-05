/**
 * Analytics Provider Component
 * Wraps the app to provide analytics tracking
 */

'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackPageView, identifyUser, resetUser } from '@/lib/analytics';
import { useUserStore } from '@/stores/user-store';

/**
 * Page tracking component (needs Suspense for useSearchParams)
 */
function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      trackPageView({
        path: url,
        title: typeof document !== 'undefined' ? document.title : '',
      });
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * User identification component
 */
function UserIdentifier() {
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (user) {
      identifyUser({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: user.created_at,
      });
    } else {
      resetUser();
    }
  }, [user]);

  return null;
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics Provider
 * Initializes analytics and provides tracking components
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics({
      enabled: process.env.NODE_ENV === 'production',
      debug: process.env.NODE_ENV === 'development',
    });
  }, []);

  return (
    <>
      {/* User identification */}
      <UserIdentifier />

      {/* Page tracking with Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>

      {/* App content */}
      {children}
    </>
  );
}

export default AnalyticsProvider;
