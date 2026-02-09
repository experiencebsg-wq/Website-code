import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

interface SizeOption {
  size: string;
  price: number;
  priceUSD: number;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  priceUSD: number;
  category: string;
  subcategory?: string;
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  new: boolean;
  images?: string[];
  sizes?: SizeOption[];
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    priceUSD: '',
    category: 'body-fragrance-male',
    subcategory: '',
    inStock: true,
    stockQuantity: '0',
    featured: false,
    new: false,
    comingSoon: false,
    images: '[]',
    sizes: [] as { size: string; price: string; priceUSD: string }[],
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = (await adminApi.products.list()) as ProductRow[];
      setProducts(data);
    } catch (e) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      price: '',
      priceUSD: '',
      category: 'body-fragrance-male',
      subcategory: '',
      inStock: true,
      stockQuantity: '0',
      featured: false,
      new: false,
      comingSoon: false,
      images: '[]',
      sizes: [],
    });
    setDialogOpen(true);
  };

  const openEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      shortDescription: p.shortDescription ?? '',
      price: String(p.price),
      priceUSD: String(p.priceUSD),
      category: p.category,
      subcategory: p.subcategory ?? '',
      inStock: p.inStock,
      stockQuantity: String(p.stockQuantity),
      featured: p.featured,
      new: p.new,
      comingSoon: p.comingSoon ?? false,
      images: JSON.stringify(Array.isArray(p.images) ? p.images : []),
      sizes: (p.sizes ?? []).map((s) => ({
        size: s.size,
        price: String(s.price),
        priceUSD: String(s.priceUSD),
      })),
    });
    setDialogOpen(true);
  };

  const addSizeRow = () => {
    setForm((f) => ({
      ...f,
      sizes: [...f.sizes, { size: '', price: '', priceUSD: '' }],
    }));
  };

  const updateSizeRow = (index: number, field: 'size' | 'price' | 'priceUSD', value: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
    }));
  };

  const removeSizeRow = (index: number) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    try {
      const sizesPayload = form.sizes
        .filter((row) => String(row.size).trim() !== '')
        .map((row) => ({
          size: row.size.trim(),
          price: Number(row.price) || 0,
          priceUSD: Number(row.priceUSD) || 0,
        }));
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || form.name,
        shortDescription: form.shortDescription || form.name,
        price: Number(form.price) || 0,
        priceUSD: Number(form.priceUSD) || 0,
        category: form.category,
        subcategory: form.subcategory || undefined,
        images: JSON.parse(form.images || '[]'),
        inStock: form.inStock,
        stockQuantity: Number(form.stockQuantity) || 0,
        sizes: sizesPayload,
        featured: form.featured,
        new: form.new,
        comingSoon: form.comingSoon,
      };
      if (editingId) {
        await adminApi.products.update(editingId, payload);
        toast.success('Product updated');
      } else {
        await adminApi.products.create(payload);
        toast.success('Product created');
      }
      setDialogOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminApi.products.delete(id);
      toast.success('Product deleted');
      load();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const imageList = ((): string[] => {
    try {
      const arr = JSON.parse(form.images || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  })();

  const addImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const { url } = await adminApi.upload(files[i]);
        newUrls.push(url);
      } catch (err) {
        toast.error(files[i].name + ': ' + (err instanceof Error ? err.message : 'Upload failed'));
      }
    }
    if (newUrls.length) {
      setForm((f) => ({ ...f, images: JSON.stringify([...imageList, ...newUrls]) }));
      toast.success(newUrls.length + ' image(s) added');
    }
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const next = imageList.filter((_, i) => i !== index);
    setForm((f) => ({ ...f, images: JSON.stringify(next) }));
  };

  const imageSrc = (url: string) => (url.startsWith('/') ? API_BASE + url : url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display text-foreground">Products</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add product
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price (NGN)</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="w-24">Featured</TableHead>
                <TableHead className="w-24">New</TableHead>
                <TableHead className="w-24">Coming Soon</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-right">₦{p.price?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{p.stockQuantity}</TableCell>
                  <TableCell>{p.featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{p.new ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{p.comingSoon ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => remove(p.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit product' : 'New product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="url-slug"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price NGN</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div>
                <Label>Price USD</Label>
                <Input
                  type="number"
                  value={form.priceUSD}
                  onChange={(e) => setForm((f) => ({ ...f, priceUSD: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                  value={form.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setForm((f) => ({
                      ...f,
                      category: cat,
                      subcategory: cat === 'home-fragrance' ? f.subcategory : '',
                    }));
                  }}
                >
                  <option value="body-fragrance-male">Body (Male)</option>
                  <option value="body-fragrance-female">Body (Female)</option>
                  <option value="home-fragrance">Home & Space Fragrances</option>
                </select>
              </div>
              <div>
                <Label>Stock quantity</Label>
                <Input
                  type="number"
                  value={form.stockQuantity}
                  onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                />
              </div>
            </div>
            {form.category === 'home-fragrance' && (
              <div>
                <Label>Subcategory</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                  value={form.subcategory}
                  onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}
                >
                  <option value="">None</option>
                  <option value="diffuser">Diffusers</option>
                  <option value="candle">Scented Candles</option>
                  <option value="auto-freshener">Auto Fresheners</option>
                  <option value="fabric-fragrance">Fabric Fragrances</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose the type for Home & Space products (used in store filters).
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Sizes (optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Add size options (e.g. 30ml, 50ml, 100ml) with prices. If none, the product uses the base price above.
              </p>
              <div className="space-y-2">
                {form.sizes.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center flex-wrap">
                    <Input
                      placeholder="Size (e.g. 30ml)"
                      value={row.size}
                      onChange={(e) => updateSizeRow(i, 'size', e.target.value)}
                      className="w-24"
                    />
                    <Input
                      type="number"
                      placeholder="NGN"
                      value={row.price}
                      onChange={(e) => updateSizeRow(i, 'price', e.target.value)}
                      className="w-24"
                    />
                    <Input
                      type="number"
                      placeholder="USD"
                      value={row.priceUSD}
                      onChange={(e) => updateSizeRow(i, 'priceUSD', e.target.value)}
                      className="w-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSizeRow(i)}
                      aria-label="Remove size"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSizeRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add size
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product images</Label>
              <div className="flex flex-wrap gap-2">
                {imageList.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={imageSrc(url)}
                      alt=""
                      className="w-20 h-20 object-cover rounded border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 flex items-center justify-center rounded border border-dashed border-border hover:border-gold cursor-pointer">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={addImages}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Upload one or more images (JPEG, PNG, WebP, GIF). First image is primary.</p>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.inStock}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, inStock: !!c }))}
                />
                In stock
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.featured}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, featured: !!c }))}
                />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.new}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, new: !!c }))}
                />
                New
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.comingSoon}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, comingSoon: !!c }))}
                />
                Coming Soon
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
