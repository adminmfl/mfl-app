// Removed React import
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { WeightLogScreen } from '../../../features/challenges/components/weight-log-screen';
import { useLeagueContext } from '../../../contexts/league-context';
import { ScreenState } from '../../../components/screen-state';

export default function WeightLogRoute() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  if (!leagueId) {
    return (
      <ScreenScrollView>
        <Stack.Screen options={{ title: 'Log Weight' }} />
        <ScreenState screen="weight-log" state="empty" message="Select a league first" />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <Stack.Screen options={{ title: 'Log Weight' }} />
      <WeightLogScreen leagueId={leagueId} challengeId={challengeId ?? ''} />
    </ScreenScrollView>
  );
}
