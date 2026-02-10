import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

export default function OrderSuccess() {
  const location = useLocation();
  const { orderId, reference } = location.state || {};

  return (
    <Layout>
      <SEO title="Order Confirmed" description="Thank you for your order." path="/order-success" noIndex />
      <section className="pt-32 pb-16 min-h-[70vh] flex items-center">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gold/10 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-gold" />
            </div>

            <h1 className="text-display-md text-foreground mb-4">Thank You!</h1>
            <p className="text-body-lg text-muted-foreground mb-8">
              Your order has been placed successfully. We'll be in touch shortly with payment 
              instructions and shipping details.
            </p>

            {(orderId || reference) && (
              <div className="card-luxury p-8 mb-10 text-left">
                <h2 className="text-lg font-display text-foreground mb-4 text-center">
                  Order Details
                </h2>
                <div className="space-y-4">
                  {orderId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="text-foreground font-mono">{orderId}</span>
                    </div>
                  )}
                  {reference && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="text-gold font-mono">{reference}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-muted-foreground mb-8">
              A confirmation email has been sent to your email address. Please save your 
              order reference for future communication.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shop">
                <Button variant="gold" size="lg">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="luxury" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
