import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const comingSoonServices = [
  {
    emoji: '🍽️',
    title: 'Food & Cloud Kitchen',
    description:
      'Experience gourmet cuisine delivered to your doorstep. Our cloud kitchen will bring you the finest culinary delights.',
  },
  {
    emoji: '🎉',
    title: 'Catering Services',
    description:
      'Elevate your events with our premium catering services. From intimate gatherings to grand celebrations.',
  },
  {
    emoji: '💄',
    title: 'Makeup Services',
    description:
      'Professional makeup artistry for all occasions. Look and feel your absolute best.',
  },
  {
    emoji: '✨',
    title: 'Beauty & Lifestyle',
    description:
      'Comprehensive beauty and lifestyle services tailored to enhance your personal style.',
  },
];

export default function ComingSoon() {
  return (
    <Layout>
      <SEO title="Coming Soon" description="New services from BSG Beelicious Signatures Global – food, catering, makeup and beauty. Stay tuned." path="/coming-soon" />
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy-gradient">
        <div className="container-luxury text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm uppercase tracking-luxury text-gold mb-4">Expanding Horizons</p>
            <h1 className="text-display-lg text-foreground mb-4">Coming Soon</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We're working on exciting new services to enhance your lifestyle experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid sm:grid-cols-2 gap-8 mb-16">
            {comingSoonServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-luxury p-8 text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 shimmer-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-gold/30 flex items-center justify-center">
                    <span className="text-4xl">{service.emoji}</span>
                  </div>
                  <h3 className="text-display-sm text-foreground mb-4">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Notification Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-gold/30 flex items-center justify-center">
              <Bell className="w-7 h-7 text-gold" />
            </div>
            <h2 className="text-display-sm text-foreground mb-4">Be the First to Know</h2>
            <p className="text-muted-foreground mb-8">
              Sign up to receive exclusive updates when these services launch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 bg-card border-border flex-1"
              />
              <Button variant="gold" size="lg">
                Notify Me
              </Button>
            </div>
          </motion.div>

          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
