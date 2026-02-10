import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <Layout>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." path="/404" noIndex />
      <section className="pt-32 pb-16 min-h-[70vh] flex items-center">
        <div className="container-luxury text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-8xl font-display text-gold mb-4">404</h1>
            <h2 className="text-display-md text-foreground mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/">
                <Button variant="gold" size="lg">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              <Button variant="luxury" size="lg" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
