import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, ShoppingCart, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Shown when the customer cancels or fails a payment on Yoco's page.
 * The order stays in PENDING state — customer can retry or abandon.
 */
const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center space-y-5">

        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="text-gray-500 text-sm">
          No charge was made. You can go back to your cart and try again.
        </p>

        {orderId && (
          <p className="text-xs text-gray-400">
            Order #{orderId} is still pending — it will be removed automatically if not paid.
          </p>
        )}

        <div className="space-y-2 pt-2">
          <Button asChild className="w-full bg-duwaz-brown hover:bg-duwaz-brown/90">
            <Link to="/cart">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/marketplace">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PaymentCancelPage;
