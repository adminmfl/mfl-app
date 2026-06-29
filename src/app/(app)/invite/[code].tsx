import { useCallback, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Button, Card, Chip } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { DarkHeaderCard } from '../../../components/dark-header-card';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { AppRoutes } from '../../../core/config/routes';
import { extractApiError } from '../../../core/utils/extract-api-error';
import { useValidateInvite } from '../../../features/invites/hooks/use-validate-invite';
import { useJoinByInvite } from '../../../features/invites/hooks/use-join-by-invite';
import {
  formatInviteDate,
  inviteStatusChipStyle,
} from '../../../features/invites/utils/invite-display';

// ---------------------------------------------------------------------------
// Helpers — formatInviteDate and inviteStatusChipStyle moved to
//           src/features/invites/utils/invite-display.ts
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function InviteCodeScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();

  const {
    data: invite,
    isLoading,
    isError,
  } = useValidateInvite(code ?? '');

  const joinMutation = useJoinByInvite();

  const [successInfo, setSuccessInfo] = useState<{
    leagueId: string;
    leagueName: string;
    alreadyMember: boolean;
  } | null>(null);

  const handleJoin = useCallback(() => {
    if (!code) return;

    joinMutation.mutate(code, {
      onSuccess: (result) => {
        setSuccessInfo({
          leagueId: result.leagueId,
          leagueName: result.leagueName,
          alreadyMember: result.alreadyMember,
        });
        // Navigate to dashboard after short delay (matches web 2s redirect)
        setTimeout(() => {
          router.replace(AppRoutes.dashboard);
        }, 2000);
      },
    });
  }, [code, joinMutation, router]);

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <ScreenScrollView>
        <ScreenState screen="invite" state="loading" message="Validating invite code..." />
      </ScreenScrollView>
    );
  }

  // ---------- Error / Invalid ----------
  if (isError || !invite) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="invite"
          state="error"
          message="Invalid invite code"
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
          screen="invite"
          state="error"
          message="This invite code is no longer valid"
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </ScreenScrollView>
    );
  }

  const league = invite.league;
  const sc = inviteStatusChipStyle(league.status);

  // ---------- Success state (matches web joined screen) ----------
  if (successInfo) {
    return (
      <ScreenScrollView>
        <View className="gap-6 py-4">
          <Animated.View entering={FadeInDown.duration(300)}>
            <DarkHeaderCard
              title={successInfo.alreadyMember ? 'Welcome Back!' : "You're In!"}
              subtitle={
                successInfo.alreadyMember
                  ? "You're already part of the team"
                  : 'Successfully joined the league'
              }
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(300).delay(80)}>
            <Card className="shadow-none border border-separator">
              <View className="items-center py-4 gap-3">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: mflColors.brandLight }}
                >
                  <Feather name="check-circle" size={28} color={mflColors.brand} />
                </View>
                <AppText className="text-xl font-bold text-foreground text-center">
                  {league.name}
                </AppText>
                <AppText className="text-sm text-muted text-center">
                  {successInfo.alreadyMember
                    ? 'Taking you back to your league...'
                    : 'Get ready to compete, stay fit, and win together!'}
                </AppText>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(300).delay(160)}>
            <View className="flex-row items-center justify-center gap-2 py-3">
              <AppText className="text-sm text-muted">Redirecting to dashboard...</AppText>
            </View>
          </Animated.View>
        </View>
      </ScreenScrollView>
    );
  }

  // ---------- League is full ----------
  if (league.isFull) {
    return (
      <ScreenScrollView>
        <View className="gap-6 py-4">
          <Animated.View entering={FadeInDown.duration(300)}>
            <DarkHeaderCard title={league.name} subtitle="League Invite" />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(300).delay(80)}>
            <Card className="shadow-none border border-separator">
              <View className="items-center py-4 gap-3">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: mflColors.amberLight }}
                >
                  <AppText style={{ fontSize: 28, color: mflColors.amber }}>!</AppText>
                </View>
                <AppText className="text-base font-semibold text-foreground text-center">
                  League at Capacity
                </AppText>
                <AppText className="text-sm text-muted text-center">
                  This league has reached its maximum capacity of {league.maxCapacity} members
                  and cannot accept new members at this time.
                </AppText>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(300).delay(160)}>
            <Button variant="secondary" size="md" onPress={() => router.back()}>
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
        {/* Header - matches web "You're Invited!" */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <DarkHeaderCard title="You're Invited!" subtitle="Join the fitness competition" />
        </Animated.View>

        {/* League Info Card */}
        <Animated.View entering={FadeInDown.duration(300).delay(80)}>
          <Card className="shadow-none border border-separator">
            <View className="gap-4">
              {/* League name + status */}
              <View className="flex-row items-center justify-between gap-2">
                <AppText className="text-xl font-bold text-foreground flex-1" numberOfLines={2}>
                  {league.name}
                </AppText>
                <Chip size="sm" variant="soft" style={{ backgroundColor: sc.bgColor }}>
                  <Chip.Label style={{ color: sc.color }}>
                    {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
                  </Chip.Label>
                </Chip>
              </View>

              {/* Description */}
              {league.description ? (
                <AppText className="text-sm text-default-500">{league.description}</AppText>
              ) : null}

              {/* Details */}
              <View className="gap-2">
                <SectionLabel label="Details" />

                <View className="flex-row justify-between items-center py-1">
                  <AppText className="text-sm text-muted">Members</AppText>
                  <AppText className="text-sm font-semibold text-foreground">
                    {league.memberCount}/{league.maxCapacity ?? '-'}
                  </AppText>
                </View>

                <View className="flex-row justify-between items-center py-1">
                  <AppText className="text-sm text-muted">Starts</AppText>
                  <AppText className="text-sm font-semibold text-foreground">
                    {formatInviteDate(league.startDate)}
                  </AppText>
                </View>

                <View className="flex-row justify-between items-center py-1">
                  <AppText className="text-sm text-muted">Ends</AppText>
                  <AppText className="text-sm font-semibold text-foreground">
                    {formatInviteDate(league.endDate)}
                  </AppText>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Join error - matches web inline error + join-league.tsx pattern */}
        {joinMutation.isError && (
          <Animated.View entering={FadeInDown.duration(200)}>
            <View className="bg-danger-50 p-3 rounded-lg">
              <AppText className="text-sm" style={{ color: mflColors.danger }}>
                {extractApiError(
                  joinMutation.error,
                  'Failed to join the league. Please try again.',
                )}
              </AppText>
            </View>
          </Animated.View>
        )}

        {/* Join Button */}
        <Animated.View entering={FadeInDown.duration(300).delay(160)}>
          {league.canJoin ? (
            <Button
              variant="primary"
              size="lg"
              onPress={handleJoin}
              isDisabled={joinMutation.isPending}
              style={{
                backgroundColor: joinMutation.isPending
                  ? mflColors.textMuted
                  : mflColors.brand,
              }}
            >
              <Button.Label>
                {joinMutation.isPending ? 'Joining...' : 'Join League'}
              </Button.Label>
            </Button>
          ) : (
            <View className="gap-3">
              <Card className="shadow-none border border-separator">
                <View className="items-center py-3">
                  <AppText className="text-sm text-muted text-center">
                    You cannot join this league at this time.
                  </AppText>
                </View>
              </Card>
              <Button variant="secondary" size="md" onPress={() => router.back()}>
                <Button.Label>Go Back</Button.Label>
              </Button>
            </View>
          )}
        </Animated.View>
      </View>
    </ScreenScrollView>
  );
}
