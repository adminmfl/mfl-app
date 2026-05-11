import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  fetchMilestoneDrafts,
  editMilestoneDraft,
  sendMilestoneDraft,
} from '../services/captain-engagement.service';
import { toMilestoneDraft } from '../mappers/captain-engagement.mapper';
import type { MilestoneDraft } from '../types/captain-engagement.model';

export function useMilestoneDrafts(leagueId: string) {
  return useQuery<MilestoneDraft[]>({
    queryKey: queryKeys.leagues.milestoneDrafts(leagueId),
    queryFn: async () => {
      const dtos = await fetchMilestoneDrafts(leagueId);
      return dtos.map(toMilestoneDraft);
    },
    enabled: !!leagueId,
  });
}

export function useEditMilestoneDraft(leagueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, content }: { draftId: string; content: string }) =>
      editMilestoneDraft(draftId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.milestoneDrafts(leagueId),
      });
    },
  });
}

export function useSendMilestoneDraft(leagueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draftId: string) => sendMilestoneDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.milestoneDrafts(leagueId),
      });
    },
  });
}
