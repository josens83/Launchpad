/**
 * Next.js Instrumentation
 * Runs at server startup for initialization tasks
 */

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateServerEnv } = await import('@/lib/env');

    console.log('🚀 Starting server initialization...');

    // Validate environment variables
    try {
      validateServerEnv();
      console.log('✅ Environment variables validated');
    } catch (error) {
      console.error('❌ Environment validation failed:', error);
      // In production, this will prevent server start
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }

    console.log('✅ Server initialization complete');
  }
}
