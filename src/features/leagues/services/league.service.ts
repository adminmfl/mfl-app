import { api } from '../../../core/api';
import type { UserLeaguesResponseDTO, LeagueDetailDTO } from '../types/league.dto';

export async function fetchUserLeagues(): Promise<UserLeaguesResponseDTO> {
  const res = await api.get<UserLeaguesResponseDTO>('/api/user/leagues');
  return res.data;
}

export async function fetchLeagueDetail(leagueId: string): Promise<LeagueDetailDTO> {
  const res = await api.get<LeagueDetailDTO>(`/api/leagues/${leagueId}`);
  return res.data;
}
