// Server-side Paystack verification. Never trust the client that a payment
// succeeded — always verify the reference against Paystack with the secret key.

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
// Overridable for tests; defaults to the real Paystack API.
const PAYSTACK_VERIFY_URL =
  process.env.PAYSTACK_VERIFY_URL || 'https://api.paystack.co/transaction/verify/';

export interface VerifiedPayment {
  amount: number; // smallest currency unit (kobo for NGN, cents for USD)
  currency: string; // e.g. "NGN" | "USD"
  status: string; // "success" when paid
  reference: string;
}

export function isPaystackConfigured(): boolean {
  return !!PAYSTACK_SECRET && PAYSTACK_SECRET.startsWith('sk_');
}

/**
 * Verifies a transaction reference with Paystack.
 * - Throws `PAYSTACK_NOT_CONFIGURED` if no valid secret key is set (so we never
 *   silently accept unverified payments in production).
 * - Returns the verified payment when Paystack reports status === 'success'.
 * - Returns `null` for any non-successful / unknown reference.
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<VerifiedPayment | null> {
  if (!isPaystackConfigured()) {
    throw new Error('PAYSTACK_NOT_CONFIGURED');
  }

  const response = await fetch(`${PAYSTACK_VERIFY_URL}${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });

  const json = (await response.json()) as {
    status?: boolean;
    data?: {
      amount?: number;
      currency?: string;
      status?: string;
      reference?: string;
    };
  };

  const data = json?.data;
  if (json?.status && data?.status === 'success') {
    return {
      amount: Number(data.amount ?? 0),
      currency: String(data.currency ?? ''),
      status: data.status,
      reference: String(data.reference ?? reference),
    };
  }
  return null;
}
