import type { UserProfileDTO } from '../types/profile.dto';
import type { UserProfile } from '../types/profile.model';

export function toUserProfile(dto: UserProfileDTO): UserProfile {
  return {
    userId: dto.user_id,
    username: dto.username,
    email: dto.email,
    phone: dto.phone,
    dateOfBirth: dto.date_of_birth,
    gender: dto.gender,
    avatarUrl: dto.profile_picture_url,
  };
}
