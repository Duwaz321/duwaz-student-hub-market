import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ isOpen, onClose }) => {
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated) {
      navigate('/register', { state: { from: { pathname: '/cart' } } });
    } else {
      navigate('/cart');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] flex flex-col',
          'bg-background dark:bg-card shadow-2xl transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-duwaz-brown" />
            <h2 className="font-semibold text-base text-foreground">
              Your Cart
              {items.length > 0 && (
                <span className="ml-2 text-xs bg-duwaz-brown text-white px-2 py-0.5 rounded-full font-medium">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {items.length > 0 ? items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-muted/30 border border-border/40 hover:border-border/70 transition-colors">
              {/* Thumbnail — fixed 56×56 to prevent it consuming space */}
              <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-duwaz-cream/50 border border-border/30">
                <img
                  src={item.image ?? '/placeholder.svg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">{item.name}</h3>
                    {item.shopName && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.shopName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="flex-shrink-0 p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  {/* Qty controls */}
                  <div className="flex items-center gap-1 bg-white rounded-full border border-border/60 px-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      aria-label="Decrease quantity"
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      aria-label="Increase quantity"
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="font-bold text-sm text-foreground">
                    R{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-duwaz-cream/60 flex items-center justify-center mb-4">
                <ShoppingBag className="h-7 w-7 text-duwaz-brown/40" />
              </div>
              <p className="font-semibold text-foreground mb-1">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mb-5">Discover products from student sellers</p>
              <button
                onClick={onClose}
                className="text-sm text-duwaz-brown font-medium hover:underline"
              >
                Continue shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
        <div className="px-6 py-5 border-t border-border/50 bg-background dark:bg-card space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-bold text-lg text-foreground">R{subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Delivery included in product prices</p>

            {/* CTA */}
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-duwaz-brown text-white font-semibold text-sm shadow-sm hover:bg-duwaz-brown/90 active:scale-[0.98] transition-all duration-200"
            >
              Make Payment
              <ArrowRight className="h-4 w-4" />
            </button>

            {!isAuthenticated && (
              <p className="text-xs text-center text-muted-foreground">
                You'll be asked to create an account first.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};
