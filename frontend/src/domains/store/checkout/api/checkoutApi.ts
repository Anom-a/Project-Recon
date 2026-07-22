import { http } from '@/shared/api/http';
import { getStoreRequestHeaders, setOrderAccessToken } from '@/domains/store/utils/session';
import type { CheckoutPayload, PendingOrder } from '@/domains/store/model/types';

const BASE = '/store';

function rememberOrderToken(order: PendingOrder): PendingOrder {
  if (order?.id && order.access_token) {
    setOrderAccessToken(order.id, order.access_token);
  }
  return order;
}

export async function checkout(
  payload: CheckoutPayload,
  attachment?: File | null,
  senderName?: string,
): Promise<PendingOrder> {
  const headers = getStoreRequestHeaders();

  if (attachment || senderName) {
    const form = new FormData();
    form.append('branch', payload.branch);
    if (payload.guest_name) form.append('guest_name', payload.guest_name);
    if (payload.guest_email) form.append('guest_email', payload.guest_email);
    if (payload.guest_phone) form.append('guest_phone', payload.guest_phone);
    if (payload.payment) {
      form.append('payment.amount', String(payload.payment.amount));
      form.append('payment.payment_method', payload.payment.payment_method);
      if (payload.payment.transaction_reference) {
        form.append('payment.transaction_reference', payload.payment.transaction_reference);
      }
      if (payload.payment.bank_name) form.append('payment.bank_name', payload.payment.bank_name);
    }
    if (attachment) form.append('payment_attachment', attachment);
    if (senderName) form.append('sender_name', senderName);
    return rememberOrderToken(
      await http.post<PendingOrder>(`${BASE}/cart/checkout/`, form, { headers }),
    );
  }

  return rememberOrderToken(
    await http.post<PendingOrder>(`${BASE}/cart/checkout/`, payload, { headers }),
  );
}

export async function getPendingOrder(id: string): Promise<PendingOrder> {
  const order = await http.get<PendingOrder>(`${BASE}/pending-orders/${id}/`, {
    headers: getStoreRequestHeaders({ orderId: id }),
  });
  return rememberOrderToken(order);
}

export async function verifyPendingOrderEmail(id: string, otp: string): Promise<PendingOrder> {
  const order = await http.post<PendingOrder>(
    `${BASE}/pending-orders/${id}/verify-email/`,
    { otp },
    { headers: getStoreRequestHeaders({ orderId: id }) },
  );
  return rememberOrderToken(order);
}

export default checkout;
