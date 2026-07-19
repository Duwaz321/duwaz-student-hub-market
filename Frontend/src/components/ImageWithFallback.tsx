import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  className?: string;
}

/**
 * Renders an image with a graceful fallback if the src is missing or fails to load.
 * Uses lazy loading for performance.
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallback = '/placeholder.svg',
  className,
}) => {
  const [errored, setErrored] = useState(false);
  const resolved = (!src || errored) ? fallback : src;

  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={cn('object-cover', className)}
    />
  );
};

export default ImageWithFallback;
