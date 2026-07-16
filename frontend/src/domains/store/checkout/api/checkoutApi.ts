import { http } from '@/shared/api/http';
import { getStoreRequestHeaders } from '@/domains/store/utils/session';
import type { CheckoutPayload, PendingOrder } from '@/domains/store/model/types';

export async function checkout(payload: CheckoutPayload): Promise<PendingOrder> {
  const headers = getStoreRequestHeaders();
  return await http.post<PendingOrder>('/store/cart/checkout/', payload, { headers });
}

export default checkout;
