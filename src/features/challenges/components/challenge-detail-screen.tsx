import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Tabs } from 'heroui-native';

import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { useLeagueContext } from '../../../contexts/league-context';
import { useChallengeDetail } from '../hooks/use-challenge-detail';
import { ChallengeDetailHeader } from './challenge-detail-header';
import { ChallengeDetailInfoCard } from './challenge-detail-info-card';
import { ChallengeSubmissionsList } from './challenge-submissions-list';
import { ChallengeLeaderboardList } from './challenge-leaderboard-list';
import { ChallengeFixturesList } from './challenge-fixtures-list';
import { ChallengeStandingsTable } from './challenge-standings-table';
import { ChallengeActionBar } from './challenge-action-bar';

const STANDARD_TABS = ['Submissions', 'Leaderboard'] as const;
const TOURNAMENT_TABS = ['Fixtures', 'Standings'] as const;

type StandardTab = (typeof STANDARD_TABS)[number];
type TournamentTab = (typeof TOURNAMENT_TABS)[number];
type Tab = StandardTab | TournamentTab;

export function ChallengeDetailScreen() {
  const router = useRouter();
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const {
    challenge,
    isTournament,
    submissions,
    leaderboard,
    matches,
    refetchAll,
  } = useChallengeDetail(leagueId, challengeId ?? '');

  const [activeTab, setActiveTab] = useState<Tab>(
    isTournament ? 'Fixtures' : 'Submissions',
  );

  const tabs = isTournament ? TOURNAMENT_TABS : STANDARD_TABS;

  if (!activeLeague) {
    return (
      <ScreenScrollView>
        <ScreenState screen="challenge-detail" state="empty" message="Select a league first" />
      </ScreenScrollView>
    );
  }

  const handleSubmitProof = () => {
    if (!challenge) return;
    router.push({
      pathname: '/(app)/challenge-submit' as any,
      params: { challengeId: challenge.challengeId },
    });
  };

  return (
    <ScreenScrollView onRefresh={refetchAll}>
      <View className="gap-6 py-4">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <ChallengeDetailHeader
            challenge={challenge}
            onBack={() => router.back()}
          />
        </Animated.View>

        {/* Info Card */}
        {challenge && (
          <Animated.View entering={FadeInDown.duration(300).delay(80)}>
            <ChallengeDetailInfoCard challenge={challenge} />
          </Animated.View>
        )}

        {/* Tabs */}
        <Animated.View entering={FadeInDown.duration(300).delay(120)}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
            <Tabs.List>
              {tabs.map((tab) => (
                <Tabs.Trigger key={tab} value={tab}>
                  <Tabs.Label>{tab}</Tabs.Label>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        </Animated.View>

        {/* Tab Content */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          {isTournament ? (
            activeTab === 'Fixtures' ? (
              <ChallengeFixturesList
                matches={matches.data}
                isLoading={matches.isLoading}
                isError={matches.isError}
                onRetry={() => matches.refetch()}
              />
            ) : (
              <ChallengeStandingsTable
                matches={matches.data}
                isLoading={matches.isLoading}
                isError={matches.isError}
                onRetry={() => matches.refetch()}
              />
            )
          ) : activeTab === 'Submissions' ? (
            <ChallengeSubmissionsList
              submissions={submissions.data}
              isLoading={submissions.isLoading}
              isError={submissions.isError}
              onRetry={() => submissions.refetch()}
            />
          ) : (
            <ChallengeLeaderboardList
              leaderboard={leaderboard.data}
              isLoading={leaderboard.isLoading}
              isError={leaderboard.isError}
              onRetry={() => leaderboard.refetch()}
            />
          )}
        </Animated.View>

        {/* Action Bar */}
        {challenge && (
          <Animated.View entering={FadeInDown.duration(300).delay(280)}>
            <ChallengeActionBar
              challenge={challenge}
              onSubmitProof={handleSubmitProof}
            />
          </Animated.View>
        )}
      </View>
    </ScreenScrollView>
  );
}
