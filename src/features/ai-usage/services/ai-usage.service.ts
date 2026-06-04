import { api } from '../../../core/api';
import type { AiUsageResponseDTO } from '../types/ai-usage.dto';

export async function fetchAiUsage(
  leagueId: string,
  days: number = 30,
): Promise<AiUsageResponseDTO> {
  const res = await api.get<AiUsageResponseDTO>(
    `/api/leagues/${leagueId}/ai-usage?days=${days}`,
  );
  return res.data;
}
