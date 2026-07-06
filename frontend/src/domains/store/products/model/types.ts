import type { Product } from '../../../../shared/types';

export interface ProductFilters {
  category?: Product['category'];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'name';
}

export { Product };
