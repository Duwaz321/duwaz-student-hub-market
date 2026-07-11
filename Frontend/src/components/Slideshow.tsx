
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideData {
  image: string;
  title: string;
  description: string;
}

interface SlideshowProps {
  slides: SlideData[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
}

const Slideshow: React.FC<SlideshowProps> = ({ 
  slides,
  autoplay = true,
  interval = 5000,
  className 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, currentSlide, isTransitioning]);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg", className)}>
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={cn(
              "absolute top-0 left-0 w-full h-full transition-opacity duration-500",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            <img 
              src={slide.image} 
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">{slide.title}</h2>
              <p className="text-lg md:text-xl max-w-lg text-center">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button 
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button 
        onClick={goToNext}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all",
              index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
