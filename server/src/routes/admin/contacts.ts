import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

// GET /admin/contacts - list all messages
router.get('/', async (_req: Request, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (e) {
    console.error('GET /admin/contacts', e);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// PATCH /admin/contacts/:id/read - mark as read
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (e) {
    console.error('PATCH /admin/contacts/:id/read', e);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

export default router;
