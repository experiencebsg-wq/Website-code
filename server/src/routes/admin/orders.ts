import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

// GET /admin/orders - list all
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where = typeof status === 'string' && status ? { status } : {};
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });
    res.json(
      orders.map((o) => ({
        id: o.id,
        orderId: o.orderId,
        email: o.email,
        phone: o.phone,
        whatsapp: o.whatsapp,
        shipping: JSON.parse(o.shipping),
        notes: o.notes,
        paymentReference: o.paymentReference,
        status: o.status,
        totalNGN: o.totalNGN,
        totalUSD: o.totalUSD,
        createdAt: o.createdAt,
        items: o.orderItems.map((i) => ({
          productId: i.productId,
          productName: i.product.name,
          quantity: i.quantity,
          size: i.size,
          priceNGN: i.priceNGN,
          priceUSD: i.priceUSD,
        })),
      }))
    );
  } catch (e) {
    console.error('GET /admin/orders', e);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /admin/orders/:id - get one
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderId: id }] },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({
      id: order.id,
      orderId: order.orderId,
      email: order.email,
      phone: order.phone,
      whatsapp: order.whatsapp,
      shipping: JSON.parse(order.shipping),
      notes: order.notes,
      paymentReference: order.paymentReference,
      status: order.status,
      totalNGN: order.totalNGN,
      totalUSD: order.totalUSD,
      createdAt: order.createdAt,
      items: order.orderItems.map((i) => ({
        productId: i.productId,
        productName: i.product.name,
        slug: i.product.slug,
        quantity: i.quantity,
        size: i.size,
        priceNGN: i.priceNGN,
        priceUSD: i.priceUSD,
      })),
    });
  } catch (e) {
    console.error('GET /admin/orders/:id', e);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PATCH /admin/orders/:id - update status
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };
    if (!status) {
      res.status(400).json({ error: 'status required' });
      return;
    }
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderId: id }] },
    });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    await prisma.order.update({
      where: { id: order.id },
      data: { status },
    });
    res.json({ success: true, status });
  } catch (e) {
    console.error('PATCH /admin/orders/:id', e);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
