import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  id: string | number;
  name: string;
  image?: string;
  productCount?: number;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, image, productCount, className }) => {
  return (
    <Link
      to={`/marketplace?category=${id}`}
      className={cn(
        'group relative block rounded-2xl overflow-hidden aspect-square',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        className
      )}
    >
      {/* Background image */}
      <img
        src={image ?? '/placeholder.svg'}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

      {/* Text */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h3 className="text-white font-semibold text-base leading-tight line-clamp-2">{name}</h3>
        {productCount !== undefined && (
          <p className="text-white/70 text-xs mt-0.5">{productCount} products</p>
        )}
      </div>

      {/* Hover accent border */}
      <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-duwaz-brown/40 transition-all duration-300 pointer-events-none" />
    </Link>
  );
};

export default CategoryCard;
