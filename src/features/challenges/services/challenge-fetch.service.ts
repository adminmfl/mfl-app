import { api } from '../../../core/api';
import type {
  ChallengesResponseDTO,
  ChallengeSubmissionsResponseDTO,
  ChallengeLeaderboardResponseDTO,
  WeightLogPlayerResponseDTO,
  WeightLogHostResponseDTO,
} from '../types/challenge.dto';
import type {
  ChallengeSubTeamDetails,
  ChallengeTeamMember,
  TournamentMatch,
  TournamentMatchStatus,
  TournamentScore,
} from '../types/challenge.model';

// ---------------------------------------------------------------------------
// Internal row shape from the tournament matches API
// ---------------------------------------------------------------------------

export interface TournamentMatchRow {
  match_id: string;
  league_challenge_id: string;
  round_number?: number | string | null;
  round_name?: string | null;
  group_id?: string | null;
  team1_id?: string | null;
  team2_id?: string | null;
  team1?: { team_name?: string } | null;
  team2?: { team_name?: string } | null;
  team1_name?: string | null;
  team2_name?: string | null;
  score1?: number | null;
  score2?: number | null;
  winner_id?: string | null;
  status?: string | null;
  start_time?: string | null;
  location?: string | null;
}

export function toTournamentMatch(row: TournamentMatchRow): TournamentMatch {
  return {
    matchId: row.match_id,
    leagueChallengeId: row.league_challenge_id,
    roundNumber: Number(row.round_number ?? 1),
    roundName: row.round_name ?? null,
    groupId: row.group_id ?? null,
    team1Id: row.team1_id ?? null,
    team2Id: row.team2_id ?? null,
    team1Name: row.team1?.team_name ?? row.team1_name ?? null,
    team2Name: row.team2?.team_name ?? row.team2_name ?? null,
    score1: Number(row.score1 ?? 0),
    score2: Number(row.score2 ?? 0),
    winnerId: row.winner_id ?? null,
    status: (row.status ?? 'scheduled') as TournamentMatchStatus,
    startTime: row.start_time ?? null,
    location: row.location ?? null,
  };
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

export async function fetchChallenges(leagueId: string): Promise<ChallengesResponseDTO> {
  const res = await api.get<ChallengesResponseDTO>(`/api/leagues/${leagueId}/challenges`);
  return res.data;
}

export async function fetchChallengeSubmissions(
  leagueId: string,
  challengeId: string,
  filters?: { teamId?: string; subTeamId?: string },
): Promise<ChallengeSubmissionsResponseDTO> {
  const res = await api.get<ChallengeSubmissionsResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/submissions`,
    { params: filters },
  );
  return res.data;
}

export async function fetchChallengeLeaderboard(
  leagueId: string,
  challengeId: string,
): Promise<ChallengeLeaderboardResponseDTO> {
  const res = await api.get<ChallengeLeaderboardResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/leaderboard`,
  );
  return res.data;
}

export async function fetchChallengeTeams(
  leagueId: string,
): Promise<Array<{ team_id: string; team_name: string; member_count?: number }>> {
  const res = await api.get<{
    success: boolean;
    data?: { teams?: Array<{ team_id: string; team_name: string; member_count?: number }> };
  }>(`/api/leagues/${leagueId}/teams`);
  return res.data.data?.teams ?? [];
}

export async function fetchChallengeSubTeams(
  leagueId: string,
  challengeId: string,
  teamId: string,
): Promise<Array<{ subteam_id: string; name: string }>> {
  const res = await api.get<{
    success: boolean;
    data?: Array<{ subteam_id: string; name: string }>;
  }>(`/api/leagues/${leagueId}/challenges/${challengeId}/subteams`, { params: { teamId } });
  return res.data.data ?? [];
}

export async function fetchChallengeSubTeamDetails(
  leagueId: string,
  challengeId: string,
  teamId: string,
): Promise<ChallengeSubTeamDetails[]> {
  const res = await api.get<{
    success: boolean;
    data?: Array<{
      subteam_id: string;
      name: string;
      team_id: string;
      challenge_subteam_members?: Array<{
        league_member_id: string;
        leaguemembers?: {
          user_id?: string;
          users?: { username?: string } | null;
        } | null;
      }>;
    }>;
  }>(`/api/leagues/${leagueId}/challenges/${challengeId}/subteams`, { params: { teamId } });

  return (res.data.data ?? []).map((row) => ({
    subTeamId: row.subteam_id,
    name: row.name,
    teamId: row.team_id,
    members: (row.challenge_subteam_members ?? []).map((member) => ({
      leagueMemberId: member.league_member_id,
      userId: member.leaguemembers?.user_id ?? '',
      fullName: member.leaguemembers?.users?.username ?? 'Unknown',
    })),
  }));
}

export async function fetchChallengeTeamMembers(
  leagueId: string,
  teamId: string,
): Promise<ChallengeTeamMember[]> {
  const res = await api.get<{
    success: boolean;
    data?: Array<{ league_member_id: string; user_id: string; username?: string }>;
  }>(`/api/leagues/${leagueId}/teams/${teamId}/members`);

  return (res.data.data ?? []).map((member) => ({
    leagueMemberId: member.league_member_id,
    userId: member.user_id,
    fullName: member.username ?? 'Unknown',
  }));
}

export async function fetchTournamentMatches(
  leagueId: string,
  challengeId: string,
): Promise<TournamentMatch[]> {
  const res = await api.get<{ success: boolean; data?: TournamentMatchRow[] }>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/tournament-matches`,
  );
  return (res.data.data ?? []).map(toTournamentMatch);
}

export async function fetchTournamentScores(
  leagueId: string,
  challengeId: string,
): Promise<TournamentScore[]> {
  const res = await api.get<{ scores?: Array<{ team_id: string; score: number }> }>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/scores`,
  );
  return (res.data.scores ?? []).map((score) => ({
    teamId: score.team_id,
    score: Number(score.score ?? 0),
  }));
}

export async function fetchWeightLossLogPlayer(
  leagueId: string,
  challengeId: string,
): Promise<WeightLogPlayerResponseDTO> {
  const res = await api.get<WeightLogPlayerResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/weight-log`,
  );
  return res.data;
}

export async function fetchWeightLossLogHost(
  leagueId: string,
  challengeId: string,
): Promise<WeightLogHostResponseDTO> {
  const res = await api.get<WeightLogHostResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/weight-log`,
    { params: { view: 'host' } } // TODO(weight-loss-api): confirm if 'view=host' is the right way to request host data
  );
  return res.data;
}
