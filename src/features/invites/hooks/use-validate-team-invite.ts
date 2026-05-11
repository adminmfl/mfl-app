import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { validateTeamInvite } from '../services/invite.service';
import { toTeamInviteValidation } from '../mappers/invite.mapper';
import type { TeamInviteValidation } from '../types/invite.model';

export function useValidateTeamInvite(code: string) {
  return useQuery<TeamInviteValidation>({
    queryKey: queryKeys.invites.validateTeam(code),
    queryFn: async () => {
      const dto = await validateTeamInvite(code);
      return toTeamInviteValidation(dto);
    },
    enabled: !!code,
    retry: false,
    staleTime: 30 * 1000,
  });
}
