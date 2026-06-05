import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { joinByInviteCode } from '../services/invite.service';
import { toJoinByInviteResult } from '../mappers/invite.mapper';
import type { JoinByInviteResult } from '../types/invite.model';

export function useJoinByInvite() {
  const queryClient = useQueryClient();

  return useMutation<JoinByInviteResult, Error, string>({
    mutationFn: async (code) => {
      const dto = await joinByInviteCode(code);
      return toJoinByInviteResult(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.leagues() });
    },
  });
}
