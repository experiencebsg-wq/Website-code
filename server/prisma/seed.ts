import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const productImages: Record<string, string> = {
  'midnight-velvet': '/assets/products/midnight-velvet.jpg',
  'lumiere-dor': '/assets/products/lumiere-dor.jpg',
  'casa-serena': '/assets/products/casa-serena.jpg',
  'royal-noir': '/assets/products/royal-noir.jpg',
  'fleur-eternelle': '/assets/products/fleur-eternelle.jpg',
  'ambre-noir-candle': '/assets/products/ambre-noir-candle.jpg',
  'ocean-breeze-auto': '/assets/products/ocean-breeze-auto.jpg',
  'silk-dreams': '/assets/products/silk-dreams.jpg',
  'sovereign-oud': '/assets/products/sovereign-oud.jpg',
  'azure-coast': '/assets/products/azure-coast.jpg',
  'noble-sage': '/assets/products/noble-sage.jpg',
  'rose-velours': '/assets/products/rose-velours.jpg',
  'orchid-mystique': '/assets/products/orchid-mystique.jpg',
  'golden-amber': '/assets/products/golden-amber.jpg',
  'lavender-dreams': '/assets/products/lavender-dreams.jpg',
  'cedar-moss': '/assets/products/cedar-moss.jpg',
  'citrus-grove': '/assets/products/citrus-grove.jpg',
  'fresh-linen': '/assets/products/fresh-linen.jpg',
};

const mockProducts = [
  { id: '1', name: 'Midnight Velvet', slug: 'midnight-velvet', description: 'A sophisticated blend of deep oud, velvety rose, and warm amber.', shortDescription: 'Deep oud with velvety rose and warm amber', price: 85000, priceUSD: 95, category: 'body-fragrance-male', images: ['midnight-velvet'], inStock: true, stockQuantity: 15, sizes: [{ size: '30ml', price: 45000, priceUSD: 50 }, { size: '50ml', price: 65000, priceUSD: 72 }, { size: '100ml', price: 85000, priceUSD: 95 }], notes: { top: ['Bergamot', 'Pink Pepper', 'Cardamom'], middle: ['Rose', 'Oud', 'Saffron'], base: ['Amber', 'Sandalwood', 'Musk'] }, featured: true, new: false, createdAt: '2024-01-01' },
  { id: '2', name: "Lumière D'Or", slug: 'lumiere-dor', description: 'A radiant feminine fragrance that captures the golden hour.', shortDescription: 'Radiant jasmine and tuberose with precious woods', price: 78000, priceUSD: 87, category: 'body-fragrance-female', images: ['lumiere-dor'], inStock: true, stockQuantity: 20, sizes: [{ size: '30ml', price: 42000, priceUSD: 47 }, { size: '50ml', price: 58000, priceUSD: 65 }, { size: '100ml', price: 78000, priceUSD: 87 }], notes: { top: ['Bergamot', 'Mandarin', 'Pear'], middle: ['Jasmine', 'Tuberose', 'Rose'], base: ['Sandalwood', 'Vanilla', 'White Musk'] }, featured: true, new: true, createdAt: '2024-01-15' },
  { id: '3', name: 'Casa Serena', slug: 'casa-serena', description: 'Transform your space with this calming home fragrance.', shortDescription: 'Calming lavender and cedarwood home diffuser', price: 35000, priceUSD: 39, category: 'home-fragrance', subcategory: 'diffuser', images: ['casa-serena'], inStock: true, stockQuantity: 30, sizes: null, notes: null, featured: true, new: false, createdAt: '2024-02-01' },
  { id: '4', name: 'Royal Noir', slug: 'royal-noir', description: 'An opulent masculine fragrance with rich leather, tobacco, and vanilla.', shortDescription: 'Rich leather and tobacco with vanilla', price: 92000, priceUSD: 102, category: 'body-fragrance-male', images: ['royal-noir'], inStock: true, stockQuantity: 12, sizes: [{ size: '30ml', price: 48000, priceUSD: 53 }, { size: '50ml', price: 68000, priceUSD: 76 }, { size: '100ml', price: 92000, priceUSD: 102 }], notes: { top: ['Black Pepper', 'Rum', 'Apple'], middle: ['Leather', 'Tobacco', 'Geranium'], base: ['Vanilla', 'Tonka Bean', 'Vetiver'] }, featured: false, new: true, createdAt: '2024-03-01' },
  { id: '5', name: 'Fleur Éternelle', slug: 'fleur-eternelle', description: 'A timeless floral bouquet celebrating eternal femininity.', shortDescription: 'Timeless peony and magnolia bouquet', price: 72000, priceUSD: 80, category: 'body-fragrance-female', images: ['fleur-eternelle'], inStock: true, stockQuantity: 18, sizes: [{ size: '30ml', price: 38000, priceUSD: 42 }, { size: '50ml', price: 52000, priceUSD: 58 }, { size: '100ml', price: 72000, priceUSD: 80 }], notes: { top: ['Pink Pepper', 'Pear', 'Bergamot'], middle: ['Peony', 'Magnolia', 'Iris'], base: ['White Musk', 'Cedarwood', 'Ambrox'] }, featured: true, new: false, createdAt: '2024-01-20' },
  { id: '6', name: 'Ambre Noir Candle', slug: 'ambre-noir-candle', description: 'Luxury scented candle with warm amber, vanilla, and a hint of smoke.', shortDescription: 'Warm amber and vanilla scented candle', price: 28000, priceUSD: 31, category: 'home-fragrance', subcategory: 'candle', images: ['ambre-noir-candle'], inStock: true, stockQuantity: 25, sizes: null, notes: null, featured: false, new: false, createdAt: '2024-02-10' },
  { id: '7', name: 'Ocean Breeze Auto', slug: 'ocean-breeze-auto', description: 'Premium auto freshener with refreshing marine and citrus notes.', shortDescription: 'Refreshing marine auto freshener', price: 15000, priceUSD: 17, category: 'home-fragrance', subcategory: 'auto-freshener', images: ['ocean-breeze-auto'], inStock: true, stockQuantity: 40, sizes: null, notes: null, featured: false, new: true, createdAt: '2024-03-15' },
  { id: '8', name: 'Silk Dreams', slug: 'silk-dreams', description: 'Luxurious fabric fragrance that leaves your linens smelling divine.', shortDescription: 'Soft floral fabric fragrance', price: 22000, priceUSD: 24, category: 'home-fragrance', subcategory: 'fabric-fragrance', images: ['silk-dreams'], inStock: false, stockQuantity: 0, sizes: null, notes: null, featured: false, new: false, createdAt: '2024-02-20' },
  { id: '9', name: 'Sovereign Oud', slug: 'sovereign-oud', description: 'A majestic fragrance featuring the finest oud from the Middle East.', shortDescription: 'Rich oud with leather and spices', price: 120000, priceUSD: 133, category: 'body-fragrance-male', images: ['sovereign-oud'], inStock: true, stockQuantity: 8, sizes: [{ size: '30ml', price: 65000, priceUSD: 72 }, { size: '50ml', price: 88000, priceUSD: 98 }, { size: '100ml', price: 120000, priceUSD: 133 }], notes: { top: ['Saffron', 'Cinnamon', 'Cardamom'], middle: ['Oud', 'Leather', 'Rose'], base: ['Amber', 'Sandalwood', 'Musk'] }, featured: true, new: true, createdAt: '2024-04-01' },
  { id: '10', name: 'Azure Coast', slug: 'azure-coast', description: 'A fresh and invigorating scent inspired by Mediterranean coastlines.', shortDescription: 'Fresh marine with citrus notes', price: 68000, priceUSD: 75, category: 'body-fragrance-male', images: ['azure-coast'], inStock: true, stockQuantity: 22, sizes: [{ size: '30ml', price: 35000, priceUSD: 39 }, { size: '50ml', price: 48000, priceUSD: 53 }, { size: '100ml', price: 68000, priceUSD: 75 }], notes: { top: ['Bergamot', 'Sea Salt', 'Grapefruit'], middle: ['Lavender', 'Rosemary', 'Geranium'], base: ['Driftwood', 'White Musk', 'Ambergris'] }, featured: false, new: false, createdAt: '2024-02-15' },
  { id: '11', name: 'Noble Sage', slug: 'noble-sage', description: 'An aromatic masterpiece where sage takes center stage.', shortDescription: 'Aromatic sage with woody undertones', price: 75000, priceUSD: 83, category: 'body-fragrance-male', images: ['noble-sage'], inStock: false, stockQuantity: 0, sizes: [{ size: '30ml', price: 40000, priceUSD: 44 }, { size: '50ml', price: 55000, priceUSD: 61 }, { size: '100ml', price: 75000, priceUSD: 83 }], notes: { top: ['Sage', 'Juniper', 'Bergamot'], middle: ['Lavender', 'Violet Leaf', 'Nutmeg'], base: ['Vetiver', 'Cedarwood', 'Patchouli'] }, featured: false, new: false, createdAt: '2024-01-25' },
  { id: '12', name: 'Rose Velours', slug: 'rose-velours', description: 'A romantic ode to the queen of flowers.', shortDescription: 'Romantic rose with velvet musk', price: 88000, priceUSD: 98, category: 'body-fragrance-female', images: ['rose-velours'], inStock: true, stockQuantity: 14, sizes: [{ size: '30ml', price: 46000, priceUSD: 51 }, { size: '50ml', price: 64000, priceUSD: 71 }, { size: '100ml', price: 88000, priceUSD: 98 }], notes: { top: ['Pink Pepper', 'Lychee', 'Raspberry'], middle: ['Bulgarian Rose', 'Peony', 'Oud'], base: ['Velvet Musk', 'Patchouli', 'Vanilla'] }, featured: true, new: true, createdAt: '2024-04-10' },
  { id: '13', name: 'Orchid Mystique', slug: 'orchid-mystique', description: 'An exotic journey through tropical gardens.', shortDescription: 'Exotic orchid with vanilla', price: 82000, priceUSD: 91, category: 'body-fragrance-female', images: ['orchid-mystique'], inStock: true, stockQuantity: 16, sizes: [{ size: '30ml', price: 43000, priceUSD: 48 }, { size: '50ml', price: 60000, priceUSD: 67 }, { size: '100ml', price: 82000, priceUSD: 91 }], notes: { top: ['Mandarin', 'Ginger', 'Pink Pepper'], middle: ['Black Orchid', 'Jasmine', 'Ylang-Ylang'], base: ['Vanilla', 'Sandalwood', 'Amber'] }, featured: false, new: false, createdAt: '2024-02-28' },
  { id: '14', name: 'Golden Amber', slug: 'golden-amber', description: 'Warm amber embraces delicate florals in this sensual evening fragrance.', shortDescription: 'Warm amber with floral notes', price: 76000, priceUSD: 84, category: 'body-fragrance-female', images: ['golden-amber'], inStock: false, stockQuantity: 0, sizes: [{ size: '30ml', price: 40000, priceUSD: 44 }, { size: '50ml', price: 56000, priceUSD: 62 }, { size: '100ml', price: 76000, priceUSD: 84 }], notes: { top: ['Bergamot', 'Orange Blossom', 'Cardamom'], middle: ['Jasmine', 'Rose', 'Tuberose'], base: ['Golden Amber', 'Benzoin', 'Vanilla'] }, featured: false, new: false, createdAt: '2024-01-30' },
  { id: '15', name: 'Lavender Dreams', slug: 'lavender-dreams', description: 'Drift into serenity with this calming lavender blend.', shortDescription: 'Calming lavender diffuser blend', price: 32000, priceUSD: 35, category: 'home-fragrance', subcategory: 'diffuser', images: ['lavender-dreams'], inStock: true, stockQuantity: 28, sizes: null, notes: null, featured: false, new: true, createdAt: '2024-04-15' },
  { id: '16', name: 'Cedar & Moss', slug: 'cedar-moss', description: 'Bring the forest indoors with this earthy scented candle.', shortDescription: 'Earthy forest scented candle', price: 30000, priceUSD: 33, category: 'home-fragrance', subcategory: 'candle', images: ['cedar-moss'], inStock: true, stockQuantity: 20, sizes: null, notes: null, featured: true, new: true, createdAt: '2024-04-20' },
  { id: '17', name: 'Citrus Grove', slug: 'citrus-grove', description: 'Energize your commute with this vibrant citrus blend.', shortDescription: 'Energizing citrus auto freshener', price: 15000, priceUSD: 17, category: 'home-fragrance', subcategory: 'auto-freshener', images: ['citrus-grove'], inStock: true, stockQuantity: 35, sizes: null, notes: null, featured: false, new: false, createdAt: '2024-03-01' },
  { id: '18', name: 'Fresh Linen', slug: 'fresh-linen', description: 'The unmistakable scent of freshly laundered linens.', shortDescription: 'Clean cotton fabric fragrance', price: 20000, priceUSD: 22, category: 'home-fragrance', subcategory: 'fabric-fragrance', images: ['fresh-linen'], inStock: true, stockQuantity: 32, sizes: null, notes: null, featured: false, new: true, createdAt: '2024-04-05' },
];

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@bsgfragrance.com' },
    create: { email: 'admin@bsgfragrance.com', passwordHash: hash },
    update: { passwordHash: hash },
  });
  console.log('Admin user created: admin@bsgfragrance.com / admin123');

  for (const p of mockProducts) {
    const images = (p.images as string[]).map((key) => productImages[key] || `/assets/products/${key}.jpg`);
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        priceUSD: p.priceUSD,
        currency: 'NGN',
        category: p.category,
        subcategory: p.subcategory ?? null,
        images: JSON.stringify(images),
        inStock: p.inStock,
        stockQuantity: p.stockQuantity,
        sizes: p.sizes ? JSON.stringify(p.sizes) : null,
        notes: p.notes ? JSON.stringify(p.notes) : null,
        featured: p.featured,
        new: p.new,
      },
      update: {
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        priceUSD: p.priceUSD,
        category: p.category,
        subcategory: p.subcategory ?? null,
        images: JSON.stringify(images),
        inStock: p.inStock,
        stockQuantity: p.stockQuantity,
        sizes: p.sizes ? JSON.stringify(p.sizes) : null,
        notes: p.notes ? JSON.stringify(p.notes) : null,
        featured: p.featured,
        new: p.new,
      },
    });
  }
  console.log('Seeded', mockProducts.length, 'products');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
