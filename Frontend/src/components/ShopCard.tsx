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
  className?: string;
}

const ShopCard: React.FC<ShopCardProps> = ({ id, name, logo, productCount, description, className }) => {
  return (
    <Link
      to={`/shop/${id}`}
      className={cn(
        'group flex gap-4 items-start p-5 rounded-2xl bg-card text-card-foreground border border-border/50',
        'transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-duwaz-brown/30',
        className
      )}
    >
      {/* Logo */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-duwaz-cream/50 border border-border/50 flex items-center justify-center">
        {logo ? (
          <ImageWithFallback src={logo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold text-duwaz-brown/50">{name.charAt(0)}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-1">{name}</h3>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" />
        </div>
        {productCount !== undefined && (
          <span className="text-xs text-duwaz-brown font-medium">{productCount} products</span>
        )}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
};

export default ShopCard;
