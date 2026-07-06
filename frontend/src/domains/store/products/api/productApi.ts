import { ROBOTICS_PRODUCTS } from '../../../../shared/constants/mock-data';
import type { Product } from '../../../../shared/types';
import type { ProductFilters } from '../model/types';

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  await new Promise(r => setTimeout(r, 200));
  let products = [...ROBOTICS_PRODUCTS];

  if (filters) {
    if (filters.category) products = products.filter(p => p.category === filters.category);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filters.sortBy === 'price-asc') products.sort((a, b) => a.price - b.price);
    if (filters.sortBy === 'price-desc') products.sort((a, b) => b.price - a.price);
    if (filters.sortBy === 'rating') products.sort((a, b) => b.rating - a.rating);
    if (filters.sortBy === 'name') products.sort((a, b) => a.name.localeCompare(b.name));
  }

  return products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  await new Promise(r => setTimeout(r, 100));
  return ROBOTICS_PRODUCTS.find(p => p.id === id);
}
