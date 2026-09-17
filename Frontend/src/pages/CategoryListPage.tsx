import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: number;
  name: string;
  productCount: number;
}

const CategoryListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories with product counts (fast, cached endpoint)
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/catalog/categories?includeEmpty=false', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to fetch categories');

        const data = await response.json();
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast({
          title: 'Error loading categories',
          description: 'Could not fetch product categories. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    navigate(`/marketplace?category=${categoryId}`, { state: { categoryName } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-duwaz-cream/40 border-b border-border/40 py-8 px-4 lg:px-6">
        <div className="container mx-auto max-w-6xl">
          <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-duwaz-brown transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to marketplace
          </Link>
          <h1 className="section-heading">Shop by Category</h1>
          <p className="text-sm text-muted-foreground mt-2">Browse products by category. Click any category to see available items.</p>
        </div>
      </div>

      {/* Categories grid */}
      <div className="container mx-auto max-w-6xl px-4 lg:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border/50 bg-card">
                <Skeleton className="h-8 w-32 mb-3" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-muted-foreground/60" />
            </div>
            <h2 className="font-semibold text-lg text-foreground mb-1">No categories found</h2>
            <p className="text-sm text-muted-foreground mb-6">There are currently no product categories available.</p>
            <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-duwaz-brown text-white text-sm font-semibold hover:bg-duwaz-brown/90 transition-all shadow-sm">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id, category.name)}
                className="group relative p-6 rounded-2xl border border-border/50 bg-card hover:bg-muted/30 hover:border-duwaz-brown/30 transition-all text-left shadow-sm hover:shadow-md"
              >
                {/* Category content */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base text-foreground group-hover:text-duwaz-brown transition-colors">
                    {category.name}
                  </h3>
                  <div className="w-6 h-6 rounded-full bg-duwaz-brown/10 group-hover:bg-duwaz-brown/20 flex items-center justify-center transition-colors">
                    <ShoppingBag className="w-3.5 h-3.5 text-duwaz-brown" />
                  </div>
                </div>

                {/* Product count */}
                <p className="text-2xl font-bold text-duwaz-brown mb-1">
                  {category.productCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {category.productCount === 1 ? 'product' : 'products'} available
                </p>

                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-duwaz-brown/0 via-duwaz-brown to-duwaz-brown/0 opacity-0 group-hover:opacity-100 rounded-b-2xl transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Browse all CTA */}
      {categories.length > 0 && (
        <div className="bg-duwaz-cream/20 border-t border-border/40 py-8 px-4 lg:px-6">
          <div className="container mx-auto max-w-6xl text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Can't find what you're looking for?
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/marketplace')}
              className="border-duwaz-brown/20 hover:border-duwaz-brown/40 text-duwaz-brown"
            >
              Browse all products
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryListPage;
