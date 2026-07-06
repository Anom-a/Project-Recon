import { motion } from 'motion/react';
import StoreTab from '../../domains/store/products/ui/StoreTab';
import { CartItem } from '../../shared/types';

interface StorePageProps {
  cart: CartItem[];
  onAddToCart: (product: any) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  cartTotal: number;
  onCheckout: () => void;
}

export default function StorePage(props: StorePageProps) {
  return (
    <motion.div key="store-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <StoreTab {...props} />
    </motion.div>
  );
}
