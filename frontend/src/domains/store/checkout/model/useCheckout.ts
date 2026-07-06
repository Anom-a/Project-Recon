import { useState } from 'react';

interface ShippingInfo {
  name: string;
  address: string;
  phone: string;
}

interface UseCheckoutReturn {
  step: 'cart' | 'shipping' | 'processing' | 'success';
  setStep: (step: 'cart' | 'shipping' | 'processing' | 'success') => void;
  shippingInfo: ShippingInfo;
  setShippingInfo: (info: ShippingInfo) => void;
  submitOrder: () => Promise<void>;
  isProcessing: boolean;
}

export function useCheckout(onComplete?: () => void): UseCheckoutReturn {
  const [step, setStep] = useState<'cart' | 'shipping' | 'processing' | 'success'>('cart');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({ name: '', address: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const submitOrder = async () => {
    setIsProcessing(true);
    setStep('processing');
    await new Promise(r => setTimeout(r, 1500));
    setStep('success');
    setIsProcessing(false);
    onComplete?.();
  };

  return { step, setStep, shippingInfo, setShippingInfo, submitOrder, isProcessing };
}
