import { forwardRef } from 'react';
import { Product } from '@/services/api';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export const ProductGrid = forwardRef<HTMLDivElement, ProductGridProps>(
  function ProductGrid({ products, columns = 4 }, ref) {
    const gridCols = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };

    return (
      <div ref={ref} className={`grid ${gridCols[columns]} gap-6 lg:gap-8`}>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    );
  }
);
