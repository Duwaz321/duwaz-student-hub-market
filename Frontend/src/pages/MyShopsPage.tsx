import { Link } from 'react-router-dom';
import { Plus, Store, Settings, ExternalLink, TrendingUp } from 'lucide-react';
import { useShopContext } from '@/context/ShopContext';
import type { Business } from '@/types';

const MyShopsPage = () => {
  const { myShops, isLoadingShop } = useShopContext();

  if (isLoadingShop) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 lg:px-6 py-12 max-w-5xl">
          <div className="h-8 w-40 bg-duwaz-cream/60 rounded-full animate-pulse mb-2" />
          <div className="h-4 w-56 bg-duwaz-cream/40 rounded-full animate-pulse mb-10" />
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-36 rounded-2xl bg-duwaz-cream/50 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-duwaz-cream/40 border-b border-border/40 py-12 px-4 lg:px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="section-label mb-2">Seller Hub</p>
          <h1 className="section-heading">My Shops</h1>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            {myShops.length === 0
              ? 'Create your first shop to start selling on campus.'
              : `You manage ${myShops.length} shop${myShops.length > 1 ? 's' : ''}.`}
          </p>
          <Link
            to="/create-shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-duwaz-brown text-white text-sm font-semibold shadow-sm hover:bg-duwaz-brown/90 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Another Shop
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-10 max-w-5xl">

        {/* Empty state */}
        {myShops.length === 0 && (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border/50 bg-duwaz-cream/10">
            <div className="w-16 h-16 rounded-full bg-duwaz-cream/60 flex items-center justify-center mx-auto mb-4">
              <Store className="h-7 w-7 text-duwaz-brown/40" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No shops yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Set up your shop and start reaching students on campus.
            </p>
            <Link
              to="/create-shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-duwaz-brown text-white text-sm font-semibold shadow-sm hover:bg-duwaz-brown/90 transition-all"
            >
              <Plus className="h-4 w-4" />
              Create Your First Shop
            </Link>
          </div>
        )}

        {/* Shop grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {myShops.map((shop: Business) => (
            <ShopManageCard key={shop.id} shop={shop} />
          ))}
        </div>
      </div>
    </div>
  );
};

const ShopManageCard = ({ shop }: { shop: Business }) => (
  <div className="group bg-card rounded-2xl border border-border/50 p-5 hover:shadow-md hover:border-duwaz-brown/20 transition-all duration-300">
    <div className="flex items-start gap-4 mb-5">
      {/* Logo */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted/50 border border-border/40 flex items-center justify-center">
        {shop.logoUrl ? (
          <img src={shop.logoUrl} alt={shop.businessName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-muted-foreground/60">{shop.businessName.charAt(0)}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground leading-tight line-clamp-1">{shop.businessName}</h3>
          <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 border border-green-500/30">
            Active
          </span>
        </div>
        {shop.shopCategory && (
          <span className="text-xs text-duwaz-brown dark:text-[hsl(25,65%,65%)] font-medium">{shop.shopCategory}</span>
        )}
        {shop.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {shop.description}
          </p>
        )}
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Link
        to={`/my-shop/${shop.id}`}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-duwaz-brown text-white text-xs font-semibold hover:bg-duwaz-brown/90 transition-colors"
      >
        <Settings className="h-3.5 w-3.5" />
        Manage
      </Link>
      <Link
        to={`/shop/${shop.id}`}
        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border text-foreground text-xs font-medium hover:border-duwaz-brown/40 hover:text-duwaz-brown transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View
      </Link>
    </div>
  </div>
);

export default MyShopsPage;
