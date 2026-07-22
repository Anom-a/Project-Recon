import { http } from '@/shared/api/http';
import { fetchAllPages } from '@/shared/api/pagination';
import type { Order } from '../../model/types';

const BASE = '/store/orders';

export async function getUserOrders(): Promise<Order[]> {
  return fetchAllPages((page) =>
    http.get(`${BASE}/`, { params: { page: String(page) } }),
  );
}

export async function getOrder(id: string): Promise<Order> {
  return await http.get<Order>(`${BASE}/${id}/`);
}
