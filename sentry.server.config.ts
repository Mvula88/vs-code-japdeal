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
    
    // Server-specific options
    autoSessionTracking: true,
    
    integrations: [
      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
    
    // Filtering
    ignoreErrors: [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'Failed to fetch',
    ],
    
    beforeSend(event, hint) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry Server Event:', event, hint);
        return null;
      }
      
      // Filter out non-critical database errors
      if (event.exception?.values?.[0]?.value?.includes('duplicate key')) {
        return null;
      }
      
      return event;
    },
  });
}