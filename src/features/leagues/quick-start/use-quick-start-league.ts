import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { createQuickStartLeague } from './quick-start.service';
import type { QuickStartPayload, QuickStartResponse } from './quick-start.types';

export function useQuickStartLeague() {
  const queryClient = useQueryClient();

  return useMutation<QuickStartResponse, Error, QuickStartPayload>({
    mutationFn: createQuickStartLeague,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.leagues() });
    },
  });
}
