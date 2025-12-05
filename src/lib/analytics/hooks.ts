/**
 * Analytics React Hooks
 * Easy integration with React components
 */

'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  initAnalytics,
  identifyUser,
  resetUser,
  trackEvent,
  trackPageView,
  Analytics,
  type AnalyticsUser,
  type AnalyticsEvent,
} from './index';

/**
 * Initialize analytics on app mount
 */
export function useAnalyticsInit(): void {
  useEffect(() => {
    initAnalytics();
  }, []);
}

/**
 * Track page views automatically
 */
export function usePageTracking(): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      trackPageView({
        path: url,
        title: document.title,
      });
    }
  }, [pathname, searchParams]);
}

/**
 * Identify user for analytics
 */
export function useIdentifyUser(user: AnalyticsUser | null): void {
  useEffect(() => {
    if (user) {
      identifyUser(user);
    } else {
      resetUser();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Track events with stable callback
 */
export function useTrackEvent(): (event: AnalyticsEvent) => void {
  return useCallback((event: AnalyticsEvent) => {
    trackEvent(event);
  }, []);
}

/**
 * Track feature usage
 */
export function useFeatureTracking(featureName: string): {
  trackUsage: (context?: string) => void;
  trackStart: () => void;
  trackComplete: () => void;
  trackError: (error: string) => void;
} {
  const trackUsage = useCallback(
    (context?: string) => {
      Analytics.featureUsed(featureName, context);
    },
    [featureName]
  );

  const trackStart = useCallback(() => {
    trackEvent({
      name: `${featureName} Started`,
    });
  }, [featureName]);

  const trackComplete = useCallback(() => {
    trackEvent({
      name: `${featureName} Completed`,
    });
  }, [featureName]);

  const trackError = useCallback(
    (error: string) => {
      trackEvent({
        name: `${featureName} Error`,
        properties: { error },
      });
    },
    [featureName]
  );

  return { trackUsage, trackStart, trackComplete, trackError };
}

/**
 * Track time spent on a component/feature
 */
export function useTimeTracking(featureName: string): void {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent({
        name: 'Time Spent',
        properties: {
          feature: featureName,
          duration_seconds: timeSpent,
        },
      });
    };
  }, [featureName]);
}

/**
 * Track form interactions
 */
export function useFormTracking(formName: string): {
  trackFieldFocus: (fieldName: string) => void;
  trackFieldBlur: (fieldName: string, hasValue: boolean) => void;
  trackSubmit: (success: boolean, errorMessage?: string) => void;
  trackAbandonment: () => void;
} {
  const trackFieldFocus = useCallback(
    (fieldName: string) => {
      trackEvent({
        name: 'Form Field Focus',
        properties: { form: formName, field: fieldName },
      });
    },
    [formName]
  );

  const trackFieldBlur = useCallback(
    (fieldName: string, hasValue: boolean) => {
      trackEvent({
        name: 'Form Field Blur',
        properties: { form: formName, field: fieldName, has_value: hasValue },
      });
    },
    [formName]
  );

  const trackSubmit = useCallback(
    (success: boolean, errorMessage?: string) => {
      trackEvent({
        name: success ? 'Form Submit Success' : 'Form Submit Error',
        properties: {
          form: formName,
          error: errorMessage,
        },
      });
    },
    [formName]
  );

  const trackAbandonment = useCallback(() => {
    trackEvent({
      name: 'Form Abandoned',
      properties: { form: formName },
    });
  }, [formName]);

  return { trackFieldFocus, trackFieldBlur, trackSubmit, trackAbandonment };
}

/**
 * Track button/CTA clicks
 */
export function useClickTracking(): (
  elementName: string,
  context?: Record<string, string | number | boolean>
) => void {
  return useCallback(
    (elementName: string, context?: Record<string, string | number | boolean>) => {
      trackEvent({
        name: 'Element Clicked',
        properties: {
          element: elementName,
          ...context,
        },
      });
    },
    []
  );
}

/**
 * Track scroll depth
 */
export function useScrollTracking(thresholds: number[] = [25, 50, 75, 100]): void {
  useEffect(() => {
    const trackedThresholds = new Set<number>();

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = Math.round((window.scrollY / scrollHeight) * 100);

      thresholds.forEach((threshold) => {
        if (scrollProgress >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          trackEvent({
            name: 'Scroll Depth',
            properties: {
              depth: threshold,
              path: window.location.pathname,
            },
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [thresholds]);
}
