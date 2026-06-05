import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  runAiScan,
  updateDigestStatus,
  updateDraft,
  createDraft,
  sendDraft,
  deleteDraft as deleteDraftService,
  createCannedMessage,
  deleteCannedMessage,
  deployChallengeTemplate,
  updateInterventionStatus,
  generateDraftFromIntervention,
} from '../services/ai-manager.service';
import { draftQueryKey } from './use-drafts';
import { cannedMessagesQueryKey } from './use-canned-messages';
import {
  aiManagerChallengesQueryKey,
  challengeTemplatesQueryKey,
} from './use-challenge-templates';

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

export function useCreateDraftFromTemplate(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      createDraft(leagueId, {
        type: 'announcement',
        targetScope: 'league',
        contextData: { precast: true, title, content },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftQueryKey(leagueId) }),
  });
}

export function useCreateCannedMessage(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; content: string; roleTarget?: string }) =>
      createCannedMessage(leagueId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: cannedMessagesQueryKey(leagueId) }),
  });
}

export function useDeleteCannedMessage(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cannedMessageId: string) => deleteCannedMessage(leagueId, cannedMessageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: cannedMessagesQueryKey(leagueId) }),
  });
}

export function useDeployChallengeTemplate(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { templateId: string; startDate: string; customName?: string }) =>
      deployChallengeTemplate(leagueId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiManagerChallengesQueryKey(leagueId) });
      qc.invalidateQueries({ queryKey: challengeTemplatesQueryKey(leagueId) });
      qc.invalidateQueries({ queryKey: queryKeys.leagues.challenges(leagueId) });
    },
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
