import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import { PointsTypeDropdown } from './points-type-dropdown';
import { PointsTypeFilter, useMobileLeaderboard } from '../hooks/use-mobile-leaderboard';
import {
  LeaderboardFilterBar,
  type LeaderboardTab,
  type WeekSelection,
} from './leaderboard-filter-bar';
import { OverallLeaderboard } from './overall-leaderboard';
import { ChallengeLeaderboardSection } from './challenge-leaderboard-section';
import {
  calculateWeekPresets,
  formatDateRange,
  isPostLeague,
  isValidYmd,
} from '../utils/leaderboard-format';
import {
  useLeagueSponsors,
  getGrandFinaleSponsor,
  SponsorBanner,
} from '../../sponsors';
import { GrandeFinaleCelebration } from './grande-finale-celebration';
import { logLeaderboardViewed } from '../../../lib/analytics';

export function LeaderboardScreen() {
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor, isCaptain, isViceCaptain, isPlayer } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';

  const [activeTab, setActiveTab] = useState<LeaderboardTab>('teams');
  const [selectedWeek, setSelectedWeek] = useState<WeekSelection>('all');
  const [pointsType, setPointsType] = useState<PointsTypeFilter>('all');
  const [dateFilter, setDateFilter] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const leaderboardQuery = useMobileLeaderboard(leagueId, dateFilter, pointsType);
  const { data: sponsorSlots } = useLeagueSponsors(leagueId);
  const grandFinaleSponsor = useMemo(
    () => getGrandFinaleSponsor(sponsorSlots ?? []),
    [sponsorSlots],
  );

  const handleRefresh = useCallback(async () => {
    await leaderboardQuery.refetch();
  }, [leaderboardQuery]);

  // Fire leaderboard_viewed once when the screen comes into focus (not on every refetch)
  const hasLoggedView = useRef(false);
  useFocusEffect(
    useCallback(() => {
      leaderboardQuery.refetch();
      if (!hasLoggedView.current && leagueId) {
        hasLoggedView.current = true;
        logLeaderboardViewed({ league_id: leagueId, tab: activeTab }).catch((error: unknown) => {
          if (__DEV__) console.warn('logLeaderboardViewed failed', error);
        });
      }
    }, [leaderboardQuery, leagueId, activeTab]),
  );

  const data = leaderboardQuery.data;
  const league = data?.league;
  const rrFormula = league?.rr_config?.formula || 'standard';
  const showAvgRR = rrFormula === 'standard';
  const weekPresets = useMemo(() => {
    if (!league?.start_date || !league?.end_date) return [];
    return calculateWeekPresets(league.start_date, league.end_date);
  }, [league?.start_date, league?.end_date]);


  const roleLabel = isHost
    ? 'Host'
    : isGovernor
      ? 'Governor'
      : isCaptain
        ? 'Captain'
        : isViceCaptain
          ? 'Vice Captain'
          : isPlayer
            ? 'Player'
            : 'Member';

  const handleWeekSelect = (week: WeekSelection) => {
    setSelectedWeek(week);
    if (week === 'all') {
      setDateFilter({});
      setCustomStart('');
      setCustomEnd('');
      return;
    }
    if (week === 'custom') {
      if (dateFilter.startDate) setCustomStart(dateFilter.startDate);
      if (dateFilter.endDate) setCustomEnd(dateFilter.endDate);
      return;
    }
    const preset = weekPresets.find((item) => item.weekNumber === week);
    if (preset) {
      setDateFilter({
        startDate: preset.startDate,
        endDate: preset.endDate,
      });
      setCustomStart(preset.startDate);
      setCustomEnd(preset.endDate);
    }
  };

  const handleApplyCustomRange = () => {
    if (!isValidYmd(customStart) || !isValidYmd(customEnd)) {
      Alert.alert('Invalid Date Range', 'Use YYYY-MM-DD for both dates.');
      return;
    }
    if (customStart > customEnd) {
      Alert.alert('Invalid Date Range', 'Start date must be before end date.');
      return;
    }
    setSelectedWeek('custom');
    setDateFilter({ startDate: customStart, endDate: customEnd });
  };

  const handleReset = () => {
    setSelectedWeek('all');
    setDateFilter({});
    setCustomStart('');
    setCustomEnd('');
  };

  if (!activeLeague) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="league-leaderboard"
          state="empty"
          message="Select a league from the Activity tab"
        />
      </ScreenScrollView>
    );
  }

  if (leaderboardQuery.isLoading && !data) {
    return (
      <ScreenScrollView>
        <ScreenState screen="league-leaderboard" state="loading" />
      </ScreenScrollView>
    );
  }

  if (leaderboardQuery.isError || !data) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="league-leaderboard"
          state="error"
          message={leaderboardQuery.error?.message || 'Failed to load leaderboard'}
          actionLabel="Retry"
          onAction={() => leaderboardQuery.refetch()}
        />
      </ScreenScrollView>
    );
  }

  const archived =
    activeLeague.status === 'post_league_archive' ||
    activeLeague.status === 'completed' ||
    isPostLeague(league?.end_date);

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="gap-5 py-4">
        <Animated.View entering={FadeInDown.duration(250)} className="gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <AppText className="mt-1 text-sm text-muted" numberOfLines={1}>
                {league?.league_name || activeLeague.name || 'Rankings'}
              </AppText>
              <AppText className="mt-1 text-xs text-muted">
                {formatDateRange(
                  data.dateRange?.startDate,
                  data.dateRange?.endDate,
                )}
              </AppText>
            </View>
            <View
              className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
              style={{ backgroundColor: mflColors.brandLight }}
            >
              <Feather name="user-check" size={13} color={mflColors.brand} />
              <AppText className="text-xs font-semibold" style={{ color: mflColors.brand }}>
                {roleLabel}
              </AppText>
            </View>
          </View>

          {archived && !isPostLeague(league?.end_date) ? (
            <View className="gap-2">
              <View
                className="flex-row items-start gap-2 rounded-lg p-3"
                style={{ backgroundColor: mflColors.inkLight }}
              >
                <Feather name="lock" size={16} color={mflColors.textSub} />
                <AppText className="flex-1 text-xs text-muted">
                  Archived: this league is in read-only mode.
                </AppText>
              </View>
              <SponsorBanner slot={grandFinaleSponsor} />
            </View>
          ) : null}

          {!showAvgRR && !archived ? (
            <View className="rounded-lg p-3" style={{ backgroundColor: mflColors.surface }}>
              <AppText className="text-xs text-muted">
                This league uses points-only scoring, so RR columns are hidden.
              </AppText>
            </View>
          ) : null}
        </Animated.View>

        {archived && isPostLeague(league?.end_date) && league ? (
          <Animated.View entering={FadeInDown.duration(250).delay(60)}>
            <SponsorBanner slot={grandFinaleSponsor} />
            <GrandeFinaleCelebration
              leagueId={leagueId}
              leagueName={league.league_name}
              leagueEndDate={league.end_date}
              teams={data.teams}
              individuals={data.individuals}
            />
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.duration(250).delay(60)}>
              <LeaderboardFilterBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                selectedWeek={selectedWeek}
                weekPresets={weekPresets}
                onWeekSelect={handleWeekSelect}
                customStart={customStart}
                customEnd={customEnd}
                onCustomStartChange={setCustomStart}
                onCustomEndChange={setCustomEnd}
                onApplyCustomRange={handleApplyCustomRange}
                onReset={handleReset}
                onRefresh={handleRefresh}
                isRefreshing={leaderboardQuery.isFetching}
              />
            </Animated.View>

            {activeTab === 'teams' ? (
              <Animated.View entering={FadeInDown.duration(250).delay(90)}>
                <PointsTypeDropdown value={pointsType} onChange={setPointsType} />
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInDown.duration(250).delay(120)}>
              {activeTab === 'teams' ? (
                <OverallLeaderboard data={data} showAvgRR={showAvgRR} pointsType={pointsType} />
              ) : (
                <ChallengeLeaderboardSection leagueId={leagueId} />
              )}
            </Animated.View>
          </>
        )}
      </View>
    </ScreenScrollView>
  );
}
