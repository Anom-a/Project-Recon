import { ArrowLeft, Package, Search } from 'lucide-react';
import type { Product, ProductCategory } from '@/domains/store/model/types';
import type { CatalogSort } from '@/domains/store/utils/catalog';
import { ProductGrid } from '@/domains/store/ui/ProductGrid';
import { ErrorBanner } from '@/domains/store/ui/ErrorBanner';
import { Button } from '@/shared/ui/Button';
import EmptyState from '@/shared/ui/EmptyState';

interface StoreCategoryViewProps {
  category?: ProductCategory;
  categoryId: string;
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onBack: () => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  addingId?: string | null;
  addedId?: string | null;
  sort: CatalogSort;
  onSortChange: (sort: CatalogSort) => void;
}

export function StoreCategoryView({
  category,
  products,
  loading,
  error,
  onRetry,
  onBack,
  onViewProduct,
  onAddToCart,
  addingId,
  addedId,
  sort,
  onSortChange,
}: StoreCategoryViewProps) {
  const title = category?.name || 'Category';
  const description = category?.description;

  return (
    <div className="min-h-screen bg-brand-paper">
      <div className="border-b border-brand-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-ink mb-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            All products
          </button>
          <p className="eyebrow mb-1">Category</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-ink">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-brand-muted max-w-2xl leading-relaxed">{description}</p>
          )}
          {!loading && (
            <p className="mt-3 text-sm text-brand-muted">
              <span className="font-medium text-brand-ink">{products.length}</span> product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-end gap-3 mb-6">
          <label className="text-sm text-brand-muted flex items-center gap-2 whitespace-nowrap">
            Sort by
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as CatalogSort)}
              className="min-h-[44px] sm:h-9 px-3 rounded-lg border border-brand-border bg-white text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue"
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorBanner
              message={error}
              title="Could not load products"
              onRetry={onRetry}
            />
          </div>
        )}

        {loading ? (
          <ProductGrid products={[]} loading skeletonCount={8} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={category ? Package : Search}
            title={category ? 'No products in this category' : 'Category not found'}
            description={category ? `There are no products in “${title}” yet. Check back soon.` : 'This category could not be found or is no longer available.'}
            action={<Button variant="secondary" onClick={onBack}>Browse all products</Button>}
          />
        ) : (
          <ProductGrid
            products={products}
            onView={onViewProduct}
            onAdd={onAddToCart}
            addingId={addingId}
            addedId={addedId}
          />
        )}
      </div>
    </div>
  );
}
