import { api } from '../../../core/api/client';

export async function setPassword(password: string): Promise<void> {
  await api.post('/api/auth/set-password', { password });
}
