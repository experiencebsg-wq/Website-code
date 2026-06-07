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

// Allowed raster image types only. SVG is intentionally excluded — it can carry
// script and would become stored XSS when served from /uploads.
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    // Derive the extension from the (validated) mimetype, not the client filename.
    const ext = MIME_TO_EXT[file.mimetype.toLowerCase()] || '.jpg';
    const rawBase = path.basename(file.originalname, path.extname(file.originalname));
    const base = rawBase.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') || 'image';
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (MIME_TO_EXT[file.mimetype.toLowerCase()]) cb(null, true);
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
