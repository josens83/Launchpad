'use client';

/**
 * Next.js App Router Error Boundary
 * 라우트별 에러 처리
 */

import { useEffect } from 'react';
import { PageErrorFallback } from '@/components/error';
import { reportError } from '@/lib/errors/handler';
import { wrapError } from '@/lib/errors';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 에러 보고
    const appError = wrapError(error, {
      metadata: {
        digest: error.digest,
        location: 'route-error-boundary',
      },
    });
    reportError(appError);

    // 콘솔 로깅 (개발용)
    console.error('[Route Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <PageErrorFallback error={error} reset={reset} />
    </div>
  );
}
