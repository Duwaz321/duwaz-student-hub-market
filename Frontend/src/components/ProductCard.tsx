import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageWithFallback from './ImageWithFallback';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  shopName?: string;
  shopId?: string | number;
  onAddToCart?: () => void;
  className?: string;
  badge?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id, name, price, image, shopName, shopId, onAddToCart, className, badge,
}) => {
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      setAdding(true);
      onAddToCart();
      setTimeout(() => setAdding(false), 600);
    }
  };

  const handleShopClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (shopId) navigate(`/shop/${shopId}`);
  };

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWished(v => !v);
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/product/${id}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/product/${id}`)}
      className={cn(
        'product-card group relative bg-card text-card-foreground',
        className
      )}
    >
      {/* Image container */}
      <div className="aspect-square relative overflow-hidden bg-duwaz-cream/40 rounded-t-2xl">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge */}
        {badge && (
          <span className="absolute top-3 left-3 bg-duwaz-brown text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {badge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          aria-label="Add to wishlist"
          onClick={handleWish}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-200',
            'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0',
            wished
              ? 'bg-red-500 text-white opacity-100 translate-y-0'
              : 'bg-white/90 text-muted-foreground hover:text-red-500 hover:bg-white'
          )}
        >
          <Heart className={cn('h-3.5 w-3.5', wished && 'fill-current')} />
        </button>

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200',
              adding
                ? 'bg-green-600 text-white'
                : 'bg-duwaz-brown/95 text-white hover:bg-duwaz-brown'
            )}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {adding ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 pt-3">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 leading-snug mb-0.5">
          {name}
        </h3>
        {shopName && (
          <span
            role="link"
            tabIndex={0}
            onClick={handleShopClick}
            onKeyDown={e => e.key === 'Enter' && handleShopClick(e as any)}
            className="text-xs text-muted-foreground hover:text-duwaz-brown transition-colors cursor-pointer line-clamp-1"
          >
            {shopName}
          </span>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="font-bold text-sm text-foreground">
            R{Number(price).toFixed(2)}
          </p>
          {/* Mobile add button (always visible on mobile, hidden on desktop where hover works) */}
          <button
            aria-label="Add to cart"
            onClick={handleAddToCart}
            className="md:hidden p-1.5 rounded-full bg-duwaz-brown text-white shadow-sm active:scale-90 transition-transform"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
