import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// POST /auth/login - admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, email: admin.email });
  } catch (e) {
    console.error('POST /auth/login', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /auth/me - get current admin (protected)
router.get('/me', requireAdmin, (req: Request, res: Response) => {
  const auth = (req as Request & { admin?: { adminId: string; email: string } }).admin;
  res.json({ email: auth?.email });
});

export default router;
