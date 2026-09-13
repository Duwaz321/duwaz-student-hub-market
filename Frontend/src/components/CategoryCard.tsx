import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  id: string | number;
  name: string;
  images?: string[];   // product images for this category
  image?: string;      // fallback single image (legacy)
  productCount?: number;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, images, image, productCount, className }) => {
  // Merge images array with legacy single image, dedupe, drop empties
  const slides = [
    ...(images ?? []),
    ...(image && !(images ?? []).includes(image) ? [image] : []),
  ].filter(Boolean) as string[];

  const hasMultiple = slides.length > 1;
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  const advance = useCallback(() => {
    if (!hasMultiple) return;
    setFading(true);
    setTimeout(() => {
      setActive(i => (i + 1) % slides.length);
      setFading(false);
    }, 300);
  }, [hasMultiple, slides.length]);

  useEffect(() => {
    if (!hasMultiple) return;
    const t = setInterval(advance, 2800);
    return () => clearInterval(t);
  }, [advance, hasMultiple]);

  const src = slides[active] ?? '/placeholder.svg';

  return (
    <Link
      to={`/marketplace?category=${id}`}
      className={cn(
        'group relative block rounded-2xl overflow-hidden aspect-square',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        className
      )}
    >
      {/* Background image — cross-fades between product images */}
      <img
        key={active}
        src={src}
        alt={name}
        onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        className={cn(
          'w-full h-full object-cover transition-all duration-500 group-hover:scale-105',
          fading ? 'opacity-0' : 'opacity-100'
        )}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

      {/* Slide dots — only shown when there are multiple images */}
      {hasMultiple && (
        <div className="absolute top-2.5 right-3 flex gap-1 z-10">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                'block rounded-full transition-all duration-300',
                i === active ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
              )}
            />
          ))}
        </div>
      )}

      {/* Text */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h3 className="text-white font-semibold text-base leading-tight line-clamp-2">{name}</h3>
        {productCount !== undefined && (
          <p className="text-white/70 text-xs mt-0.5">{productCount} product{productCount !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Hover accent border */}
      <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-duwaz-brown/40 transition-all duration-300 pointer-events-none" />
    </Link>
  );
};

export default CategoryCard;
