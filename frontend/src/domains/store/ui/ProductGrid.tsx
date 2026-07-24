import type { Product } from '@/domains/store/model/types';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
  onView?: (product: Product) => void;
  onAdd?: (product: Product) => void;
  addingId?: string | null;
  addedId?: string | null;
  featured?: boolean;
  className?: string;
  compact?: boolean;
}

export function ProductGrid({
  products,
  loading,
  skeletonCount = 12,
  onView,
  onAdd,
  addingId,
  addedId,
  featured,
  className,
  compact,
}: ProductGridProps) {
  if (loading) {
    return (
      <div
        className={
          className ||
          'grid grid-cols-2 max-[420px]:grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5'
        }
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={className || 'flex gap-4 overflow-x-auto pb-2 scrollbar-hide'}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={onView}
            onAdd={onAdd}
            adding={addingId === product.id}
            added={addedId === product.id}
            featured={featured}
            className="min-w-[240px] shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        className ||
        'grid grid-cols-2 max-[420px]:grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5'
      }
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onView={onView}
          onAdd={onAdd}
          adding={addingId === product.id}
          added={addedId === product.id}
          featured={featured}
        />
      ))}
    </div>
  );
}
