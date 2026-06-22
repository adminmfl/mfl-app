import { api } from '../../../core/api';
import type {
  ChallengesResponseDTO,
  ChallengeSubmissionsResponseDTO,
  ChallengeLeaderboardResponseDTO,
  CreateChallengeResponseDTO,
  MutateChallengeResponseDTO,
  SubmitChallengeProofResponseDTO,
  UploadChallengeProofResponseDTO,
  ChallengeTypeDTO,
  ChallengeStatusDTO,
} from '../types/challenge.dto';
import type {
  ChallengeSubTeamDetails,
  ChallengeTeamMember,
  TournamentMatch,
  TournamentMatchInput,
  TournamentScore,
  TournamentMatchStatus, 
} from '../types/challenge.model';

export async function fetchChallenges(leagueId: string): Promise<ChallengesResponseDTO> {
  const res = await api.get<ChallengesResponseDTO>(`/api/leagues/${leagueId}/challenges`);
  return res.data;
}

export interface ChallengeMutationInput {
  name: string;
  description?: string | null;
  challengeType: ChallengeTypeDTO;
  totalPoints: number;
  docUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  templateId?: string | null;
  isCustom?: boolean;
  isUniqueWorkout?: boolean;
  status?: ChallengeStatusDTO;
}

interface TournamentMatchRow {
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

export async function createChallenge(
  leagueId: string,
  data: ChallengeMutationInput,
): Promise<CreateChallengeResponseDTO> {
  const res = await api.post<CreateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges`,
    data,
  );
  return res.data;
}

export async function updateChallenge(
  leagueId: string,
  challengeId: string,
  data: Partial<ChallengeMutationInput>,
): Promise<MutateChallengeResponseDTO> {
  const res = await api.patch<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}`,
    data,
  );
  return res.data;
}

export async function deleteChallenge(
  leagueId: string,
  challengeId: string,
): Promise<MutateChallengeResponseDTO> {
  const res = await api.delete<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}`,
  );
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

export async function validateChallengeSubmission(
  submissionId: string,
  data: { status: 'approved' | 'rejected'; awardedPoints?: number | null },
): Promise<MutateChallengeResponseDTO> {
  const res = await api.post<MutateChallengeResponseDTO>(
    `/api/challenge-submissions/${submissionId}/validate`,
    data,
  );
  return res.data;
}

export async function assignChallengeTeamScore(
  leagueId: string,
  challengeId: string,
  data: { teamId: string; score: number },
): Promise<MutateChallengeResponseDTO> {
  const res = await api.post<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/team-score`,
    data,
  );
  return res.data;
}

export async function publishChallenge(
  leagueId: string,
  challengeId: string,
): Promise<MutateChallengeResponseDTO> {
  const res = await api.post<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/publish`,
  );
  return res.data;
}

export async function uploadChallengeDocument(
  leagueId: string,
  file: { uri: string; name: string; type: string },
): Promise<string> {
  const formData = new FormData();
  formData.append('league_id', leagueId);
  // TODO: RN FormData accepts { uri, name, type } but TS types don't reflect this
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const res = await api.post<{ success: boolean; data?: { url?: string }; error?: string }>(
    '/api/upload/challenge-document',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  const url = res.data.data?.url;
  if (!url) throw new Error(res.data.error || 'Document upload failed.');
  return url;
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
  const res = await api.get<{ success: boolean; data?: Array<{ subteam_id: string; name: string }> }>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/subteams`,
    { params: { teamId } },
  );
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
  }>(`/api/leagues/${leagueId}/challenges/${challengeId}/subteams`, {
    params: { teamId },
  });

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
    data?: Array<{
      league_member_id: string;
      user_id: string;
      username?: string;
    }>;
  }>(`/api/leagues/${leagueId}/teams/${teamId}/members`);

  return (res.data.data ?? []).map((member) => ({
    leagueMemberId: member.league_member_id,
    userId: member.user_id,
    fullName: member.username ?? 'Unknown',
  }));
}

export async function createChallengeSubTeam(
  leagueId: string,
  challengeId: string,
  data: { teamId: string; name: string; memberIds: string[] },
): Promise<MutateChallengeResponseDTO> {
  const res = await api.post<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/subteams`,
    data,
  );
  return res.data;
}

export async function updateChallengeSubTeam(
  leagueId: string,
  challengeId: string,
  subTeamId: string,
  data: { name: string; memberIds: string[] },
): Promise<MutateChallengeResponseDTO> {
  const res = await api.put<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/subteams/${subTeamId}`,
    data,
  );
  return res.data;
}

export async function deleteChallengeSubTeam(
  leagueId: string,
  challengeId: string,
  subTeamId: string,
): Promise<MutateChallengeResponseDTO> {
  const res = await api.delete<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/subteams/${subTeamId}`,
  );
  return res.data;
}

function toTournamentMatch(row: TournamentMatchRow): TournamentMatch {
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

function toTournamentPayload(input: TournamentMatchInput) {
  return {
    round_number: input.roundNumber,
    round_name: input.roundName.trim() || null,
    team1_id: input.team1Id || null,
    team2_id: input.team2Id || null,
    start_time: input.startTime || null,
    status: input.status,
    score1: input.score1,
    score2: input.score2,
  };
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

export async function createTournamentMatch(
  leagueId: string,
  challengeId: string,
  input: TournamentMatchInput,
): Promise<MutateChallengeResponseDTO> {
  const res = await api.post<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/tournament-matches`,
    toTournamentPayload(input),
  );
  return res.data;
}

export async function updateTournamentMatch(
  leagueId: string,
  challengeId: string,
  matchId: string,
  input: TournamentMatchInput,
): Promise<MutateChallengeResponseDTO> {
  const res = await api.patch<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/tournament-matches/${matchId}`,
    toTournamentPayload(input),
  );
  return res.data;
}

export async function deleteTournamentMatch(
  leagueId: string,
  challengeId: string,
  matchId: string,
): Promise<MutateChallengeResponseDTO> {
  const res = await api.delete<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/tournament-matches/${matchId}`,
  );
  return res.data;
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

export async function finalizeTournamentScores(
  leagueId: string,
  challengeId: string,
  scores: TournamentScore[],
): Promise<MutateChallengeResponseDTO> {
  const res = await api.post<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/finalize`,
    {
      scores: scores.map((score) => ({
        teamId: score.teamId,
        points: score.score,
      })),
    },
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

export async function submitChallengeProof(
  leagueId: string,
  challengeId: string,
  data: { proofUrl?: string; workoutEntryId?: string },
): Promise<SubmitChallengeProofResponseDTO> {
  const res = await api.post<SubmitChallengeProofResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/submissions`,
    { proofUrl: data.proofUrl, workoutEntryId: data.workoutEntryId },
  );
  return res.data;
}

export async function uploadChallengeProof(
  file: { uri: string; name: string; type: string },
  leagueId: string,
  challengeId: string,
): Promise<UploadChallengeProofResponseDTO> {
  const formData = new FormData();
  // TODO: RN FormData accepts { uri, name, type } but TS types don't reflect this
  formData.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
  formData.append('league_id', leagueId);
  formData.append('challenge_id', challengeId);
  const res = await api.post<UploadChallengeProofResponseDTO>(
    '/api/upload/challenge-proof',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data;
}
