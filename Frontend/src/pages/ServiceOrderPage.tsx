import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusinesses';
import { useAuth } from '@/context/AuthContext';
import { messagesApi } from '@/services/api';
import type { CartItem } from '@/types';

const ServiceOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const shopId = Number(id);
  const { data: shop, isLoading: shopLoading } = useBusiness(shopId);

  const [serviceItems, setServiceItems] = useState<CartItem[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Load service items from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('duwaz_service_items');
    if (stored) {
      try {
        setServiceItems(JSON.parse(stored));
        sessionStorage.removeItem('duwaz_service_items');
      } catch (err) {
        console.error('Failed to parse service items:', err);
      }
    }
  }, []);

  // Pre-fill message with service details
  useEffect(() => {
    if (serviceItems.length > 0 && !messageContent) {
      const itemsList = serviceItems
        .map(item => `• ${item.name} (R${item.price.toFixed(2)})`)
        .join('\n');
      setMessageContent(
        `Hi, I'm interested in your service:\n\n${itemsList}\n\nCould you please provide more details about availability and pricing?`
      );
    }
  }, [serviceItems]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast({ title: 'Message is empty', variant: 'destructive' });
      return;
    }

    if (!user) {
      toast({ title: 'Please sign in first', variant: 'destructive' });
      navigate('/login');
      return;
    }

    setIsSending(true);
    try {
      const subject = serviceItems.length > 0
        ? `Service Inquiry: ${serviceItems.map(i => i.name).join(', ')}`
        : 'Service Inquiry';

      await messagesApi.sendServiceInquiry(shopId, subject, messageContent);

      toast({
        title: '✅ Message sent!',
        description: 'The seller will respond to your service inquiry shortly.',
      });

      // Clear form
      setMessageContent('');
      
      // Redirect to marketplace after short delay
      setTimeout(() => {
        navigate('/marketplace');
      }, 1500);
    } catch (err: any) {
      toast({
        title: 'Failed to send message',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="h-8 w-48 bg-duwaz-cream/50 animate-pulse rounded-2xl mb-6" />
          <div className="bg-white rounded-2xl border border-border/50 p-8 space-y-4">
            <div className="h-6 w-64 bg-duwaz-cream/50 animate-pulse rounded-2xl" />
            <div className="h-4 w-96 bg-duwaz-cream/50 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-duwaz-cream/40 border-b border-border/40 py-8 px-4 lg:px-6">
        <div className="container mx-auto max-w-3xl">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-duwaz-brown transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to marketplace
          </Link>
          <h1 className="section-heading">Service Inquiry</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-8 max-w-3xl">
        {/* Shop info card */}
        {shop && (
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-duwaz-cream/50 flex items-center justify-center">
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.businessName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-duwaz-brown/50">{shop.businessName.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg text-foreground">{shop.businessName}</h2>
                <p className="text-sm text-muted-foreground mt-1">Service Provider</p>
                {shop.description && (
                  <p className="text-sm text-muted-foreground mt-2">{shop.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Service items summary */}
        {serviceItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-base text-blue-900 mb-3 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Services You're Interested In
            </h3>
            <div className="space-y-2">
              {serviceItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-blue-800">{item.name}</span>
                  <span className="font-semibold text-blue-900">R{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex gap-3">
          <Clock className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Service transactions are handled via messaging</p>
            <p className="text-amber-800 mt-1">
              Send your inquiry below and the service provider will respond with details, availability, and pricing.
            </p>
          </div>
        </div>

        {/* Message form */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
          <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-duwaz-brown" />
            Message Service Provider
          </h3>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="message" className="text-sm font-medium text-foreground">
                Your message
              </Label>
              <textarea
                id="message"
                placeholder="Describe your service needs, ask about availability, pricing, or any other questions..."
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                rows={6}
                className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-duwaz-brown/25 focus:border-duwaz-brown transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {messageContent.length} / 5000 characters
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSending || !messageContent.trim()}
                className="flex-1 bg-duwaz-brown hover:bg-duwaz-brown/90"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/marketplace')}
              >
                Cancel
              </Button>
            </div>
          </form>

          {!user && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                You need to be signed in to send a message.{' '}
                <Link to="/login" className="font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Tips section */}
        <div className="mt-8 bg-duwaz-cream/30 rounded-2xl border border-duwaz-brown/20 p-6">
          <h4 className="font-semibold text-sm text-duwaz-brown mb-3">💡 Tips for a successful service inquiry</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>• Be specific about what you need</li>
            <li>• Ask about availability and turnaround time</li>
            <li>• Mention your budget if relevant</li>
            <li>• Provide contact details for follow-up</li>
            <li>• Check the service provider's response time expectations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderPage;
