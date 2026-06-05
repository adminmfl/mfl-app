import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { ScreenState } from '../../components/screen-state';
import { SectionLabel } from '../../components/section-label';
import { useLeagueContext } from '../../contexts/league-context';
import { useUserLeagues } from '../../features/leagues';
import {
  LeagueUnreadMessages,
  NotificationCard,
  useSubmissionNotifications,
} from '../../features/notifications';

export default function NotificationsScreen() {
  const { activeLeague } = useLeagueContext();
  const {
    data: leagues,
    isLoading: leaguesLoading,
    refetch: refetchLeagues,
  } = useUserLeagues();

  const activeLeagueId = activeLeague?.leagueId ?? '';
  const activeLeagueName = activeLeague?.name ?? '';
  const submissionNotifications = useSubmissionNotifications(
    activeLeagueId,
    activeLeagueName,
  );

  const allNotifications = useMemo(
    () =>
      [...submissionNotifications].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [submissionNotifications],
  );

  const handleRefresh = useCallback(async () => {
    await refetchLeagues();
  }, [refetchLeagues]);

  const hasUnreadLeagues = leagues && leagues.length > 0;
  const hasNotifications = allNotifications.length > 0 || hasUnreadLeagues;

  if (leaguesLoading) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="notifications"
          state="loading"
          message="Loading notifications..."
        />
      </ScreenScrollView>
    );
  }

  if (!hasNotifications) {
    return (
      <ScreenScrollView onRefresh={handleRefresh}>
        <View className="py-4">
          <DarkHeaderCard title="Notifications" subtitle="Stay up to date" />
        </View>
        <ScreenState
          screen="notifications"
          state="empty"
          message="No notifications yet"
        />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="py-4 gap-5">
        <DarkHeaderCard title="Notifications" subtitle="Stay up to date" />

        {leagues && leagues.length > 0 && (
          <View>
            <SectionLabel
              label="Unread Messages"
              style={{ marginBottom: 12 }}
            />
            {leagues.map((league) => (
              <LeagueUnreadMessages
                key={league.leagueId}
                leagueId={league.leagueId}
                leagueName={league.name}
              />
            ))}
          </View>
        )}

        {allNotifications.length > 0 && (
          <View>
            <SectionLabel
              label="Recent Activity"
              style={{ marginBottom: 12 }}
            />
            {allNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}
