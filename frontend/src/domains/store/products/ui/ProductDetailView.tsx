import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ImageOff, Package, ShoppingCart, Check,
  Ruler, Hash, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getProduct } from '@/domains/store/products/api/productApi';
import { getProductAvailability } from '@/domains/store/inventory/api/inventoryApi';
import type { BranchInventory, Product } from '@/domains/store/model/types';
import { relatedProducts } from '@/domains/store/utils/catalog';
import { PriceDisplay } from '@/domains/store/ui/PriceDisplay';
import { StockBadge } from '@/domains/store/ui/StockBadge';
import { ProductGrid } from '@/domains/store/ui/ProductGrid';
import { ErrorBanner } from '@/domains/store/ui/ErrorBanner';
import { Button } from '@/shared/ui/Button';
import EmptyState from '@/shared/ui/EmptyState';
import { cn } from '@/shared/utils/cn';
import { formatApiError } from '@/shared/utils/formatApiError';

interface ProductDetailViewProps {
  productId: string;
  catalog: Product[];
  onBack: () => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product, branchId?: string, quantity?: number) => Promise<void>;
  adding?: boolean;
  cartError?: string | null;
  onClearError?: () => void;
}

export function ProductDetailView({
  productId,
  catalog,
  onBack,
  onViewProduct,
  onAddToCart,
  adding,
  cartError,
  onClearError,
}: ProductDetailViewProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<BranchInventory[]>([]);
  const [availLoading, setAvailLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [relatedAddingId, setRelatedAddingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProduct(productId);
        if (cancelled) return;
        setProduct(data ?? null);
        setQuantity(1);
        setActiveImageIdx(0);
        setAdded(false);
      } catch (err) {
        if (!cancelled) setError(formatApiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setAvailLoading(true);
        const rows = await getProductAvailability(productId);
        if (cancelled) return;
        setAvailability(rows);
        const preferred = rows.find((r) => r.quantity > 0) || rows[0];
        setSelectedBranch(preferred?.branch || '');
      } catch {
        if (!cancelled) setAvailability([]);
      } finally {
        if (!cancelled) setAvailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productId]);

  const images = useMemo(() => {
    if (!product) return [];
    const all = product.images?.length
      ? [...product.images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order)
      : product.primary_image
        ? [product.primary_image]
        : [];
    return all;
  }, [product]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === 'ArrowLeft') setActiveImageIdx((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setActiveImageIdx((i) => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length]);

  const related = useMemo(
    () => (product ? relatedProducts(catalog, product, 4) : []),
    [catalog, product],
  );

  const selectedStock = availability.find((a) => a.branch === selectedBranch);
  const lineTotal = product ? Number(product.price) * quantity : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-pulse space-y-6" aria-busy="true" aria-label="Loading product">
        <div className="h-4 w-32 bg-brand-surface rounded" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-square rounded-[var(--radius-card)] bg-brand-surface" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-brand-surface rounded" />
            <div className="h-4 w-full bg-brand-surface rounded" />
            <div className="h-4 w-5/6 bg-brand-surface rounded" />
            <div className="h-12 w-40 bg-brand-surface rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={Package}
          title="Product not found"
          description={error || 'This product may be unavailable or no longer listed.'}
          action={<Button variant="secondary" onClick={onBack}>Back to store</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-paper pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-ink mb-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to store
        </button>

        {cartError && (
          <div className="mb-6">
            <ErrorBanner
              message={cartError}
              title="Could not add to cart"
              onDismiss={onClearError}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="relative aspect-square bg-white rounded-[var(--radius-card)] border border-brand-border overflow-hidden group">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activeImageIdx]?.image}
                    alt={images[activeImageIdx]?.alt_text || product.name}
                    className="w-full h-full object-contain p-6 transition-opacity duration-300"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImageIdx((i) => Math.max(0, i - 1))}
                        disabled={activeImageIdx <= 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white/90 border border-brand-border shadow-sm flex items-center justify-center text-brand-muted hover:text-brand-ink hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 transition-all disabled:opacity-30 sm:disabled:opacity-0 active:scale-95"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImageIdx((i) => Math.min(images.length - 1, i + 1))}
                        disabled={activeImageIdx >= images.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white/90 border border-brand-border shadow-sm flex items-center justify-center text-brand-muted hover:text-brand-ink hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 transition-all disabled:opacity-30 sm:disabled:opacity-0 active:scale-95"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="w-16 h-16 text-brand-border" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Product images">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === activeImageIdx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={cn(
                      'w-16 h-16 rounded-lg border overflow-hidden shrink-0 bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30',
                      idx === activeImageIdx
                        ? 'border-brand-blue ring-2 ring-brand-blue/20'
                        : 'border-brand-border hover:border-brand-blue/50',
                    )}
                  >
                    <img
                      src={img.image}
                      alt={img.alt_text || `${product.name} ${idx + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue mb-2">
              {product.category_name}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-ink tracking-tight">
              {product.name}
            </h1>
            {product.short_description && (
              <p className="mt-3 text-sm text-brand-muted leading-relaxed">{product.short_description}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <PriceDisplay amount={product.price} size="lg" />
              <StockBadge
                loading={availLoading}
                quantity={selectedStock?.quantity}
                minimum={selectedStock?.minimum_quantity}
                unknown={!availLoading && availability.length === 0}
              />
            </div>

            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-brand-border bg-white px-3 py-2.5">
                <dt className="text-[11px] uppercase tracking-wide text-brand-muted flex items-center gap-1">
                  <Hash className="w-3 h-3" /> SKU
                </dt>
                <dd className="font-medium text-brand-ink mt-0.5">{product.sku || '—'}</dd>
              </div>
              {product.barcode && (
                <div className="rounded-xl border border-brand-border bg-white px-3 py-2.5">
                  <dt className="text-[11px] uppercase tracking-wide text-brand-muted">Barcode</dt>
                  <dd className="font-medium text-brand-ink mt-0.5">{product.barcode}</dd>
                </div>
              )}
              {product.weight != null && Number(product.weight) > 0 && (
                <div className="rounded-xl border border-brand-border bg-white px-3 py-2.5">
                  <dt className="text-[11px] uppercase tracking-wide text-brand-muted flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Weight
                  </dt>
                  <dd className="font-medium text-brand-ink mt-0.5">{product.weight} kg</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 space-y-3">
              <p className="text-sm font-semibold text-brand-ink">Pickup branch</p>
              {availLoading ? (
                <div className="h-28 rounded-xl bg-brand-surface animate-pulse" aria-busy="true" />
              ) : availability.length === 0 ? (
                <p className="text-sm text-brand-muted rounded-xl border border-brand-border bg-white p-4 leading-relaxed">
                  No branch inventory is listed for this product yet.
                </p>
              ) : (
                <div className="space-y-2" role="radiogroup" aria-label="Pickup branch">
                  {availability.map((row) => (
                    <label
                      key={row.id}
                      className={cn(
                        'flex items-center justify-between gap-3 p-3 rounded-xl border bg-white cursor-pointer transition-all',
                        selectedBranch === row.branch
                          ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue/20'
                          : 'border-brand-border hover:border-brand-blue/30 hover:bg-brand-blue/[0.02]',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="branch"
                          value={row.branch}
                          checked={selectedBranch === row.branch}
                          onChange={() => setSelectedBranch(row.branch)}
                          className="accent-[var(--color-brand-blue)] w-4 h-4"
                        />
                        <span>
                          <span className="block text-sm font-medium text-brand-ink">{row.branch_name}</span>
                          <span className="text-xs text-brand-muted">{row.quantity} unit{row.quantity !== 1 ? 's' : ''} available</span>
                        </span>
                      </span>
                      <StockBadge quantity={row.quantity} minimum={row.minimum_quantity} />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3 sticky bottom-4 lg:static bg-brand-paper/95 lg:bg-transparent py-3 lg:py-0 backdrop-blur-md lg:backdrop-blur-none rounded-xl lg:rounded-none -mx-3 sm:mx-0 px-3 sm:px-0">
              <div className="flex items-center border border-brand-border rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  className="px-3 py-2.5 text-brand-muted hover:text-brand-ink hover:bg-brand-surface transition-colors disabled:opacity-30"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-3 text-sm font-semibold tabular-nums min-w-[2.5rem] text-center" aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  className="px-3 py-2.5 text-brand-muted hover:text-brand-ink hover:bg-brand-surface transition-colors disabled:opacity-30"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={selectedStock != null && quantity >= selectedStock.quantity}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <Button
                size="lg"
                disabled={adding || !selectedBranch || (selectedStock?.quantity ?? 0) <= 0}
                onClick={async () => {
                  if (!product || !selectedBranch) return;
                  try {
                    await onAddToCart(product, selectedBranch, quantity);
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1800);
                  } catch {
                    /* error surfaced via cartError prop */
                  }
                }}
                className="flex-1 sm:flex-none min-w-[180px]"
              >
                {added ? (
                  <><Check className="w-4 h-4 mr-2 inline" />Added to cart</>
                ) : (
                  <><ShoppingCart className="w-4 h-4 mr-2 inline" />{adding ? 'Adding…' : 'Add to cart'}</>
                )}
              </Button>
              {selectedStock != null && selectedStock.quantity > 0 && (
                <div className="hidden sm:block">
                  <PriceDisplay amount={lineTotal} size="sm" className="text-brand-muted" />
                </div>
              )}
            </div>

            {product.description && (
              <div className="mt-10 pt-8 border-t border-brand-border">
                <h2 className="text-sm font-semibold text-brand-ink mb-3">Description</h2>
                <div className="text-sm text-brand-muted leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="eyebrow mb-1">You might also like</p>
                <h2 className="font-display text-xl font-bold text-brand-ink">Related products</h2>
              </div>
            </div>
            <ProductGrid
              products={related}
              onView={onViewProduct}
              onAdd={async (p) => {
                setRelatedAddingId(p.id);
                try {
                  await onAddToCart(p);
                } finally {
                  setRelatedAddingId(null);
                }
              }}
              addingId={relatedAddingId}
            />
          </section>
        )}
      </div>
    </div>
  );
}
