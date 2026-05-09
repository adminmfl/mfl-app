import { api } from '../../../core/api';
import type { GovernorListResponseDTO } from '../types/governor.dto';

export async function fetchGovernors(
  leagueId: string,
): Promise<GovernorListResponseDTO> {
  const res = await api.get<GovernorListResponseDTO>(
    `/api/leagues/${leagueId}/governor`,
  );
  return res.data;
}

export async function requestHostDigest(
  leagueId: string,
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>(
    `/api/leagues/${leagueId}/host-digest`,
  );
  return res.data;
}

export async function generateLeagueReport(
  leagueId: string,
): Promise<{ message: string; reportUrl?: string }> {
  const res = await api.post<{ message: string; reportUrl?: string }>(
    `/api/leagues/${leagueId}/report`,
  );
  return res.data;
}
