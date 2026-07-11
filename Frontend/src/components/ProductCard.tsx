import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image?: string;
  shopName?: string;
  shopId?: string | number;
  onAddToCart?: () => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  image,
  shopName,
  shopId,
  onAddToCart,
  className,
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart();
  };

  return (
    <Link to={`/product/${id}`} className={cn("product-card block", className)}>
      <div className="aspect-square relative overflow-hidden">
        <img
          src={image ?? '/placeholder.svg'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-1">{name}</h3>
        {shopName && (
          <Link
            to={shopId ? `/shop/${shopId}` : '#'}
            className="text-sm text-muted-foreground hover:text-duwaz-brown transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {shopName}
          </Link>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="font-bold">R{Number(price).toFixed(2)}</p>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
