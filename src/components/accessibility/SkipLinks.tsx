/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts for accessibility
 */

'use client';

import { useSkipLink } from '@/lib/accessibility/hooks';
import { cn } from '@/lib/utils';

interface SkipLink {
  id: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { id: 'main-content', label: 'Skip to main content' },
  { id: 'navigation', label: 'Skip to navigation' },
];

export function SkipLinks({ links = defaultLinks, className }: SkipLinksProps) {
  return (
    <nav
      aria-label="Skip links"
      className={cn('relative z-[100]', className)}
    >
      {links.map((link) => (
        <SkipLinkItem key={link.id} targetId={link.id} label={link.label} />
      ))}
    </nav>
  );
}

function SkipLinkItem({
  targetId,
  label,
}: {
  targetId: string;
  label: string;
}) {
  const { skipLinkProps } = useSkipLink(targetId);

  return (
    <a
      {...skipLinkProps}
      className={cn(
        // Visually hidden by default
        'absolute -top-full left-0 z-[100]',
        // Visible on focus
        'focus:top-4 focus:left-4',
        // Styling
        'rounded-md bg-primary px-4 py-2',
        'text-sm font-medium text-white',
        'shadow-lg ring-2 ring-white ring-offset-2 ring-offset-primary',
        'transition-all duration-200'
      )}
    >
      {label}
    </a>
  );
}

export default SkipLinks;
