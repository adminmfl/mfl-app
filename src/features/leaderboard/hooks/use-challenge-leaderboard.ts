import { useQuery } from '@tanstack/react-query';
import {
  fetchChallengeScores,
  fetchLeaderboardChallenges,
  fetchSpecialChallengeSummaries,
} from '../services/leaderboard.service';
import type {
  ChallengeScoreDTO,
  ChallengeSummaryDTO,
} from '../types/leaderboard.dto';

export interface ChallengeOption extends ChallengeSummaryDTO {
  isSpecial?: boolean;
}

const VISIBLE_CHALLENGE_STATUSES = new Set([
  'active',
  'submission_closed',
  'published',
  'closed',
]);

function toTime(date?: string | null) {
  if (!date) return 0;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

export function useLeaderboardChallengeOptions(leagueId: string) {
  return useQuery<ChallengeOption[]>({
    queryKey: ['leaderboard-challenges', leagueId],
    queryFn: async () => {
      const [challengeResponse, specialResponse] = await Promise.all([
        fetchLeaderboardChallenges(leagueId),
        fetchSpecialChallengeSummaries(leagueId).catch(() => ({
          success: true,
          data: [],
        })),
      ]);

      if (!challengeResponse.success) {
        throw new Error(
          challengeResponse.error || 'Failed to fetch challenges',
        );
      }

      const visible = (challengeResponse.data.active ?? []).filter(
        (challenge) =>
          !challenge.status || VISIBLE_CHALLENGE_STATUSES.has(challenge.status),
      );

      const existingTemplateIds = new Set(
        visible.map((challenge) => challenge.template_id).filter(Boolean),
      );

      const specialOnly: ChallengeOption[] = (specialResponse.data ?? [])
        .filter((challenge) => !existingTemplateIds.has(challenge.challenge_id))
        .map((challenge) => ({
          id: `sc_${challenge.challenge_id}`,
          name: challenge.name,
          challenge_type: 'team',
          total_points: 0,
          status: 'closed',
          isSpecial: true,
        }));

      return [...visible, ...specialOnly].sort(
        (a, b) =>
          toTime(b.end_date || b.start_date) -
          toTime(a.end_date || a.start_date),
      );
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}

export function useLeaderboardChallengeScores(
  leagueId: string,
  challengeId: string,
) {
  return useQuery<ChallengeScoreDTO[]>({
    queryKey: ['leaderboard-challenge-scores', leagueId, challengeId],
    queryFn: async () => {
      const response = await fetchChallengeScores(leagueId, challengeId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch challenge scores');
      }
      return response.data ?? [];
    },
    enabled: !!leagueId && !!challengeId,
    staleTime: 60 * 1000,
  });
}
