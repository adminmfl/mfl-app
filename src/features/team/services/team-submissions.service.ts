import { api } from '../../../core/api';
import type { TeamSubmissionsResponseDTO } from '../types/team-submission.dto';

/**
 * GET /api/leagues/{leagueId}/my-team/submissions
 * Returns submissions from the captain's team for validation.
 */
export async function fetchTeamSubmissions(
  leagueId: string,
): Promise<TeamSubmissionsResponseDTO> {
  const res = await api.get<TeamSubmissionsResponseDTO>(
    `/api/leagues/${leagueId}/my-team/submissions`,
  );
  return res.data;
}
