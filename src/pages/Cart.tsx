import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getProductImageUrl } from '@/services/api';

export default function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const subtotal = getSubtotal();

  const getItemPrice = (item: typeof items[0]) => {
    if (item.selectedSize && item.product.sizes) {
      const sizeOption = item.product.sizes.find((s) => s.size === item.selectedSize);
      if (sizeOption) return { ngn: sizeOption.price, usd: sizeOption.priceUSD };
    }
    return { ngn: item.product.price, usd: item.product.priceUSD };
  };

  if (items.length === 0) {
    return (
      <Layout>
        <SEO title="Your Cart" description="View your cart. Add luxury fragrances from BSG and proceed to checkout." path="/cart" />
        <section className="pt-32 pb-16 min-h-[70vh] flex items-center">
          <div className="container-luxury text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-24 h-24 mx-auto mb-8 rounded-full border-2 border-border flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h1 className="text-display-md text-foreground mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Looks like you haven't added any fragrances to your cart yet. 
                Explore our collection to find your signature scent.
              </p>
              <Link to="/shop">
                <Button variant="gold" size="lg">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Your Cart" description="View your cart. Add luxury fragrances from BSG and proceed to checkout." path="/cart" />
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-display-md text-foreground">Shopping Cart</h1>
              <Button variant="ghost" onClick={clearCart} className="text-muted-foreground">
                Clear Cart
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map((item, index) => {
                  const itemPrice = getItemPrice(item);
                  return (
                    <motion.div
                      key={`${item.product.id}-${item.selectedSize}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card-luxury p-6 flex flex-col sm:flex-row gap-6"
                    >
                      {/* Image - use API base for uploads */}
                      <Link to={`/product/${item.product.slug}`} className="shrink-0">
                        <div className="w-full sm:w-32 h-40 sm:h-32 bg-muted rounded-sm overflow-hidden">
                          <img
                            src={getProductImageUrl(item.product.images?.[0] || '') || '/placeholder.svg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex justify-between gap-4 mb-2">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-luxury text-muted-foreground">
                              {item.product.category.replace(/-/g, ' ')}
                            </p>
                            <Link
                              to={`/product/${item.product.slug}`}
                              className="font-display text-lg text-foreground hover:text-gold transition-colors block truncate"
                            >
                              {item.product.name}
                            </Link>
                            {item.selectedSize ? (
                              <p className="text-sm text-foreground mt-1 font-medium">
                                Size: {item.selectedSize}
                              </p>
                            ) : (
                              item.product.shortDescription && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {item.product.shortDescription}
                                </p>
                              )
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              Unit price: {formatPrice(itemPrice.ngn, itemPrice.usd)}
                              {item.quantity > 1 && (
                                <span className="ml-1">
                                  · {item.quantity} × {formatPrice(itemPrice.ngn, itemPrice.usd)}
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedSize)}
                            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-4 pt-2">
                          {/* Quantity */}
                          <div className="flex items-center border border-border rounded-sm">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.selectedSize
                                )
                              }
                              className="p-2 hover:bg-muted transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.selectedSize
                                )
                              }
                              className="p-2 hover:bg-muted transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right shrink-0">
                            <p className="text-gold font-medium">
                              {formatPrice(itemPrice.ngn * item.quantity, itemPrice.usd * item.quantity)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {currency === 'NGN' ? `$${(itemPrice.usd * item.quantity).toLocaleString()}` : `₦${(itemPrice.ngn * item.quantity).toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card-luxury p-8 sticky top-32"
                >
                  <h2 className="text-xl font-display text-foreground mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal.ngn, subtotal.usd)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="divider-gold mb-6" />

                  <div className="flex justify-between mb-8">
                    <span className="text-foreground font-medium">Total</span>
                    <div className="text-right">
                      <p className="text-xl text-gold font-display">
                        {formatPrice(subtotal.ngn, subtotal.usd)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currency === 'NGN' ? `$${subtotal.usd} USD` : `₦${subtotal.ngn.toLocaleString()} NGN`}
                      </p>
                    </div>
                  </div>

                  <Link to="/checkout" className="block">
                    <Button variant="gold" size="lg" className="w-full text-sm sm:text-base">
                      Checkout
                      <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
                    </Button>
                  </Link>

                  <Link to="/shop" className="block mt-4">
                    <Button variant="luxury" size="lg" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
