const SESSION_KEY_STORAGE = 'ethio_robotics_store_session';
const CART_TOKEN_STORAGE = 'ethio_robotics_store_cart_token';
const ORDER_TOKEN_PREFIX = 'ethio_robotics_store_order_token:';

export function getSessionKey(): string {
  let sessionKey = localStorage.getItem(SESSION_KEY_STORAGE);
  if (!sessionKey) {
    sessionKey = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY_STORAGE, sessionKey);
  }
  return sessionKey;
}

export function getCartToken(): string | null {
  return localStorage.getItem(CART_TOKEN_STORAGE);
}

export function setCartToken(token: string | null | undefined): void {
  if (!token) return;
  localStorage.setItem(CART_TOKEN_STORAGE, token);
}

export function clearCartToken(): void {
  localStorage.removeItem(CART_TOKEN_STORAGE);
}

export function getOrderAccessToken(orderId: string): string | null {
  return sessionStorage.getItem(`${ORDER_TOKEN_PREFIX}${orderId}`);
}

export function setOrderAccessToken(orderId: string, token: string | null | undefined): void {
  if (!orderId || !token) return;
  sessionStorage.setItem(`${ORDER_TOKEN_PREFIX}${orderId}`, token);
}

/** Headers for guest/session store requests (cart + pending-order access). */
export function getStoreRequestHeaders(opts?: { orderId?: string }): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Session-Key': getSessionKey(),
  };
  const cartToken = getCartToken();
  if (cartToken) headers['X-Cart-Token'] = cartToken;
  if (opts?.orderId) {
    const orderToken = getOrderAccessToken(opts.orderId);
    if (orderToken) headers['X-Order-Token'] = orderToken;
  }
  return headers;
}
