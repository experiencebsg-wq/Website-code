import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import contactRouter from './routes/contact.js';
import newsletterRouter from './routes/newsletter.js';
import paymentsRouter from './routes/payments.js';
import authRouter from './routes/auth.js';
import adminProductsRouter from './routes/admin/products.js';
import adminOrdersRouter from './routes/admin/orders.js';
import adminContactsRouter from './routes/admin/contacts.js';
import adminNewsletterRouter from './routes/admin/newsletter.js';
import adminUploadRouter from './routes/admin/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
// CORS: allow localhost and 127.0.0.1 on any port so store/admin work from either URL
const corsOrigins = (process.env.FRONTEND_URL || 'http://localhost:8080,http://localhost:5174').split(',').map((s) => s.trim());
const corsOptions = {
  origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return cb(null, true);
    const allowed = corsOrigins.some((o) => origin === o);
    if (allowed) return cb(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded images (storefront and admin load from API origin)
const uploadsDir = path.join(path.dirname(__dirname), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Public API (used by storefront)
app.use('/products', productsRouter);
app.use('/checkout', ordersRouter);
app.use('/contact', contactRouter);
app.use('/newsletter', newsletterRouter);
app.use('/payments', paymentsRouter);
app.use('/auth', authRouter);

// Admin API (protected by route-level middleware)
app.use('/admin/products', adminProductsRouter);
app.use('/admin/orders', adminOrdersRouter);
app.use('/admin/contacts', adminContactsRouter);
app.use('/admin/newsletter', adminNewsletterRouter);
app.use('/admin/upload', adminUploadRouter);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`BSG API running at http://localhost:${PORT}`);
});
