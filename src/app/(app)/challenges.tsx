import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Tabs } from 'heroui-native';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { ScreenState } from '../../components/screen-state';
import { useLeagueContext } from '../../contexts/league-context';
import { useChallenges } from '../../features/challenges/hooks/use-challenges';
import { ChallengeListCard } from '../../features/challenges/components/challenge-list-card';
import { ChallengesHeader } from '../../features/challenges/components/challenges-header';
import type { Challenge } from '../../features/challenges/types/challenge.model';

const TABS_LIST = ['Active', 'Completed'] as const;
type Tab = (typeof TABS_LIST)[number];

export default function ChallengesScreen() {
  const router = useRouter();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const [activeTab, setActiveTab] = useState<Tab>('Active');

  const { data: challenges, isLoading, isError, refetch } = useChallenges(leagueId);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Filter out drafts (web parity) then split by tab
  const visibleChallenges = useMemo(() => {
    if (!challenges) return [];
    return challenges.filter((c) => c.status !== 'draft');
  }, [challenges]);

  const filtered = useMemo(() => {
    if (activeTab === 'Active') {
      return visibleChallenges.filter((c) =>
        ['active', 'scheduled'].includes(c.status),
      );
    }
    return visibleChallenges.filter((c) =>
      ['published', 'closed', 'submission_closed'].includes(c.status),
    );
  }, [visibleChallenges, activeTab]);

  // Header counter: approved submissions across ALL visible challenges
  const approvedCount = useMemo(
    () => visibleChallenges.filter((c) => c.mySubmission?.status === 'approved').length,
    [visibleChallenges],
  );

  const handleCardPress = useCallback(
    (challenge: Challenge) => {
      router.push(`/(app)/challenges/${challenge.challengeId}` as any);
    },
    [router],
  );

  const handleSubmitProof = useCallback(
    (challenge: Challenge) => {
      router.push({
        pathname: '/(app)/challenge-submit' as any,
        params: { challengeId: challenge.challengeId },
      });
    },
    [router],
  );

  if (!activeLeague) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="challenges"
          state="empty"
          message="Select a league from the Activity tab"
        />
      </ScreenScrollView>
    );
  }

  if (isLoading) {
    return (
      <ScreenScrollView>
        <ScreenState screen="challenges" state="loading" />
      </ScreenScrollView>
    );
  }

  if (isError || !challenges) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="challenges"
          state="error"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="gap-8 py-4">
        <ChallengesHeader
          approvedCount={approvedCount}
          totalCount={visibleChallenges.length}
          isLoading={isLoading}
        />

        <Animated.View entering={FadeInDown.duration(300).delay(80)}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
            <Tabs.List>
              {TABS_LIST.map((tab) => (
                <Tabs.Trigger key={tab} value={tab}>
                  <Tabs.Label>{tab}</Tabs.Label>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(160)}>
          {filtered.length === 0 ? (
            <ScreenState
              screen="challenges"
              state="empty"
              message={
                activeTab === 'Active'
                  ? 'No active challenges right now'
                  : 'No completed challenges yet'
              }
            />
          ) : (
            <View>
              {filtered.map((challenge) => (
                <ChallengeListCard
                  key={challenge.challengeId}
                  challenge={challenge}
                  onPress={() => handleCardPress(challenge)}
                  onSubmitProof={() => handleSubmitProof(challenge)}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </ScreenScrollView>
  );
}
