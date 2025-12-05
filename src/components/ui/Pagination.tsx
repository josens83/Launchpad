/**
 * Pagination Component
 * Accessible, responsive pagination with multiple variants
 */

'use client';

import { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'simple' | 'minimal';
  className?: string;
  disabled?: boolean;
}

// Generate page range array
function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}

const DOTS = -1;

export function usePagination({
  totalPages,
  siblingCount = 1,
  currentPage,
}: {
  totalPages: number;
  siblingCount: number;
  currentPage: number;
}): (number | typeof DOTS)[] {
  return useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    // Case 1: Number of pages is less than page numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots to show, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    // Case 3: No right dots to show, but left dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [totalPages, siblingCount, currentPage]);
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  size = 'md',
  variant = 'default',
  className,
  disabled = false,
}: PaginationProps) {
  const paginationRange = usePagination({
    currentPage,
    totalPages,
    siblingCount,
  });

  const handlePageChange = useCallback(
    (page: number) => {
      if (!disabled && page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    },
    [disabled, totalPages, currentPage, onPageChange]
  );

  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  const sizeClasses = {
    sm: 'h-7 min-w-7 text-xs',
    md: 'h-9 min-w-9 text-sm',
    lg: 'h-11 min-w-11 text-base',
  };

  const baseButtonClass = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    sizeClasses[size]
  );

  const pageButtonClass = (isActive: boolean) =>
    cn(
      baseButtonClass,
      'px-3',
      isActive
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
    );

  const navButtonClass = cn(
    baseButtonClass,
    'px-2 bg-background border border-input hover:bg-accent hover:text-accent-foreground'
  );

  // Minimal variant - just numbers
  if (variant === 'minimal') {
    return (
      <nav
        role="navigation"
        aria-label="Pagination"
        className={cn('flex items-center justify-center gap-1', className)}
      >
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      </nav>
    );
  }

  // Simple variant - prev/next only
  if (variant === 'simple') {
    return (
      <nav
        role="navigation"
        aria-label="Pagination"
        className={cn('flex items-center justify-between gap-4', className)}
      >
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={navButtonClass}
          aria-label="Previous page"
        >
          ← Previous
        </button>
        <span className="text-sm text-muted-foreground">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={navButtonClass}
          aria-label="Next page"
        >
          Next →
        </button>
      </nav>
    );
  }

  // Default variant - full pagination
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {/* First page button */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={disabled || currentPage === 1}
          className={navButtonClass}
          aria-label="First page"
        >
          <ChevronDoubleLeftIcon className="h-4 w-4" />
        </button>
      )}

      {/* Previous button */}
      {showPrevNext && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={navButtonClass}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
      )}

      {/* Page numbers */}
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <span
              key={`dots-${index}`}
              className={cn(
                'inline-flex items-center justify-center px-2',
                sizeClasses[size]
              )}
            >
              ⋯
            </span>
          );
        }

        return (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            disabled={disabled}
            className={pageButtonClass(pageNumber === currentPage)}
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === currentPage ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Next button */}
      {showPrevNext && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={navButtonClass}
          aria-label="Next page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      )}

      {/* Last page button */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
          className={navButtonClass}
          aria-label="Last page"
        >
          <ChevronDoubleRightIcon className="h-4 w-4" />
        </button>
      )}
    </nav>
  );
}

// Icon components
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ChevronDoubleLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronDoubleRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 5l7 7-7 7M5 5l7 7-7 7"
      />
    </svg>
  );
}

export default Pagination;
