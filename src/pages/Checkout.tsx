import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { SEO } from '@/components/SEO';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { submitCheckout, verifyPayment, CheckoutData } from '@/services/api';
import { PaystackPayment } from '@/components/PaystackPayment';
import { toast } from 'sonner';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCart();
  const { currency, formatPrice } = useCurrency();
  const subtotal = getSubtotal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    notes: '',
  });

  // Get the appropriate amount based on selected currency
  const getPaymentAmount = () => {
    // Convert to smallest unit (kobo for NGN, cents for USD)
    return currency === 'NGN' ? subtotal.ngn * 100 : subtotal.usd * 100;
  };

  const getDisplayTotal = () => {
    return currency === 'NGN' ? subtotal.ngn : subtotal.usd;
  };

  const getItemPrice = (item: (typeof items)[0]) => {
    if (item.selectedSize && item.product.sizes) {
      const s = item.product.sizes.find((x) => x.size === item.selectedSize);
      if (s) return { ngn: s.price, usd: s.priceUSD };
    }
    return { ngn: item.product.price, usd: item.product.priceUSD };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.phone &&
      formData.whatsapp &&
      formData.firstName &&
      formData.lastName &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.country
    );
  };

  const handlePaymentSuccess = async (reference: string) => {
    setIsSubmitting(true);

    try {
      // Verify payment with backend
      const verificationResponse = await verifyPayment(reference);
      
      if (verificationResponse.success) {
        // Submit order after successful payment
        const checkoutData: CheckoutData = {
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          createAccount,
          shipping: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postalCode: formData.postalCode,
          },
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.selectedSize,
          })),
          notes: formData.notes,
          paymentReference: reference,
        };

        const orderResponse = await submitCheckout(checkoutData);
        
        if (orderResponse.success) {
          clearCart();
          toast.success('Payment successful!');
          navigate('/order-success', {
            state: {
              orderId: orderResponse.orderId,
              reference: reference,
            },
          });
        }
      } else {
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentClose = () => {
    toast.info('Payment was cancelled');
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <SEO title="Checkout" description="Complete your order. Secure payment with Paystack." path="/checkout" noIndex />
      <section className="pt-32 pb-16">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-display-md text-foreground mb-10 text-center">Checkout</h1>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid lg:grid-cols-3 gap-10">
                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-10">
                  {/* Contact Information */}
                  <div className="card-luxury p-8">
                    <h2 className="text-xl font-display text-foreground mb-6">
                      Contact Information
                    </h2>
                    <div className="grid gap-6">
                      <div>
                        <Label htmlFor="email" className="text-muted-foreground">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="mt-2 h-12 bg-muted border-border"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="phone" className="text-muted-foreground">
                            Phone Number *
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="mt-2 h-12 bg-muted border-border"
                            placeholder="+234..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="whatsapp" className="text-muted-foreground">
                            WhatsApp Number *
                          </Label>
                          <Input
                            id="whatsapp"
                            name="whatsapp"
                            type="tel"
                            value={formData.whatsapp}
                            onChange={handleInputChange}
                            required
                            className="mt-2 h-12 bg-muted border-border"
                            placeholder="+234..."
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="createAccount"
                          checked={createAccount}
                          onCheckedChange={(checked) => setCreateAccount(checked as boolean)}
                        />
                        <Label htmlFor="createAccount" className="text-muted-foreground">
                          Create an account for faster checkout next time
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="card-luxury p-8">
                    <h2 className="text-xl font-display text-foreground mb-6">
                      Shipping Address
                    </h2>
                    <div className="grid gap-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="firstName" className="text-muted-foreground">
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="mt-2 h-12 bg-muted border-border"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-muted-foreground">
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="mt-2 h-12 bg-muted border-border"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address" className="text-muted-foreground">
                          Street Address *
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="mt-2 h-12 bg-muted border-border"
                          placeholder="123 Main Street, Apartment 4"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="city" className="text-muted-foreground">
                            City *
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="mt-2 h-12 bg-muted border-border"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-muted-foreground">
                            State *
                          </Label>
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="mt-2 h-12 bg-muted border-border"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="country" className="text-muted-foreground">
                            Country *
                          </Label>
                          <Input
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                            className="mt-2 h-12 bg-muted border-border"
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode" className="text-muted-foreground">
                            Postal Code
                          </Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className="mt-2 h-12 bg-muted border-border"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="card-luxury p-8">
                    <h2 className="text-xl font-display text-foreground mb-6">
                      Order Notes (Optional)
                    </h2>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-muted border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Any special instructions for your order..."
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="card-luxury p-8 sticky top-32">
                    <h2 className="text-xl font-display text-foreground mb-6">Your Order</h2>
                    
                    {/* Items */}
                    <div className="space-y-4 mb-6">
                      {items.map((item) => {
                        const itemPrice = getItemPrice(item);
                        return (
                          <div
                            key={`${item.product.id}-${item.selectedSize}`}
                            className="flex justify-between text-sm gap-2"
                          >
                            <span className="text-muted-foreground min-w-0">
                              {item.product.name}
                              {item.selectedSize && ` (${item.selectedSize})`} × {item.quantity}
                            </span>
                            <span className="text-foreground shrink-0">
                              {formatPrice(itemPrice.ngn * item.quantity, itemPrice.usd * item.quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="divider-gold mb-6" />

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal.ngn, subtotal.usd)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span>Calculated after order</span>
                      </div>
                    </div>

                    <div className="divider-gold mb-6" />

                    <div className="flex justify-between mb-8">
                      <span className="text-foreground font-medium">Total</span>
                      <div className="text-right">
                        <p className="text-xl text-gold font-display">
                          {formatPrice(subtotal.ngn, subtotal.usd)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {currency === 'NGN' ? `$${subtotal.usd} USD` : `₦${subtotal.ngn.toLocaleString()} NGN`}
                        </p>
                      </div>
                    </div>

                    <PaystackPayment
                      email={formData.email}
                      amount={getPaymentAmount()}
                      currency={currency}
                      onSuccess={handlePaymentSuccess}
                      onClose={handlePaymentClose}
                      disabled={isSubmitting || !isFormValid()}
                      metadata={{
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        phone: formData.phone,
                        whatsapp: formData.whatsapp,
                        items: items.map((item) => ({
                          productId: item.product.id,
                          quantity: item.quantity,
                          size: item.selectedSize,
                        })),
                      }}
                    />

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Pay securely with card, bank transfer, USSD, or mobile money.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
