import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenState } from '../../../components/screen-state';
import { useLeagueContext } from '../../../contexts/league-context';
import { TeamMessagingScreen } from '../../../features/messaging';

export default function TeamChatRoute() {
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();

  if (!activeLeague) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ScreenState
          screen="team-chat"
          state="empty"
          message="Select a league to view team chat."
        />
      </View>
    );
  }

  return <TeamMessagingScreen league={activeLeague} />;
}
