/**
 * CSRF Protection Utilities
 * Implements Double Submit Cookie pattern for API routes
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Set CSRF token in cookie
 */
export async function setCsrfToken(response: NextResponse): Promise<string> {
  const token = generateCsrfToken();

  response.cookies.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

/**
 * Get CSRF token from request cookie
 */
export async function getCsrfTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CSRF_TOKEN_NAME);
  return token?.value || null;
}

/**
 * Validate CSRF token from request
 * Returns true if valid, false otherwise
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  // Skip validation for safe methods
  const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  if (safeMethod) {
    return true;
  }

  // Skip validation for webhook endpoints (they use signature verification)
  if (request.nextUrl.pathname.startsWith('/api/webhooks')) {
    return true;
  }

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_TOKEN_NAME)?.value;

  // Both must exist and match
  if (!headerToken || !cookieToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(headerToken, cookieToken);
}

/**
 * Constant-time string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * CSRF validation middleware wrapper for API routes
 */
export function withCsrfProtection<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
): (request: NextRequest) => Promise<NextResponse<T>> {
  return async (request: NextRequest) => {
    const isValid = await validateCsrfToken(request);

    if (!isValid) {
      return NextResponse.json(
        {
          error: {
            code: 'CSRF_VALIDATION_FAILED',
            message: 'Invalid or missing CSRF token',
          },
        },
        { status: 403 }
      ) as NextResponse<T>;
    }

    return handler(request);
  };
}

/**
 * React hook helper - returns CSRF token for client-side requests
 * Use this in a server component to pass to client components
 */
export async function getClientCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_TOKEN_NAME)?.value;

  // If no token exists, this will be set on the next response
  // For now, generate one for the client to use
  if (!token) {
    token = generateCsrfToken();
  }

  return token;
}
