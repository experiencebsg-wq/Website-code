import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { requireAdmin } from '../../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Server root is one level up from src (src/routes/admin -> ../../../ = server root when running from server/)
const serverRoot = path.resolve(__dirname, '../../..');
const uploadsDir = path.join(serverRoot, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    const name = base || 'image';
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(jpe?g|png|webp|gif)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error('Only images (JPEG, PNG, WebP, GIF) are allowed'));
  },
});

const router = Router();
router.use(requireAdmin);

// POST /admin/upload - upload a single image
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const url = '/uploads/' + req.file.filename;
    res.json({ url });
  } catch (e) {
    console.error('POST /admin/upload', e);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
