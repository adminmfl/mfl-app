import { api } from '../../../core/api/client';

export interface SignupPayload {
  email: string;
  otp: string;
  createUser: true;
  password: string;
  username: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
}

export async function sendSignupOtp(email: string): Promise<{ message?: string; error?: string }> {
  const res = await api.post('/api/auth/send-otp', { email });
  return res.data;
}

export async function verifySignupOtp(payload: SignupPayload): Promise<{ success?: boolean; error?: string }> {
  const res = await api.post('/api/auth/verify-otp', payload);
  return res.data;
}
