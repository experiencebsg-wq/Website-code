import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import logo from '@/assets/logo.png';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-luxury">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="relative z-10 group">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              src={logo}
              alt="BSG Beelicious Signatures Global"
              className="h-12 lg:h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={link.path}
                  className={`relative text-sm uppercase tracking-luxury transition-colors duration-300 group ${
                    location.pathname === link.path
                      ? 'text-gold'
                      : 'text-foreground/80 hover:text-gold'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                    location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="hidden lg:flex items-center space-x-4"
          >
            <CurrencyToggle />
            <Link to="/shop" className="text-foreground/80 hover:text-gold transition-all duration-300 hover:scale-110">
              <Search className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="relative text-foreground/80 hover:text-gold transition-all duration-300 hover:scale-110">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-gold-foreground text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-4">
            <Link to="/cart" className="relative text-foreground/80 hover:text-gold transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-gold-foreground text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background/98 backdrop-blur-md border-b border-border"
          >
            <div className="container-luxury py-8 space-y-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`block text-lg uppercase tracking-luxury py-2 ${
                      location.pathname === link.path
                        ? 'text-gold'
                        : 'text-foreground/80'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="pt-4 border-t border-border"
              >
                <CurrencyToggle />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
