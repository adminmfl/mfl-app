import { api } from '../../../core/api';
import type {
  ChallengeScoresResponseDTO,
  ChallengesResponseDTO,
  LeaderboardResponseDTO,
  SpecialChallengesResponseDTO,
  TeamsMetadataResponseDTO,
} from '../types/leaderboard.dto';

export async function fetchLeaderboard(
  leagueId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    tzOffsetMinutes?: number;
    ianaTimezone?: string;
    points_type?: 'all' | 'activity' | 'challenge';
  },
): Promise<LeaderboardResponseDTO> {
  const res = await api.get<LeaderboardResponseDTO>(
    `/api/leagues/${leagueId}/leaderboard`,
    { params },
  );
  return res.data;
}

export async function fetchLeaderboardTeamMetadata(
  leagueId: string,
): Promise<TeamsMetadataResponseDTO> {
  const res = await api.get<TeamsMetadataResponseDTO>(
    `/api/leagues/${leagueId}/teams`,
  );
  return res.data;
}

export async function fetchLeaderboardChallenges(
  leagueId: string,
): Promise<ChallengesResponseDTO> {
  const res = await api.get<ChallengesResponseDTO>(
    `/api/leagues/${leagueId}/challenges`,
  );
  return res.data;
}

export async function fetchSpecialChallengeSummaries(
  leagueId: string,
): Promise<SpecialChallengesResponseDTO> {
  const res = await api.get<SpecialChallengesResponseDTO>(
    `/api/leagues/${leagueId}/special-challenge-scores`,
  );
  return res.data;
}

export async function fetchChallengeScores(
  leagueId: string,
  challengeId: string,
): Promise<ChallengeScoresResponseDTO> {
  const url = challengeId.startsWith('sc_')
    ? `/api/leagues/${leagueId}/special-challenge-scores/${challengeId.replace(
        'sc_',
        '',
      )}`
    : `/api/leagues/${leagueId}/challenges/${challengeId}/leaderboard`;
  const res = await api.get<ChallengeScoresResponseDTO>(url);
  return res.data;
}
