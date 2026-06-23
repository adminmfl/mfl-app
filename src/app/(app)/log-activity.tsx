import Feather from '@expo/vector-icons/Feather';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/app-text';
import { ScreenState } from '../../components/screen-state';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';
import { useLeagueActivities } from '../../features/leagues/hooks/use-league-activities';
import { WorkoutSubmission } from '../../features/activity-submission/components/workout-submission';
import { RestDaySubmission } from '../../features/activity-submission/components/rest-day-submission';
import { AutoRestInfoCard, AutoRestInfoIcon } from '../../features/activity-submission/components/auto-rest-info-card';
import { mflColors } from '../../constants/colors';
import { mmkv, SEEN_AUTO_REST_INFO_KEY } from '../../core/storage/mmkv';
import type { ResubmitParams } from '../../features/activity-submission/types';

export default function LogActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    type?: string;
    resubmit?: string;
    date?: string;
    workout_type?: string;
    duration?: string;
    distance?: string;
    steps?: string;
    holes?: string;
    notes?: string;
  }>();

  const { activeLeague } = useLeagueContext();
  useRole(); // validates we're in a RoleProvider
  const leagueId = activeLeague?.leagueId ?? '';

  const { data: activities, isLoading: activitiesLoading } = useLeagueActivities(leagueId || null);

  // Determine if rest days are available for this league
  const showRestDays = (activeLeague?.restDays ?? 0) > 0;

  // Check league status
  const isLeagueEnded = activeLeague?.status === 'completed';
  const isChallengesOnly = activeLeague?.leagueMode === 'challenges';
  const noTeamAssigned = activeLeague != null && !activeLeague.teamId;

  // Grace period: league end date has passed but status not yet 'completed'
  const isInGracePeriod = useMemo(() => {
    if (!activeLeague?.endDate || isLeagueEnded) return false;
    const endStr = String(activeLeague.endDate).slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);
    return todayStr > endStr;
  }, [activeLeague?.endDate, isLeagueEnded]);

  // Resubmit params from navigation
  const resubmitParams = useMemo<ResubmitParams | null>(() => {
    if (!params.resubmit) return null;
    return {
      resubmitId: params.resubmit,
      date: params.date,
      type: params.type as 'workout' | 'rest' | undefined,
      workoutType: params.workout_type,
      duration: params.duration,
      distance: params.distance,
      steps: params.steps,
      holes: params.holes,
      notes: params.notes,
    };
  }, [params]);

  // Tab state: workout or rest
  const [tab, setTab] = useState<'workout' | 'rest'>(() => {
    if (resubmitParams?.type === 'rest') return 'rest';
    if (params.type === 'rest') return 'rest';
    return 'workout';
  });

  // Auto-rest info card — shown once, dismissible, icon always visible
  const [showAutoRestCard, setShowAutoRestCard] = useState(
    () => !mmkv.getBoolean(SEEN_AUTO_REST_INFO_KEY),
  );

  const handleDismissAutoRestCard = useCallback(() => {
    mmkv.set(SEEN_AUTO_REST_INFO_KEY, true);
    setShowAutoRestCard(false);
  }, []);

  const handleReopenAutoRestCard = useCallback(() => {
    setShowAutoRestCard(true);
  }, []);

  const handleSuccess = () => router.back();

  // Guards
  if (!activeLeague) {
    return (
      <ScreenState
        screen="log-activity"
        state="empty"
        message="Join a league first to log activities."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (isLeagueEnded) {
    return (
      <ScreenState
        screen="log-activity"
        state="empty"
        message="This league has ended. Submissions are closed."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (isChallengesOnly) {
    return (
      <ScreenState
        screen="log-activity"
        state="empty"
        message="This league uses challenges only. Activity submissions are not accepted."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (activitiesLoading) {
    return <ScreenState screen="log-activity" state="loading" />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top }}
        contentContainerClassName="px-5 gap-4 pb-10"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center pt-2 pb-1">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="w-8 h-8 justify-center items-center rounded-full"
          >
            <Feather name="arrow-left" size={20} color={mflColors.textMuted} />
          </Pressable>
          <AppText className="flex-1 text-xl font-bold text-foreground text-center">
            Log Activity
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        {/* Grace Period Banner */}
        {isInGracePeriod && (
          <View className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-200">
            <AppText className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              League Completed — Congrats!
            </AppText>
            <AppText className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              You may still submit activities during the grace period.
            </AppText>
          </View>
        )}

        {/* Team Assignment Warning */}
        {noTeamAssigned && (
          <View className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 gap-1">
            <AppText className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Waiting for Team Assignment
            </AppText>
            <AppText className="text-sm text-amber-700 dark:text-amber-400">
              Please contact your host to be assigned to a team before submitting activities.
            </AppText>
          </View>
        )}

        {/* Activity / Rest Tabs */}
        {showRestDays && !resubmitParams && (
          <View className="flex-row bg-default-100 rounded-xl p-1">
            <Pressable
              onPress={() => setTab('workout')}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                tab === 'workout' ? 'bg-card shadow-sm' : ''
              }`}
            >
              <AppText
                className={`text-sm font-semibold ${
                  tab === 'workout' ? 'text-foreground' : 'text-muted'
                }`}
              >
                Activity
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => setTab('rest')}
              className={`flex-1 py-2.5 rounded-lg items-center flex-row justify-center gap-1 ${
                tab === 'rest' ? 'bg-card shadow-sm' : ''
              }`}
            >
              <AppText
                className={`text-sm font-semibold ${
                  tab === 'rest' ? 'text-foreground' : 'text-muted'
                }`}
              >
                Rest Day
              </AppText>
              <AutoRestInfoIcon onPress={handleReopenAutoRestCard} />
            </Pressable>
          </View>
        )}

        {/* Auto-rest day info card (one-time, dismissible) */}
        {showRestDays && !resubmitParams && tab === 'rest' && (
          <AutoRestInfoCard
            showCard={showAutoRestCard}
            onDismiss={handleDismissAutoRestCard}
          />
        )}

        {/* Content */}
        {tab === 'workout' && !activitiesLoading && (!activities || activities.length === 0) ? (
          <View className="bg-card rounded-xl border border-separator p-6 items-center gap-2">
            <AppText className="text-base font-semibold text-foreground">No Activities</AppText>
            <AppText className="text-sm text-muted text-center">
              This league does not have any activities configured yet.
            </AppText>
          </View>
        ) : tab === 'workout' ? (
          <WorkoutSubmission
            leagueId={leagueId}
            league={activeLeague}
            activities={activities ?? []}
            resubmitParams={resubmitParams}
            onSuccess={handleSuccess}
          />
        ) : (
          <RestDaySubmission
            leagueId={leagueId}
            league={activeLeague}
            onSuccess={handleSuccess}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
