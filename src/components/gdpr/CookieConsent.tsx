/**
 * Cookie Consent Banner Component
 * GDPR-compliant cookie consent UI
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getConsentState,
  saveConsentState,
  acceptAll,
  acceptNecessaryOnly,
  CONSENT_CONFIG,
  type ConsentState,
  type ConsentCategory,
} from '@/lib/gdpr/consent';
import { cn } from '@/lib/utils';

interface CookieConsentProps {
  className?: string;
}

export function CookieConsent({ className }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if consent has been given
    const consent = getConsentState();
    if (!consent) {
      // Small delay to prevent flash
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
    setIsVisible(false);
  }, []);

  const handleAcceptNecessary = useCallback(() => {
    acceptNecessaryOnly();
    setIsVisible(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    saveConsentState(preferences);
    setIsVisible(false);
  }, [preferences]);

  const togglePreference = useCallback((category: ConsentCategory) => {
    if (category === 'necessary') return; // Can't toggle necessary
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900',
        'border-t border-gray-200 dark:border-gray-800 shadow-lg',
        'animate-in slide-in-from-bottom duration-300',
        className
      )}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {!showDetails ? (
          // Simple view
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h2
                id="cookie-consent-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                We value your privacy
              </h2>
              <p
                id="cookie-consent-description"
                className="mt-1 text-sm text-gray-600 dark:text-gray-400"
              >
                We use cookies to enhance your browsing experience, serve
                personalized content, and analyze our traffic. By clicking
                &ldquo;Accept All&rdquo;, you consent to our use of cookies.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowDetails(true)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Customize
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Necessary Only
              </button>
              <button
                onClick={handleAcceptAll}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Detailed view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                id="cookie-consent-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                Cookie Preferences
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close details"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.entries(CONSENT_CONFIG) as [ConsentCategory, typeof CONSENT_CONFIG['necessary']][]).map(
                ([category, config]) => (
                  <div
                    key={category}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {config.title}
                      </h3>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={preferences[category]}
                          onChange={() => togglePreference(category)}
                          disabled={config.required}
                          aria-label={`Toggle ${config.title}`}
                        />
                        <div
                          className={cn(
                            'h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-primary',
                            'after:absolute after:left-[2px] after:top-[2px]',
                            'after:h-5 after:w-5 after:rounded-full after:bg-white',
                            'after:transition-all peer-checked:after:translate-x-full',
                            config.required && 'cursor-not-allowed opacity-60'
                          )}
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {config.description}
                    </p>
                    {config.required && (
                      <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        Required
                      </span>
                    )}
                  </div>
                )
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleAcceptNecessary}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Necessary Only
              </button>
              <button
                onClick={handleSavePreferences}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CookieConsent;
