import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag, Package, Plus, Minus, Trash2,
  ShoppingCart as CartIcon,
  Loader2, CheckCircle2, AlertTriangle, X, Upload, Landmark,
} from 'lucide-react';
import { listProducts } from '@/domains/store/products/api/productApi';
import { listActiveCategories } from '@/domains/store/categories/api/categoriesApi';
import { getCart, addCartItem, updateCartItemQuantity, removeCartItem, clearCart } from '@/domains/store/cart/api/cartApi';
import { getUserOrders } from '@/domains/store/orders/api/orderApi';
import checkout from '@/domains/store/checkout/api/checkoutApi';
import { listBankAccounts } from '@/domains/store/bank/api/bankAccountApi';
import { getOrderStatusLabel, getOrderStatusTone } from '@/domains/store/utils/orderStatus';
import type {
  Product, ProductCategory, ShoppingCart,
  Order, PendingOrder, StorePaymentMethod, BankAccount,
} from '@/shared/types';
import { formatMoney } from '@/domains/store/utils/formatMoney';
import { formatApiError } from '@/shared/utils/formatApiError';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/Button';
import PageHeader from '../../../shared/ui/PageHeader';
import TabBar from '../../../shared/ui/TabBar';
import EmptyState from '@/shared/ui/EmptyState';
import { GridSkeleton } from '../../../shared/ui/LoadingSkeleton';

interface Props {
  currentUser: { name?: string; email?: string; assignments?: { branch_id?: string | null; branch_name?: string | null; is_primary?: boolean }[] };
}

const TABS = [
  { id: 'shop', label: 'Shop' },
  { id: 'cart', label: 'Cart' },
  { id: 'orders', label: 'My orders' },
];

const PAYMENT_OPTIONS: { value: StorePaymentMethod; label: string }[] = [
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'MOBILE_MONEY', label: 'Mobile money' },
  { value: 'CASH', label: 'Cash (pay at branch)' },
  { value: 'CHEQUE', label: 'Cheque' },
];

export default function StoreModule({ currentUser }: Props) {
  const [tab, setTab] = useState('shop');

  const primaryAssignment = (currentUser.assignments || []).find(a => a.is_primary);
  const branchId = primaryAssignment?.branch_id || '';
  const branchName = primaryAssignment?.branch_name || '';

  return (
    <div>
      <PageHeader
        title="Store"
        subtitle={branchName ? `Shopping for pickup at ${branchName}` : 'Browse products, manage your cart, and track orders'}
        icon={ShoppingBag}
      />
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'shop' && <ShopPanel branchId={branchId} onGoToCart={() => setTab('cart')} />}
      {tab === 'cart' && <CartPanel branchId={branchId} />}
      {tab === 'orders' && <OrdersPanel />}
    </div>
  );
}

function ShopPanel({ branchId, onGoToCart }: { branchId: string; onGoToCart: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([
        listProducts(),
        listActiveCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const addToCart = async (productId: string) => {
    if (!branchId) {
      setCartError('No branch is assigned to your account. Contact staff to enable store checkout.');
      return;
    }
    setAddingId(productId);
    setCartError(null);
    try {
      await addCartItem({ product: productId, branch: branchId, quantity: 1 });
      setAddedId(productId);
      setTimeout(() => setAddedId((id) => (id === productId ? null : id)), 1600);
    } catch (e) {
      setCartError(formatApiError(e));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {!branchId && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-800" role="status">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          Your account has no primary branch. You can browse products, but adding to cart requires a branch assignment.
        </div>
      )}

      {cartError && (
        <div className="flex items-start justify-between gap-2 p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700" role="alert">
          <span className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {cartError}
          </span>
          <button type="button" onClick={() => setCartError(null)} className="shrink-0 p-1" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'text-xs font-semibold px-3 py-2 rounded-xl border transition-colors',
              !selectedCategory
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white text-brand-muted border-brand-border hover:border-brand-blue/30 hover:text-brand-ink',
            )}
          >
            All products
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'text-xs font-semibold px-3 py-2 rounded-xl border transition-colors',
                selectedCategory === cat.id
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-brand-muted border-brand-border hover:border-brand-blue/30 hover:text-brand-ink',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-white rounded-2xl border border-brand-border p-6 text-center space-y-3">
          <p className="text-sm text-red-700">{error}</p>
          <Button variant="secondary" size="sm" onClick={load}>Try again</Button>
        </div>
      )}

      {loading ? (
        <GridSkeleton count={6} />
      ) : !error && filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-border">
          <EmptyState
            icon={Package}
            title="No products found"
            description={selectedCategory ? 'No products in this category yet.' : 'Check back later for new products.'}
            action={selectedCategory ? (
              <Button variant="secondary" size="sm" onClick={() => setSelectedCategory(null)}>Show all products</Button>
            ) : undefined}
          />
        </div>
      ) : !error ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-brand-muted">
              <span className="font-medium text-brand-ink">{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
            </p>
            <button type="button" onClick={onGoToCart} className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark">
              View cart
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((product, i) => {
              const primaryImg = product.primary_image?.image || product.images?.[0]?.image;
              const isAdding = addingId === product.id;
              const isAdded = addedId === product.id;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="bg-white rounded-[var(--radius-card)] border border-brand-border overflow-hidden hover:shadow-sm hover:border-brand-blue/20 transition-all group flex flex-col"
                >
                  <div className="aspect-square bg-brand-surface flex items-center justify-center p-4">
                    {primaryImg ? (
                      <img src={primaryImg} alt={product.name} loading="lazy" className="w-full h-full object-contain" />
                    ) : (
                      <Package className="w-12 h-12 text-brand-border" />
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <p className="text-[11px] text-brand-muted font-medium truncate">{product.category_name}</p>
                    <h4 className="font-semibold text-sm text-brand-ink line-clamp-2 leading-snug">{product.name}</h4>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <span className="font-bold text-sm text-brand-blue tabular-nums">{formatMoney(product.price)}</span>
                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        disabled={isAdding || !branchId}
                        aria-label={isAdded ? `${product.name} added` : `Add ${product.name} to cart`}
                        className={cn(
                          'min-h-[40px] min-w-[40px] rounded-lg flex items-center justify-center transition-colors disabled:opacity-40',
                          isAdded
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-brand-blue text-white hover:bg-brand-blue-dark',
                        )}
                      >
                        {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isAdded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CartPanel({ branchId }: { branchId: string }) {
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<StorePaymentMethod>('BANK_TRANSFER');
  const [bankName, setBankName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentAttachment, setPaymentAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (paymentMethod === 'CASH') return;
    setBankAccountsLoading(true);
    listBankAccounts()
      .then(setBankAccounts)
      .catch(() => setBankAccounts([]))
      .finally(() => setBankAccountsLoading(false));
  }, [paymentMethod]);

  const loadCart = useCallback(async () => {
    try {
      setActionError('');
      const data = await getCart();
      setCart(data);
    } catch (e) {
      setCart(null);
      setActionError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  const bankAccountsByBank = useMemo(() => {
    const seen = new Set<string>();
    const uniq = bankAccounts.filter(a => {
      if (seen.has(a.account_number)) return false;
      seen.add(a.account_number);
      return a.is_active;
    });
    const groups: { bank: string; accounts: typeof uniq }[] = [];
    uniq.forEach(a => {
      let g = groups.find(x => x.bank === a.bank_name);
      if (!g) { g = { bank: a.bank_name, accounts: [] }; groups.push(g); }
      g.accounts.push(a);
    });
    return groups;
  }, [bankAccounts]);

  const handleUpdate = async (itemId: string, qty: number) => {
    if (qty < 1) return;
    try {
      await updateCartItemQuantity(itemId, qty);
      await loadCart();
    } catch (e) {
      setActionError(formatApiError(e));
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeCartItem(itemId);
      await loadCart();
    } catch (e) {
      setActionError(formatApiError(e));
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      await loadCart();
    } catch (e) {
      setActionError(formatApiError(e));
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) { setError('Your cart is empty.'); return; }
    const uniqueBranches = [...new Set(cart.items.map(i => i.branch))];
    if (uniqueBranches.length !== 1) {
      setError('Your cart has items from multiple branches. Checkout supports one branch per order.');
      return;
    }
    const checkoutBranch = uniqueBranches[0];
    if (paymentMethod !== 'CASH' && !transactionRef.trim()) {
      setError('Transaction reference is required for this payment method.');
      return;
    }
    setCheckingOut(true);
    setError('');
    try {
      const order = await checkout({
        branch: checkoutBranch,
        payment: {
          amount: cart.total,
          payment_method: paymentMethod,
          transaction_reference: transactionRef.trim() || undefined,
          bank_name: bankName.trim() || undefined,
        },
      }, paymentAttachment, senderName.trim() || undefined);
      await loadCart();
      setPendingOrder(order);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center" aria-busy="true" aria-label="Loading cart">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-muted" />
      </div>
    );
  }

  if (pendingOrder) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-[var(--radius-card)] border border-brand-border p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-bold text-lg text-brand-ink mb-1">Order submitted</h3>
        <p className="text-sm text-brand-muted mb-4">
          Payment evidence was submitted. Staff will verify and confirm your order.
        </p>
        {pendingOrder.payment_reference && (
          <p className="text-xs text-brand-muted mb-4 font-mono">
            Reference: <span className="font-semibold text-brand-ink">{pendingOrder.payment_reference}</span>
          </p>
        )}
        <div className="text-left space-y-2 mb-4 rounded-xl border border-brand-border bg-brand-surface/50 p-4">
          {pendingOrder.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm text-brand-ink gap-3">
              <span className="truncate">{item.product_name} × {item.quantity}</span>
              <span className="font-semibold shrink-0 tabular-nums">{formatMoney(item.subtotal)}</span>
            </div>
          ))}
          <div className="border-t border-brand-border pt-2 flex justify-between font-bold text-brand-ink">
            <span>Total</span>
            <span className="text-brand-blue tabular-nums">{formatMoney(pendingOrder.total)}</span>
          </div>
        </div>
        <Button onClick={() => setPendingOrder(null)} className="w-full sm:w-auto">
          Continue shopping
        </Button>
      </div>
    );
  }

  if (actionError && (!cart || cart.items.length === 0)) {
    return (
      <div className="bg-white rounded-[var(--radius-card)] border border-brand-border p-6 text-center space-y-3">
        <p className="text-sm text-red-700">{actionError}</p>
        <Button variant="secondary" size="sm" onClick={loadCart}>Try again</Button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-white rounded-[var(--radius-card)] border border-brand-border">
        <EmptyState icon={CartIcon} title="Your cart is empty" description="Add products from the shop to get started." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      {(error || actionError) && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700" role="alert">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error || actionError}
        </div>
      )}

      <div className="space-y-2">
        {cart.items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.2) }}
            className="flex items-center gap-3 sm:gap-4 bg-white rounded-[var(--radius-card)] border border-brand-border p-3 sm:p-4"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-brand-ink truncate">{item.product_name}</h4>
              <p className="text-xs text-brand-muted">{item.branch_name}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleUpdate(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="min-h-[40px] min-w-[40px] rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center hover:bg-brand-border/30 disabled:opacity-40"
                aria-label={`Decrease ${item.product_name} quantity`}
              >
                <Minus className="w-3.5 h-3.5 text-brand-muted" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-brand-ink tabular-nums">{item.quantity}</span>
              <button
                type="button"
                onClick={() => handleUpdate(item.id, item.quantity + 1)}
                className="min-h-[40px] min-w-[40px] rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center hover:bg-brand-border/30"
                aria-label={`Increase ${item.product_name} quantity`}
              >
                <Plus className="w-3.5 h-3.5 text-brand-muted" />
              </button>
            </div>
            <div className="text-right min-w-[72px]">
              <p className="font-bold text-sm text-brand-ink tabular-nums">{formatMoney(item.subtotal)}</p>
              <p className="text-[10px] text-brand-muted tabular-nums">{formatMoney(item.product_price)} each</p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              className="p-2 rounded-lg text-brand-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label={`Remove ${item.product_name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[var(--radius-card)] border border-brand-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-brand-ink">Total ({cart.item_count} item{cart.item_count !== 1 ? 's' : ''})</span>
          <span className="font-bold text-lg text-brand-blue tabular-nums">{formatMoney(cart.total)}</span>
        </div>
        <div>
          <label htmlFor="student-payment-method" className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide mb-1 block">Payment method</label>
          <select
            id="student-payment-method"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as StorePaymentMethod)}
            className="w-full text-sm border border-brand-border rounded-xl p-2.5 bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue"
          >
            {PAYMENT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {paymentMethod !== 'CASH' && (
          <>
            <div>
              <label htmlFor="student-sender" className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide mb-1 block">Your name / sender</label>
              <input
                id="student-sender"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                className="w-full text-sm border border-brand-border rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="student-bank" className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide mb-1 block">Your bank / provider</label>
              <input
                id="student-bank"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full text-sm border border-brand-border rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue"
                placeholder="e.g. Commercial Bank of Ethiopia"
              />
            </div>
            <div>
              <label htmlFor="student-ref" className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide mb-1 block">Transaction reference</label>
              <input
                id="student-ref"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                className="w-full text-sm border border-brand-border rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue"
                placeholder="Transfer / receipt reference"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide mb-1 block">Upload receipt <span className="font-medium normal-case tracking-normal">(optional)</span></label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => setPaymentAttachment(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5 mr-1.5 inline" />
                  {paymentAttachment ? paymentAttachment.name : 'Choose file'}
                </Button>
                {paymentAttachment && (
                  <button
                    type="button"
                    onClick={() => { setPaymentAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="p-1.5 text-brand-muted hover:text-red-500 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="border-t border-brand-border pt-3">
              <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                <Landmark className="w-3 h-3" /> Company bank accounts
              </p>
              {bankAccountsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-brand-surface rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : bankAccountsByBank.length === 0 ? (
                <p className="text-xs text-brand-muted">No bank accounts available.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {bankAccountsByBank.map(({ bank, accounts }) => (
                    <div key={bank}>
                      <p className="font-semibold text-brand-ink text-xs mb-1">{bank}</p>
                      <div className="space-y-1">
                        {accounts.map(acc => (
                          <div key={acc.account_number} className="flex items-center gap-2 p-2 bg-brand-surface rounded-lg border border-brand-border text-xs">
                            <div className="flex-1 min-w-0 flex items-baseline gap-2">
                              <span className="font-mono font-semibold text-brand-ink">{acc.account_number}</span>
                              <span className="text-brand-muted text-[10px] truncate">{acc.account_holder}{acc.branch ? ` · ${acc.branch}` : ''}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(acc.account_number)}
                              className="shrink-0 p-1.5 rounded text-brand-muted hover:text-brand-blue hover:bg-brand-blue/5 transition-colors"
                              aria-label={`Copy account number ${acc.account_number}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" onClick={handleClear} className="flex-1">
            Clear cart
          </Button>
          <Button onClick={handleCheckout} disabled={checkingOut || !branchId} className="flex-1">
            {checkingOut ? <Loader2 className="w-4 h-4 animate-spin mr-1.5 inline" /> : <ShoppingBag className="w-4 h-4 mr-1.5 inline" />}
            {checkingOut ? 'Processing…' : 'Place order'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await getUserOrders());
    } catch (e) {
      setError(formatApiError(e));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="py-12 text-center" aria-busy="true" aria-label="Loading orders">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[var(--radius-card)] border border-brand-border p-6 text-center space-y-3">
        <p className="text-sm text-red-700">{error}</p>
        <Button variant="secondary" size="sm" onClick={load}>Try again</Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-[var(--radius-card)] border border-brand-border">
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Confirmed orders appear here after payment is verified."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order, i) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.04, 0.24) }}
          className="bg-white rounded-[var(--radius-card)] border border-brand-border p-4"
        >
          <div className="flex items-start justify-between mb-3 gap-3">
            <div className="min-w-0">
              <p className="text-xs text-brand-muted font-mono font-semibold truncate">#{order.order_number}</p>
              <p className="text-[11px] text-brand-muted mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0', getOrderStatusTone(order.status))}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
          <div className="space-y-1">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-xs text-brand-muted gap-3">
                <span className="truncate text-brand-ink">{item.product_name} × {item.quantity}</span>
                <span className="tabular-nums shrink-0">{formatMoney(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-brand-border">
            <span className="text-[11px] text-brand-muted truncate">{order.branch_name}</span>
            <span className="font-bold text-sm text-brand-blue tabular-nums">{formatMoney(order.total)}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
