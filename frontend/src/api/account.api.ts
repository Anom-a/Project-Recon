import { http } from './client';
import type { PaginatedResponse } from './types/common.types';
import type { AdminUserResponse, AuditLogEntry, Branch, Assignment } from './types/account.types';

export const usersApi = {
  list: () => http.get<PaginatedResponse<AdminUserResponse>>('/accounts/users/'),

  get: (id: string) => http.get<AdminUserResponse>(`/accounts/users/${id}/`),

  update: (id: string, data: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string | null;
    profile_picture?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
  }) => http.patch<AdminUserResponse>(`/accounts/users/${id}/`, data),

  toggleStatus: (userId: string, currentStatus: string) => {
    const action = currentStatus === 'Active' ? 'deactivate' : 'activate';
    return http.post(`/accounts/users/${userId}/${action}/`, {});
  },

  archive: (userId: string) =>
    http.post(`/accounts/users/${userId}/archive/`, {}),

  createStaff: (data: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    branch_id: string;
    role?: string;
  }) => http.post('/accounts/users/staff/', data),

  createBranchManager: (data: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    branch_id: string;
  }) => http.post('/accounts/users/branch-managers/', data),
};

export const auditApi = {
  list: () => http.get<PaginatedResponse<AuditLogEntry>>('/audit/'),

  get: (id: string) => http.get<AuditLogEntry>(`/audit/${id}/`),
};

export const branchesApi = {
  list: () => http.get<PaginatedResponse<Branch>>('/accounts/branches/'),

  get: (id: string) => http.get<Branch>(`/accounts/branches/${id}/`),

  create: (data: {
    name: string;
    code: string;
    email?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    state_region?: string;
    country?: string;
  }) => http.post<Branch>('/accounts/branches/', data),

  update: (id: string, data: Partial<Branch>) =>
    http.patch<Branch>(`/accounts/branches/${id}/`, data),

  assignManager: (branchId: string, managerUserId: string) =>
    http.post(`/accounts/branches/${branchId}/assign-manager/`, { manager_user_id: managerUserId }),

  changeManager: (branchId: string, managerUserId: string) =>
    http.post(`/accounts/branches/${branchId}/change-manager/`, { manager_user_id: managerUserId }),

  createWithManager: (data: {
    name: string;
    code: string;
    manager_user_id: string;
    email?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    state_region?: string;
    country?: string;
  }) => http.post('/accounts/branches/with-manager/', data),

  toggleActive: (branchId: string, isActive: boolean) => {
    const action = isActive ? 'deactivate' : 'activate';
    return http.post(`/accounts/branches/${branchId}/${action}/`, {});
  },

  archive: (branchId: string) =>
    http.post(`/accounts/branches/${branchId}/archive/`, {}),
};

export const assignmentsApi = {
  list: () => http.get<PaginatedResponse<Assignment>>('/accounts/assignments/'),

  create: (data: {
    user_id: string;
    branch_id?: string | null;
    role: string;
    is_primary?: boolean;
  }) => http.post<Assignment>('/accounts/assignments/', data),

  update: (id: string, data: { is_primary?: boolean; is_active?: boolean }) =>
    http.patch<Assignment>(`/accounts/assignments/${id}/`, data),

  delete: (id: string) => http.delete(`/accounts/assignments/${id}/`),

  makePrimary: (id: string) =>
    http.post(`/accounts/assignments/${id}/make-primary/`, {}),

  transfer: (data: {
    user_id: string;
    from_branch_id: string;
    to_branch_id: string;
    role: string;
  }) => http.post('/accounts/assignments/transfer/', data),
};
