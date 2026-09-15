import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageWithFallback from './ImageWithFallback';

interface ShopCardProps {
  id: string | number;
  name: string;
  logo?: string | null;
  productCount?: number;
  description: string;
  isOpen?: boolean;
  operatingHours?: string;
  className?: string;
}

const ShopCard: React.FC<ShopCardProps> = ({
  id, name, logo, productCount, description, isOpen = true, operatingHours, className,
}) => {
  return (
    <Link
      to={`/shop/${id}`}
      className={cn(
        'group flex gap-4 items-start p-5 rounded-2xl bg-card text-card-foreground border border-border/50',
        'transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-duwaz-brown/30',
        !isOpen && 'opacity-60',
        className
      )}
    >
      {/* Logo */}
      <div className="relative w-14 h-14 flex-shrink-0">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-duwaz-cream/50 border border-border/50 flex items-center justify-center">
          {logo ? (
            <ImageWithFallback src={logo} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-duwaz-brown/50">{name.charAt(0)}</span>
          )}
        </div>
        {/* Open / Closed dot */}
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card',
            isOpen ? 'bg-green-500' : 'bg-gray-400'
          )}
          title={isOpen ? 'Open now' : 'Closed'}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-1">{name}</h3>
            {/* Open / Closed label */}
            <span
              className={cn(
                'inline-block mt-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full',
                isOpen
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {isOpen ? '● Open' : '● Closed'}
            </span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" />
        </div>
        {productCount !== undefined && (
          <span className="text-xs text-duwaz-brown font-medium">{productCount} products</span>
        )}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{description}</p>
        {operatingHours && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">🕐 {operatingHours}</p>
        )}
      </div>
    </Link>
  );
};

export default ShopCard;
