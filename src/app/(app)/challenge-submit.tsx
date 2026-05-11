import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScreenState } from '../../components/screen-state';
import { useLeagueContext } from '../../contexts/league-context';
import { useChallenges } from '../../features/challenges/hooks/use-challenges';
import { ChallengeSubmitForm } from '../../features/challenges/components/challenge-submit-form';

export default function ChallengeSubmitScreen() {
  const router = useRouter();
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const { data: challenges } = useChallenges(leagueId);
  const challenge = useMemo(
    () => challenges?.find((c) => c.challengeId === challengeId) ?? null,
    [challenges, challengeId],
  );

  if (!activeLeague) {
    return (
      <ScreenState
        screen="challenge-submit"
        state="empty"
        message="Join a league first."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (!challenge) {
    return <ScreenState screen="challenge-submit" state="loading" />;
  }

  return <ChallengeSubmitForm challenge={challenge} leagueId={leagueId} />;
}
