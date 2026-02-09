import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { fetchProductById, Product, getProductImageUrl } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await fetchProductById(slug);
        setProduct(data ?? null);
        if (data?.sizes?.length) {
          setSelectedSize(data.sizes[0].size);
        }
      } catch (e) {
        setProduct(null);
        setFetchError(e instanceof Error ? e.message : 'Could not load product.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  const { formatPrice, currency } = useCurrency();

  const getCurrentPrice = () => {
    if (!product) return { ngn: 0, usd: 0 };
    if (selectedSize && product.sizes) {
      const sizeOption = product.sizes.find((s) => s.size === selectedSize);
      if (sizeOption) {
        return { ngn: sizeOption.price, usd: sizeOption.priceUSD };
      }
    }
    return { ngn: product.price, usd: product.priceUSD };
  };

  const handleAddToCart = () => {
    if (!product || product.comingSoon) return;
    addItem(product, quantity, selectedSize);
    toast.success(`${product.name} added to cart`);
  };

  const isComingSoon = Boolean(product?.comingSoon);

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-32 pb-16">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
              <div className="aspect-product bg-muted rounded-sm" />
              <div className="space-y-6">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-10 w-64 bg-muted rounded" />
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="h-24 w-full bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="pt-32 pb-16">
          <div className="container-luxury text-center">
            <h1 className="text-display-md text-foreground mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">
              {fetchError ?? "The product you're looking for doesn't exist."}
            </p>
            <Link to="/shop">
              <Button variant="gold">Return to Shop</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const currentPrice = getCurrentPrice();

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Link
              to="/shop"
              className="inline-flex items-center text-muted-foreground hover:text-gold transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Shop
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative aspect-product bg-card rounded-sm overflow-hidden mb-4 group">
                <img
                  src={getProductImageUrl(product.images[selectedImage] || product.images[0] || '')}
                  alt={product.name}
                  className={`w-full h-full object-cover ${isComingSoon ? 'opacity-50' : ''}`}
                />
                {isComingSoon && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-3 pointer-events-none">
                    <span className="text-white text-sm uppercase tracking-[0.35em] font-medium">
                      Coming Soon
                    </span>
                    <span className="text-white/80 text-xs uppercase tracking-widest">
                      This product is not yet available for purchase
                    </span>
                  </div>
                )}
                {product.images.length > 1 && !isComingSoon && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedImage((i) => (i <= 0 ? product.images.length - 1 : i - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold hover:text-gold-foreground"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImage((i) => (i >= product.images.length - 1 ? 0 : i + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold hover:text-gold-foreground"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedImage(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${selectedImage === index ? 'bg-gold scale-125' : 'bg-white/60 hover:bg-white/80'}`}
                          aria-label={`Image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-gold' : 'border-transparent hover:border-gold/50'
                      }`}
                    >
                      <img
                        src={getProductImageUrl(img)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-sm uppercase tracking-luxury text-gold mb-3">
                {product.category.replace(/-/g, ' ')}
              </p>
              
              <h1 className="text-display-md text-foreground mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl text-gold font-display">
                  {formatPrice(currentPrice.ngn, currentPrice.usd)}
                </span>
                <span className="text-lg text-muted-foreground">
                  {currency === 'NGN' ? `$${currentPrice.usd}` : `₦${currentPrice.ngn.toLocaleString()}`}
                </span>
              </div>

              <p className="text-body text-muted-foreground mb-8">{product.description}</p>

              {/* Coming Soon - no purchase options */}
              {isComingSoon ? (
                <div className="mb-10 p-8 border border-border rounded-sm bg-muted/40 text-center">
                  <p className="text-foreground font-medium uppercase tracking-luxury mb-1">Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    This product is not yet available. Check back later or follow us for updates.
                  </p>
                </div>
              ) : (
                <div>
              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm uppercase tracking-luxury text-foreground mb-3">Size</p>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size.size}
                        onClick={() => setSelectedSize(size.size)}
                        className={`px-6 py-3 border rounded-sm text-sm uppercase tracking-luxury transition-all ${
                          selectedSize === size.size
                            ? 'border-gold bg-gold/10 text-gold'
                            : 'border-border text-muted-foreground hover:border-gold/50'
                        }`}
                      >
                        {size.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <p className="text-sm uppercase tracking-luxury text-foreground mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-muted transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-muted transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {!product.inStock && (
                    <span className="text-destructive text-sm">Out of Stock</span>
                  )}
                  {product.inStock && product.stockQuantity < 10 && (
                    <span className="text-gold text-sm">
                      Only {product.stockQuantity} left
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-10">
                <Button
                  variant="gold"
                  size="xl"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="luxury" size="xl" aria-label="Add to wishlist">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
                </div>
              )}

              {/* Fragrance Notes */}
              {product.notes && (
                <div className="border-t border-border pt-8">
                  <p className="text-sm uppercase tracking-luxury text-gold mb-4">
                    Fragrance Notes
                  </p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Top Notes</p>
                      <p className="text-foreground">{product.notes.top.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Heart Notes</p>
                      <p className="text-foreground">{product.notes.middle.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Base Notes</p>
                      <p className="text-foreground">{product.notes.base.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
