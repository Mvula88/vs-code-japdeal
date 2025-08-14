import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    
    // Edge runtime specific
    transportOptions: {
      // Increase timeout for edge runtime
      fetchOptions: {
        keepalive: true,
      },
    },
    
    beforeSend(event) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      return event;
    },
  });
}