import { api } from '../../../core/api';
import type { AtRiskPlayerDTO, MilestoneDraftDTO } from '../types/captain-engagement.dto';

export async function fetchAtRiskPlayers(
  leagueId: string,
): Promise<AtRiskPlayerDTO[]> {
  const res = await api.get<AtRiskPlayerDTO[]>(
    `/api/captain/at-risk?leagueId=${leagueId}`,
  );
  return res.data;
}

export async function fetchMilestoneDrafts(
  leagueId: string,
): Promise<MilestoneDraftDTO[]> {
  const res = await api.get<MilestoneDraftDTO[]>(
    `/api/captain/milestone-drafts?leagueId=${leagueId}`,
  );
  return res.data;
}

export async function editMilestoneDraft(
  draftId: string,
  content: string,
): Promise<{ success: boolean }> {
  const res = await api.patch<{ success: boolean }>(
    `/api/captain/milestone-drafts/${draftId}`,
    { content },
  );
  return res.data;
}

export async function sendMilestoneDraft(
  draftId: string,
): Promise<{ success: boolean }> {
  const res = await api.post<{ success: boolean }>(
    `/api/captain/milestone-drafts/${draftId}/send`,
  );
  return res.data;
}
