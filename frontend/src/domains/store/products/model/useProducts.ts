import { useState, useEffect } from 'react';
import type { Product } from '../../../../shared/types';
import type { ProductFilters } from './types';
import { getProducts } from '../api/productApi';

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getProducts(filters).then(setProducts).finally(() => setIsLoading(false));
  }, [filters?.category, filters?.search, filters?.sortBy]);

  return { products, isLoading };
}
