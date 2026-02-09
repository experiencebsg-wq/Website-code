import { useCurrency } from '@/contexts/CurrencyContext';
import { motion } from 'framer-motion';

export function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className="relative flex items-center gap-1 px-3 py-1.5 rounded-sm border border-border bg-muted/50 hover:bg-muted transition-colors"
      aria-label={`Switch to ${currency === 'NGN' ? 'USD' : 'NGN'}`}
    >
      <motion.span
        key={currency}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-sm font-medium text-gold"
      >
        {currency === 'NGN' ? '₦' : '$'}
      </motion.span>
      <span className="text-xs uppercase tracking-luxury text-muted-foreground">
        {currency}
      </span>
      <div className="ml-1 w-px h-3 bg-border" />
      <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
        {currency === 'NGN' ? 'USD' : 'NGN'}
      </span>
    </button>
  );
}
