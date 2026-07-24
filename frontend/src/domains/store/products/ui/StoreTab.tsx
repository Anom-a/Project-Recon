import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ShoppingCart, Store, ShoppingBag } from 'lucide-react';
import { useCartContext } from '@/shared/context/CartContext';
import { listProducts } from '@/domains/store/products/api/productApi';
import { listActiveCategories } from '@/domains/store/categories/api/categoriesApi';
import type { Product, ProductCategory, BranchInventory } from '@/domains/store/model/types';
import { getProductAvailability } from '@/domains/store/inventory/api/inventoryApi';
import { Button } from '@/shared/ui/Button';
import { CategoryChips } from '@/domains/store/ui/CategoryChips';
import { ProductGrid } from '@/domains/store/ui/ProductGrid';
import { SectionHeader } from '@/domains/store/ui/SectionHeader';
import { SearchInput } from '@/domains/store/ui/SearchInput';
import { ErrorBanner } from '@/domains/store/ui/ErrorBanner';
import {
  CatalogSort,
  filterAndSortProducts,
  navigateStore,
  paginate,
  parseStorePath,
  recentlyAdded,
  storeCategoryPath,
  storeProductPath,
  type StoreView,
} from '@/domains/store/utils/catalog';
import { formatApiError } from '@/shared/utils/formatApiError';
import { ProductDetailView } from '@/domains/store/products/ui/ProductDetailView';
import { StoreCategoryView } from '@/domains/store/products/ui/StoreCategoryView';
import PendingOrderView from '@/domains/store/checkout/ui/PendingOrderView';
import { DesktopCartSidebar } from '@/domains/store/cart/ui/DesktopCartSidebar';
import { getUserProfile } from '@/shared/utils/storage';

const PAGE_SIZE = 12;

interface StoreTabProps {
  openCart: () => void;
}

export default function StoreTab({ openCart }: StoreTabProps) {
  const [view, setView] = useState<StoreView>(() => parseStorePath(window.location.pathname));
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sort, setSort] = useState<CatalogSort>('newest');
  const [page, setPage] = useState(1);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [cartErrorMessage, setCartErrorMessage] = useState<string | null>(null);
  const currentUser = getUserProfile();

  const {
    cart, loading: cartLoading, error: cartError,
    handleAddToCart, handleUpdateQuantity, handleRemoveFromCart,
    clearCartError,
  } = useCartContext();

  useEffect(() => {
    const sync = () => setView(parseStorePath(window.location.pathname));
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
    setShowAllProducts(false);
  }, [debouncedSearch, selectedCategory, sort]);

  useEffect(() => {
    if (view.kind === 'category') setSelectedCategory(view.categoryId);
  }, [view]);

  useEffect(() => {
    (async () => {
      try {
        setCategoriesLoading(true);
        setCategories(await listActiveCategories());
      } catch { /* non-fatal */ }
      finally { setCategoriesLoading(false); }
    })();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      setError(null);
      setProducts(await listProducts());
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = useMemo(
    () => filterAndSortProducts(products, {
      categoryId: selectedCategory, search: debouncedSearch, sort,
    }),
    [products, selectedCategory, debouncedSearch, sort],
  );

  const latestProducts = useMemo(
    () => (!selectedCategory && !debouncedSearch ? recentlyAdded(products, 8) : []),
    [products, selectedCategory, debouncedSearch],
  );

  const featuredIds = useMemo(() => new Set(latestProducts.map((p) => p.id)), [latestProducts]);

  const filteredExcludingFeatured = useMemo(() => {
    if (showAllProducts || selectedCategory || debouncedSearch) return filtered;
    const nonFeatured = filtered.filter((p) => !featuredIds.has(p.id));
    return nonFeatured.length > 0 ? nonFeatured : filtered;
  }, [filtered, featuredIds, selectedCategory, debouncedSearch, showAllProducts]);

  const pageData = useMemo(() => paginate(filteredExcludingFeatured, page, PAGE_SIZE), [filteredExcludingFeatured, page]);

  const cartItemCount = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart],
  );

  const goHomeBrowse = useCallback(() => {
    navigateStore('/store');
    setView({ kind: 'home' });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory(undefined);
    setSearchQuery('');
    goHomeBrowse();
  }, [goHomeBrowse]);

  const openProduct = useCallback((product: Product) => {
    navigateStore(storeProductPath(product.id));
    setView({ kind: 'product', productId: product.id });
  }, []);

  const handleCategoryChip = useCallback((categoryId: string | undefined) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      navigateStore(storeCategoryPath(categoryId));
      setView({ kind: 'category', categoryId });
    } else {
      goHomeBrowse();
    }
  }, [goHomeBrowse]);

  const addProductToCart = useCallback(async (product: Product, branchId?: string, quantity = 1) => {
    setAddingToCart(product.id);
    setCartErrorMessage(null);
    clearCartError();
    try {
      let branch = branchId;
      if (!branch) {
        const availability: BranchInventory[] = await getProductAvailability(product.id);
        const inStock = availability.find((a) => a.quantity > 0) || availability[0];
        if (!inStock) {
          setCartErrorMessage('This product is not available at any branch yet.');
          return;
        }
        branch = inStock.branch;
      }
      await handleAddToCart({ product: product.id, branch, quantity });
      setAddedToCart(product.id);
      setTimeout(() => setAddedToCart((id) => (id === product.id ? null : id)), 1800);
    } catch (err: unknown) {
      setCartErrorMessage(formatApiError(err));
    } finally {
      setAddingToCart(null);
    }
  }, [handleAddToCart, clearCartError]);

  const renderView = () => {
    switch (view.kind) {
      case 'product':
        return (
          <ProductDetailView
            productId={view.productId}
            catalog={products}
            onBack={goHomeBrowse}
            onViewProduct={openProduct}
            onAddToCart={addProductToCart}
            adding={addingToCart === view.productId}
            cartError={cartErrorMessage || cartError}
            onClearError={() => { setCartErrorMessage(null); clearCartError(); }}
          />
        );
      case 'pending-order':
        return <PendingOrderView orderId={view.orderId} onBack={goHomeBrowse} />;
      case 'category': {
        const category = categories.find((c) => c.id === view.categoryId);
        return (
          <StoreCategoryView
            category={category}
            categoryId={view.categoryId}
            products={filterAndSortProducts(products, { categoryId: view.categoryId, sort })}
            loading={productsLoading || categoriesLoading}
            error={error}
            onRetry={loadProducts}
            onBack={goHomeBrowse}
            onViewProduct={openProduct}
            onAddToCart={(p) => addProductToCart(p)}
            addingId={addingToCart}
            addedId={addedToCart}
            sort={sort}
            onSortChange={setSort}
          />
        );
      }
      default:
        return null;
    }
  };

  const isHomeView = view.kind === 'home';

  return (
    <>
      {isHomeView ? (
        <div className="min-h-screen bg-white">
          {/* ─── Mobile sticky header ─── */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-brand-border/70">
            <div className="flex items-center gap-2 px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-brand-ink font-bold text-sm shrink-0">
                <Store className="w-4 h-4 text-brand-blue-bright" />
                Store
              </span>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted/60 pointer-events-none" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-9 pr-3 h-9 rounded-lg bg-brand-surface text-sm text-brand-ink placeholder:text-brand-muted/60 border border-brand-border/60 focus:outline-none focus:border-brand-blue-bright transition-all"
                  aria-label="Search products"
                />
              </div>
              <button
                type="button"
                onClick={openCart}
                className="relative shrink-0 w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-ink"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-[18px] h-[18px]" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-blue-bright text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center leading-none border-2 border-white">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ─── Hero section ─── */}
          <section className="bg-brand-blue-bright text-white">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-7 lg:py-8">
              <div className="flex items-center justify-between gap-8">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">
                    <Store className="w-3 h-3" />
                    Ethio Robotics Store
                  </span>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mt-1 leading-tight">
                    Parts, kits, and gear for your next build
                  </h1>
                  <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-lg leading-relaxed">
                    Browse products, check branch stock, and pick up after payment verification.
                  </p>
                  <button
                    type="button"
                    onClick={openCart}
                    className="mt-3 inline-flex items-center h-10 px-5 bg-white text-brand-blue-bright rounded-[10px] text-sm font-semibold hover:bg-white/90 transition-colors active:scale-[0.97]"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Start Shopping
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Category chips + Search (desktop) ─── */}
          <div className="hidden sm:block max-w-[1440px] mx-auto px-4 sm:px-6 mt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 overflow-x-auto scrollbar-hide -mb-1">
                <CategoryChips
                  categories={categories}
                  selectedId={selectedCategory}
                  loading={categoriesLoading}
                  onSelect={handleCategoryChip}
                />
              </div>
              <div className="hidden sm:block w-80 shrink-0">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name or SKU…"
                />
              </div>
            </div>
          </div>

          {/* ─── Mobile category chips ─── */}
          <div className="sm:hidden overflow-x-auto scrollbar-hide px-4 mt-3">
            <CategoryChips
              categories={categories}
              selectedId={selectedCategory}
              loading={categoriesLoading}
              onSelect={handleCategoryChip}
            />
          </div>

          {/* ─── Main content ─── */}
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mt-6 pb-24 sm:pb-8">
            <div className="flex gap-8">
              <div className="flex-1 min-w-0 space-y-10">
                {/* ─── Error banner ─── */}
                {(error || cartError || cartErrorMessage) && (
                  <ErrorBanner
                    message={error ?? cartError ?? cartErrorMessage ?? ''}
                    title={error ? 'Could not load products' : 'Could not update cart'}
                    onRetry={error ? loadProducts : undefined}
                    onDismiss={!error ? () => { clearCartError(); setCartErrorMessage(null); } : undefined}
                  />
                )}

                {/* ─── Featured Products ─── */}
                {!productsLoading && latestProducts.length > 0 && (
                  <section>
                    <SectionHeader
                      eyebrow="Featured"
                      title="Featured Products"
                      action={
                        <button
                          type="button"
                          onClick={() => { setShowAllProducts(true); setPage(1); }}
                          className="text-xs font-semibold text-brand-blue-bright hover:text-brand-blue-bright/80 transition-colors"
                        >
                          View All →
                        </button>
                      }
                    />
                    <ProductGrid
                      products={latestProducts}
                      onView={openProduct}
                      onAdd={(p) => addProductToCart(p)}
                      addingId={addingToCart}
                      addedId={addedToCart}
                      compact
                      featured
                    />
                  </section>
                )}

                {/* ─── All Products ─── */}
                <section>
                  <div className="flex items-end justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-brand-ink">All Products</h2>
                      {!productsLoading && (
                        <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                          {pageData.total} product{pageData.total !== 1 ? 's' : ''}
                          {!showAllProducts && !selectedCategory && !debouncedSearch && latestProducts.length > 0 && (
                            <span className="text-brand-muted/60"> (excluding featured)</span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(selectedCategory || debouncedSearch) && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="text-xs font-semibold text-brand-blue-bright hover:text-brand-blue-bright/80 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as CatalogSort)}
                        className="h-8 px-2 rounded-lg border border-brand-border bg-white text-xs text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue-bright/10 focus:border-brand-blue-bright"
                        aria-label="Sort products"
                      >
                        <option value="newest">Newest</option>
                        <option value="name-asc">Name A–Z</option>
                        <option value="name-desc">Name Z–A</option>
                        <option value="price-asc">Price: low to high</option>
                        <option value="price-desc">Price: high to low</option>
                      </select>
                    </div>
                  </div>

                  {productsLoading ? (
                    <ProductGrid products={[]} loading skeletonCount={12} />
                  ) : pageData.total === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6 text-brand-border" />
                      </div>
                      <p className="text-sm font-semibold text-brand-ink mb-1">No products found</p>
                      <p className="text-xs text-brand-muted">
                        {debouncedSearch
                          ? `No results for "${debouncedSearch}". Try a different search term.`
                          : 'No products match this selection yet.'}
                      </p>
                      {(selectedCategory || debouncedSearch) && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-3 inline-flex items-center h-9 px-4 bg-brand-blue-bright text-white rounded-[10px] text-xs font-semibold hover:bg-brand-blue-bright/90 transition-colors active:scale-[0.97]"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <ProductGrid
                        products={pageData.items}
                        onView={openProduct}
                        onAdd={(p) => addProductToCart(p)}
                        addingId={addingToCart}
                        addedId={addedToCart}
                      />
                      {pageData.totalPages > 1 && (
                        <nav className="flex items-center justify-center gap-2 pt-6" aria-label="Product pagination">
                          <button
                            type="button"
                            disabled={pageData.page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="h-8 px-3 rounded-lg text-xs font-semibold border border-brand-border text-brand-muted hover:text-brand-ink hover:bg-brand-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: pageData.totalPages }, (_, i) => i + 1).map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                aria-current={p === pageData.page ? 'page' : undefined}
                                className={`w-7 h-7 rounded-md text-[11px] font-semibold transition-all ${
                                  p === pageData.page
                                    ? 'bg-brand-blue-bright text-white'
                                    : 'text-brand-muted hover:text-brand-ink hover:bg-brand-surface'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            disabled={pageData.page >= pageData.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="h-8 px-3 rounded-lg text-xs font-semibold border border-brand-border text-brand-muted hover:text-brand-ink hover:bg-brand-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            Next
                          </button>
                        </nav>
                      )}
                    </>
                  )}
                </section>
              </div>

              <DesktopCartSidebar
                cart={cart}
                loading={cartLoading}
                itemCount={cartItemCount}
                onOpenCart={openCart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
              />
            </div>
          </div>
        </div>
      ) : (
        renderView()
      )}

      {/* ─── Mobile cart FAB ─── */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40 bottom-safe">
        <button
          type="button"
          onClick={openCart}
          className="relative w-12 h-12 bg-brand-blue-bright text-white rounded-full shadow-lg shadow-brand-blue-bright/25 flex items-center justify-center hover:bg-brand-blue-bright/90 transition-colors active:scale-95"
          aria-label="Open cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-blue-bright text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none border-2 border-white">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
