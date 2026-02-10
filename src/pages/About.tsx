import { motion } from 'framer-motion';
import { Gem, Heart, Award, Globe } from 'lucide-react';
import { Layout } from '@/components/layout';
import { SEO } from '@/components/SEO';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import collectionImg from '@/assets/hero-collection.jpg';

const values = [
  {
    icon: Gem,
    title: 'Luxury',
    description:
      'We source only the finest fragrances and materials, ensuring every product embodies true luxury and elegance.',
  },
  {
    icon: Heart,
    title: 'Passion',
    description:
      'Our love for exquisite scents drives us to curate collections that inspire and delight our customers.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description:
      'We maintain the highest standards in product quality, customer service, and overall brand experience.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description:
      'From local to international, we bring luxury fragrances to customers wherever they are in the world.',
  },
];

export default function About() {
  return (
    <Layout>
      <SEO
        title="About Us"
        description="BSG Beelicious Signatures Global – our story, values and commitment to luxury fragrances. Premium perfumes, colognes and home scents in Nigeria and worldwide."
        path="/about"
      />
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy-gradient">
        <div className="container-luxury text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm uppercase tracking-luxury text-gold mb-4">Our Story</p>
            <h1 className="text-display-lg text-foreground mb-4">
              BSG Beelicious Signatures Global
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A journey of luxury, elegance, and the art of sophisticated living
            </p>
          </motion.div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="aspect-[4/5] rounded-sm overflow-hidden bg-muted relative">
                <img 
                  src={collectionImg} 
                  alt="BSG Fragrance Collection" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                  <img src={logo} alt="BSG Logo" className="w-24 h-24 object-contain" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p className="text-sm uppercase tracking-luxury text-gold mb-4">The Beginning</p>
              <h2 className="text-display-md text-foreground mb-6">
                Born From Passion
              </h2>
              <div className="space-y-6 text-muted-foreground">
                <p className="text-body-lg">
                  BSG Beelicious Signatures Global was born from a passion for luxury and an 
                  unwavering commitment to excellence. We believe that fragrance is more 
                  than just a scent—it's a signature, a statement, and an extension of 
                  one's personality.
                </p>
                <p className="text-body">
                  Our journey began with a simple vision: to bring world-class luxury 
                  fragrances and home scents to discerning customers who appreciate the 
                  finer things in life. Every product in our collection is carefully 
                  curated to meet the highest standards of quality and sophistication.
                </p>
                <p className="text-body">
                  Today, we stand as a beacon of luxury in the fragrance industry, 
                  offering an exclusive range of body perfumes, home fragrances, and 
                  soon, gourmet food and beauty services. Our commitment remains 
                  unchanged: to deliver exceptional experiences that leave lasting impressions.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-card">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm uppercase tracking-luxury text-gold mb-4">What Drives Us</p>
            <h2 className="text-display-md text-foreground mb-4">Our Core Values</h2>
            <div className="divider-gold-short mx-auto" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-gold/30 flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <p className="text-sm uppercase tracking-luxury text-gold mb-4">Our Vision</p>
              <h2 className="text-display-md text-foreground mb-8">
                Redefining Luxury Living
              </h2>
              <p className="text-body-lg text-muted-foreground mb-8">
                As we expand into new territories—from gourmet food and cloud kitchens 
                to professional beauty services—our mission remains the same: to create 
                exceptional experiences that celebrate the art of luxury living.
              </p>
              <div className="divider-gold mb-8" />
              <p className="text-muted-foreground italic font-display text-xl">
                "Join us on this journey as we continue to redefine what it means to live beautifully."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy-gradient">
        <div className="container-luxury text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-display-md text-foreground mb-6">
              Experience Luxury Today
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Discover our collection of exquisite fragrances and find your signature scent.
            </p>
            <Link to="/shop">
              <Button variant="gold" size="xl">
                Shop Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
