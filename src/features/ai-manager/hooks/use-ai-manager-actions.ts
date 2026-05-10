import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  runAiScan,
  updateDigestStatus,
  updateDraft,
  sendDraft,
  deleteDraft as deleteDraftService,
  updateInterventionStatus,
  generateDraftFromIntervention,
} from '../services/ai-manager.service';
import { draftQueryKey } from './use-drafts';

function useInvalidateAll(leagueId: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: [...queryKeys.leagues.all, leagueId, 'ai-manager'] });
  };
}

export function useRunScan(leagueId: string) {
  const invalidateAll = useInvalidateAll(leagueId);
  return useMutation({
    mutationFn: () => runAiScan(leagueId),
    onSuccess: invalidateAll,
  });
}

export function useMarkDigestRead(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => updateDigestStatus(leagueId, ids, 'read'),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [...queryKeys.leagues.all, leagueId, 'ai-manager', 'digest'],
      }),
  });
}

export function useDismissDigest(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => updateDigestStatus(leagueId, ids, 'dismissed'),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [...queryKeys.leagues.all, leagueId, 'ai-manager', 'digest'],
      }),
  });
}

export function useSendDraft(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => sendDraft(leagueId, draftId),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftQueryKey(leagueId) }),
  });
}

export function useScheduleDraft(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => updateDraft(leagueId, draftId, { status: 'scheduled' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftQueryKey(leagueId) }),
  });
}

export function useCancelDraft(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => updateDraft(leagueId, draftId, { status: 'cancelled' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftQueryKey(leagueId) }),
  });
}

export function useDismissDraft(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => updateDraft(leagueId, draftId, { status: 'dismissed' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftQueryKey(leagueId) }),
  });
}

export function useDeleteDraft(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => deleteDraftService(leagueId, draftId),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftQueryKey(leagueId) }),
  });
}

export function useEditDraft(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, content }: { draftId: string; content: string }) =>
      updateDraft(leagueId, draftId, { content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftQueryKey(leagueId) }),
  });
}

export function useDismissIntervention(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => updateInterventionStatus(leagueId, ids, 'dismissed'),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [...queryKeys.leagues.all, leagueId, 'ai-manager', 'interventions'],
      }),
  });
}

export function useGenerateDraftFromIntervention(leagueId: string) {
  const invalidateAll = useInvalidateAll(leagueId);
  return useMutation({
    mutationFn: (interventionId: string) =>
      generateDraftFromIntervention(leagueId, interventionId),
    onSuccess: invalidateAll,
  });
}
