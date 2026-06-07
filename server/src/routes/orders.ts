import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { isPaystackConfigured, verifyPaystackTransaction } from '../lib/paystack.js';

const router = Router();

function orderId() {
  return 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

// POST /orders (checkout) - create order ONLY after the payment is verified server-side.
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      email: string;
      phone: string;
      whatsapp: string;
      createAccount?: boolean;
      shipping: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        country: string;
        postalCode?: string;
      };
      items: { productId: string; quantity: number; size?: string }[];
      notes?: string;
      paymentReference?: string;
    };

    const { email, phone, whatsapp, shipping, items, notes, paymentReference } = body;
    if (!email || !phone || !shipping || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Missing required fields: email, phone, shipping, items' });
      return;
    }

    // A verified payment reference is mandatory — no free orders.
    if (!paymentReference || typeof paymentReference !== 'string' || !paymentReference.trim()) {
      res.status(400).json({ error: 'Missing payment reference' });
      return;
    }
    const reference = paymentReference.trim();

    if (!isPaystackConfigured()) {
      // Fail closed: never create a "paid" order when we cannot verify payments.
      res.status(503).json({ error: 'Payment verification is not configured on the server' });
      return;
    }

    // Reject reused references (replay / double-spend of one payment).
    const existing = await prisma.order.findFirst({ where: { paymentReference: reference } });
    if (existing) {
      res.status(409).json({ error: 'Payment reference has already been used' });
      return;
    }

    // Recompute totals from the database — never trust client-supplied prices.
    let totalNGN = 0;
    let totalUSD = 0;
    const lineItems: { productId: string; quantity: number; size?: string; priceNGN: number; priceUSD: number }[] = [];

    for (const item of items) {
      if (!item || !item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        res.status(400).json({ error: 'Invalid item in cart' });
        return;
      }
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        res.status(400).json({ error: `Product not found: ${item.productId}` });
        return;
      }
      let priceNGN = product.price;
      let priceUSD = product.priceUSD;
      if (item.size && product.sizes) {
        const sizes = JSON.parse(product.sizes) as { size: string; price: number; priceUSD: number }[];
        const s = sizes.find((x) => x.size === item.size);
        if (s) {
          priceNGN = s.price;
          priceUSD = s.priceUSD;
        }
      }
      totalNGN += priceNGN * item.quantity;
      totalUSD += priceUSD * item.quantity;
      lineItems.push({
        productId: product.id,
        quantity: item.quantity,
        size: item.size,
        priceNGN,
        priceUSD,
      });
    }

    // Verify the transaction with Paystack.
    const verified = await verifyPaystackTransaction(reference);
    if (!verified) {
      res.status(402).json({ error: 'Payment could not be verified' });
      return;
    }

    // Confirm the amount actually paid matches the server-computed total for the
    // currency that was charged (Paystack amounts are in the smallest unit).
    const currency = verified.currency.toUpperCase();
    let expectedAmount: number | null = null;
    if (currency === 'NGN') expectedAmount = totalNGN * 100;
    else if (currency === 'USD') expectedAmount = totalUSD * 100;

    if (expectedAmount === null || verified.amount !== expectedAmount) {
      res.status(400).json({ error: 'Payment amount does not match order total' });
      return;
    }

    const id = orderId();
    const order = await prisma.order.create({
      data: {
        orderId: id,
        email,
        phone,
        whatsapp,
        shipping: JSON.stringify(shipping),
        notes: notes ?? null,
        paymentReference: reference,
        status: 'paid',
        totalNGN,
        totalUSD,
      },
    });

    for (const li of lineItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: li.productId,
          quantity: li.quantity,
          size: li.size ?? null,
          priceNGN: li.priceNGN,
          priceUSD: li.priceUSD,
        },
      });
    }

    res.status(201).json({
      success: true,
      orderId: id,
      reference,
      message: 'Your order has been placed successfully!',
    });
  } catch (e) {
    console.error('POST /orders', e);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;
