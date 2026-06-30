import { api } from '../../../core/api';
import type {
  CreateChallengeResponseDTO,
  MutateChallengeResponseDTO,
  SubmitChallengeProofResponseDTO,
  ChallengeTypeDTO,
  ChallengeStatusDTO,
} from '../types/challenge.dto';
import type { TournamentMatchInput, TournamentScore } from '../types/challenge.model';

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Challenge CRUD
// ---------------------------------------------------------------------------

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

export async function publishChallenge(
  leagueId: string,
  challengeId: string,
): Promise<MutateChallengeResponseDTO> {
  const res = await api.post<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/publish`,
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// Submission validation
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Team score
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-team management
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Tournament matches
// ---------------------------------------------------------------------------

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

export async function finalizeTournamentScores(
  leagueId: string,
  challengeId: string,
  scores: TournamentScore[],
): Promise<MutateChallengeResponseDTO> {
  const res = await api.post<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/finalize`,
    { scores: scores.map((s) => ({ teamId: s.teamId, points: s.score })) },
  );
  return res.data;
}

export async function submitWeightLog(
  leagueId: string,
  challengeId: string,
  data: { logType: 'start' | 'progress' | 'end'; weight: number },
): Promise<MutateChallengeResponseDTO> {
  const res = await api.post<MutateChallengeResponseDTO>(
    `/api/leagues/${leagueId}/challenges/${challengeId}/weight-log`,
    {
      log_type: data.logType,
      weight: data.weight,
    } // TODO(weight-loss-api): confirm against live endpoint for request body structure
  );
  return res.data;
}
