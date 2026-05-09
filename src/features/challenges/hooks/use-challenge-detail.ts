import { useCallback } from 'react';
import { useChallenges } from './use-challenges';
import { useChallengeSubmissions } from './use-challenge-submissions';
import { useChallengeLeaderboard } from './use-challenge-leaderboard';
import { useTournamentMatches } from './use-configure-challenges';

export function useChallengeDetail(leagueId: string, challengeId: string) {
  const { data: challenges } = useChallenges(leagueId);
  const challenge = challenges?.find((c) => c.challengeId === challengeId) ?? null;

  const isTournament = challenge?.challengeType === 'tournament';

  const submissions = useChallengeSubmissions(
    leagueId,
    isTournament ? '' : challengeId,
  );

  const leaderboard = useChallengeLeaderboard(
    leagueId,
    isTournament ? '' : challengeId,
  );

  const matches = useTournamentMatches(
    leagueId,
    isTournament ? challengeId : '',
  );

  const refetchAll = useCallback(async () => {
    const promises: Promise<any>[] = [];
    if (isTournament) {
      promises.push(matches.refetch());
    } else {
      promises.push(submissions.refetch(), leaderboard.refetch());
    }
    await Promise.all(promises);
  }, [isTournament, matches, submissions, leaderboard]);

  return {
    challenge,
    isTournament,
    submissions,
    leaderboard,
    matches,
    refetchAll,
  };
}
