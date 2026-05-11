import { api } from '../../../core/api';
import type { EngagementResponseDTO } from '../types/engagement.dto';

export async function fetchEngagement(
  leagueId: string,
): Promise<EngagementResponseDTO> {
  const res = await api.get<EngagementResponseDTO>(
    `/api/leagues/${leagueId}/engagement`,
  );
  return res.data;
}
