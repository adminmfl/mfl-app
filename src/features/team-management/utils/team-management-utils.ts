import type {
  ManagedLeagueMember,
  ManagedTeam,
  ManagedTeamMember,
} from '../types/team-management';

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  return (name || 'TM').substring(0, 2).toUpperCase();
}

export function formatRole(role: string): string {
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function visibleRoles(roles: string[]): string[] {
  return roles.filter((role) => role !== 'player');
}

export function getPerTeamCapacity(data: {
  leagueCapacity?: number;
  maxTeams?: number;
}) {
  if (!data.leagueCapacity || !data.maxTeams) return 20;
  return Math.ceil(data.leagueCapacity / data.maxTeams);
}

export function getTeamMembersFromAllocated(
  team: ManagedTeam,
  members: ManagedLeagueMember[],
): ManagedTeamMember[] {
  return members
    .filter((member) => member.team_id === team.team_id)
    .map((member) => ({
      league_member_id: member.league_member_id,
      user_id: member.user_id,
      team_id: member.team_id,
      league_id: member.league_id,
      username: member.username,
      email: member.email,
      is_captain: team.captain?.user_id === member.user_id,
      roles: member.roles || [],
      points: member.points,
    }));
}

export function searchMembers<T extends { username: string; email: string }>(
  members: T[],
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return members;
  return members.filter(
    (member) =>
      member.username.toLowerCase().includes(normalized) ||
      member.email.toLowerCase().includes(normalized),
  );
}
