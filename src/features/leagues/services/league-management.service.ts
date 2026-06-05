import { api } from '../../../core/api';
import type {
  CreateLeagueRequestDTO,
  CreateLeagueResponseDTO,
  JoinLeagueResponseDTO,
  TeamInviteJoinResponseDTO,
  UpdateLeagueRequestDTO,
  UpdateLeagueResponseDTO,
  LeagueRulesDTO,
} from '../types/league-management.dto';
import type { PickedRulesDocument } from '../types/league-management.model';

export async function createLeague(
  data: CreateLeagueRequestDTO,
): Promise<CreateLeagueResponseDTO> {
  const res = await api.post<CreateLeagueResponseDTO>('/api/leagues', data);
  return res.data;
}

export async function joinByCode(code: string): Promise<JoinLeagueResponseDTO> {
  const res = await api.post<JoinLeagueResponseDTO>('/api/leagues/join-by-code', { code });
  return res.data;
}

export async function joinByTeamInvite(code: string): Promise<TeamInviteJoinResponseDTO> {
  const res = await api.post<TeamInviteJoinResponseDTO>(
    `/api/invite/team/${encodeURIComponent(code)}`,
  );
  return res.data;
}

export async function updateLeague(
  leagueId: string,
  data: UpdateLeagueRequestDTO,
): Promise<UpdateLeagueResponseDTO> {
  const res = await api.patch<UpdateLeagueResponseDTO>(
    `/api/leagues/${leagueId}`,
    data,
  );
  return res.data;
}

export async function fetchLeagueRules(leagueId: string): Promise<LeagueRulesDTO> {
  const res = await api.get<LeagueRulesDTO>(`/api/leagues/${leagueId}/rules`);
  return res.data;
}

export async function updateLeagueRules(
  leagueId: string,
  rulesSummary: string,
  file?: PickedRulesDocument | null,
): Promise<LeagueRulesDTO> {
  const formData = new FormData();
  formData.append('rules_summary', rulesSummary);
  if (file) {
    formData.append('file', file as any);
  }
  const res = await api.post<LeagueRulesDTO>(
    `/api/leagues/${leagueId}/rules`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  if (!res.data.success) {
    throw new Error('Failed to save rules');
  }
  return res.data;
}

export async function deleteRulesDocument(
  leagueId: string,
): Promise<void> {
  const res = await api.delete<{ success: boolean }>(
    `/api/leagues/${leagueId}/rules`,
  );
  if (!res.data.success) {
    throw new Error('Failed to delete document');
  }
}

export async function launchLeague(leagueId: string): Promise<void> {
  await api.post(`/api/leagues/${leagueId}/launch`);
}

export async function deleteLeague(leagueId: string): Promise<void> {
  await api.delete(`/api/leagues/${leagueId}`);
}
