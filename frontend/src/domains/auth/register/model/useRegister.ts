import { useState } from 'react';
import type { UserProfile } from '../../../../shared/types';
import type { RegisterData } from '../../model/types';
import { registerApi } from '../api/registerApi';

interface UseRegisterReturn {
  register: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useRegister(onSuccess: (user: UserProfile) => void): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await registerApi(data);
      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}
