'use client';

/**
 * Next.js Global Error Handler
 * 루트 레이아웃 포함 모든 에러 처리
 */

import { useEffect } from 'react';
import { reportError } from '@/lib/errors/handler';
import { wrapError } from '@/lib/errors';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 에러 보고
    const appError = wrapError(error, {
      metadata: {
        digest: error.digest,
        location: 'global-error-boundary',
      },
    });
    reportError(appError);

    // 콘솔 로깅
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-950">
          <div className="mx-auto max-w-md text-center">
            {/* 아이콘 */}
            <div className="mb-6 inline-flex rounded-full bg-red-100 p-4 dark:bg-red-900/30">
              <svg
                className="h-12 w-12 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* 타이틀 */}
            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
              Something went wrong
            </h1>

            {/* 설명 */}
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              We&apos;re sorry, but something unexpected happened. Our team has been
              notified and is working on a fix.
            </p>

            {/* 액션 버튼들 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go Home
              </a>
            </div>

            {/* 에러 ID (지원용) */}
            {error.digest && (
              <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
                Error ID: {error.digest}
              </p>
            )}

            {/* 개발 환경 에러 디테일 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-900 dark:bg-red-950/50">
                <p className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">
                  Error Details (Development Only)
                </p>
                <pre className="overflow-auto whitespace-pre-wrap text-xs text-red-700 dark:text-red-300">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
