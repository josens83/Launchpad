/**
 * Optimized Image Component
 * Handles lazy loading, placeholders, error states, and responsive images
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  // Fallback options
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;

  // Loading states
  showSkeleton?: boolean;
  skeletonClassName?: string;

  // Blur placeholder
  blurDataURL?: string;
  generateBlur?: boolean;

  // Aspect ratio (for skeleton)
  aspectRatio?: number;

  // Callbacks
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;

  // Container styling
  containerClassName?: string;
}

// Simple blur data URL generator (1x1 pixel)
function generateBlurPlaceholder(color = '#e5e7eb'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="${color}" width="1" height="1"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Default fallback image (simple SVG placeholder)
const DEFAULT_FALLBACK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Cpath fill='%239ca3af' d='M50 35a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-25 40v5h50v-5c0-8.3-16.7-12.5-25-12.5S25 66.7 25 75z'/%3E%3C/svg%3E`;

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  fallbackComponent,
  showSkeleton = true,
  skeletonClassName,
  blurDataURL,
  generateBlur = true,
  aspectRatio,
  onLoadComplete,
  onError,
  containerClassName,
  className,
  fill,
  width,
  height,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [prevSrc, setPrevSrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes (React recommended pattern for derived state)
  if (src !== prevSrc) {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
    setPrevSrc(src);
  }

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);

    // Try fallback
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    }

    onError?.(new Error(`Failed to load image: ${src}`));
  }, [currentSrc, fallbackSrc, onError, src]);

  // Generate blur placeholder if needed
  const placeholder = blurDataURL || (generateBlur ? generateBlurPlaceholder() : undefined);

  // If error and fallback component provided
  if (hasError && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // Container style for aspect ratio
  const containerStyle = aspectRatio
    ? { paddingBottom: `${(1 / aspectRatio) * 100}%` }
    : undefined;

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        fill && 'h-full w-full',
        containerClassName
      )}
      style={containerStyle}
    >
      {/* Skeleton loader */}
      {showSkeleton && isLoading && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700',
            skeletonClassName
          )}
          aria-hidden="true"
        />
      )}

      {/* Image */}
      <Image
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        placeholder={placeholder ? 'blur' : undefined}
        blurDataURL={placeholder}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    </div>
  );
}

/**
 * Avatar Image Component
 * Specialized for user avatars with initials fallback
 */
interface AvatarImageProps extends Omit<OptimizedImageProps, 'fallbackComponent'> {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const avatarSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AvatarImage({
  src,
  alt,
  name,
  size = 'md',
  className,
  ...props
}: AvatarImageProps) {
  const dimension = avatarSizes[size];
  const initials = getInitials(name);

  const fallbackComponent = (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary/10 text-primary',
        'font-medium',
        className
      )}
      style={{ width: dimension, height: dimension }}
      aria-label={alt || name || 'Avatar'}
    >
      <span className="text-xs">{initials}</span>
    </div>
  );

  if (!src) {
    return fallbackComponent;
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt || name || 'Avatar'}
      width={dimension}
      height={dimension}
      fallbackComponent={fallbackComponent}
      showSkeleton={false}
      className={cn('rounded-full object-cover', className)}
      {...props}
    />
  );
}

/**
 * Thumbnail Image Component
 * Specialized for content thumbnails with aspect ratio
 */
interface ThumbnailImageProps extends Omit<OptimizedImageProps, 'aspectRatio'> {
  ratio?: '16:9' | '4:3' | '1:1' | '9:16';
}

const aspectRatios = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '9:16': 9 / 16,
};

export function ThumbnailImage({
  src,
  alt,
  ratio = '16:9',
  className,
  containerClassName,
  ...props
}: ThumbnailImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      aspectRatio={aspectRatios[ratio]}
      containerClassName={cn('rounded-lg', containerClassName)}
      className={cn('object-cover', className)}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      {...props}
    />
  );
}

export default OptimizedImage;
