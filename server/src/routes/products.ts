import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Map DB product to frontend Product shape
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
  weightGrams: number | null;
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
    category: p.category as 'body-fragrance-male' | 'body-fragrance-female' | 'home-fragrance',
    subcategory: p.subcategory ?? undefined,
    images: JSON.parse(p.images) as string[],
    inStock: p.inStock,
    stockQuantity: p.stockQuantity,
    sizes: p.sizes ? (JSON.parse(p.sizes) as { size: string; price: number; priceUSD: number }[]) : undefined,
    notes: p.notes ? (JSON.parse(p.notes) as { top: string[]; middle: string[]; base: string[] }) : undefined,
    featured: p.featured,
    new: p.new,
    comingSoon: p.comingSoon,
    weightGrams: p.weightGrams ?? undefined,
    createdAt: p.createdAt.toISOString().slice(0, 10),
  };
}

// GET /products - list products (with optional filters for shop)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, featured, search, minPrice, maxPrice, sort } = req.query;
    const where: Record<string, unknown> = {};
    if (typeof category === 'string' && category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (typeof search === 'string' && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { description: { contains: term } },
        { shortDescription: { contains: term } },
      ];
    }
    const priceCond: { gte?: number; lte?: number } = {};
    if (minPrice != null) priceCond.gte = Number(minPrice);
    if (maxPrice != null) priceCond.lte = Number(maxPrice);
    if (Object.keys(priceCond).length) where.price = priceCond;

    const orderBy: Record<string, string> = {};
    if (sort === 'price_asc') orderBy.price = 'asc';
    else if (sort === 'price_desc') orderBy.price = 'desc';
    else if (sort === 'newest') orderBy.createdAt = 'desc';
    else orderBy.createdAt = 'desc';

    const products = await prisma.product.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy,
    });
    res.json(products.map(toProduct));
  } catch (e) {
    console.error('GET /products', e);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /products/featured
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products.map(toProduct));
  } catch (e) {
    console.error('GET /products/featured', e);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// GET /products/:id - get by id or slug
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(toProduct(product));
  } catch (e) {
    console.error('GET /products/:id', e);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
