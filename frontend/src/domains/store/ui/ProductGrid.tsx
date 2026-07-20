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
  skeletonCount = 8,
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
      <div className={className || 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 sm:gap-4'}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={className || (compact
      ? 'flex gap-4 overflow-x-auto pb-2 scrollbar-hide'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 sm:gap-4'
    )}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onView={onView}
          onAdd={onAdd}
          adding={addingId === product.id}
          added={addedId === product.id}
          featured={featured}
          className={compact ? 'min-w-[240px] shrink-0' : undefined}
        />
      ))}
    </div>
  );
}
