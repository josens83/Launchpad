import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Generate Content Security Policy header
 */
function generateCSP(): string {
  const directives = [
    // Default: only allow same origin
    "default-src 'self'",

    // Scripts: self, inline (for Next.js), and external services
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net",

    // Styles: self and inline (for styled-components/emotion)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Images: self, data URIs, and external
    "img-src 'self' data: blob: https: http:",

    // Fonts: self and Google Fonts
    "font-src 'self' https://fonts.gstatic.com data:",

    // Connect: API endpoints
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.openai.com https://*.sentry.io",

    // Frames: Stripe
    "frame-src 'self' https://js.stripe.com",

    // Object: none
    "object-src 'none'",

    // Base URI: self
    "base-uri 'self'",

    // Form action: self
    "form-action 'self'",

    // Frame ancestors: none (prevent clickjacking)
    "frame-ancestors 'none'",

    // Upgrade insecure requests in production
    ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join("; ");
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set("Content-Security-Policy", generateCSP());

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS filtering
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // HSTS (Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Permissions policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return response;
}

export async function updateSession(request: NextRequest) {
  // Skip authentication for public API routes
  const publicApiPaths = ["/api/health", "/api/docs"];
  const isPublicApi = publicApiPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicApi) {
    const response = NextResponse.next({ request });
    return addSecurityHeaders(response);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = [
    "/dashboard",
    "/projects",
    "/scripts",
    "/thumbnails",
    "/editor",
    "/seo",
    "/analytics",
    "/settings",
    "/onboarding",
  ];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(url);
    return addSecurityHeaders(redirectResponse);
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ["/login", "/signup"];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(url);
    return addSecurityHeaders(redirectResponse);
  }

  // Check if user needs onboarding
  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profile && !profile.onboarding_completed && !request.nextUrl.pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      const redirectResponse = NextResponse.redirect(url);
      return addSecurityHeaders(redirectResponse);
    }
  }

  return addSecurityHeaders(supabaseResponse);
}
