import type { UserProfile } from '../../../../shared/types';
import type { RegisterData, AuthResponse } from '../../model/types';

export async function registerApi(data: RegisterData): Promise<AuthResponse> {
  await new Promise(r => setTimeout(r, 600));
  const user: UserProfile = {
    email: data.email,
    name: data.name,
    role: data.role,
    enrolledPrograms: [],
    xpPoints: 50,
    badges: ['New Member'],
  };
  return { user };
}
