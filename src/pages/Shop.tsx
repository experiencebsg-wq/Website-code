import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Layout } from '@/components/layout';
import { ProductGrid } from '@/components/products';
import { fetchProducts, Product } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ActiveFilterTags } from '@/components/shop';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
  { value: 'all', label: 'All Products' },
  { value: 'body-fragrance-male', label: 'Body Fragrances (Male)' },
  { value: 'body-fragrance-female', label: 'Body Fragrances (Female)' },
  { value: 'home-fragrance', label: 'Home & Space Fragrances' },
];

const subcategories = [
  { value: 'all', label: 'All Types' },
  { value: 'diffuser', label: 'Diffusers' },
  { value: 'candle', label: 'Scented Candles' },
  { value: 'auto-freshener', label: 'Auto Fresheners' },
  { value: 'fabric-fragrance', label: 'Fabric Fragrances' },
];

const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: '0-30000', label: 'Under ₦30,000' },
  { value: '30000-60000', label: '₦30,000 - ₦60,000' },
  { value: '60000-100000', label: '₦60,000 - ₦100,000' },
  { value: '100000+', label: 'Over ₦100,000' },
];

const stockOptions = [
  { value: 'all', label: 'All Products' },
  { value: 'inStock', label: 'In Stock Only' },
];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const category = searchParams.get('category') || 'all';
  const subcategory = searchParams.get('type') || 'all';
  const priceRange = searchParams.get('price') || 'all';
  const stockStatus = searchParams.get('stock') || 'all';
  const sortBy = searchParams.get('sort') || 'featured';

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await fetchProducts();
        setProducts(data ?? []);
      } catch (e) {
        setProducts([]);
        setFetchError(e instanceof Error ? e.message : 'Could not load products. Is the API server running?');
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (category !== 'all') {
      if (category === 'body-fragrance') {
        result = result.filter(
          (p) => p.category === 'body-fragrance-male' || p.category === 'body-fragrance-female'
        );
      } else {
        result = result.filter((p) => p.category === category);
      }
    }

    // Subcategory filter (only for home fragrances)
    if (category === 'home-fragrance' && subcategory !== 'all') {
      result = result.filter((p) => p.subcategory === subcategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Price filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map((v) => (v === '' ? Infinity : parseInt(v)));
      if (priceRange.endsWith('+')) {
        const minVal = parseInt(priceRange.replace('+', ''));
        result = result.filter((p) => p.price >= minVal);
      } else {
        result = result.filter((p) => p.price >= min && p.price <= max);
      }
    }

    // Stock filter
    if (stockStatus === 'inStock') {
      result = result.filter((p) => p.inStock);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, category, subcategory, searchQuery, priceRange, stockStatus, sortBy]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === 'featured') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Clear subcategory when switching away from home-fragrance
    if (key === 'category' && value !== 'home-fragrance') {
      newParams.delete('type');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const hasActiveFilters = category !== 'all' || subcategory !== 'all' || priceRange !== 'all' || stockStatus !== 'all' || searchQuery;

  // Build active filter tags
  const activeFilterTags = useMemo(() => {
    const tags: { key: string; label: string; value: string }[] = [];
    
    if (category !== 'all') {
      const categoryLabel = categories.find(c => c.value === category)?.label || category;
      tags.push({ key: 'category', label: categoryLabel, value: category });
    }
    
    if (category === 'home-fragrance' && subcategory !== 'all') {
      const subcategoryLabel = subcategories.find(s => s.value === subcategory)?.label || subcategory;
      tags.push({ key: 'type', label: subcategoryLabel, value: subcategory });
    }
    
    if (priceRange !== 'all') {
      const priceLabel = priceRanges.find(p => p.value === priceRange)?.label || priceRange;
      tags.push({ key: 'price', label: priceLabel, value: priceRange });
    }
    
    if (stockStatus === 'inStock') {
      tags.push({ key: 'stock', label: 'In Stock Only', value: stockStatus });
    }
    
    if (searchQuery) {
      tags.push({ key: 'search', label: `"${searchQuery}"`, value: searchQuery });
    }
    
    return tags;
  }, [category, subcategory, priceRange, stockStatus, searchQuery]);

  const handleRemoveFilter = (key: string) => {
    if (key === 'search') {
      setSearchQuery('');
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(key);
      // Also clear subcategory if removing category
      if (key === 'category') {
        newParams.delete('type');
      }
      setSearchParams(newParams);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy-gradient">
        <div className="container-luxury text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm uppercase tracking-luxury text-gold mb-4">Our Collection</p>
            <h1 className="text-display-lg text-foreground mb-4">Shop Fragrances</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Discover our curated selection of luxury body and home fragrances.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="section-padding">
        <div className="container-luxury">
          {/* Search & Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search fragrances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
              <Select value={category} onValueChange={(v) => updateFilter('category', v)}>
                <SelectTrigger className="w-[200px] h-12 bg-card border-border">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Subcategory - only show for Home Fragrances */}
              {category === 'home-fragrance' && (
                <Select value={subcategory} onValueChange={(v) => updateFilter('type', v)}>
                  <SelectTrigger className="w-[170px] h-12 bg-card border-border">
                    <SelectValue placeholder="Product Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.value} value={sub.value}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={priceRange} onValueChange={(v) => updateFilter('price', v)}>
                <SelectTrigger className="w-[170px] h-12 bg-card border-border">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockStatus} onValueChange={(v) => updateFilter('stock', v)}>
                <SelectTrigger className="w-[150px] h-12 bg-card border-border">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  {stockOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => updateFilter('sort', v)}>
                <SelectTrigger className="w-[170px] h-12 bg-card border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mb-8 p-6 bg-card rounded-sm border border-border space-y-4"
            >
              <Select value={category} onValueChange={(v) => updateFilter('category', v)}>
                <SelectTrigger className="w-full h-12 bg-muted border-border">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mobile Subcategory */}
              {category === 'home-fragrance' && (
                <Select value={subcategory} onValueChange={(v) => updateFilter('type', v)}>
                  <SelectTrigger className="w-full h-12 bg-muted border-border">
                    <SelectValue placeholder="Product Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.value} value={sub.value}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={priceRange} onValueChange={(v) => updateFilter('price', v)}>
                <SelectTrigger className="w-full h-12 bg-muted border-border">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockStatus} onValueChange={(v) => updateFilter('stock', v)}>
                <SelectTrigger className="w-full h-12 bg-muted border-border">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  {stockOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => updateFilter('sort', v)}>
                <SelectTrigger className="w-full h-12 bg-muted border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="w-full">
                  Clear All Filters
                </Button>
              )}
            </motion.div>
          )}

          {/* Active Filter Tags */}
          <ActiveFilterTags
            filters={activeFilterTags}
            onRemove={handleRemoveFilter}
            onClearAll={clearFilters}
          />

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground">{filteredProducts.length}</span> products
            </p>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card-luxury animate-pulse">
                  <div className="aspect-product bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-20 bg-muted rounded" />
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="text-center py-20">
              <p className="text-destructive text-lg mb-2">Could not load products</p>
              <p className="text-muted-foreground mb-4">{fetchError}</p>
              <p className="text-sm text-muted-foreground">Start the API server in another terminal: <code className="bg-muted px-1 rounded">cd server && npm run dev</code></p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} columns={4} />
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">No products found</p>
              <Button variant="goldOutline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
