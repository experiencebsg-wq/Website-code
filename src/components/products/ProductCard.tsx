import { forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product, getProductImageUrl } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  function ProductCard({ product, index = 0 }, ref) {
    const { addItem } = useCart();
    const { formatPrice, currency } = useCurrency();
    const images = product.images?.length ? product.images : ['/placeholder.svg'];
    const [imageIndex, setImageIndex] = useState(0);
    const currentImage = images[imageIndex] || images[0];
    const hasSizes = product.sizes && product.sizes.length > 0;
    const minNgn = hasSizes ? Math.min(...product.sizes!.map((s) => s.price)) : product.price;
    const minUsd = hasSizes ? Math.min(...product.sizes!.map((s) => s.priceUSD)) : product.priceUSD;

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (product.comingSoon) return;
      addItem(product, 1, product.sizes?.[0]?.size);
    };

    const isComingSoon = Boolean(product.comingSoon);

    const goPrev = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setImageIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
    };
    const goNext = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setImageIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.1,
          ease: [0.16, 1, 0.3, 1]
        }}
        viewport={{ once: true, margin: "-50px" }}
        whileHover={{ y: -8 }}
      >
        <Link to={`/product/${product.slug}`} className="group block">
          <div className="card-product card-border-animate">
            {/* Image Container with optional slider */}
            <div className="relative aspect-product overflow-hidden bg-muted img-zoom">
              <motion.img
                key={currentImage}
                src={getProductImageUrl(currentImage)}
                alt={product.name}
                className={`w-full h-full object-cover ${isComingSoon ? 'opacity-60' : ''}`}
                whileHover={isComingSoon ? undefined : { scale: 1.08 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Coming Soon overlay */}
              {isComingSoon && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <span className="text-white/90 text-xs uppercase tracking-[0.3em] font-medium">
                    Coming Soon
                  </span>
                  <span className="text-white/70 text-[10px] uppercase tracking-widest">
                    Not yet available
                  </span>
                </div>
              )}
              {images.length > 1 && !isComingSoon && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold hover:text-gold-foreground"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold hover:text-gold-foreground"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImageIndex(i); }}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imageIndex ? 'bg-gold' : 'bg-white/60'}`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Overlay Actions - hidden when Coming Soon */}
              {!isComingSoon && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-background/60 flex items-center justify-center gap-3"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="gold"
                      size="icon"
                      onClick={handleAddToCart}
                      className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                  >
                    <Button
                      variant="luxury"
                      size="icon"
                      className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                      aria-label="Quick view"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isComingSoon && (
                  <motion.span 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-black/90 text-white text-xs uppercase tracking-[0.2em] px-3 py-1.5 border border-white/20"
                  >
                    Coming Soon
                  </motion.span>
                )}
                {product.new && !isComingSoon && (
                  <motion.span 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-gold text-gold-foreground text-xs uppercase tracking-luxury px-3 py-1"
                  >
                    New
                  </motion.span>
                )}
                {!product.inStock && !isComingSoon && (
                  <motion.span 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-destructive text-destructive-foreground text-xs uppercase tracking-luxury px-3 py-1"
                  >
                    Sold Out
                  </motion.span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-5">
              <p className="text-xs uppercase tracking-luxury text-muted-foreground mb-2">
                {product.category.replace(/-/g, ' ')}
              </p>
              <h3 className="font-display text-lg font-medium text-foreground mb-3 group-hover:text-gold transition-colors">
                {product.name}
              </h3>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-gold font-medium">
                    {hasSizes ? 'From ' : ''}{formatPrice(minNgn, minUsd)}
                  </span>
                  {!hasSizes && (
                    <span className="text-muted-foreground text-sm">
                      {currency === 'NGN' ? `$${product.priceUSD}` : `₦${product.price.toLocaleString()}`}
                    </span>
                  )}
                </div>
                {hasSizes && (
                  <p className="text-xs text-muted-foreground">
                    Sizes: {product.sizes!.map((s) => s.size).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }
);
