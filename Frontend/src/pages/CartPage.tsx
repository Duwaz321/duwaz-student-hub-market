import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Trash, MapPin, Home, Pencil, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// ── Main Component ─────────────────────────────────────────────────────────────
const CartPage = () => {
  const { toast }    = useToast();
  const navigate     = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [useMyResidence, setUseMyResidence] = useState(true);
  const [customAddress, setCustomAddress]   = useState('');

  const effectiveAddress = useMyResidence ? (user?.locationAddress ?? '') : customAddress;

  // Total = product prices × quantities only — no separate delivery fee
  const total = subtotal;

  const handleRemove = (id: number, name: string) => {
    removeItem(id);
    toast({ title: 'Item removed', description: `${name} removed from cart.` });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/register', { state: { from: { pathname: '/cart' } } });
      toast({ title: 'Create an account first', description: 'You need an account to make a payment.' });
      return;
    }

    if (!effectiveAddress.trim()) {
      toast({
        title: 'Delivery address required',
        description: useMyResidence
          ? 'Your profile has no residence address. Select "Enter a different address" below.'
          : 'Please enter your delivery address.',
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingOut(true);

    const businessGroups: Record<string, typeof items> = {};
    items.forEach(item => {
      const key = String(item.shopId ?? 'unknown');
      if (!businessGroups[key]) businessGroups[key] = [];
      businessGroups[key].push(item);
    });

    const shopIds = Object.keys(businessGroups).filter(k => k !== 'unknown');
    if (shopIds.length === 0) {
      toast({ title: 'Checkout failed', description: 'Could not determine which shop these items belong to.', variant: 'destructive' });
      setIsCheckingOut(false);
      return;
    }

    import('@/services/api').then(({ ordersApi }) => {
      const orderPromises = shopIds.map(shopId => {
        const shopItems = businessGroups[shopId];
        // Total = product prices × quantities only — no delivery fee added
        const shopTotal = shopItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const payload = {
          totalAmount: shopTotal,
          status: 'PENDING',
          deliveryAddress: effectiveAddress.trim(),
          business: { id: Number(shopId) },
          items: shopItems.map(item => ({
            product: { id: item.id },
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        } as any;
        return ordersApi.create(payload);
      });

      Promise.all(orderPromises)
        .then((createdOrders: any[]) => {
          toast({ title: 'Order placed!', description: 'Track your delivery in real time.' });
          clearCart();
          navigate(`/order/${createdOrders[0].id}/track`);
        })
        .catch((err: any) => {
          toast({ title: 'Checkout failed', description: err.message, variant: 'destructive' });
        })
        .finally(() => setIsCheckingOut(false));
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-duwaz-cream/40 border-b border-border/40 py-8 px-4 lg:px-6">
        <div className="container mx-auto max-w-5xl">
          <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-duwaz-brown transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />Back to marketplace
          </Link>
          <h1 className="section-heading">Your Cart</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-8 max-w-5xl">

      {items.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">

          {/* ── Cart Items ── */}
          <div className="md:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:border-border transition-colors">
                <div className="w-24 h-24 bg-duwaz-cream/40 flex-shrink-0">
                  <img src={item.image ?? '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.shopName}</p>
                    </div>
                    <p className="font-bold text-sm text-foreground flex-shrink-0">R{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-muted/50 border border-border/60 rounded-full px-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-white" onClick={() => updateQuantity(item.id, -1)}>-</Button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-white" onClick={() => updateQuantity(item.id, 1)}>+</Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-7 px-3 text-xs" onClick={() => handleRemove(item.id, item.name)}>
                      <Trash className="h-3 w-3 mr-1" />Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Right column ── */}
          <div className="space-y-4">

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-duwaz-brown" />
                Delivery Address <span className="text-red-500">*</span>
              </h2>

              {/* Use my residence */}
              {isAuthenticated && user?.locationAddress && (
                <button
                  type="button"
                  onClick={() => setUseMyResidence(true)}
                  className={`w-full flex items-start gap-3 border rounded-lg p-3 text-left transition-all ${
                    useMyResidence ? 'border-duwaz-brown bg-duwaz-brown/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Home className={`h-5 w-5 mt-0.5 flex-shrink-0 ${useMyResidence ? 'text-duwaz-brown' : 'text-gray-400'}`} />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${useMyResidence ? 'text-duwaz-brown' : 'text-gray-700'}`}>Use my residence</p>
                    <p className="text-xs text-gray-500 truncate">{user.locationAddress}</p>
                  </div>
                  {useMyResidence && (
                    <span className="ml-auto text-xs bg-duwaz-brown text-white px-2 py-0.5 rounded-full flex-shrink-0">✓ Selected</span>
                  )}
                </button>
              )}

              {/* Custom address */}
              <div>
                <button
                  type="button"
                  onClick={() => setUseMyResidence(false)}
                  className={`w-full flex items-center gap-3 border rounded-lg p-3 text-left transition-all mb-2 ${
                    !useMyResidence ? 'border-duwaz-brown bg-duwaz-brown/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Pencil className={`h-5 w-5 flex-shrink-0 ${!useMyResidence ? 'text-duwaz-brown' : 'text-gray-400'}`} />
                  <p className={`text-sm font-semibold ${!useMyResidence ? 'text-duwaz-brown' : 'text-gray-700'}`}>
                    Enter a different address
                  </p>
                  {!useMyResidence && (
                    <span className="ml-auto text-xs bg-duwaz-brown text-white px-2 py-0.5 rounded-full flex-shrink-0">✓ Selected</span>
                  )}
                </button>

                {!useMyResidence && (
                  <div className="space-y-1">
                    <Label htmlFor="customAddr">Delivery address</Label>
                    <Input
                      id="customAddr"
                      placeholder="e.g. 12 Main Road, Observatory, Cape Town"
                      value={customAddress}
                      onChange={e => setCustomAddress(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* No residence warning */}
              {isAuthenticated && !user?.locationAddress && useMyResidence && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                  ⚠ No residence address on your profile. Please select "Enter a different address" above, or update your profile in Account settings.
                </p>
              )}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Delivery is included in product prices. No extra fees at checkout.
              </p>

              <Button
                className="w-full bg-duwaz-brown hover:bg-duwaz-brown/90"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Processing…' : (
                  <><ShoppingBag className="mr-2 h-4 w-4" />Make Payment — R{total.toFixed(2)}</>
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  You'll be asked to create an account before paying.
                </p>
              )}
              <p className="text-xs text-gray-400 mt-3 text-center">
                By completing this purchase you agree to our terms and conditions.
              </p>
            </div>

          </div>
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border/50 bg-duwaz-cream/10">
          <div className="w-16 h-16 rounded-full bg-duwaz-cream/60 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7 text-duwaz-brown/40" />
          </div>
          <h2 className="font-semibold text-lg text-foreground mb-1">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mb-6">Add items from the marketplace to get started</p>
          <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-duwaz-brown text-white text-sm font-semibold hover:bg-duwaz-brown/90 transition-all shadow-sm">
            Browse Products
          </Link>
        </div>
      )}
      </div>
    </div>
  );
};

export default CartPage;
