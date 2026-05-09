import { useRouter } from 'expo-router';

import { ScreenState } from '../../components/screen-state';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';
import { CustomActivitiesScreen } from '../../features/custom-activities/components/custom-activities-screen';

export default function CustomActivitiesRoute() {
  const router = useRouter();
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor } = useRole();

  if (!activeLeague) {
    return (
      <ScreenState
        screen="custom-activities"
        state="empty"
        message="Select a league first."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (!isHost && !isGovernor) {
    return (
      <ScreenState
        screen="custom-activities"
        state="error"
        message="Only the league host or governor can manage custom activities."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  return (
    <CustomActivitiesScreen
      leagueName={activeLeague.name}
      onBack={() => router.back()}
    />
  );
}
