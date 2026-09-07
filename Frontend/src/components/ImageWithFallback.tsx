import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  className?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src, alt, fallback = '/placeholder.svg', className,
}) => {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const resolved = (!src || errored) ? fallback : src;
  const isFallback = resolved === fallback;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!loaded && (
        <div className="absolute inset-0 bg-duwaz-cream/50 animate-pulse" />
      )}
      <img
        src={resolved}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => { setErrored(true); setLoaded(true); }}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          isFallback ? 'object-contain p-4 opacity-40' : 'object-cover'
        )}
      />
    </div>
  );
};

export default ImageWithFallback;
