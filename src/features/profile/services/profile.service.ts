import { api } from '../../../core/api';
import type { UserProfileDTO } from '../types/profile.dto';

export async function fetchUserProfile(): Promise<UserProfileDTO> {
  const res = await api.get<UserProfileDTO>('/api/user/profile');
  return res.data;
}

export async function updateUserProfile(data: {
  name: string;
  phone?: string | null;
  date_of_birth?: string | null;
  profile_picture_url?: string | null;
}): Promise<void> {
  await api.patch('/api/user/profile', data);
}
