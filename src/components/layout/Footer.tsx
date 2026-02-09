import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

const footerLinks = {
  shop: [
    { name: 'Body Fragrances', path: '/shop?category=body-fragrance' },
    { name: 'Home & Space', path: '/shop?category=home-fragrance' },
    { name: 'New Arrivals', path: '/shop?new=true' },
    { name: 'Bestsellers', path: '/shop?featured=true' },
  ],
  company: [
    { name: 'Our Story', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Coming Soon', path: '/coming-soon' },
  ],
  support: [
    { name: 'Shipping Info', path: '/contact' },
    { name: 'Returns & Exchange', path: '/contact' },
    { name: 'FAQs', path: '/contact' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/experiencebsg?igsh=aXo4YXU1cTBqN3k4' },
  { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
  { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container-luxury section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Link to="/" className="inline-block hover-scale">
              <img
                src={logo}
                alt="BSG Beelicious Signatures Global"
                className="h-16 w-auto mb-6"
              />
            </Link>
            <p className="text-muted-foreground text-body mb-6 max-w-sm">
              Crafting luxury fragrances that tell your unique story. 
              Experience the art of scent with BSG Beelicious Signatures Global.
            </p>
            <p className="text-muted-foreground text-sm mb-2">
              <a href="https://experienceBSG.com" className="hover:text-gold transition-colors">experienceBSG.com</a>
              {' · '}
              <a href="mailto:experienceBSG@gmail.com" className="hover:text-gold transition-colors">experienceBSG@gmail.com</a>
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1, borderColor: 'hsl(43 74% 49%)' }}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm uppercase tracking-luxury text-gold mb-6">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 link-luxury"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm uppercase tracking-luxury text-gold mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 link-luxury"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm uppercase tracking-luxury text-gold mb-6">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 link-luxury"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="border-t border-border"
      >
        <div className="container-luxury py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BSG Beelicious Signatures Global. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            experienceBSG.com · Your Customized Experience
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
