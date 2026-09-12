import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentApi } from '@/services/api';

/**
 * Landing page after Yoco redirects back on successful payment.
 * Yoco appends ?orderId=... to the successUrl we provided.
 * We poll our backend for up to 10s to confirm the webhook has fired,
 * then redirect to the order tracking page.
 */
const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  const [status, setStatus] = useState<'checking' | 'confirmed' | 'timeout'>('checking');
  const [dots, setDots] = useState('');

  // Animate dots while checking
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!orderId) { setStatus('timeout'); return; }

    let attempts = 0;
    const maxAttempts = 12; // 12 × 2s = 24s max wait

    const poll = async () => {
      try {
        const result = await paymentApi.getStatus(Number(orderId));
        if (result.paymentStatus === 'PAID' || result.orderStatus === 'CONFIRMED') {
          setStatus('confirmed');
          // Small delay so the success animation shows before redirecting
          setTimeout(() => navigate(`/order/${orderId}/track`), 1800);
          return;
        }
      } catch {
        // Backend not ready yet — keep polling
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setStatus('timeout');
        return;
      }
      setTimeout(poll, 2000);
    };

    // Start polling after a short initial delay
    const t = setTimeout(poll, 1500);
    return () => clearTimeout(t);
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center space-y-5">

        {status === 'checking' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Received!</h1>
            <p className="text-gray-500 text-sm">
              Confirming your order{dots}
            </p>
            <p className="text-xs text-gray-400">This only takes a moment.</p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-green-700">Payment Confirmed!</h1>
            <p className="text-gray-500 text-sm">
              Your order is confirmed. Redirecting to tracking{dots}
            </p>
          </>
        )}

        {status === 'timeout' && (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Payment Processed</h1>
            <p className="text-gray-500 text-sm">
              Your payment went through. It may take a moment to reflect.
            </p>
            {orderId && (
              <Button asChild className="w-full bg-duwaz-brown hover:bg-duwaz-brown/90">
                <Link to={`/order/${orderId}/track`}>Track My Order</Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to="/account">My Orders</Link>
            </Button>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentSuccessPage;
