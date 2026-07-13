import { http } from '@/shared/api/http';
import type { StorePayment } from '@/domains/store/model/types';

export async function verifyPayment(reference: string): Promise<StorePayment> {
  return await http.post<StorePayment>('/store/payments/verify/', { reference });
}
