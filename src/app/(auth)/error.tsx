'use client';

/**
 * Auth Route Error Boundary
 * Handles errors in login/signup pages
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { reportError } from '@/lib/errors/handler';
import { wrapError } from '@/lib/errors';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    const appError = wrapError(error, {
      metadata: {
        digest: error.digest,
        location: 'auth-error-boundary',
        route: 'auth',
      },
    });
    reportError(appError);

    console.error('[Auth Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-gray-900">
          Authentication Error
        </h1>
        <p className="mb-6 text-gray-600">
          Something went wrong during authentication. Please try again.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
