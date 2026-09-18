import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Star, Users } from 'lucide-react';
import Slideshow from '@/components/Slideshow';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import ShopCard from '@/components/ShopCard';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

const SkeletonCard = () => (
  <div className="rounded-2xl bg-duwaz-cream/50 animate-pulse aspect-square" />
);

const SkeletonShop = () => (
  <div className="rounded-2xl bg-duwaz-cream/50 animate-pulse h-24" />
);

const SectionHeader = ({
  label, heading, sub, href,
}: { label?: string; heading: string; sub?: string; href?: string }) => (
  <div className="text-center mb-10">
    {label && <p className="section-label mb-2">{label}</p>}
    <h2 className="section-heading">{heading}</h2>
    {sub && <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">{sub}</p>}
    {href && (
      <Link
        to={href}
        className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-duwaz-brown hover:text-duwaz-brown/80 transition-colors group"
      >
        View all
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
);

const TrustPill = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-card border border-border/50 shadow-sm">
    <Icon className="h-4 w-4 text-duwaz-brown flex-shrink-0" />
    <span className="text-sm font-medium text-foreground/80 whitespace-nowrap">{text}</span>
  </div>
);

const HomePage = () => {
  const { toast } = useToast();
  const { addItem } = useCart();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: businesses = [], isLoading: businessesLoading } = useBusinesses();

  // Build a map of categoryId → product count so we can filter empty categories
  // Note: API returns categoryId (not category.id), so we use that directly
  const productCountByCategory = products.reduce<Record<number, number>>((acc, p: any) => {
    const catId = p.categoryId || p.category?.id;
    if (catId) {
      acc[catId] = (acc[catId] ?? 0) + 1;
    }
    return acc;
  }, {});

  // Collect up to 4 product images per category for the card slideshow
  const imagesByCategory = products.reduce<Record<number, string[]>>((acc, p: any) => {
    const catId = p.categoryId || p.category?.id;
    if (catId && p.imageUrl) {
      const list = acc[catId] ?? [];
      if (list.length < 4) list.push(p.imageUrl);
      acc[catId] = list;
    }
    return acc;
  }, {});

  // Only show categories that have at least one product
  const activeCategories = categories.filter(cat => (productCountByCategory[cat.id] ?? 0) > 0);

  // Shuffle products so they're mixed from different categories (not grouped by category)
  // This prevents showing all items from the same category in a row
  const shuffledProducts = (() => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  })();
  
  const featuredProducts = shuffledProducts;
  const featuredShops = businesses.slice(0, 4);
  
  // DEBUG: Log products to help diagnose why they're not appearing
  console.log('[HomePage] Total products loaded:', products.length);
  console.log('[HomePage] Products by category:', productCountByCategory);
  console.log('[HomePage] Active categories:', activeCategories.length);
  console.log('[HomePage] Sample product:', products[0]);

  // Build slides from products with images
  const slides = (() => {
    const withImages = products.filter(p => p.imageUrl);
    const pool = (withImages.length >= 3 ? withImages : products).slice(0, 6);
    if (pool.length === 0) {
      return [{ image: '/placeholder.svg', title: 'Welcome to Duwaz', description: 'Student marketplace — buy and sell on campus' }];
    }
    return pool.map(p => ({
      image: p.imageUrl ?? '/placeholder.svg',
      title: p.name,
      description: p.business?.businessName
        ? `By ${p.business.businessName} · R${Number(p.price).toFixed(2)}`
        : `R${Number(p.price).toFixed(2)}`,
      linkTo: `/product/${p.id}`,
    }));
  })();

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.imageUrl ?? '/placeholder.svg',
      shopName: product.businessName ?? product.business?.businessName ?? product.categoryName ?? product.category?.name ?? '',
      shopId: product.businessId ?? product.business?.id,
    });
    toast({ title: 'Added to cart', description: `${product.name} added.`, duration: 2500 });
  };

  return (
    <div className="flex flex-col">

      {/* ── Hero Slideshow ── */}
      <section className="w-full h-[55vh] md:h-[65vh] lg:h-[70vh]">
        <Slideshow slides={slides} className="h-full rounded-none" />
      </section>

      {/* ── Trust Pills ── */}
      <section className="bg-duwaz-cream/40 border-y border-border/40 py-4">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide justify-start md:justify-center">
            <TrustPill icon={ShieldCheck} text="Verified Student Sellers" />
            <TrustPill icon={Truck} text="Campus Delivery" />
            <TrustPill icon={Star} text="Rated by Students" />
            <TrustPill icon={Users} text="Growing Community" />
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 px-4 lg:px-6 bg-background">
        <div className="container mx-auto">
          <SectionHeader
            label="Browse"
            heading="Shop by Category"
            sub="Find exactly what you're looking for"
            href="/marketplace"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {categoriesLoading || productsLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : activeCategories.length === 0
              ? (
                <p className="col-span-full text-center text-sm text-muted-foreground py-8">
                  No categories with products yet.
                </p>
              )
              : activeCategories.slice(0, 8).map(cat => (
                  <CategoryCard
                    key={cat.id}
                    id={cat.id}
                    name={cat.name}
                    images={imagesByCategory[cat.id] ?? []}
                    productCount={productCountByCategory[cat.id] ?? 0}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-16 px-4 lg:px-6 bg-duwaz-cream/30">
        <div className="container mx-auto">
          <SectionHeader
            label="Popular"
            heading="Discover Products"
            sub="Unique items from independent student sellers"
            href="/marketplace"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
            {productsLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    price={Number(p.price)}
                    image={p.imageUrl}
                    shopName={p.business?.businessName ?? p.businessName ?? p.category?.name ?? p.categoryName}
                    shopId={p.business?.id ?? p.businessId}
                    onAddToCart={() => handleAddToCart(p)}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* ── Seller Spotlight ── */}
      <section className="py-16 px-4 lg:px-6 bg-background">
        <div className="container mx-auto">
          <SectionHeader
            label="Sellers"
            heading="Student Businesses"
            sub="Meet the entrepreneurs behind the products"
            href="/marketplace"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {businessesLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonShop key={i} />)
              : featuredShops.map(shop => (
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

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden bg-[#4A2410] py-20 px-4 lg:px-6">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #C8936A 0%, transparent 60%), radial-gradient(circle at 80% 20%, #8B4C1C 0%, transparent 50%)'}}
        />
        <div className="relative container mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">For Entrepreneurs</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-4">
            Start selling today
          </h2>
          <p className="text-white/65 text-base mb-8 leading-relaxed">
            Join hundreds of student sellers already growing their businesses on Duwaz.
            Set up your shop in minutes — no experience needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/create-shop"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-duwaz-brown font-semibold text-sm shadow-md hover:shadow-lg hover:bg-white/95 transition-all duration-200 active:scale-95"
            >
              Open Your Shop
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
