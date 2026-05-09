import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveManualEntry } from '../services/manual-entry.service';
import type { ManualEntrySaveRequestDTO } from '../types/manual-entry';

interface SaveManualEntryVars {
  leagueId: string;
  data: ManualEntrySaveRequestDTO;
}

export function useSaveManualEntry() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SaveManualEntryVars>({
    mutationFn: async ({ leagueId, data }) => {
      await saveManualEntry(leagueId, data);
    },
    onSuccess: (_data, { leagueId }) => {
      queryClient.invalidateQueries({
        queryKey: ['leagues', leagueId, 'manual-entry'],
      });
      queryClient.invalidateQueries({
        queryKey: ['leagues', leagueId, 'submissions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['leagues', leagueId, 'leaderboard'],
      });
    },
  });
}
