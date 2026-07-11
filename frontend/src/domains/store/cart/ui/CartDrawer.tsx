import { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Plus, Minus, Trash2, CheckCircle2, Loader, Award } from 'lucide-react';
import { CartItem, UserProfile } from '@/src/shared/types';

interface CartDrawerProps {
  cartOpen: boolean;
  cart: CartItem[];
  checkoutStep: string;
  currentUser: UserProfile | null;
  getCartTotal: () => number;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveFromCart: (id: string) => void;
  onCheckoutSubmit: (e: FormEvent) => void;
  onSetCheckoutStep: (step: 'cart' | 'shipping' | 'submitting' | 'success') => void;
  onSetCart: (cart: CartItem[]) => void;
}

export default function CartDrawer({
  cartOpen, cart, checkoutStep, currentUser, getCartTotal,
  onClose, onUpdateQuantity, onRemoveFromCart,
  onCheckoutSubmit, onSetCheckoutStep, onSetCart
}: CartDrawerProps) {
  const total = getCartTotal();

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col z-10">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-blue" />
                <h3 className="font-bold text-lg text-slate-900">Cart ({cart.length})</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {checkoutStep === 'success' ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-black text-xl text-slate-900 mb-1">Purchase Complete!</h3>
                  <p className="text-sm text-slate-500">Your order has been placed. Check your dashboard for updates.</p>
                  {currentUser && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl text-amber-700 text-sm font-bold">
                      <Award className="w-4 h-4" /> +40 XP Earned!
                    </div>
                  )}
                  <button onClick={() => { onSetCart([]); onSetCheckoutStep('cart'); onClose(); }}
                    className="mt-6 px-6 py-2.5 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : checkoutStep === 'submitting' ? (
                <div className="text-center py-16">
                  <Loader className="w-10 h-10 animate-spin text-brand-blue mx-auto mb-4" />
                  <p className="text-sm text-slate-500">Processing your order...</p>
                </div>
              ) : checkoutStep === 'shipping' ? (
                <form onSubmit={onCheckoutSubmit} className="space-y-4">
                  <h4 className="font-bold text-base text-slate-900">Shipping Details</h4>
                  <input placeholder="Full Name" defaultValue={currentUser?.name || ''} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  <input placeholder="Email" type="email" defaultValue={currentUser?.email || ''} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  <input placeholder="Phone Number" type="tel" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  <input placeholder="Address" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  <div className="pt-2">
                    <button type="submit" className="w-full bg-brand-red text-white font-bold py-3 rounded-xl hover:bg-brand-red-dark transition-colors">
                      Place Order — Birr {total.toLocaleString()}
                    </button>
                  </div>
                </form>
              ) : (
                cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">Your cart is empty</p>
                    <p className="text-xs text-slate-400 mt-1">Browse our store to add items</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{item.product.name}</h4>
                        <p className="text-xs font-bold text-brand-blue mt-0.5">Birr {item.product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                          <button onClick={() => onUpdateQuantity(item.product.id, -1)} className="p-1.5 text-slate-400 hover:text-slate-700"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-xs font-bold px-2 text-slate-800">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.product.id, 1)} className="p-1.5 text-slate-400 hover:text-slate-700"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <button onClick={() => onRemoveFromCart(item.product.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
            {cart.length > 0 && checkoutStep === 'cart' && (
              <div className="p-5 border-t border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm text-slate-700">Total</span>
                  <span className="font-bold text-lg text-brand-blue">Birr {total.toLocaleString()}</span>
                </div>
                <button onClick={() => onSetCheckoutStep('shipping')}
                  className="w-full bg-gradient-to-r from-brand-red to-brand-red-dark text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
