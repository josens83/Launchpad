/**
 * Accessibility Hooks
 * Custom hooks for WCAG 2.1 compliance
 */

'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type RefObject,
  type KeyboardEvent,
} from 'react';

/**
 * Focus trap hook for modals and dialogs
 * Traps focus within a container for keyboard navigation
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean = true
): RefObject<T | null> {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Store the previously focused element
    const previouslyFocused = document.activeElement as HTMLElement;

    // Focus the first element
    firstElement?.focus();

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus when trap is deactivated
      previouslyFocused?.focus();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Skip link hook for main content navigation
 */
export function useSkipLink(targetId: string = 'main-content'): {
  skipLinkProps: {
    href: string;
    className: string;
    onClick: (e: React.MouseEvent) => void;
  };
} {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
        target.removeAttribute('tabindex');
      }
    },
    [targetId]
  );

  return {
    skipLinkProps: {
      href: `#${targetId}`,
      className:
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary focus:rounded-md focus:shadow-lg',
      onClick: handleClick,
    },
  };
}

/**
 * Announce to screen readers hook
 * Creates an ARIA live region for dynamic announcements
 */
export function useAnnounce(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
} {
  const announceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region element
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    announceRef.current = liveRegion;

    return () => {
      liveRegion.remove();
    };
  }, []);

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!announceRef.current) return;

      announceRef.current.setAttribute('aria-live', priority);
      // Clear and set message to ensure announcement
      announceRef.current.textContent = '';
      requestAnimationFrame(() => {
        if (announceRef.current) {
          announceRef.current.textContent = message;
        }
      });
    },
    []
  );

  return { announce };
}

/**
 * Keyboard navigation hook for lists/grids
 */
export function useArrowNavigation<T extends HTMLElement = HTMLElement>(
  itemCount: number,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
): {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  getItemProps: (index: number) => {
    tabIndex: number;
    'aria-selected': boolean;
    onKeyDown: (e: KeyboardEvent<T>) => void;
    onClick: () => void;
  };
} {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const navigate = useCallback(
    (direction: 'next' | 'prev') => {
      setActiveIndex((current) => {
        let next = direction === 'next' ? current + 1 : current - 1;

        if (loop) {
          if (next < 0) next = itemCount - 1;
          if (next >= itemCount) next = 0;
        } else {
          next = Math.max(0, Math.min(itemCount - 1, next));
        }

        return next;
      });
    },
    [itemCount, loop]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<T>) => {
      const isVertical = orientation === 'vertical' || orientation === 'both';
      const isHorizontal =
        orientation === 'horizontal' || orientation === 'both';

      switch (e.key) {
        case 'ArrowDown':
          if (isVertical) {
            e.preventDefault();
            navigate('next');
          }
          break;
        case 'ArrowUp':
          if (isVertical) {
            e.preventDefault();
            navigate('prev');
          }
          break;
        case 'ArrowRight':
          if (isHorizontal) {
            e.preventDefault();
            navigate('next');
          }
          break;
        case 'ArrowLeft':
          if (isHorizontal) {
            e.preventDefault();
            navigate('prev');
          }
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(itemCount - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.(activeIndex);
          break;
      }
    },
    [orientation, navigate, itemCount, activeIndex, onSelect]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      'aria-selected': index === activeIndex,
      onKeyDown: handleKeyDown,
      onClick: () => {
        setActiveIndex(index);
        onSelect?.(index);
      },
    }),
    [activeIndex, handleKeyDown, onSelect]
  );

  return { activeIndex, setActiveIndex, getItemProps };
}

/**
 * Reduced motion preference hook
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * High contrast preference hook
 */
export function useHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersHighContrast;
}

/**
 * Focus visible hook (for custom focus styling)
 */
export function useFocusVisible(): boolean {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isFocusVisible;
}
