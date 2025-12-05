'use client';

/**
 * Async Boundary - Suspense + Error Boundary 통합 컴포넌트
 * 비동기 컴포넌트의 로딩과 에러 상태를 일관되게 처리
 */

import { ReactNode, Suspense, ComponentType } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import {
  PageErrorFallback,
  SectionErrorFallback,
  ComponentErrorFallback,
  CardErrorFallback,
} from './ErrorFallbacks';

type BoundaryLevel = 'page' | 'section' | 'component' | 'card';

interface AsyncBoundaryProps {
  children: ReactNode;
  level?: BoundaryLevel;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
  suspense?: boolean;
}

/**
 * 레벨별 기본 로딩 Fallback
 */
const LoadingFallbacks: Record<BoundaryLevel, ReactNode> = {
  page: <PageLoadingFallback />,
  section: <SectionLoadingFallback />,
  component: <ComponentLoadingFallback />,
  card: <CardLoadingFallback />,
};

/**
 * 레벨별 기본 에러 Fallback
 */
const ErrorFallbacks: Record<BoundaryLevel, ComponentType<{ error: Error; reset: () => void }>> = {
  page: PageErrorFallback,
  section: SectionErrorFallback,
  component: ComponentErrorFallback,
  card: CardErrorFallback,
};

/**
 * Async Boundary 컴포넌트
 */
export function AsyncBoundary({
  children,
  level = 'component',
  loadingFallback,
  errorFallback,
  onError,
  onReset,
  resetKeys,
  suspense = true,
}: AsyncBoundaryProps) {
  const DefaultErrorFallback = ErrorFallbacks[level];
  const defaultLoadingFallback = LoadingFallbacks[level];

  const renderErrorFallback = errorFallback
    ? typeof errorFallback === 'function'
      ? errorFallback
      : () => errorFallback
    : (error: Error, reset: () => void) => (
        <DefaultErrorFallback error={error} reset={reset} />
      );

  const content = (
    <ErrorBoundary
      fallback={renderErrorFallback}
      onError={(error) => onError?.(error)}
      onReset={onReset}
      resetKeys={resetKeys}
      level={level}
    >
      {children}
    </ErrorBoundary>
  );

  if (suspense) {
    return (
      <Suspense fallback={loadingFallback || defaultLoadingFallback}>
        {content}
      </Suspense>
    );
  }

  return content;
}

/**
 * 페이지 로딩 Fallback
 */
function PageLoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

/**
 * 섹션 로딩 Fallback
 */
function SectionLoadingFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="md" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

/**
 * 컴포넌트 로딩 Fallback
 */
function ComponentLoadingFallback() {
  return (
    <div className="flex h-16 items-center justify-center">
      <LoadingSpinner size="sm" />
    </div>
  );
}

/**
 * 카드 로딩 Fallback
 */
function CardLoadingFallback() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
      <LoadingSpinner size="md" />
    </div>
  );
}

/**
 * 로딩 스피너 컴포넌트
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <svg
      className={`animate-spin text-primary ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * 스켈레톤 로딩 컴포넌트들
 */
export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 h-32 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex gap-4 border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-gray-300 dark:bg-gray-600" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 border-b border-gray-200 bg-white p-4 last:border-0 dark:border-gray-800 dark:bg-gray-900"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mb-4 h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

export { LoadingSpinner };
export default AsyncBoundary;
