import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Slideshow from '@/components/Slideshow';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import ShopCard from '@/components/ShopCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { slideData } from '@/data/mockData';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

const SkeletonCard = () => (
  <div className="rounded-lg bg-gray-200 animate-pulse aspect-square" />
);

const HomePage = () => {
  const { toast } = useToast();
  const { addItem } = useCart();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: businesses = [], isLoading: businessesLoading } = useBusinesses();

  const featuredProducts = products.slice(0, 4);
  const featuredShops = businesses.slice(0, 3);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: '/placeholder.svg',
      shopName: product.category?.name ?? '',
    });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full h-[50vh] md:h-[60vh]">
        <Slideshow slides={slideData} className="h-full" />
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
            <Link to="/marketplace" className="text-duwaz-brown hover:text-duwaz-brown/80 flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categoriesLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : categories.map((category) => (
                  <CategoryCard key={category.id} id={category.id} name={category.name} />
                ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Products</h2>
            <Link to="/marketplace" className="text-duwaz-brown hover:text-duwaz-brown/80 flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {productsLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={Number(product.price)}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* Student Businesses Section */}
      <section className="py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Student Businesses</h2>
            <Link to="/marketplace" className="text-duwaz-brown hover:text-duwaz-brown/80 flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {businessesLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
                ))
              : featuredShops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    id={shop.id}
                    name={shop.businessName}
                    logo={shop.logoUrl}
                    description={shop.description ?? ''}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-duwaz-brown text-white text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Student Business Today</h2>
          <p className="text-lg mb-8">
            Join the Duwaz marketplace and start selling your products to the student community.
          </p>
          <Button asChild size="lg" className="bg-white text-duwaz-brown hover:bg-white/90">
            <Link to="/create-shop">Create Your Shop</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
