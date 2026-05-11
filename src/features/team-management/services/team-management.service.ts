import { api } from '../../../core/api';
import type {
  ManagedTeamMember,
  PickedTeamLogo,
  TeamManagementResponseDTO,
  TeamMembersResponseDTO,
} from '../types/team-management';

export async function fetchTeamManagementData(
  leagueId: string,
): Promise<TeamManagementResponseDTO> {
  const res = await api.get<TeamManagementResponseDTO>(
    `/api/leagues/${leagueId}/teams`,
  );
  return res.data;
}

export async function fetchManagedTeamMembers(
  leagueId: string,
  teamId: string,
): Promise<ManagedTeamMember[]> {
  const res = await api.get<TeamMembersResponseDTO>(
    `/api/leagues/${leagueId}/teams/${teamId}/members`,
  );
  return res.data.data || [];
}

export async function createManagedTeam(leagueId: string, teamName: string) {
  const res = await api.post(`/api/leagues/${leagueId}/teams`, {
    team_name: teamName,
  });
  return res.data;
}

export async function updateManagedTeamName(
  leagueId: string,
  teamId: string,
  teamName: string,
) {
  const res = await api.patch(`/api/leagues/${leagueId}/teams/${teamId}`, {
    team_name: teamName,
  });
  return res.data;
}

export async function deleteManagedTeam(leagueId: string, teamId: string) {
  const res = await api.delete(`/api/leagues/${leagueId}/teams/${teamId}`);
  return res.data;
}

export async function addManagedMemberToTeam(
  leagueId: string,
  teamId: string,
  leagueMemberId: string,
) {
  const res = await api.post(`/api/leagues/${leagueId}/teams/${teamId}/members`, {
    league_member_id: leagueMemberId,
  });
  return res.data;
}

export async function unassignManagedMemberFromTeam(
  leagueId: string,
  teamId: string,
  leagueMemberId: string,
) {
  const res = await api.delete(`/api/leagues/${leagueId}/teams/${teamId}/members`, {
    data: { league_member_id: leagueMemberId },
  });
  return res.data;
}

export async function moveManagedMember(
  leagueId: string,
  leagueMemberId: string,
  teamId: string,
) {
  const res = await api.patch(`/api/leagues/${leagueId}/members`, {
    memberId: leagueMemberId,
    teamId,
  });
  return res.data;
}

export async function removeManagedMemberFromLeague(
  leagueId: string,
  leagueMemberId: string,
) {
  const res = await api.delete(`/api/leagues/${leagueId}/members`, {
    params: { memberId: leagueMemberId },
  });
  return res.data;
}

export async function assignManagedCaptain(
  leagueId: string,
  teamId: string,
  userId: string,
) {
  const res = await api.post(`/api/leagues/${leagueId}/teams/${teamId}/captain`, {
    user_id: userId,
  });
  return res.data;
}

export async function removeManagedCaptain(leagueId: string, teamId: string) {
  const res = await api.delete(`/api/leagues/${leagueId}/teams/${teamId}/captain`);
  return res.data;
}

export async function assignManagedViceCaptain(
  leagueId: string,
  teamId: string,
  userId: string,
) {
  const res = await api.post(
    `/api/leagues/${leagueId}/teams/${teamId}/vice-captain`,
    { user_id: userId },
  );
  return res.data;
}

export async function removeManagedViceCaptain(
  leagueId: string,
  teamId: string,
  userId: string,
) {
  const res = await api.delete(
    `/api/leagues/${leagueId}/teams/${teamId}/vice-captain`,
    { data: { user_id: userId } },
  );
  return res.data;
}

export async function assignManagedGovernor(leagueId: string, userId: string) {
  const res = await api.post(`/api/leagues/${leagueId}/governor`, {
    user_id: userId,
  });
  return res.data;
}

export async function removeManagedGovernor(leagueId: string, userId: string) {
  const res = await api.delete(`/api/leagues/${leagueId}/governor`, {
    data: { user_id: userId },
  });
  return res.data;
}

export async function uploadManagedTeamLogo(
  leagueId: string,
  teamId: string,
  file: PickedTeamLogo,
) {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const res = await api.post(
    `/api/leagues/${leagueId}/teams/${teamId}/logo`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data;
}

export async function removeManagedTeamLogo(leagueId: string, teamId: string) {
  const res = await api.delete(`/api/leagues/${leagueId}/teams/${teamId}/logo`);
  return res.data;
}
