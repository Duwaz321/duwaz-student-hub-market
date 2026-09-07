import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideData {
  image: string;
  title: string;
  description: string;
  linkTo?: string;
}

interface SlideshowProps {
  slides: SlideData[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
}

const Slideshow: React.FC<SlideshowProps> = ({ slides, autoplay = true, interval = 4500, className }) => {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const go = (next: number) => {
    if (transitioning || slides.length < 2) return;
    setTransitioning(true);
    setCurrent(next);
    setTimeout(() => setTransitioning(false), 600);
  };

  const goNext = () => go((current + 1) % slides.length);
  const goPrev = () => go((current - 1 + slides.length) % slides.length);

  useEffect(() => { setCurrent(0); }, [slides.length]);

  useEffect(() => {
    if (!autoplay || slides.length < 2) return;
    const t = setInterval(goNext, interval);
    return () => clearInterval(t);
  }, [autoplay, interval, current, transitioning, slides.length]);

  if (!slides.length) return <div className={cn('bg-duwaz-cream/50 animate-pulse', className)} />;

  return (
    <div className={cn('relative w-full overflow-hidden bg-black', className)}>
      {slides.map((slide, i) => {
        const isActive = i === current;
        const inner = (
          <div className={cn(
            'absolute inset-0 transition-opacity duration-600',
            isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )}>
            {/* Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-6 text-center text-white">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-2 font-medium">{slide.description}</p>
              <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight max-w-2xl drop-shadow-md line-clamp-2">
                {slide.title}
              </h2>
              {slide.linkTo && (
                <span className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/15 border border-white/30 text-sm font-medium backdrop-blur-sm hover:bg-white/25 transition-colors">
                  View Product →
                </span>
              )}
            </div>
          </div>
        );

        return slide.linkTo ? (
          <Link key={i} to={slide.linkTo} className="block absolute inset-0 z-10 cursor-pointer">
            {inner}
          </Link>
        ) : (
          <div key={i}>{inner}</div>
        );
      })}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === current ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Slideshow;
