import { useState, useEffect } from 'react';
import { listActiveCategories } from '../api/categoriesApi';
import type { ProductCategory } from '@/domains/store/model/types';
import { formatApiError } from '@/shared/utils/formatApiError';

export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);
        const data = await listActiveCategories();
        setCategories(data);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export default useCategories;
