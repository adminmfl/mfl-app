import { useState } from 'react';
import { View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { useLeagueContext } from '../../../contexts/league-context';
import { usePartnerActivity } from '../hooks/use-partner-activity';
import { ActivityRow } from './activity-row';
import { TeamFilter } from './team-filter';

export function PartnerActivityScreen() {
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';
  const [selectedTeam, setSelectedTeam] = useState('all');

  const { data, isLoading, error, refetch } = usePartnerActivity(
    leagueId,
    selectedTeam === 'all' ? undefined : selectedTeam,
  );

  if (isLoading && !data) {
    return <ScreenState state="loading" message="Loading partner activity..." />;
  }

  if (error) {
    const msg =
      (error as any)?.response?.status === 403
        ? 'Cross-team visibility is not enabled for this league.'
        : 'Failed to load partner activity.';
    return (
      <ScreenState
        state="error"
        message={msg}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const activities = data?.activities ?? [];
  const teams = data?.teams ?? [];

  return (
    <ScreenScrollView onRefresh={refetch}>
      <View className="gap-4">
        <View className="gap-1">
          <AppText className="text-xl font-semibold">Partner Team Activity</AppText>
          <AppText className="text-sm text-muted">
            See what other teams have been up to in the last 7 days.
          </AppText>
        </View>

        <TeamFilter
          teams={teams}
          selectedTeamId={selectedTeam}
          onSelect={setSelectedTeam}
        />

        {activities.length === 0 ? (
          <ScreenState
            state="empty"
            message="No partner team activity in the last 7 days."
          />
        ) : (
          <Card>
            <Card.Header>
              <View className="gap-1">
                <AppText className="text-base font-semibold">
                  Recent Activity ({activities.length})
                </AppText>
                <AppText className="text-xs text-muted">
                  Approved entries from other teams - last 7 days
                </AppText>
              </View>
            </Card.Header>
            <Card.Body className="px-4 pb-2">
              {activities.map((a, i) => (
                <ActivityRow
                  key={`${a.date}-${a.playerName}-${i}`}
                  activity={a}
                />
              ))}
            </Card.Body>
          </Card>
        )}
      </View>
    </ScreenScrollView>
  );
}
