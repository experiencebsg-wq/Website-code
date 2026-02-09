import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

function orderId() {
  return 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

// POST /orders (checkout) - create order after payment
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

    let totalNGN = 0;
    let totalUSD = 0;
    const lineItems: { productId: string; quantity: number; size?: string; priceNGN: number; priceUSD: number }[] = [];

    for (const item of items) {
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

    const id = orderId();
    const order = await prisma.order.create({
      data: {
        orderId: id,
        email,
        phone,
        whatsapp,
        shipping: JSON.stringify(shipping),
        notes: notes ?? null,
        paymentReference: paymentReference ?? null,
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
      reference: paymentReference ?? '',
      message: 'Your order has been placed successfully!',
    });
  } catch (e) {
    console.error('POST /orders', e);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;
