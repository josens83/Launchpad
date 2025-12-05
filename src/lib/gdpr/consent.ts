/**
 * GDPR Consent Management
 * Handle user consent for data processing
 */

// Consent categories
export type ConsentCategory =
  | 'necessary'
  | 'analytics'
  | 'marketing'
  | 'preferences';

export interface ConsentState {
  necessary: boolean; // Always true - required for app functionality
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: string;
  version: string;
}

export interface ConsentConfig {
  necessary: {
    title: string;
    description: string;
    required: true;
  };
  analytics: {
    title: string;
    description: string;
    required: false;
  };
  marketing: {
    title: string;
    description: string;
    required: false;
  };
  preferences: {
    title: string;
    description: string;
    required: false;
  };
}

// Consent configuration with descriptions
export const CONSENT_CONFIG: ConsentConfig = {
  necessary: {
    title: 'Essential Cookies',
    description:
      'These cookies are required for the website to function properly. They enable basic features like page navigation, secure areas access, and authentication.',
    required: true,
  },
  analytics: {
    title: 'Analytics Cookies',
    description:
      'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our services.',
    required: false,
  },
  marketing: {
    title: 'Marketing Cookies',
    description:
      'These cookies are used to track visitors across websites to display relevant advertisements and measure the effectiveness of advertising campaigns.',
    required: false,
  },
  preferences: {
    title: 'Preference Cookies',
    description:
      'These cookies remember your preferences and settings, such as language preferences and display options, to enhance your experience.',
    required: false,
  },
};

const CONSENT_STORAGE_KEY = 'gdpr-consent';
const CONSENT_VERSION = '1.0.0';

/**
 * Get current consent state from storage
 */
export function getConsentState(): ConsentState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const consent = JSON.parse(stored) as ConsentState;

    // Check if consent version matches
    if (consent.version !== CONSENT_VERSION) {
      // Version mismatch - need to re-consent
      return null;
    }

    return consent;
  } catch {
    return null;
  }
}

/**
 * Save consent state to storage
 */
export function saveConsentState(consent: Omit<ConsentState, 'timestamp' | 'version'>): void {
  if (typeof window === 'undefined') return;

  const fullConsent: ConsentState = {
    ...consent,
    necessary: true, // Always true
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fullConsent));

  // Dispatch event for other parts of the app to react
  window.dispatchEvent(
    new CustomEvent('consent-updated', { detail: fullConsent })
  );
}

/**
 * Check if user has given consent
 */
export function hasConsent(): boolean {
  return getConsentState() !== null;
}

/**
 * Check if specific category has consent
 */
export function hasConsentFor(category: ConsentCategory): boolean {
  const consent = getConsentState();
  if (!consent) return false;
  return consent[category] === true;
}

/**
 * Accept all consent categories
 */
export function acceptAll(): void {
  saveConsentState({
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  });
}

/**
 * Accept only necessary cookies
 */
export function acceptNecessaryOnly(): void {
  saveConsentState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
}

/**
 * Withdraw all consent (except necessary)
 */
export function withdrawConsent(): void {
  saveConsentState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Clear non-essential cookies
  clearNonEssentialCookies();
}

/**
 * Clear non-essential cookies
 */
function clearNonEssentialCookies(): void {
  if (typeof document === 'undefined') return;

  // Get all cookies
  const cookies = document.cookie.split(';');

  // Essential cookie names that should not be cleared
  const essentialCookies = [
    'sb-', // Supabase auth
    '__Secure-',
    '__Host-',
    CONSENT_STORAGE_KEY,
  ];

  cookies.forEach((cookie) => {
    const [name] = cookie.split('=');
    const trimmedName = name.trim();

    // Check if it's an essential cookie
    const isEssential = essentialCookies.some((essential) =>
      trimmedName.startsWith(essential)
    );

    if (!isEssential) {
      // Clear the cookie
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });

  // Clear localStorage items (except essential ones)
  const essentialStorage = ['user-storage', CONSENT_STORAGE_KEY];
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !essentialStorage.includes(key)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * Hook for listening to consent changes
 */
export function onConsentChange(
  callback: (consent: ConsentState) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ConsentState>;
    callback(customEvent.detail);
  };

  window.addEventListener('consent-updated', handler);
  return () => window.removeEventListener('consent-updated', handler);
}
