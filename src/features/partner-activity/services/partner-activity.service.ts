import { api } from '../../../core/api';
import type { PartnerActivityResponseDTO } from '../types/partner-activity.dto';

export async function fetchPartnerActivity(
  leagueId: string,
  teamId?: string,
): Promise<PartnerActivityResponseDTO> {
  const params = new URLSearchParams({ limit: '50' });
  if (teamId && teamId !== 'all') {
    params.set('team_id', teamId);
  }
  const res = await api.get<PartnerActivityResponseDTO>(
    `/api/leagues/${leagueId}/partner-activity?${params.toString()}`,
  );
  return res.data;
}
