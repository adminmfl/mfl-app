import { api } from '../../../core/api';
import type {
  DigestItemDTO,
  DraftDTO,
  InterventionDTO,
  AiScanResponseDTO,
  CannedMessageDTO,
  CannedMessagesResponseDTO,
  ChallengeDeployResponseDTO,
  ChallengeTemplateDTO,
  AiManagerChallengeDTO,
} from '../types/ai-manager.dto';

// ─── Digest ─────────────────────────────────────────────────────────────────

export async function fetchDigestItems(leagueId: string): Promise<DigestItemDTO[]> {
  const res = await api.get<DigestItemDTO[]>(`/api/leagues/${leagueId}/host-digest`);
  return res.data;
}

export async function updateDigestStatus(
  leagueId: string,
  itemIds: string[],
  status: string,
): Promise<void> {
  await api.patch(`/api/leagues/${leagueId}/host-digest`, { itemIds, status });
}

// ─── AI Scan ────────────────────────────────────────────────────────────────

export async function runAiScan(leagueId: string): Promise<AiScanResponseDTO> {
  const res = await api.post<AiScanResponseDTO>(`/api/leagues/${leagueId}/ai-scan`);
  return res.data;
}

// ─── Drafts ─────────────────────────────────────────────────────────────────

export async function fetchDrafts(leagueId: string): Promise<DraftDTO[]> {
  const res = await api.get<DraftDTO[]>(`/api/leagues/${leagueId}/drafts`);
  return res.data;
}

export async function createDraft(
  leagueId: string,
  body: { type: string; targetScope: string; contextData: Record<string, unknown> },
): Promise<DraftDTO> {
  const res = await api.post<DraftDTO>(`/api/leagues/${leagueId}/drafts`, body);
  return res.data;
}

export async function updateDraft(
  leagueId: string,
  draftId: string,
  body: { content?: string; status?: string },
): Promise<DraftDTO> {
  const res = await api.patch<DraftDTO>(`/api/leagues/${leagueId}/drafts/${draftId}`, body);
  return res.data;
}

export async function sendDraft(leagueId: string, draftId: string): Promise<{ success: boolean }> {
  const res = await api.post<{ success: boolean }>(
    `/api/leagues/${leagueId}/drafts/${draftId}/send`,
  );
  return res.data;
}

export async function deleteDraft(leagueId: string, draftId: string): Promise<void> {
  await api.delete(`/api/leagues/${leagueId}/drafts/${draftId}`);
}

// --- Canned Messages / Precast Library -------------------------------------

export async function fetchCannedMessages(leagueId: string): Promise<CannedMessageDTO[]> {
  const res = await api.get<CannedMessagesResponseDTO | CannedMessageDTO[]>(
    `/api/leagues/${leagueId}/canned-messages`,
  );
  return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
}

export async function createCannedMessage(
  leagueId: string,
  body: { title: string; content: string; roleTarget?: string },
): Promise<CannedMessageDTO> {
  const res = await api.post<{ success: boolean; data: CannedMessageDTO }>(
    `/api/leagues/${leagueId}/canned-messages`,
    {
      title: body.title,
      content: body.content,
      role_target: body.roleTarget,
    },
  );
  return res.data.data;
}

export async function deleteCannedMessage(
  leagueId: string,
  cannedMessageId: string,
): Promise<void> {
  await api.delete(`/api/leagues/${leagueId}/canned-messages`, {
    data: { canned_message_id: cannedMessageId },
  });
}

// --- Challenge Templates ----------------------------------------------------

export async function fetchChallengeTemplates(
  leagueId: string,
): Promise<ChallengeTemplateDTO[]> {
  const res = await api.get<ChallengeTemplateDTO[]>(
    `/api/leagues/${leagueId}/challenge-templates`,
  );
  return res.data;
}

export async function fetchAiManagerChallenges(
  leagueId: string,
): Promise<AiManagerChallengeDTO[]> {
  const res = await api.get<{
    success?: boolean;
    data?: { active?: AiManagerChallengeDTO[] };
  }>(`/api/leagues/${leagueId}/challenges`);
  return res.data.data?.active ?? [];
}

export async function deployChallengeTemplate(
  leagueId: string,
  body: { templateId: string; startDate: string; customName?: string },
): Promise<ChallengeDeployResponseDTO> {
  const res = await api.post<ChallengeDeployResponseDTO>(
    `/api/leagues/${leagueId}/challenge-deploy`,
    body,
  );
  return res.data;
}

// ─── Interventions ──────────────────────────────────────────────────────────

export async function fetchInterventions(leagueId: string): Promise<InterventionDTO[]> {
  const res = await api.get<InterventionDTO[]>(`/api/leagues/${leagueId}/interventions`);
  return res.data;
}

export async function updateInterventionStatus(
  leagueId: string,
  interventionIds: string[],
  status: string,
): Promise<void> {
  await api.patch(`/api/leagues/${leagueId}/interventions`, { interventionIds, status });
}

export async function generateDraftFromIntervention(
  leagueId: string,
  interventionId: string,
): Promise<DraftDTO> {
  const res = await api.post<DraftDTO>(
    `/api/leagues/${leagueId}/interventions/${interventionId}/draft`,
  );
  return res.data;
}
