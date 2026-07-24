import { ImageOff, ShoppingCart, Check, Eye, Star, Clock, Ban } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { Product } from '@/domains/store/model/types';
import { PriceDisplay } from './PriceDisplay';
import { StockBadge } from './StockBadge';

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  onAdd?: (product: Product) => void;
  adding?: boolean;
  added?: boolean;
  stockQuantity?: number | null;
  className?: string;
  featured?: boolean;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function isNewProduct(product: Product): boolean {
  const created = new Date(product.created_at).getTime();
  return Date.now() - created < THIRTY_DAYS_MS;
}

export function ProductCard({
  product,
  onView,
  onAdd,
  adding,
  added,
  stockQuantity,
  className,
  featured,
}: ProductCardProps) {
  const outOfStock = stockQuantity != null && stockQuantity <= 0;
  const isNew = isNewProduct(product);

  return (
    <article
      className={cn(
        'group flex flex-col bg-white rounded-[10px] border border-brand-border/70 overflow-hidden transition-all duration-200',
        'hover:shadow-md hover:border-brand-blue-bright/20 hover:-translate-y-0.5',
        outOfStock && 'opacity-75',
        className,
      )}
    >
      <div className="relative bg-brand-surface/50">
        <button
          type="button"
          onClick={() => onView?.(product)}
          className="w-full h-[180px] p-4 flex items-center justify-center"
          aria-label={`View ${product.name}`}
        >
          {(() => {
            const imgSrc = product.primary_image?.image || product.images?.[0]?.image;
            const imgAlt = product.primary_image?.alt_text || product.images?.[0]?.alt_text || product.name;
            return imgSrc ? (
              <img
                src={imgSrc}
                alt={imgAlt}
                loading="lazy"
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : null;
          })()}
          {!product.primary_image?.image && !product.images?.length && (
            <div className="flex items-center justify-center">
              <ImageOff className="w-8 h-8 text-brand-border" />
            </div>
          )}
        </button>

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {stockQuantity != null && !outOfStock && (
            <StockBadge quantity={stockQuantity} />
          )}
          {isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50/95 text-[10px] font-semibold text-emerald-700 rounded-full border border-emerald-200/60 backdrop-blur-sm">
              <Clock className="w-2.5 h-2.5" />
              New
            </span>
          )}
          {featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50/95 text-[10px] font-semibold text-blue-700 rounded-full border border-blue-200/60 backdrop-blur-sm">
              <Star className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50/95 border border-red-200 rounded-lg text-[11px] font-bold text-red-600 shadow-sm">
              <Ban className="w-3.5 h-3.5" />
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 pt-2.5 gap-1">
        {product.category_name && (
          <p className="text-[11px] font-medium text-brand-muted/70 uppercase tracking-wider truncate">
            {product.category_name}
          </p>
        )}
        <button type="button" onClick={() => onView?.(product)} className="text-left">
          <h3 className="text-[15px] font-semibold text-brand-ink leading-snug line-clamp-2 group-hover:text-brand-blue-bright transition-colors">
            {product.name}
          </h3>
        </button>

        <div className="mt-auto pt-1.5 flex items-center justify-between gap-2">
          <PriceDisplay amount={product.price} size="sm" className="text-[17px] font-bold text-brand-ink" />
          <div className="flex items-center gap-1">
            {onView && (
              <button
                type="button"
                onClick={() => onView(product)}
                className="w-8 h-8 rounded-lg text-brand-muted hover:text-brand-blue-bright hover:bg-brand-blue-bright/5 transition-colors flex items-center justify-center"
                aria-label={`View ${product.name}`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            {onAdd && (
              <button
                type="button"
                onClick={() => onAdd(product)}
                disabled={adding || outOfStock}
                className={cn(
                  'h-[34px] px-3 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1.5',
                  added
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-brand-blue-bright text-white hover:bg-brand-blue-bright/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
                )}
              >
                {adding ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : added ? (
                  <><Check className="w-3 h-3" /> Added</>
                ) : (
                  <><ShoppingCart className="w-3 h-3" /> Add</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[10px] border border-brand-border/60 overflow-hidden animate-pulse">
      <div className="h-[180px] bg-brand-surface/70" />
      <div className="p-3 pt-2.5 space-y-2">
        <div className="h-2.5 bg-brand-surface rounded w-1/4" />
        <div className="h-3.5 bg-brand-surface rounded w-full" />
        <div className="h-3.5 bg-brand-surface rounded w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 bg-brand-surface rounded w-20" />
          <div className="h-[34px] bg-brand-surface rounded w-[68px]" />
        </div>
      </div>
    </div>
  );
}
