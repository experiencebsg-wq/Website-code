import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout';
import { ProductGrid } from '@/components/products';
import { fetchFeaturedProducts, Product } from '@/services/api';
import heroVideo from '@/assets/hero-video.mp4';
import logo from '@/assets/logo.png';
import ingredientsImg from '@/assets/fragrance-ingredients.jpg';
import collectionImg from '@/assets/hero-collection.jpg';
import homeSpaceImg from '@/assets/home-space-collection.jpg';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchFeaturedProducts();
        setFeaturedProducts(products ?? []);
      } catch (e) {
        setFeaturedProducts([]);
        setFetchError(e instanceof Error ? e.message : 'Could not load products.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <Layout>
      {/* Hero Section with Video */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover"
            style={{ 
              aspectRatio: '16/9',
            }}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container-luxury text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <p className="text-sm uppercase tracking-luxury-wide text-gold mb-6">
              Your Customized Experience
            </p>
            <h1 className="text-display-xl text-foreground mb-6">
              The Art of
              <span className="block text-gold-gradient">Luxury Fragrance</span>
            </h1>
            <p className="text-body-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Discover exquisite scents crafted for those who appreciate the finer things in life. 
              Each fragrance tells a unique story of elegance and sophistication.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shop">
                <Button variant="hero" size="xl">
                  Explore Collection
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="luxury" size="xl">
                  Our Story
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-gold rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Brand Story Teaser */}
      <section className="section-padding bg-card">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-sm uppercase tracking-luxury text-gold mb-4">Our Philosophy</p>
              <h2 className="text-display-md text-foreground mb-6">
                Crafting Moments of Pure Elegance
              </h2>
              <p className="text-body-lg text-muted-foreground mb-6">
                At BSG Beelicious Signatures Global, we believe that fragrance is more than just a scent—it's 
                an expression of your unique identity. Each of our creations is meticulously crafted 
                using the finest ingredients sourced from around the world.
              </p>
              <p className="text-body text-muted-foreground mb-8">
                From the sun-drenched fields of Provence to the exotic markets of Marrakech, 
                we curate only the most exceptional elements to create fragrances that leave 
                a lasting impression.
              </p>
              <Link to="/about">
                <Button variant="goldOutline" size="lg">
                  Discover Our Story
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-sm overflow-hidden bg-muted">
                <img 
                  src={ingredientsImg} 
                  alt="Premium fragrance ingredients" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-gold/30 rounded-sm" />
              <div className="absolute -top-4 -right-4 p-2 bg-card rounded-sm shadow-lg">
                <img src={logo} alt="BSG Logo" className="w-16 h-16 object-contain" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm uppercase tracking-luxury text-gold mb-4">Curated Selection</p>
            <h2 className="text-display-md text-foreground mb-4">Featured Fragrances</h2>
            <div className="divider-gold-short mx-auto" />
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-luxury animate-pulse">
                  <div className="aspect-product bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-20 bg-muted rounded" />
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">Could not load featured products</p>
              <p className="text-sm text-muted-foreground">{fetchError}</p>
            </div>
          ) : (
            <ProductGrid products={featuredProducts.slice(0, 4)} columns={4} />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/shop">
              <Button variant="goldOutline" size="lg">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="section-padding bg-navy-gradient">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm uppercase tracking-luxury text-gold mb-4">Collections</p>
            <h2 className="text-display-md text-foreground mb-4">Explore Our Range</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Body Fragrances */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link to="/shop?category=body-fragrance" className="group block">
                <div className="card-luxury overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={collectionImg} 
                      alt="Body Fragrances Collection" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 text-center p-8">
                      <h3 className="text-display-sm text-foreground mb-3 group-hover:text-gold transition-colors">
                        Body Fragrances
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Exquisite perfumes for men & women
                      </p>
                      <span className="text-gold text-sm uppercase tracking-luxury inline-flex items-center">
                        Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Home Fragrances */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Link to="/shop?category=home-fragrance" className="group block">
                <div className="card-luxury overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={homeSpaceImg} 
                      alt="Home & Space – Diffusers, candles & more" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 text-center p-8">
                      <h3 className="text-display-sm text-foreground mb-3 group-hover:text-gold transition-colors">
                        Home & Space
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Diffusers, candles & more
                      </p>
                      <span className="text-gold text-sm uppercase tracking-luxury inline-flex items-center">
                        Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coming Soon Sections */}
      <section className="section-padding">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm uppercase tracking-luxury text-gold mb-4">Coming Soon</p>
            <h2 className="text-display-md text-foreground mb-4">Expanding Horizons</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're growing to bring you more premium experiences. Stay tuned for these exciting new offerings.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Food & Catering */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link to="/coming-soon" className="group block">
                <div className="card-luxury p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 shimmer-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-gold/30 flex items-center justify-center">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <h3 className="text-display-sm text-foreground mb-3">
                      Food & Catering
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Cloud kitchen & premium catering services
                    </p>
                    <span className="text-gold text-sm uppercase tracking-luxury">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Makeup & Lifestyle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Link to="/coming-soon" className="group block">
                <div className="card-luxury p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 shimmer-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-gold/30 flex items-center justify-center">
                      <span className="text-2xl">💄</span>
                    </div>
                    <h3 className="text-display-sm text-foreground mb-3">
                      Makeup & Lifestyle
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Beauty services & lifestyle experiences
                    </p>
                    <span className="text-gold text-sm uppercase tracking-luxury">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="section-padding bg-card border-t border-border">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="text-sm uppercase tracking-luxury text-gold mb-4">Stay Connected</p>
            <h2 className="text-display-md text-foreground mb-6">
              Join the BSG Family
            </h2>
            <p className="text-muted-foreground mb-8">
              Be the first to know about new arrivals, exclusive offers, and the latest from our world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 bg-muted border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              />
              <Button variant="gold" size="lg">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
