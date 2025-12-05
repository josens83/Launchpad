'use client';

/**
 * 다양한 레벨의 에러 Fallback UI 컴포넌트
 */

import { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isAppError } from '@/lib/errors';
import { getErrorMessage, getActionUrl, ErrorAction } from '@/lib/errors/messages';
import Link from 'next/link';

interface ErrorFallbackProps {
  error: Error;
  reset?: () => void;
  returnUrl?: string;
}

/**
 * 전역 에러 Fallback (앱 전체 크래시)
 */
export function GlobalErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 inline-flex rounded-full bg-red-100 p-4 dark:bg-red-900/30">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Oops! Something went wrong
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          We&apos;re sorry, but something unexpected happened. Our team has been notified.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {reset && (
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/help" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Get Help
            </Link>
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-900 dark:bg-red-950/50">
            <p className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">
              Error Details (Development Only)
            </p>
            <pre className="overflow-auto text-xs text-red-700 dark:text-red-300">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 페이지 레벨 에러 Fallback
 */
export function PageErrorFallback({ error, reset, returnUrl }: ErrorFallbackProps) {
  const appError = isAppError(error) ? error : null;
  const errorMessage = appError
    ? getErrorMessage(appError.code)
    : { title: 'Page Error', description: 'This page encountered an error.' };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-5 inline-flex rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
          <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {errorMessage.title}
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {errorMessage.description}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {reset && (
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {errorMessage.actionLabel || 'Try Again'}
            </Button>
          )}
          {returnUrl && (
            <Button variant="outline" asChild>
              <Link href={returnUrl} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 섹션 레벨 에러 Fallback
 */
export function SectionErrorFallback({ error, reset }: ErrorFallbackProps) {
  const appError = isAppError(error) ? error : null;
  const canRetry = appError?.canRetry() ?? true;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/50">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 font-medium text-amber-800 dark:text-amber-200">
            Unable to load this section
          </h3>
          <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">
            {appError?.getUserMessage() || 'An error occurred while loading this content.'}
          </p>
          {canRetry && reset && (
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 컴포넌트 레벨 에러 Fallback (인라인)
 */
export function ComponentErrorFallback({ error, reset }: ErrorFallbackProps) {
  const appError = isAppError(error) ? error : null;
  const canRetry = appError?.canRetry() ?? true;

  return (
    <div className="flex items-center gap-3 rounded-md bg-red-50 px-4 py-3 dark:bg-red-950/30">
      <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
      <p className="flex-1 text-sm text-red-700 dark:text-red-300">
        {appError?.getUserMessage() || 'Failed to load'}
      </p>
      {canRetry && reset && (
        <button
          onClick={reset}
          className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * 카드 에러 Fallback (그리드 아이템용)
 */
export function CardErrorFallback({ reset }: Omit<ErrorFallbackProps, 'error'> & { error?: Error }) {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/50">
      <AlertTriangle className="mb-3 h-8 w-8 text-gray-400" />
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Failed to load content
      </p>
      {reset && (
        <button
          onClick={reset}
          className="text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * 데이터 로딩 에러 Fallback
 */
export function DataErrorFallback({
  error,
  reset,
  title = 'Failed to load data',
}: ErrorFallbackProps & { title?: string }) {
  const appError = isAppError(error) ? error : null;
  const errorMessage = appError
    ? getErrorMessage(appError.code)
    : { title, description: 'Unable to fetch the requested data.' };

  const action = errorMessage.action;
  const actionUrl = action ? getActionUrl(action) : null;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
        {errorMessage.title}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {errorMessage.description}
      </p>
      <div className="flex gap-3">
        {reset && (action === 'retry' || !action) && (
          <Button variant="outline" onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {errorMessage.actionLabel || 'Try Again'}
          </Button>
        )}
        {actionUrl && action !== 'retry' && (
          <Button asChild>
            <Link href={actionUrl}>{errorMessage.actionLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * 네트워크 에러 Fallback
 */
export function NetworkErrorFallback({ reset }: { reset?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
        No Internet Connection
      </h3>
      <p className="mb-4 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        Please check your network connection and try again.
      </p>
      {reset && (
        <Button variant="outline" onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * 빈 상태 & 에러 결합 컴포넌트
 */
interface EmptyOrErrorStateProps {
  error?: Error | null;
  isEmpty?: boolean;
  reset?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children?: ReactNode;
}

export function EmptyOrErrorState({
  error,
  isEmpty,
  reset,
  emptyTitle = 'No data found',
  emptyDescription = 'There is nothing to display here yet.',
  emptyAction,
  children,
}: EmptyOrErrorStateProps) {
  if (error) {
    return <DataErrorFallback error={error} reset={reset} />;
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
          {emptyTitle}
        </h3>
        <p className="mb-4 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {emptyDescription}
        </p>
        {emptyAction}
      </div>
    );
  }

  return <>{children}</>;
}
