import { api } from '../../../core/api/client';

export async function sendOtp(email: string): Promise<void> {
  await api.post('/api/auth/send-otp', { email });
}

export async function resetPassword(email: string, otp: string, password: string): Promise<void> {
  await api.post('/api/auth/reset-password', { email, otp, password });
}

export async function completeProfile(data: {
  username: string;
  password: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
}): Promise<void> {
  await api.post('/api/auth/complete-profile', data);
}
