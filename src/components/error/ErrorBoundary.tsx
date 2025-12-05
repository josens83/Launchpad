'use client';

/**
 * React Error Boundary 컴포넌트
 * Netflix/Spotify 수준의 에러 복구 UX
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, wrapError, isAppError } from '@/lib/errors';
import { reportError } from '@/lib/errors/handler';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
  level?: 'page' | 'section' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 기본 Error Boundary 클래스 컴포넌트
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetKeyRef: unknown[] = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    this.resetKeyRef = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // 에러 보고
    const appError = isAppError(error) ? error : wrapError(error);
    reportError(appError, {
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component',
    });

    // 커스텀 에러 핸들러 호출
    this.props.onError?.(error, errorInfo);

    // 콘솔 로깅 (개발용)
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // resetKeys가 변경되면 에러 상태 리셋
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      !this.areKeysEqual(prevProps.resetKeys || [], this.props.resetKeys)
    ) {
      this.reset();
    }
  }

  private areKeysEqual(prevKeys: unknown[], nextKeys: unknown[]): boolean {
    if (prevKeys.length !== nextKeys.length) return false;
    return prevKeys.every((key, index) => Object.is(key, nextKeys[index]));
  }

  reset = (): void => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // 커스텀 fallback 렌더링
      if (typeof fallback === 'function') {
        return fallback(error, this.reset);
      }

      if (fallback) {
        return fallback;
      }

      // 기본 fallback UI
      return <DefaultErrorFallback error={error} reset={this.reset} />;
    }

    return children;
  }
}

/**
 * 기본 에러 Fallback UI
 */
interface DefaultErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps) {
  const appError = isAppError(error) ? error : null;
  const canRetry = appError?.canRetry() ?? true;

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
        <svg
          className="h-6 w-6 text-red-600 dark:text-red-400"
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
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Something went wrong
      </h3>
      <p className="mb-4 max-w-sm text-sm text-gray-600 dark:text-gray-400">
        {appError?.getUserMessage() || 'An unexpected error occurred. Please try again.'}
      </p>
      {canRetry && (
        <button
          onClick={reset}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      )}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 w-full max-w-lg text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            Error Details (Dev Only)
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

export default ErrorBoundary;
