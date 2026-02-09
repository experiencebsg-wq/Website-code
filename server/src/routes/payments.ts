import { Router, Request, Response } from 'express';

const router = Router();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify/';

// GET /payments/verify/:reference - verify Paystack transaction (uses Paystack REST API)
router.get('/verify/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      res.status(400).json({ success: false, message: 'Missing reference' });
      return;
    }
    if (!PAYSTACK_SECRET || !PAYSTACK_SECRET.startsWith('sk_')) {
      // No valid Paystack key: accept any reference (dev mode)
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          amount: 0,
          currency: 'NGN',
          transaction_date: new Date().toISOString(),
          status: 'success',
          reference,
        },
      });
      return;
    }
    const response = await fetch(`${PAYSTACK_VERIFY_URL}${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });
    const json = (await response.json()) as {
      status: boolean;
      data?: {
        amount: number;
        currency: string;
        transaction_date: string;
        status: string;
        reference: string;
      };
    };
    const data = json.data;
    if (json.status && data?.status === 'success') {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          amount: data.amount,
          currency: data.currency,
          transaction_date: data.transaction_date,
          status: data.status,
          reference: data.reference,
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
