import { http } from '@/shared/api/http';
import type {
  ProductCategory, Product, BranchInventory, Order,
} from '@/domains/store/model/types';

const PREFIX = '/store/admin';

export interface CategoryPayload {
  name: string;
  description: string;
  is_active: boolean;
}

export interface ProductPayload {
  category: string;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  barcode: string;
  price: number;
  currency: string;
  weight: number;
  is_active: boolean;
}

export interface InventoryPayload {
  branch: string;
  product: string;
  quantity: number;
  minimum_quantity: number;
}

export interface OrderStatusPayload {
  status: string;
  notes?: string;
}

export type InventoryAction = 'add' | 'reduce' | 'correct' | 'transfer';

export interface InventoryActionPayload {
  action: InventoryAction;
  branch: string;
  product: string;
  quantity?: number;
  new_quantity?: number;
  to_branch?: string;
  reason?: string;
}

export const storeAdminApi = {
  categories: {
    list: () => http.get<ProductCategory[]>(`${PREFIX}/categories/`),
    get: (id: string) => http.get<ProductCategory>(`${PREFIX}/categories/${id}/`),
    create: (data: CategoryPayload) => http.post<ProductCategory>(`${PREFIX}/categories/`, data),
    update: (id: string, data: Partial<CategoryPayload>) => http.put<ProductCategory>(`${PREFIX}/categories/${id}/`, data),
    delete: (id: string) => http.delete<void>(`${PREFIX}/categories/${id}/`),
    activate: (id: string) => http.post<void>(`${PREFIX}/categories/${id}/activate/`, {}),
    deactivate: (id: string) => http.post<void>(`${PREFIX}/categories/${id}/deactivate/`, {}),
  },

  products: {
    list: (params?: Record<string, string>) => http.get<Product[]>(`${PREFIX}/products/`, { params }),
    get: (id: string) => http.get<Product>(`${PREFIX}/products/${id}/`),
    create: (data: ProductPayload) => http.post<Product>(`${PREFIX}/products/`, data),
    update: (id: string, data: Partial<ProductPayload>) => http.put<Product>(`${PREFIX}/products/${id}/`, data),
    delete: (id: string) => http.delete<void>(`${PREFIX}/products/${id}/`),
    uploadImage: (productId: string, formData: FormData) =>
      http.post<Product>(`${PREFIX}/products/${productId}/images/`, formData),
    deleteImage: (productId: string, imageId: string) =>
      http.delete<void>(`${PREFIX}/products/${productId}/images/${imageId}/`),
  },

  inventory: {
    list: (params?: Record<string, string>) => http.get<BranchInventory[]>(`${PREFIX}/inventory/`, { params }),
    create: (data: InventoryPayload) => http.post<BranchInventory>(`${PREFIX}/inventory/`, data),
    action: (data: InventoryActionPayload) => http.post<BranchInventory>(`${PREFIX}/inventory/action/`, data),
  },

  orders: {
    list: (params?: Record<string, string>) => http.get<Order[]>(`${PREFIX}/orders/`, { params }),
    get: (id: string) => http.get<Order>(`${PREFIX}/orders/${id}/`),
    updateStatus: (id: string, data: OrderStatusPayload) =>
      http.post<Order>(`${PREFIX}/orders/${id}/status/`, data),
  },
};
