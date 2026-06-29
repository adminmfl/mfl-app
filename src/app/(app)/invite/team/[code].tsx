import { useCallback } from 'react';
import { View, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Card, Chip } from 'heroui-native';
import { AppText } from '../../../../components/app-text';
import { ScreenScrollView } from '../../../../components/screen-scroll-view';
import { ScreenState } from '../../../../components/screen-state';
import { DarkHeaderCard } from '../../../../components/dark-header-card';
import { SectionLabel } from '../../../../components/section-label';
import { mflColors } from '../../../../constants/colors';
import { AppRoutes } from '../../../../core/config/routes';
import { useLeagueContext } from '../../../../contexts/league-context';
import { useValidateTeamInvite } from '../../../../features/invites/hooks/use-validate-team-invite';
import { useJoinByTeamInvite } from '../../../../features/invites/hooks/use-join-by-team-invite';
import {
  formatInviteDate,
  inviteStatusChipStyle,
} from '../../../../features/invites/utils/invite-display';
import type { UserLeague } from '../../../../features/leagues/types/league.model';

// ---------------------------------------------------------------------------
// Helpers — formatInviteDate and inviteStatusChipStyle moved to
//           src/features/invites/utils/invite-display.ts
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function TeamInviteCodeScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { setActiveLeague } = useLeagueContext();

  const {
    data: invite,
    isLoading,
    isError,
  } = useValidateTeamInvite(code ?? '');

  const joinMutation = useJoinByTeamInvite();

  const navigateToDashboard = useCallback(() => {
    router.replace(AppRoutes.dashboard);
  }, [router]);

  const handleJoin = useCallback(() => {
    if (!code || !invite) return;

    joinMutation.mutate(code, {
      onSuccess: (result) => {
        // Set the joined league as active (matches web: navigates to league page)
        const leagueForContext: UserLeague = {
          leagueId: result.leagueId,
          name: result.leagueName,
          description: invite.league.description,
          logoUrl: null,
          status: invite.league.status,
          startDate: invite.league.startDate,
          endDate: invite.league.endDate,
          numTeams: 0,
          leagueCapacity: 0,
          isPublic: false,
          isExclusive: false,
          inviteCode: null,
          roles: ['member'],
          teamId: result.teamId,
          teamName: result.teamName,
          teamLogoUrl: null,
          isHost: false,
          creatorName: null,
          branding: null,
          rrConfig: null,
          restDays: 0,
          leagueMode: 'default',
        };
        setActiveLeague(leagueForContext);

        if (result.alreadyMember) {
          Alert.alert('Already a Member', result.message ?? 'You are already a member of this team.', [
            { text: 'Go to Dashboard', onPress: navigateToDashboard },
          ]);
        } else {
          Alert.alert('Joined!', `You have successfully joined team ${result.teamName} in ${result.leagueName}.`, [
            { text: 'Go to Dashboard', onPress: navigateToDashboard },
          ]);
        }
      },
      onError: (error) => {
        Alert.alert('Error', error.message || 'Failed to join the team. Please try again.');
      },
    });
  }, [code, invite, joinMutation, setActiveLeague, navigateToDashboard]);

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <ScreenScrollView>
        <ScreenState screen="team-invite" state="loading" message="Validating team invite code..." />
      </ScreenScrollView>
    );
  }

  // ---------- Error / Invalid ----------
  if (isError || !invite) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="team-invite"
          state="error"
          message="Invalid team invite code"
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </ScreenScrollView>
    );
  }

  if (!invite.valid) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="team-invite"
          state="error"
          message="This team invite code is no longer valid"
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </ScreenScrollView>
    );
  }

  const { team, league } = invite;
  const sc = inviteStatusChipStyle(league.status);

  // ---------- Team is full ----------
  if (team.isFull) {
    return (
      <ScreenScrollView>
        <View className="gap-6 py-4">
          <Animated.View entering={FadeInDown.duration(300)}>
            <DarkHeaderCard title={team.name} subtitle="Team Invite" />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(300).delay(80)}>
            <Card className="shadow-none border border-separator">
              <View className="items-center py-4 gap-3">
                <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: mflColors.amberLight }}>
                  <AppText style={{ fontSize: 28, color: mflColors.amber }}>!</AppText>
                </View>
                <AppText className="text-base font-semibold text-foreground text-center">
                  Team at Capacity
                </AppText>
                <AppText className="text-sm text-muted text-center">
                  This team has reached its maximum capacity of {team.maxCapacity} members and cannot accept new members at this time.
                </AppText>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(300).delay(160)}>
            <Button
              variant="secondary"
              size="md"
              onPress={() => router.back()}
            >
              <Button.Label>Go Back</Button.Label>
            </Button>
          </Animated.View>
        </View>
      </ScreenScrollView>
    );
  }

  // ---------- Valid invite ----------
  return (
    <ScreenScrollView>
      <View className="gap-6 py-4">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <DarkHeaderCard title="Team Invite" subtitle="You have been invited to join a team" />
        </Animated.View>

        {/* Team Info Card */}
        <Animated.View entering={FadeInDown.duration(300).delay(80)}>
          <Card className="shadow-none border border-separator">
            <View className="gap-4">
              <View className="flex-row items-center justify-between gap-2">
                <AppText className="text-xl font-bold text-foreground flex-1" numberOfLines={2}>
                  {team.name}
                </AppText>
              </View>

              <View className="gap-2">
                <SectionLabel label="Team Details" />

                <View className="flex-row justify-between items-center py-1">
                  <AppText className="text-sm text-muted">Members</AppText>
                  <AppText className="text-sm font-semibold text-foreground">
                    {team.memberCount}
                    {team.maxCapacity ? ` / ${team.maxCapacity}` : ''}
                  </AppText>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* League Info Card */}
        <Animated.View entering={FadeInDown.duration(300).delay(120)}>
          <Card className="shadow-none border border-separator">
            <View className="gap-4">
              <View className="flex-row items-center justify-between gap-2">
                <AppText className="text-lg font-bold text-foreground flex-1" numberOfLines={2}>
                  {league.name}
                </AppText>
                <Chip size="sm" variant="soft" style={{ backgroundColor: sc.bgColor }}>
                  <Chip.Label style={{ color: sc.color }}>
                    {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
                  </Chip.Label>
                </Chip>
              </View>

              {league.description ? (
                <AppText className="text-sm text-default-500">
                  {league.description}
                </AppText>
              ) : null}

              <View className="gap-2">
                <SectionLabel label="League Details" />

                <View className="flex-row justify-between items-center py-1">
                  <AppText className="text-sm text-muted">Start Date</AppText>
                  <AppText className="text-sm font-semibold text-foreground">
                    {formatInviteDate(league.startDate)}
                  </AppText>
                </View>

                <View className="flex-row justify-between items-center py-1">
                  <AppText className="text-sm text-muted">End Date</AppText>
                  <AppText className="text-sm font-semibold text-foreground">
                    {formatInviteDate(league.endDate)}
                  </AppText>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Join Button */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          {invite.canJoin ? (
            <Button
              variant="primary"
              size="lg"
              onPress={handleJoin}
              isDisabled={joinMutation.isPending}
              style={{ backgroundColor: joinMutation.isPending ? mflColors.textMuted : mflColors.brand }}
            >
              <Button.Label>
                {joinMutation.isPending ? 'Joining...' : 'Join Team'}
              </Button.Label>
            </Button>
          ) : (
            <View className="gap-3">
              <Card className="shadow-none border border-separator">
                <View className="items-center py-3">
                  <AppText className="text-sm text-muted text-center">
                    You cannot join this team at this time.
                  </AppText>
                </View>
              </Card>
              <Button
                variant="secondary"
                size="md"
                onPress={() => router.back()}
              >
                <Button.Label>Go Back</Button.Label>
              </Button>
            </View>
          )}
        </Animated.View>
      </View>
    </ScreenScrollView>
  );
}
