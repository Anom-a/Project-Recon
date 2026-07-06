import { useState } from 'react';
import type { UserProfile } from '../../../../shared/types';
import type { LoginCredentials } from '../../model/types';
import { loginApi, socialLoginApi } from '../api/loginApi';

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  socialLogin: (provider: 'google' | 'github') => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useLogin(onSuccess: (user: UserProfile) => void): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await loginApi(credentials);
      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await socialLoginApi(provider);
      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Social login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { login, socialLogin, isLoading, error };
}
