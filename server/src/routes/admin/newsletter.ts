import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAdmin } from '../../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

// GET /admin/newsletter – list all newsletter subscribers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(subscribers);
  } catch (e) {
    console.error('GET /admin/newsletter', e);
    res.status(500).json({ error: 'Failed to fetch mailing list' });
  }
});

export default router;
