import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { validateInviteCode } from '../services/invite.service';
import { toInviteValidation } from '../mappers/invite.mapper';
import type { InviteValidation } from '../types/invite.model';

export function useValidateInvite(code: string) {
  return useQuery<InviteValidation>({
    queryKey: queryKeys.invites.validate(code),
    queryFn: async () => {
      const dto = await validateInviteCode(code);
      return toInviteValidation(dto);
    },
    enabled: !!code,
    retry: false,
    staleTime: 30 * 1000,
  });
}
