/**
 * Analytics System
 * Unified analytics interface for multiple providers
 * Supports Mixpanel, Google Analytics, and custom events
 */

// Types
export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  plan?: string;
  createdAt?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
  timestamp?: Date;
}

export interface PageView {
  path: string;
  title?: string;
  referrer?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  mixpanelToken?: string;
  gaTrackingId?: string;
  amplitudeApiKey?: string;
}

// Default configuration
const defaultConfig: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  amplitudeApiKey: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
};

// Analytics state
let config = defaultConfig;
let currentUser: AnalyticsUser | null = null;
const eventQueue: AnalyticsEvent[] = [];
let isInitialized = false;

/**
 * Initialize analytics with configuration
 */
export function initAnalytics(customConfig?: Partial<AnalyticsConfig>): void {
  config = { ...defaultConfig, ...customConfig };

  if (!config.enabled) {
    if (config.debug) {
      console.log('[Analytics] Disabled in non-production environment');
    }
    return;
  }

  // Initialize Mixpanel
  if (config.mixpanelToken && typeof window !== 'undefined') {
    initMixpanel(config.mixpanelToken);
  }

  // Initialize Google Analytics
  if (config.gaTrackingId && typeof window !== 'undefined') {
    initGoogleAnalytics(config.gaTrackingId);
  }

  isInitialized = true;

  // Flush queued events
  flushEventQueue();
}

/**
 * Initialize Mixpanel
 */
function initMixpanel(token: string): void {
  if (typeof window === 'undefined') return;

  // Dynamic import for client-side only
  import('mixpanel-browser').then((mixpanel) => {
    mixpanel.default.init(token, {
      debug: config.debug,
      track_pageview: true,
      persistence: 'localStorage',
    });
  }).catch((error) => {
    console.error('[Analytics] Failed to initialize Mixpanel:', error);
  });
}

/**
 * Initialize Google Analytics
 */
function initGoogleAnalytics(trackingId: string): void {
  if (typeof window === 'undefined') return;

  // Add gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', trackingId, {
    send_page_view: false, // We'll handle page views manually
  });

  // Expose gtag globally
  window.gtag = gtag;
}

/**
 * Identify user for analytics
 */
export function identifyUser(user: AnalyticsUser): void {
  currentUser = user;

  if (config.debug) {
    console.log('[Analytics] Identify user:', user.id);
  }

  if (!config.enabled || typeof window === 'undefined') return;

  // Mixpanel
  if (config.mixpanelToken) {
    import('mixpanel-browser').then((mixpanel) => {
      mixpanel.default.identify(user.id);
      mixpanel.default.people.set({
        $email: user.email,
        $name: user.name,
        plan: user.plan,
        created_at: user.createdAt,
      });
    }).catch(() => {});
  }

  // Google Analytics
  if (config.gaTrackingId && window.gtag) {
    window.gtag('set', 'user_properties', {
      user_id: user.id,
      plan: user.plan,
    });
  }
}

/**
 * Reset user (on logout)
 */
export function resetUser(): void {
  currentUser = null;

  if (!config.enabled || typeof window === 'undefined') return;

  // Mixpanel
  if (config.mixpanelToken) {
    import('mixpanel-browser').then((mixpanel) => {
      mixpanel.default.reset();
    }).catch(() => {});
  }
}

/**
 * Track custom event
 */
export function trackEvent(event: AnalyticsEvent): void {
  const fullEvent: AnalyticsEvent = {
    ...event,
    timestamp: event.timestamp || new Date(),
    properties: {
      ...event.properties,
      user_id: currentUser?.id,
      user_plan: currentUser?.plan,
    },
  };

  if (config.debug) {
    console.log('[Analytics] Track event:', fullEvent.name, fullEvent.properties);
  }

  if (!config.enabled) {
    // Queue events if analytics not initialized
    if (!isInitialized) {
      eventQueue.push(fullEvent);
    }
    return;
  }

  if (typeof window === 'undefined') return;

  // Mixpanel
  if (config.mixpanelToken) {
    import('mixpanel-browser').then((mixpanel) => {
      mixpanel.default.track(fullEvent.name, fullEvent.properties);
    }).catch(() => {});
  }

  // Google Analytics
  if (config.gaTrackingId && window.gtag) {
    window.gtag('event', fullEvent.name, {
      ...fullEvent.properties,
    });
  }
}

/**
 * Track page view
 */
export function trackPageView(pageView: PageView): void {
  if (config.debug) {
    console.log('[Analytics] Page view:', pageView.path);
  }

  if (!config.enabled || typeof window === 'undefined') return;

  // Mixpanel
  if (config.mixpanelToken) {
    import('mixpanel-browser').then((mixpanel) => {
      mixpanel.default.track('Page View', {
        path: pageView.path,
        title: pageView.title || document.title,
        referrer: pageView.referrer || document.referrer,
      });
    }).catch(() => {});
  }

  // Google Analytics
  if (config.gaTrackingId && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pageView.path,
      page_title: pageView.title || document.title,
      page_referrer: pageView.referrer || document.referrer,
    });
  }
}

/**
 * Flush queued events
 */
function flushEventQueue(): void {
  while (eventQueue.length > 0) {
    const event = eventQueue.shift();
    if (event) {
      trackEvent(event);
    }
  }
}

// Predefined event helpers
export const Analytics = {
  // User events
  userSignUp: (method: string) =>
    trackEvent({ name: 'User Sign Up', properties: { method } }),

  userLogin: (method: string) =>
    trackEvent({ name: 'User Login', properties: { method } }),

  userLogout: () => trackEvent({ name: 'User Logout' }),

  // Project events
  projectCreated: (projectId: string, type: string) =>
    trackEvent({ name: 'Project Created', properties: { project_id: projectId, type } }),

  projectDeleted: (projectId: string) =>
    trackEvent({ name: 'Project Deleted', properties: { project_id: projectId } }),

  // AI Feature events
  scriptGenerated: (projectId: string, wordCount: number, duration: number) =>
    trackEvent({
      name: 'Script Generated',
      properties: { project_id: projectId, word_count: wordCount, duration },
    }),

  thumbnailGenerated: (projectId: string, style: string) =>
    trackEvent({
      name: 'Thumbnail Generated',
      properties: { project_id: projectId, style },
    }),

  seoOptimized: (projectId: string, keywordCount: number) =>
    trackEvent({
      name: 'SEO Optimized',
      properties: { project_id: projectId, keyword_count: keywordCount },
    }),

  // Subscription events
  subscriptionStarted: (plan: string, price: number) =>
    trackEvent({
      name: 'Subscription Started',
      properties: { plan, price },
    }),

  subscriptionCancelled: (plan: string, reason?: string) =>
    trackEvent({
      name: 'Subscription Cancelled',
      properties: { plan, reason },
    }),

  subscriptionUpgraded: (fromPlan: string, toPlan: string) =>
    trackEvent({
      name: 'Subscription Upgraded',
      properties: { from_plan: fromPlan, to_plan: toPlan },
    }),

  // Feature usage
  featureUsed: (feature: string, context?: string) =>
    trackEvent({
      name: 'Feature Used',
      properties: { feature, context },
    }),

  // Error events
  errorOccurred: (errorCode: string, errorMessage: string, context?: string) =>
    trackEvent({
      name: 'Error Occurred',
      properties: { error_code: errorCode, error_message: errorMessage, context },
    }),

  // Export events
  contentExported: (type: string, format: string) =>
    trackEvent({
      name: 'Content Exported',
      properties: { type, format },
    }),
};

// Type declarations for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export default Analytics;
