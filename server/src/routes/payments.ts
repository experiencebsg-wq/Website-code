import { Router, Request, Response } from 'express';
import { isPaystackConfigured, verifyPaystackTransaction } from '../lib/paystack.js';

const router = Router();

// GET /payments/verify/:reference - verify Paystack transaction (uses Paystack REST API)
// NOTE: This is advisory for the storefront UI only. The authoritative check that a
// payment is real AND matches the order total happens in POST /checkout (orders.ts).
router.get('/verify/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      res.status(400).json({ success: false, message: 'Missing reference' });
      return;
    }
    if (!isPaystackConfigured()) {
      // Do NOT accept unverified payments. Fail closed.
      res.status(503).json({
        success: false,
        message: 'Payment verification is not configured on the server',
      });
      return;
    }

    const verified = await verifyPaystackTransaction(reference);
    if (verified) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          amount: verified.amount,
          currency: verified.currency,
          status: verified.status,
          reference: verified.reference,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (e) {
    console.error('GET /payments/verify', e);
    res.status(500).json({ success: false, message: 'Verification error' });
  }
});

export default router;
