import { api } from '../../../core/api';
import type { LeagueMembersResponseDTO, TeamsResponseDTO, TeamMembersResponseDTO, TeamSummaryResponseDTO } from '../types/team.dto';

export async function fetchLeagueMembers(leagueId: string): Promise<LeagueMembersResponseDTO> {
  const res = await api.get<LeagueMembersResponseDTO>(`/api/leagues/${leagueId}/members`);
  return res.data;
}

export async function fetchTeams(leagueId: string): Promise<TeamsResponseDTO> {
  const res = await api.get<TeamsResponseDTO>(`/api/leagues/${leagueId}/teams`);
  return res.data;
}

export async function fetchTeamMembers(
  leagueId: string,
  teamId: string,
): Promise<TeamMembersResponseDTO> {
  const res = await api.get<TeamMembersResponseDTO>(
    `/api/leagues/${leagueId}/teams/${teamId}/members`,
  );
  return res.data;
}

export async function fetchTeamSummary(
  leagueId: string,
): Promise<TeamSummaryResponseDTO> {
  const res = await api.get<TeamSummaryResponseDTO>(
    `/api/leagues/${leagueId}/my-team/summary`,
  );
  return res.data;
}

export async function assignMemberToTeam(
  leagueId: string,
  teamId: string,
  leagueMemberId: string,
): Promise<{ success: boolean; message?: string }> {
  const res = await api.post(`/api/leagues/${leagueId}/teams/${teamId}/members`, {
    league_member_id: leagueMemberId,
  });
  return res.data;
}
