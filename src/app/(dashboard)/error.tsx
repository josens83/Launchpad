'use client';

/**
 * Dashboard Route Error Boundary
 * Handles errors within the dashboard layout
 */

import { useEffect } from 'react';
import { PageErrorFallback } from '@/components/error';
import { reportError } from '@/lib/errors/handler';
import { wrapError } from '@/lib/errors';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    const appError = wrapError(error, {
      metadata: {
        digest: error.digest,
        location: 'dashboard-error-boundary',
        route: 'dashboard',
      },
    });
    reportError(appError);

    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <PageErrorFallback
        error={error}
        reset={reset}
      />
    </div>
  );
}
