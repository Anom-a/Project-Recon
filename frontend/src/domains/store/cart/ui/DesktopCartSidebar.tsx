import { Minus, Plus, Trash2, ShoppingCart, ShoppingBag, Package } from 'lucide-react';
import type { ShoppingCart as Cart } from '@/domains/store/model/types';
import { PriceDisplay } from '@/domains/store/ui/PriceDisplay';
import { Button } from '@/shared/ui/Button';

interface DesktopCartSidebarProps {
  cart: Cart | null;
  loading?: boolean;
  itemCount: number;
  onOpenCart: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function DesktopCartSidebar({
  cart,
  loading,
  itemCount,
  onOpenCart,
  onUpdateQuantity,
  onRemove,
}: DesktopCartSidebarProps) {
  return (
    <aside className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-6 space-y-3">
        <div className="bg-white rounded-[10px] border border-brand-border/70 overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-blue-bright" />
              <h3 className="font-semibold text-sm text-brand-ink">
                Cart {itemCount > 0 && <span className="text-brand-muted font-medium">({itemCount})</span>}
              </h3>
            </div>
            {itemCount > 0 && (
              <button type="button" onClick={onOpenCart} className="text-[11px] font-semibold text-brand-blue-bright hover:text-brand-blue-bright/80">
                View all
              </button>
            )}
          </div>

          <div className="px-4 py-2 max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-2.5 p-2.5 bg-brand-surface rounded-lg">
                    <div className="w-10 h-10 bg-brand-border/40 rounded-md" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 bg-brand-border/40 rounded w-3/4" />
                      <div className="h-2 bg-brand-border/40 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="py-6 text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center mx-auto mb-2">
                  <ShoppingBag className="w-5 h-5 text-brand-border" />
                </div>
                <p className="text-sm font-semibold text-brand-ink mb-0.5">Cart is empty</p>
                <p className="text-xs text-brand-muted/70">Add items to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 p-2.5 bg-brand-surface rounded-lg border border-brand-border/50">
                    <div className="w-10 h-10 bg-white rounded-md border border-brand-border flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-brand-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-semibold text-brand-ink truncate">{item.product_name}</h4>
                      <p className="text-[10px] text-brand-muted truncate">{item.branch_name}</p>
                      <PriceDisplay amount={item.product_price} size="sm" className="text-[11px] font-semibold text-brand-blue-bright" />
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex items-center bg-white border border-brand-border rounded-md overflow-hidden">
                          <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink" disabled={item.quantity <= 1} aria-label={`Decrease ${item.product_name} quantity`}>
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-[10px] font-semibold px-1 min-w-[16px] text-center tabular-nums text-brand-ink">{item.quantity}</span>
                          <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink" aria-label={`Increase ${item.product_name} quantity`}>
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <button type="button" onClick={() => onRemove(item.id)} className="p-1 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-md" aria-label={`Remove ${item.product_name}`}>
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart && cart.items.length > 0 && (
            <div className="px-4 py-3 border-t border-brand-border/50 bg-brand-surface/30">
              <div className="flex items-center justify-between mb-2.5 gap-3">
                <span className="text-xs font-semibold text-brand-ink">Subtotal</span>
                <PriceDisplay amount={cart.total} size="sm" className="text-sm font-bold" />
              </div>
              <Button onClick={onOpenCart} className="w-full font-semibold text-xs" size="sm">
                Checkout
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-white rounded-[10px] border border-brand-border/70">
          <Package className="w-3.5 h-3.5 text-brand-blue-bright mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-brand-ink">Branch pickup</p>
            <p className="text-[10px] text-brand-muted leading-relaxed">
              Choose a branch at checkout.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
