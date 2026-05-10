import { api } from '../../../core/api';
import type {
  DigestItemDTO,
  DraftDTO,
  InterventionDTO,
  AiScanResponseDTO,
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
  body: { type: string; targetScope: string; contextData: Record<string, any> },
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
