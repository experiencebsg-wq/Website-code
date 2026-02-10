import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return typeof email === 'string' && email.trim().length > 0 && email.length <= 254 && EMAIL_REGEX.test(email.trim());
}

// POST /newsletter – subscribe email (lead capture)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    const normalized = email?.trim().toLowerCase();
    if (!normalized || !isValidEmail(normalized)) {
      res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      return;
    }
    await prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      create: { email: normalized },
      update: {},
    });
    res.status(200).json({ success: true, message: "You're in! We'll keep you updated on new arrivals and exclusive offers." });
  } catch (e) {
    console.error('POST /newsletter', e);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again later.' });
  }
});

export default router;
