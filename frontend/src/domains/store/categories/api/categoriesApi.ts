import { http } from '@/shared/api/http';
import { fetchAllPages } from '@/shared/api/pagination';
import type { ProductCategory } from '../../model/types';

const BASE = '/store/categories';

export async function listActiveCategories(): Promise<ProductCategory[]> {
  return fetchAllPages((page) =>
    http.get(`${BASE}/`, { params: { is_active: 'true', page: String(page) } }),
  );
}

export async function getCategory(id: string): Promise<ProductCategory> {
  return await http.get<ProductCategory>(`${BASE}/${id}/`);
}
