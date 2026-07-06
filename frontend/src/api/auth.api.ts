import { http } from './client';
import type { LoginRequest, LoginResponse, ForgotPasswordRequest, ResetPasswordRequest } from './types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    http.post<LoginResponse>('/accounts/login/', data),

  logout: (refresh: string) =>
    http.post('/accounts/logout/', { refresh }),

  forgotPassword: (data: ForgotPasswordRequest) =>
    http.post('/accounts/password/forgot/', data),

  resetPassword: (data: ResetPasswordRequest) =>
    http.post('/accounts/password/reset/', data),

  refreshToken: (refresh: string) =>
    http.post<{ access: string }>('/accounts/token/refresh/', { refresh }),
};
