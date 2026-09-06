import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ShopCard from '@/components/ShopCard';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

const MarketplacePage = () => {
  const { toast } = useToast();
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [activeTab, setActiveTab] = useState<'products' | 'shops'>('products');
  const [sortBy, setSortBy] = useState('default');

  const { data: categories = [] } = useCategories();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: businesses = [], isLoading: businessesLoading } = useBusinesses();

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.imageUrl ?? '/placeholder.svg',
      shopName: product.business?.businessName ?? product.category?.name ?? '',
      shopId: product.business?.id,
    });
    toast({ title: 'Added to cart', description: `${product.name} added.`, duration: 2000 });
  };

  const filteredProducts = products
    .filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || String(p.category?.id) === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const filteredBusinesses = businesses.filter(b =>
    b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.description ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedCategory === 'all') searchParams.delete('category');
    else searchParams.set('category', selectedCategory);
    setSearchParams(searchParams);
  }, [selectedCategory]);

  const clearFilters = () => { setSearchTerm(''); setSelectedCategory('all'); setSortBy('default'); };
  const hasFilters = searchTerm || selectedCategory !== 'all';

  return (
    <div className="min-h-screen bg-background">

      {/* Page header */}
      <div className="bg-duwaz-cream/40 border-b border-border/40 py-12 px-4 lg:px-6">
        <div className="container mx-auto text-center">
          <p className="section-label mb-2">Marketplace</p>
          <h1 className="section-heading mb-4">Discover Something You'll Love</h1>

          {/* Search bar — centered */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, shops…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl border border-border bg-background dark:bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-duwaz-brown/25 focus:border-duwaz-brown transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-8">

        {/* Category pills + sort */}
        <div className="flex items-start gap-4 mb-8 flex-wrap">
          {/* Tabs */}
          <div className="flex bg-muted/50 rounded-full p-1 gap-0.5 flex-shrink-0">
            <button
              onClick={() => setActiveTab('products')}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                activeTab === 'products'
                  ? 'bg-card text-foreground shadow-sm dark:bg-white/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Products
              {!productsLoading && (
                <span className="ml-1.5 text-xs text-muted-foreground">({filteredProducts.length})</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('shops')}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                activeTab === 'shops'
                  ? 'bg-card text-foreground shadow-sm dark:bg-white/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Shops
              {!businessesLoading && (
                <span className="ml-1.5 text-xs text-muted-foreground">({filteredBusinesses.length})</span>
              )}
            </button>
          </div>

          {/* Sort */}
          {activeTab === 'products' && (
            <div className="flex items-center gap-2 ml-auto">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-border rounded-xl px-3 py-2 bg-background dark:bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-duwaz-brown/20"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </div>
          )}
        </div>

        {/* Category filter pills */}
        {activeTab === 'products' && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                selectedCategory === 'all'
                  ? 'bg-duwaz-brown text-white border-duwaz-brown shadow-sm'
                  : 'bg-background dark:bg-card text-muted-foreground border-border hover:border-duwaz-brown/50 hover:text-foreground'
              )}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                  selectedCategory === String(cat.id)
                    ? 'bg-duwaz-brown text-white border-duwaz-brown shadow-sm'
                    : 'bg-background dark:bg-card text-muted-foreground border-border hover:border-duwaz-brown/50 hover:text-foreground'
                )}
              >
                {cat.name}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />Clear
              </button>
            )}
          </div>
        )}

        {/* Products grid */}
        {activeTab === 'products' && (
          productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-duwaz-cream/50 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
              {filteredProducts.map(p => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={Number(p.price)}
                  image={p.imageUrl}
                  shopName={p.business?.businessName ?? p.category?.name}
                  shopId={p.business?.id}
                  onAddToCart={() => handleAddToCart(p)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-duwaz-cream/60 flex items-center justify-center mx-auto mb-4">
                <Search className="h-7 w-7 text-duwaz-brown/40" />
              </div>
              <p className="font-semibold text-foreground mb-1">No products found</p>
              <p className="text-sm text-muted-foreground mb-4">Try different search terms or filters</p>
              <button onClick={clearFilters} className="text-sm text-duwaz-brown font-medium hover:underline">
                Clear all filters
              </button>
            </div>
          )
        )}

        {/* Shops grid */}
        {activeTab === 'shops' && (
          businessesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-duwaz-cream/50 animate-pulse" />
              ))}
            </div>
          ) : filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBusinesses.map(shop => (
                <ShopCard
                  key={shop.id}
                  id={shop.id}
                  name={shop.businessName}
                  logo={shop.logoUrl}
                  description={shop.description ?? ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-semibold text-foreground mb-1">No shops found</p>
              <p className="text-sm text-muted-foreground mb-4">Try a different search term</p>
              <button onClick={() => setSearchTerm('')} className="text-sm text-duwaz-brown font-medium hover:underline">
                Clear search
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
