import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Star, Minus, Plus, Store, Tag, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProduct } from '@/hooks/useProducts';
import { useProductReviews } from '@/hooks/useReviews';
import { useCart } from '@/context/CartContext';
import ImageWithFallback from '@/components/ImageWithFallback';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [wished, setWished] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const productId = Number(id);
  const { data: product, isLoading, isError } = useProduct(productId);
  const { data: reviews = [] } = useProductReviews(productId);

  const averageRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length
    : 0;

  // Collect all non-null images in order
  const allImages = product
    ? [
        product.imageUrl,
        (product as any).imageUrl2,
        (product as any).imageUrl3,
        (product as any).imageUrl4,
      ].filter(Boolean) as string[]
    : [];

  const displayImage = allImages[activeImage] ?? '/placeholder.svg';

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: allImages[0] ?? '/placeholder.svg',
        shopName: product.business?.businessName ?? product.category?.name ?? '',
        shopId: product.business?.id,
      });
    }
    toast({ title: `${product.name} added!`, description: `Qty: ${quantity}`, duration: 2500 });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-6 py-10">
        <div className="h-5 w-28 bg-duwaz-cream/60 rounded-full animate-pulse mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl bg-duwaz-cream/50 animate-pulse" />
          <div className="space-y-4">
            {[80, 50, 30, 60].map((w, i) => (
              <div key={i} className={`h-5 bg-duwaz-cream/50 rounded-full animate-pulse`} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isError || !product) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="font-semibold text-xl mb-2">Product not found</h1>
      <p className="text-muted-foreground text-sm mb-6">This product has been removed or doesn't exist.</p>
      <Link to="/marketplace" className="btn-primary text-sm inline-flex">Back to Marketplace</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-6 py-8">

        {/* Breadcrumb */}
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-duwaz-brown transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />Back to marketplace
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Image gallery ── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="rounded-2xl overflow-hidden bg-duwaz-cream/30 aspect-square border border-border/40 shadow-sm">
              <ImageWithFallback
                src={displayImage}
                alt={product.name}
                className="w-full h-full"
              />
            </div>

            {/* Thumbnails — only shown when there are 2+ images */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? 'border-duwaz-brown shadow-md scale-105'
                        : 'border-border/40 opacity-70 hover:opacity-100 hover:border-border'
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div className="flex flex-col">
            {product.category && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Tag className="h-3.5 w-3.5" />
                {product.category.name}
              </div>
            )}

            <h1 className="font-semibold text-2xl md:text-3xl text-foreground leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-border'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating > 0 ? averageRating.toFixed(1) : 'No reviews yet'}
                {reviews.length > 0 && ` (${reviews.length})`}
              </span>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-foreground mb-5">
              R{Number(product.price).toFixed(2)}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 border-t border-border/40 pt-5">
                {product.description}
              </p>
            )}

            {/* Shop */}
            {product.business && (
              <Link
                to={`/shop/${product.business.id}`}
                className="flex items-center gap-2.5 mb-6 p-3 rounded-xl border border-border/50 bg-muted/30 hover:border-duwaz-brown/30 hover:bg-duwaz-cream/30 transition-all group w-fit"
              >
                <div className="w-8 h-8 rounded-lg bg-duwaz-cream/60 flex items-center justify-center flex-shrink-0">
                  {product.business.logoUrl ? (
                    <img src={product.business.logoUrl} alt={product.business.businessName} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Store className="h-4 w-4 text-duwaz-brown/50" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sold by</p>
                  <p className="text-sm font-medium text-foreground group-hover:text-duwaz-brown transition-colors">
                    {product.business.businessName}
                  </p>
                </div>
              </Link>
            )}

            {/* Quantity + CTA */}
            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground/70">Quantity</span>
                <div className="flex items-center gap-1 bg-muted/50 rounded-full border border-border/60 px-1.5">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    aria-label="Increase quantity"
                    className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-duwaz-brown text-white font-semibold text-sm shadow-sm hover:bg-duwaz-brown/90 active:scale-[0.98] transition-all duration-200"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart — R{(Number(product.price) * quantity).toFixed(2)}
                </button>
                <button
                  onClick={() => setWished(v => !v)}
                  aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`h-12 w-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${wished ? 'bg-red-500 border-red-500 text-white' : 'border-border/60 text-muted-foreground hover:text-red-500 hover:border-red-200'}`}
                >
                  <Heart className={`h-4 w-4 ${wished ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 pt-10 border-t border-border/40">
          <h2 className="font-semibold text-xl text-foreground mb-6">
            Reviews
            <span className="ml-2 text-sm font-normal text-muted-foreground">({reviews.length})</span>
          </h2>

          {reviews.length === 0 ? (
            <div className="py-10 text-center bg-duwaz-cream/20 rounded-2xl border border-border/40">
              <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No reviews yet — be the first to buy and review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < Number(review.rating) ? 'text-amber-400 fill-amber-400' : 'text-border'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.reviewDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
