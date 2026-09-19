import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Loader2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  business: {
    id: number;
    businessName: string;
  };
}

interface Category {
  id: number;
  name: string;
  productCount: number;
}

const ServiceListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    // Fetch service categories
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/catalog/categories?includeEmpty=false`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to fetch categories');

        const data = await response.json();
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch services with pagination
    const fetchServices = async () => {
      try {
        setLoading(true);
        const endpoint = selectedCategory
          ? `${API_BASE_URL}/api/catalog/services/by-category/${selectedCategory}?page=${page}&size=${pageSize}`
          : `${API_BASE_URL}/api/catalog/services?page=${page}&size=${pageSize}`;

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to fetch services');

        const data = await response.json();
        setServices(data.content || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        toast({
          title: 'Error loading services',
          description: 'Could not fetch services. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, page, toast]);

  const handleServiceClick = (serviceId: number) => {
    // Navigate to service detail or initiate contact
    navigate(`/product/${serviceId}`);
  };

  const handleContactShop = (businessId: number, serviceName: string) => {
    // Navigate to business profile or messaging interface
    navigate(`/shop/${businessId}`, { state: { serviceInquiry: serviceName } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-gradient-to-r from-duwaz-brown/10 to-duwaz-cream/40 border-b border-border/40 py-8 px-4 lg:px-6">
        <div className="container mx-auto max-w-6xl">
          <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-duwaz-brown transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to marketplace
          </Link>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="section-heading flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-duwaz-brown" />
                Services
              </h1>
              <p className="text-sm text-muted-foreground mt-2">Find services offered by local businesses. No delivery needed — communicate directly with service providers.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 lg:px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar: Category filter */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-3">Filter by Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setSelectedCategory(null); setPage(0); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCategory === null
                        ? 'bg-duwaz-brown text-white'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    All Services
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? 'bg-duwaz-brown text-white'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs font-semibold">{cat.productCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info box */}
              <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/50">
                <p className="text-xs text-blue-900 font-medium flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Direct messaging with service providers — no driver or delivery fees.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Main content: Services grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border/50 overflow-hidden bg-card">
                    <Skeleton className="w-full h-48" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border/50 bg-muted/10">
                <Briefcase className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h2 className="font-semibold text-lg text-foreground mb-1">No services found</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {selectedCategory ? 'No services in this category yet.' : 'No services available at this time.'}
                </p>
                <Button variant="outline" onClick={() => navigate('/marketplace')}>
                  Browse products instead
                </Button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {services.map(service => (
                    <div key={service.id} className="group rounded-2xl border border-border/50 overflow-hidden bg-card hover:border-duwaz-brown/30 hover:shadow-md transition-all">
                      {/* Service image */}
                      <div className="relative w-full h-48 bg-muted overflow-hidden cursor-pointer" onClick={() => handleServiceClick(service.id)}>
                        {service.imageUrl ? (
                          <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-duwaz-brown/10 to-duwaz-cream/20">
                            <Briefcase className="h-12 w-12 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-duwaz-brown">
                          Service
                        </div>
                      </div>

                      {/* Service info */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm text-foreground line-clamp-2 cursor-pointer hover:text-duwaz-brown transition-colors" onClick={() => handleServiceClick(service.id)}>
                            {service.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">{service.business.businessName}</p>
                        </div>

                        {service.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-duwaz-brown">R{service.price.toFixed(2)}</span>
                        </div>

                        {/* Action button */}
                        <Button
                          className="w-full bg-duwaz-brown hover:bg-duwaz-brown/90 text-white"
                          onClick={() => handleContactShop(service.business.id, service.name)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Provider
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination info */}
                <div className="text-center text-xs text-muted-foreground">
                  Showing {services.length} service{services.length !== 1 ? 's' : ''} — more available
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceListPage;
