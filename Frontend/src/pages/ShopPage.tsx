import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store, Settings, Package, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import { useBusiness } from '@/hooks/useBusinesses';
import { useBusinessProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';

const ShopPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { user } = useAuth();

  const shopId = Number(id);
  const { data: shop, isLoading: shopLoading, isError: shopError } = useBusiness(shopId);
  const { data: products = [], isLoading: productsLoading } = useBusinessProducts(shopId);

  const isOwner = !!user && shop?.student?.id === user.userId;

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id, name: product.name,
      price: Number(product.price),
      image: product.imageUrl ?? '/placeholder.svg',
      shopName: shop?.businessName ?? '',
      shopId: shop?.id,
    });
    toast({ title: 'Added to cart', description: `${product.name} added.`, duration: 2500 });
  };

  if (shopLoading) return (
    <div className="min-h-screen bg-background">
      <div className="h-52 bg-duwaz-cream/50 animate-pulse" />
      <div className="container mx-auto px-4 py-8 space-y-4">
        <div className="h-8 bg-duwaz-cream/50 animate-pulse rounded-2xl w-1/3" />
        <div className="h-4 bg-duwaz-cream/50 animate-pulse rounded-2xl w-1/2" />
      </div>
    </div>
  );

  if (shopError || !shop) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
      <h1 className="font-semibold text-xl mb-2">Shop not found</h1>
      <p className="text-muted-foreground mb-6 text-sm">This shop doesn't exist or has been removed.</p>
      <Link to="/marketplace" className="btn-primary text-sm inline-flex">Back to Marketplace</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative w-full h-52 md:h-64 bg-gradient-to-br from-duwaz-brown/80 to-[#2D1208] overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 60%, #C8936A 0%, transparent 50%)' }}
        />
        {/* Back link */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            to="/marketplace"
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="h-3.5 w-3.5" />Back
          </Link>
        </div>
        {/* Manage button */}
        {isOwner && (
          <div className="absolute top-4 right-4 z-10">
            <Link
              to={`/my-shop/${shop.id}`}
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
            >
              <Settings className="h-3.5 w-3.5" />Manage
            </Link>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 lg:px-6">
        {/* Shop header card */}
        <div className="relative -mt-10 mb-8">
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-border/40 bg-duwaz-cream/50 flex items-center justify-center shadow-sm -mt-10 sm:mt-0">
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt={shop.businessName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-duwaz-brown/50">{shop.businessName.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-semibold text-xl text-foreground leading-tight">{shop.businessName}</h1>
                  {shop.student && (
                    <p className="text-sm text-muted-foreground mt-0.5">by {shop.student.studentName}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                    <Package className="h-3.5 w-3.5" />
                    {products.length} product{products.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              {shop.description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                  {shop.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="pb-16">
          <h2 className="font-semibold text-lg text-foreground mb-5">
            Products
            {!productsLoading && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">({products.length})</span>
            )}
          </h2>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-duwaz-cream/50 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={Number(product.price)}
                  image={product.imageUrl}
                  shopName={shop.businessName}
                  shopId={shop.id}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-duwaz-cream/20 rounded-2xl border border-border/40">
              <Store className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-medium text-foreground mb-1">No products yet</p>
              <p className="text-sm text-muted-foreground">
                {isOwner ? 'Start adding products from your dashboard.' : 'Check back soon!'}
              </p>
              {isOwner && (
                <Link
                  to={`/my-shop/${shop.id}`}
                  className="mt-4 inline-flex btn-primary text-sm"
                >
                  Add Products
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
