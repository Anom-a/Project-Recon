import { useState } from 'react';
import { CartItem, Product } from '../../../../shared/types';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'submitting' | 'success'>('cart');

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty < 1 ? 1 : newQty };
        }
        return item;
      });
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const openCart = () => {
    setCheckoutStep('cart');
    setCartOpen(true);
  };

  const closeCart = () => {
    setCartOpen(false);
  };

  return {
    cart,
    setCart,
    cartOpen,
    setCartOpen,
    checkoutStep,
    setCheckoutStep,
    handleAddToCart,
    handleUpdateCartQuantity,
    handleRemoveFromCart,
    getCartTotal,
    getCartItemsCount,
    openCart,
    closeCart,
  };
}
