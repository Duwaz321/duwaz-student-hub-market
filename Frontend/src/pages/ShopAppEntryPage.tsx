import { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShopContext } from '@/context/ShopContext';
import ShopPwaManifest from '@/components/ShopPwaManifest';
import InstallShopAppButton from '@/components/InstallShopAppButton';

const ShopAppEntryPage = () => {
  const { myShops, isLoadingShop } = useShopContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingShop && myShops.length === 1) {
      navigate(`/shop-app/${myShops[0].id}`, { replace: true });
    }
  }, [isLoadingShop, myShops, navigate]);

  if (isLoadingShop || myShops.length === 1) {
    return (
      <main className="min-h-screen bg-background px-5 py-10">
        <ShopPwaManifest />
        <div className="mx-auto max-w-xl space-y-4">
          <div className="h-7 w-56 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 sm:px-8">
      <ShopPwaManifest />
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-sm font-semibold text-duwaz-brown">DUWAZ SELLER HUB</p>
            <h1 className="mt-1 text-2xl font-semibold">Choose a shop</h1>
            <p className="mt-1 text-sm text-muted-foreground">Open a shop dashboard or install this app on your device.</p>
          </div>
          <InstallShopAppButton />
        </header>

        {myShops.length === 0 ? (
          <section className="border-y border-border py-10 text-center">
            <Store className="mx-auto mb-3 h-8 w-8 text-duwaz-brown" />
            <h2 className="font-semibold">You don’t have a shop yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create one to open your seller dashboard.</p>
            <Button asChild className="mt-5 bg-duwaz-brown hover:bg-duwaz-brown/90">
              <Link to="/create-shop">Create a shop</Link>
            </Button>
          </section>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {myShops.map(shop => (
              <Link
                key={shop.id}
                to={`/shop-app/${shop.id}`}
                className="flex items-center gap-4 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : <Store className="h-5 w-5 text-muted-foreground" />}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{shop.businessName}</span>
                  <span className="block truncate text-sm text-muted-foreground">{shop.shopCategory ?? 'Shop dashboard'}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ShopAppEntryPage;
