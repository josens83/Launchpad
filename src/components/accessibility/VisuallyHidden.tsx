/**
 * Visually Hidden Component
 * Hides content visually while keeping it accessible to screen readers
 */

import { cn } from '@/lib/utils';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  focusable?: boolean;
}

/**
 * Visually hide content while keeping it accessible to screen readers
 * Use this for:
 * - Icon-only buttons (add descriptive text)
 * - Form labels that are visually represented by placeholders
 * - Section headers for screen reader navigation
 */
export function VisuallyHidden({
  children,
  as: Component = 'span',
  className,
  focusable = false,
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        // Standard visually hidden styles (sr-only)
        'absolute h-px w-px overflow-hidden whitespace-nowrap',
        'border-0 p-0',
        '[clip:rect(0,0,0,0)]',
        // Allow focus if focusable
        focusable && 'focus:static focus:h-auto focus:w-auto focus:clip-auto',
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * Announcer component for dynamic content changes
 * Content announced to screen readers via aria-live region
 */
interface AnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}

export function Announcer({
  message,
  priority = 'polite',
  atomic = true,
}: AnnouncerProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {message}
    </div>
  );
}

export default VisuallyHidden;
