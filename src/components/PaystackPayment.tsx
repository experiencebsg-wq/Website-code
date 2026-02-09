import { usePaystackPayment } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

interface PaystackPaymentProps {
  email: string;
  amount: number; // Amount in smallest unit (kobo for NGN, cents for USD)
  currency?: 'NGN' | 'USD';
  onSuccess: (reference: string) => void;
  onClose: () => void;
  disabled?: boolean;
  metadata?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    whatsapp?: string;
    items?: Array<{ productId: string; quantity: number; size?: string }>;
  };
}

// Paystack Public Key - This is a PUBLIC key and safe to expose in frontend code
// Get your key from: https://dashboard.paystack.com/settings/developers
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_2ee561f002328c3e2a27bce186a98b42090a552c';

export function PaystackPayment({
  email,
  amount,
  currency = 'NGN',
  onSuccess,
  onClose,
  disabled = false,
  metadata,
}: PaystackPaymentProps) {
  const config = {
    reference: `BSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    email,
    amount, // Amount in smallest unit
    currency, // NGN or USD
    publicKey: PAYSTACK_PUBLIC_KEY,
    metadata: {
      custom_fields: [
        {
          display_name: 'Customer Name',
          variable_name: 'customer_name',
          value: `${metadata?.firstName || ''} ${metadata?.lastName || ''}`.trim(),
        },
        {
          display_name: 'Phone',
          variable_name: 'phone',
          value: metadata?.phone || '',
        },
        {
          display_name: 'WhatsApp',
          variable_name: 'whatsapp',
          value: metadata?.whatsapp || '',
        },
        {
          display_name: 'Currency',
          variable_name: 'currency',
          value: currency,
        },
      ],
      items: metadata?.items || [],
    },
  };

  const handlePaystackSuccessAction = (reference: { reference: string }) => {
    onSuccess(reference.reference);
  };

  const handlePaystackCloseAction = () => {
    onClose();
  };

  const initializePayment = usePaystackPayment(config);

  const handleClick = () => {
    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.includes('your_public_key_here')) {
      console.error('Paystack public key is not configured');
      return;
    }
    initializePayment({
      onSuccess: handlePaystackSuccessAction,
      onClose: handlePaystackCloseAction,
    });
  };

  const isConfigured = PAYSTACK_PUBLIC_KEY && !PAYSTACK_PUBLIC_KEY.includes('your_public_key_here');

  const formatAmount = () => {
    const displayAmount = amount / 100; // Convert from smallest unit
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(displayAmount);
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="gold"
        size="lg"
        className="w-full"
        onClick={handleClick}
        disabled={disabled || !isConfigured}
      >
        {disabled ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatAmount()}
          </>
        )}
      </Button>
      
      {!isConfigured && (
        <p className="text-xs text-destructive text-center">
          Payment is not configured. Please contact support.
        </p>
      )}
      
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Secured by</span>
        <span className="font-semibold text-foreground">Paystack</span>
      </div>
    </div>
  );
}
