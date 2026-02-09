import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

function toProduct(p: {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  priceUSD: number;
  currency: string;
  category: string;
  subcategory: string | null;
  images: string;
  inStock: boolean;
  stockQuantity: number;
  sizes: string | null;
  notes: string | null;
  featured: boolean;
  new: boolean;
  comingSoon: boolean;
  createdAt: Date;
}) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    price: p.price,
    priceUSD: p.priceUSD,
    currency: p.currency,
    category: p.category,
    subcategory: p.subcategory ?? undefined,
    images: JSON.parse(p.images) as string[],
    inStock: p.inStock,
    stockQuantity: p.stockQuantity,
    sizes: p.sizes ? JSON.parse(p.sizes) : undefined,
    notes: p.notes ? JSON.parse(p.notes) : undefined,
    featured: p.featured,
    new: p.new,
    comingSoon: p.comingSoon,
    createdAt: p.createdAt.toISOString().slice(0, 10),
  };
}

// GET /admin/products - list all
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(products.map(toProduct));
  } catch (e) {
    console.error('GET /admin/products', e);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /admin/products - create
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      name: string;
      slug?: string;
      description: string;
      shortDescription: string;
      price: number;
      priceUSD: number;
      currency?: string;
      category: string;
      subcategory?: string;
      images: string[];
      inStock?: boolean;
      stockQuantity?: number;
      sizes?: { size: string; price: number; priceUSD: number }[];
      notes?: { top: string[]; middle: string[]; base: string[] };
      featured?: boolean;
      new?: boolean;
      comingSoon?: boolean;
    };
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        shortDescription: body.shortDescription,
        price: body.price,
        priceUSD: body.priceUSD,
        currency: body.currency || 'NGN',
        category: body.category,
        subcategory: body.subcategory ?? null,
        images: JSON.stringify(body.images || []),
        inStock: body.inStock ?? true,
        stockQuantity: body.stockQuantity ?? 0,
        sizes: body.sizes ? JSON.stringify(body.sizes) : null,
        notes: body.notes ? JSON.stringify(body.notes) : null,
        featured: body.featured ?? false,
        new: body.new ?? false,
        comingSoon: body.comingSoon ?? false,
      },
    });
    res.status(201).json(toProduct(product));
  } catch (e) {
    console.error('POST /admin/products', e);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /admin/products/:id - update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as Partial<{
      name: string;
      slug: string;
      description: string;
      shortDescription: string;
      price: number;
      priceUSD: number;
      currency: string;
      category: string;
      subcategory: string;
      images: string[];
      inStock: boolean;
      stockQuantity: number;
      sizes: { size: string; price: number; priceUSD: number }[];
      notes: { top: string[]; middle: string[]; base: string[] };
      featured: boolean;
      new: boolean;
      comingSoon: boolean;
    }>;
    const data: Record<string, unknown> = {};
    if (body.name != null) data.name = body.name;
    if (body.slug != null) data.slug = body.slug;
    if (body.description != null) data.description = body.description;
    if (body.shortDescription != null) data.shortDescription = body.shortDescription;
    if (body.price != null) data.price = body.price;
    if (body.priceUSD != null) data.priceUSD = body.priceUSD;
    if (body.currency != null) data.currency = body.currency;
    if (body.category != null) data.category = body.category;
    if (body.subcategory != null) data.subcategory = body.subcategory;
    if (body.images != null) data.images = JSON.stringify(body.images);
    if (body.inStock != null) data.inStock = body.inStock;
    if (body.stockQuantity != null) data.stockQuantity = body.stockQuantity;
    if (body.sizes != null) data.sizes = JSON.stringify(body.sizes);
    if (body.notes != null) data.notes = JSON.stringify(body.notes);
    if (body.featured != null) data.featured = body.featured;
    if (body.new != null) data.new = body.new;
    if (body.comingSoon != null) data.comingSoon = body.comingSoon;

    const product = await prisma.product.update({
      where: { id },
      data,
    });
    res.json(toProduct(product));
  } catch (e) {
    console.error('PUT /admin/products/:id', e);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /admin/products/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    console.error('DELETE /admin/products/:id', e);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
