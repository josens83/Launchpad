/**
 * Focus Trap Component
 * Traps focus within a container for modal dialogs and overlays
 */

'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  returnFocus?: boolean;
  initialFocus?: string;
}

export function FocusTrap({
  children,
  active = true,
  returnFocus = true,
  initialFocus,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    // Store currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), ' +
          '[href], ' +
          'input:not([disabled]):not([type="hidden"]), ' +
          'select:not([disabled]), ' +
          'textarea:not([disabled]), ' +
          '[tabindex]:not([tabindex="-1"]):not([disabled])'
      );
    };

    // Focus initial element or first focusable
    const focusableElements = getFocusableElements();
    if (initialFocus) {
      const initialElement = container.querySelector<HTMLElement>(initialFocus);
      initialElement?.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: go to last element if on first
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: go to first element if on last
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Handle focus leaving the container
    const handleFocusOut = (e: FocusEvent) => {
      if (!container.contains(e.relatedTarget as Node)) {
        // Focus is leaving the container, prevent it
        const elements = getFocusableElements();
        if (elements.length > 0) {
          elements[0].focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusout', handleFocusOut);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusout', handleFocusOut);

      // Return focus to previous element
      if (returnFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, initialFocus, returnFocus]);

  return (
    <div ref={containerRef} data-focus-trap={active ? 'active' : 'inactive'}>
      {children}
    </div>
  );
}

export default FocusTrap;
