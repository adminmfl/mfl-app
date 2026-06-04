import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchUserProfile } from '../services/profile.service';
import { toUserProfile } from '../mappers/profile.mapper';
import type { UserProfile } from '../types/profile.model';

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      const dto = await fetchUserProfile();
      return toUserProfile(dto);
    },
    staleTime: 5 * 60 * 1000,
  });
}
