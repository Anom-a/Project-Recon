import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingCart, Plus, X } from 'lucide-react';
import { useCart } from '@/shared/hooks/useCart';
import { listProducts } from '@/domains/store/products/api/productApi';
import { listActiveCategories } from '@/domains/store/categories/api/categoriesApi';
import type { Product, ProductCategory } from '@/domains/store/model/types';
import { cn } from '@/shared/utils/cn';

function ProductSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg border border-slate-100 overflow-hidden">
      <div className="aspect-square bg-slate-100" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="h-5 bg-slate-100 rounded w-1/2 mt-2" />
      </div>
    </div>
  );
}

export function StoreTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const { cart, handleAddToCart, openCart } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    (async () => {
      try {
        setCategoriesLoading(true);
        const data = await listActiveCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      setError(null);
      const data = await listProducts({
        category_id: selectedCategory,
        search: debouncedSearchQuery,
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  }, [selectedCategory, debouncedSearchQuery]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const cartItemCount = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900 shrink-0 tracking-tight">
              Store
            </h1>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={openCart}
              className="relative p-2.5 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-slate-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Mobile cart FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={openCart}
          className="relative w-14 h-14 bg-brand-blue text-white rounded-full shadow-lg shadow-brand-blue/25 flex items-center justify-center hover:bg-brand-blue-dark transition-colors active:scale-95"
          aria-label="Open cart"
        >
          <ShoppingBag className="w-6 h-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-blue-bright text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 leading-none border-2 border-white">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                !selectedCategory
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              )}
            >
              All
            </button>
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="shrink-0 h-8 w-24 bg-slate-100 rounded-full animate-pulse" />
                ))
              : categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                      selectedCategory === cat.id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
          </div>
        </div>

        <div className="mt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
              <p className="text-red-600 text-sm mb-2">{error}</p>
              <button
                onClick={loadProducts}
                className="text-sm text-red-600 underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          )}

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {Array.from({ length: 18 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">No products found</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              {(selectedCategory || debouncedSearchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory(undefined);
                    setSearchQuery('');
                  }}
                  className="text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500 mb-3">{products.length} products</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                <AnimatePresence mode="popLayout">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-white rounded-lg border border-slate-100 overflow-hidden group hover:border-slate-200 hover:shadow-sm transition-all">
                        <div className="aspect-square bg-slate-50 relative overflow-hidden">
                          {product.primary_image?.image ? (
                            <img
                              src={product.primary_image.image}
                              alt={product.name}
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-slate-300 text-[10px] font-medium">N/A</span>
                            </div>
                          )}
                          <button
                            onClick={() => handleAddToCart({
                              product: product.id,
                              branch: "697b6ba4-da14-4c8f-9066-c0baf51181e2",
                              quantity: 1,
                            })}
                            className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="p-2.5">
                          <h3 className="text-[13px] font-medium text-slate-800 leading-tight line-clamp-2 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mb-1.5">
                            {product.short_description}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-900">
                              ${Number(product.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
