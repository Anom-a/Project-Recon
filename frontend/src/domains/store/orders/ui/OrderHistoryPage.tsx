import { ShoppingBag, ArrowRight, Clock, Package } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import EmptyState from '@/shared/ui/EmptyState';
import { Button } from '@/shared/ui/Button';
import { formatMoney } from '@/domains/store/utils/formatMoney';
import { getOrderStatusLabel, getOrderStatusTone } from '@/domains/store/utils/orderStatus';
import { navigateStore } from '@/domains/store/utils/catalog';
import { cn } from '@/shared/utils/cn';

export default function OrderHistoryPage() {
  const { orders, loading, error, reload } = useOrders();

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto" aria-busy="true" aria-label="Loading orders">
        <div className="mb-6 space-y-2">
          <div className="h-3 w-16 bg-brand-surface rounded animate-pulse" />
          <div className="h-7 w-40 bg-brand-surface rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-[var(--radius-card)] border border-brand-border/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EmptyState
          icon={ShoppingBag}
          title="Could not load orders"
          description={error}
          action={<Button variant="secondary" onClick={reload}>Try again</Button>}
        />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Confirmed orders appear here after payment is verified."
          action={<Button onClick={() => navigateStore('/store')}>Browse store</Button>}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <p className="eyebrow mb-1">Account</p>
          <h1 className="font-display text-2xl font-bold text-brand-ink">My orders</h1>
          <p className="text-sm text-brand-muted mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigateStore('/store')}>
          Continue shopping
        </Button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <button
            type="button"
            key={order.id}
            onClick={() => navigateStore(`/store/orders/${order.id}`)}
            className="block w-full p-4 sm:p-5 bg-white rounded-[var(--radius-card)] border border-brand-border hover:border-brand-blue/30 hover:shadow-sm transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-bold text-brand-ink font-mono truncate">#{order.order_number}</p>
                <p className="text-xs text-brand-muted mt-0.5 flex items-center gap-1 flex-wrap">
                  <Clock className="w-3 h-3 shrink-0" />
                  {new Date(order.created_at).toLocaleString()} · {order.branch_name}
                </p>
              </div>
              <span className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0',
                getOrderStatusTone(order.status)
              )}>
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-brand-muted flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-blue">
                {formatMoney(order.total)}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
