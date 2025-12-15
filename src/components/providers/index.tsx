/**
 * Combined Providers Component
 * Wraps the app with all necessary providers
 */

'use client';

import { QueryProvider } from './QueryProvider';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { PageErrorFallback } from '@/components/error/ErrorFallbacks';
import { CookieConsent } from '@/components/gdpr/CookieConsent';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => <PageErrorFallback error={error} reset={reset} />}
      level="page"
    >
      <QueryProvider>
        <AnalyticsProvider>
          {children}
          {/* GDPR Cookie Consent Banner */}
          <CookieConsent />
        </AnalyticsProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export { QueryProvider } from './QueryProvider';
export { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
