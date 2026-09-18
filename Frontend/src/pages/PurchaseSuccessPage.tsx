import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, User, Phone, Clock, Home, Banknote, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ordersApi } from '@/services/api';

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  deliveryAddress: string;
  business: { id: number; businessName: string; student?: { studentName: string; email?: string; phone?: string } };
  items: any[];
  orderDate: string;
}

const PurchaseSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    ordersApi.getById(Number(orderId))
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load order');
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-duwaz-brown" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error || 'Could not load order details'}</p>
          <Link to="/marketplace">
            <Button className="bg-duwaz-brown hover:bg-duwaz-brown/90">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sellerName = order.business?.student?.studentName || order.business?.businessName || 'Seller';
  const isCollection = order.paymentMethod === 'collection';
  const isCash = order.paymentMethod === 'cash';
  const isDelivery = !isCollection && !isCash && order.deliveryAddress !== 'SERVICE_NO_DELIVERY';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background">
      {/* ── Success Header ── */}
      <div className="bg-white border-b border-border/40 py-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
              <CheckCircle className="h-20 w-20 text-green-500 relative z-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Purchase Successful! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            Your order has been placed. Here's what happens next.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-12">
        {/* ── Order Confirmation ── */}
        <Card className="mb-8 border-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-xl">Order Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Order ID</p>
                <p className="text-2xl font-bold text-duwaz-brown">#{order.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Total Amount</p>
                <p className="text-2xl font-bold">R{Number(order.totalAmount).toFixed(2)}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Order Date</p>
              <p className="text-sm">{new Date(order.orderDate).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Items Summary ── */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Items Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start pb-3 border-b last:border-0">
                  <div>
                    <p className="font-semibold text-sm">{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-bold">R{(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Meet Your Seller ── */}
        <Card className="mb-8 border-2 border-duwaz-brown/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-duwaz-brown" />
              Meet Your Seller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Shop Name</p>
              <p className="text-lg font-bold text-foreground">{order.business?.businessName || 'Local Shop'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Contact Information</p>
              <div className="space-y-2">
                {order.business?.student?.studentName && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{order.business.student.studentName}</span>
                  </div>
                )}
                {order.business?.student?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{order.business.student.phone}</span>
                  </div>
                )}
                {order.business?.student?.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">✉</span>
                    </div>
                    <span className="text-sm">{order.business.student.email}</span>
                  </div>
                )}
                {!order.business?.student && (
                  <p className="text-sm text-muted-foreground">Contact details will be provided in your confirmation email</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium flex items-start gap-2">
                <span className="mt-0.5">💬</span>
                <span>
                  You'll be able to message the seller through your Order Details page. They'll confirm availability and arrange the meeting.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── What Happens Next ── */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-duwaz-brown" />
              What Happens Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isCollection && (
                <>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-duwaz-brown text-white flex items-center justify-center font-bold text-sm">1</div>
                      <div className="w-0.5 h-12 bg-border my-2" />
                    </div>
                    <div className="pb-8">
                      <p className="font-semibold text-sm text-foreground">Seller Confirms Stock</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        The seller will confirm within a few hours that items are ready for collection.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-duwaz-brown text-white flex items-center justify-center font-bold text-sm">2</div>
                      <div className="w-0.5 h-12 bg-border my-2" />
                    </div>
                    <div className="pb-8">
                      <p className="font-semibold text-sm text-foreground">Arrange Meeting</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You'll receive instructions on when and where to collect your items. Message the seller to confirm a time that works for both of you.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">✓</div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Collect & Pay</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Meet the seller at the agreed location. Collect your items and payment will be handled according to the method you selected.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {isCash && (
                <>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-duwaz-brown text-white flex items-center justify-center font-bold text-sm">1</div>
                      <div className="w-0.5 h-12 bg-border my-2" />
                    </div>
                    <div className="pb-8">
                      <p className="font-semibold text-sm text-foreground">Seller Confirms</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        The seller will prepare your order and confirm it's ready for delivery.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-duwaz-brown text-white flex items-center justify-center font-bold text-sm">2</div>
                      <div className="w-0.5 h-12 bg-border my-2" />
                    </div>
                    <div className="pb-8">
                      <p className="font-semibold text-sm text-foreground">Driver Collects</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        A delivery driver will collect your items from the seller's location.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">✓</div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Delivery & Payment</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your items will be delivered to your address. Pay the driver in cash when they arrive.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {isDelivery && (
                <>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-duwaz-brown text-white flex items-center justify-center font-bold text-sm">1</div>
                      <div className="w-0.5 h-12 bg-border my-2" />
                    </div>
                    <div className="pb-8">
                      <p className="font-semibold text-sm text-foreground">Payment Confirmed</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your online payment has been processed successfully.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-duwaz-brown text-white flex items-center justify-center font-bold text-sm">2</div>
                      <div className="w-0.5 h-12 bg-border my-2" />
                    </div>
                    <div className="pb-8">
                      <p className="font-semibold text-sm text-foreground">Order Prepared</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        The seller will prepare your order and hand it to our delivery driver.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">✓</div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Delivered</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your items will be delivered to: <strong>{order.deliveryAddress}</strong>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Next Steps CTA ── */}
        <div className="bg-duwaz-cream/50 border border-duwaz-brown/20 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-duwaz-brown" />
            Track Your Order
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Monitor your order status and communicate with the seller in real-time.
          </p>
          <Link to={`/order/${order.id}/track`}>
            <Button className="bg-duwaz-brown hover:bg-duwaz-brown/90 w-full sm:w-auto">
              View Order Details
            </Button>
          </Link>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/marketplace" className="flex-1">
            <Button variant="outline" className="w-full border-duwaz-brown text-duwaz-brown hover:bg-duwaz-brown hover:text-white">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/my-orders" className="flex-1">
            <Button className="w-full bg-duwaz-brown hover:bg-duwaz-brown/90">
              View All Orders
            </Button>
          </Link>
        </div>

        {/* ── Help Text ── */}
        <div className="mt-12 p-6 bg-blue-50/50 border border-blue-200 rounded-2xl">
          <p className="text-sm text-blue-900 font-medium mb-2">💡 Need Help?</p>
          <p className="text-sm text-blue-800">
            Check your email for an order confirmation. If you have any questions, you can message the seller directly from your Order Details page or contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
