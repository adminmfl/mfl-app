import { useCallback } from 'react';
import { View, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import { useMyTeamView } from '../hooks/use-my-team-view';
import { mflColors } from '../../../constants/colors';
import { TeamViewHeader } from './team-view-header';
import { TeamViewStats } from './team-view-stats';
import { TeamViewRoster } from './team-view-roster';

export function MyTeamViewScreen() {
  const { activeLeague } = useLeagueContext();
  const { activeRole, isPlayer, isCaptain, isViceCaptain } = useRole();
  const router = useRouter();

  const leagueId = activeLeague?.leagueId ?? '';
  const teamId = activeLeague?.teamId ?? null;
  const teamName = activeLeague?.teamName ?? null;
  const teamLogoUrl = activeLeague?.teamLogoUrl ?? null;
  const teamCapacity = activeLeague
    ? Math.floor(
        activeLeague.leagueCapacity / Math.max(activeLeague.numTeams, 1),
      )
    : 0;

  const rrFormula =
    (activeLeague?.rrConfig as Record<string, any>)?.formula ?? 'standard';
  const showRR = rrFormula === 'standard';
  const showRestDays = (activeLeague?.restDays ?? 1) > 0;

  const canViewTeam = isPlayer || isCaptain || isViceCaptain;

  const {
    data: viewData,
    isLoading,
    isError,
    refetch,
  } = useMyTeamView(leagueId, teamId, teamCapacity, teamLogoUrl);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Access check — only players/captains/VCs can see their team view
  if (!canViewTeam) {
    return (
      <ScreenScrollView>
        <View className="flex-1 justify-center items-center p-8">
          <Feather name="alert-circle" size={32} color={mflColors.danger} />
          <AppText className="text-base font-semibold text-foreground mt-4">
            Access Restricted
          </AppText>
          <AppText className="text-sm text-muted text-center mt-1">
            You are currently viewing as {activeRole}. To view your team, you
            need to be participating as a player in this league.
          </AppText>
        </View>
      </ScreenScrollView>
    );
  }

  // Not assigned to a team
  if (!teamId || !teamName) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="my-team"
          state="empty"
          message="You haven't been assigned to a team yet. Please wait for the host or governor to assign you."
        />
      </ScreenScrollView>
    );
  }

  // No league selected
  if (!activeLeague) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="my-team"
          state="empty"
          message="Select a league to view your team"
        />
      </ScreenScrollView>
    );
  }

  if (isLoading) {
    return (
      <ScreenScrollView>
        <ScreenState screen="my-team" state="loading" />
      </ScreenScrollView>
    );
  }

  if (isError) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="my-team"
          state="error"
          message="Failed to load team data"
          actionLabel="Retry"
          onAction={handleRefresh}
        />
      </ScreenScrollView>
    );
  }

  const members = viewData?.members ?? [];
  const stats = viewData?.stats;
  const captain = members.find((m) => m.isCaptain);

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="py-4 gap-4">
        {/* Header */}
        <TeamViewHeader
          teamName={teamName}
          teamLogoUrl={stats?.teamLogoUrl ?? teamLogoUrl}
          captainName={captain?.username ?? null}
          memberCount={members.length}
        />

        {/* Team Chat Button */}
        <Pressable
          className="flex-row items-center justify-center gap-2 rounded-xl py-3"
          style={{ backgroundColor: mflColors.brand }}
          onPress={() => router.push('/(app)/(tabs)/team-chat')}
        >
          <Feather name="message-circle" size={16} color={mflColors.white} />
          <AppText
            className="text-sm font-semibold"
            style={{ color: mflColors.white }}
          >
            Team Chat
          </AppText>
        </Pressable>

        {/* Stats Grid */}
        {stats && (
          <TeamViewStats
            stats={stats}
            memberCount={members.length}
            showRR={showRR}
            showRestDays={showRestDays}
          />
        )}

        {/* Roster */}
        <TeamViewRoster
          members={members}
          showRR={showRR}
          showRestDays={showRestDays}
        />
      </View>
    </ScreenScrollView>
  );
}
