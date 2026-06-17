import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from 'heroui-native';

import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { ScreenState } from '../../components/screen-state';
import { mflColors } from '../../constants/colors';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';
import { ManualEntryEditor } from '../../features/manual-entry/components/manual-entry-editor';
import { ManualEntryPicker } from '../../features/manual-entry/components/manual-entry-picker';
import { ManualEntryWeekList } from '../../features/manual-entry/components/manual-entry-week-list';
import { useManualEntryMembers } from '../../features/manual-entry/hooks/use-manual-entry-members';
import { useManualEntryWeek } from '../../features/manual-entry/hooks/use-manual-entry-week';
import { useManualEntryForm } from '../../features/manual-entry/hooks/use-manual-entry-form';
import {
  formatWeekRange,
  getActivityNameMap,
  getWeekRange,
  normalizedTeamName,
} from '../../features/manual-entry/utils/manual-entry-utils';
import { useLeagueActivities } from '../../features/leagues/hooks/use-league-activities';

export default function ManualEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';
  const showRR = (activeLeague?.rrConfig?.formula || 'standard') === 'standard';
  const canUsePage = isHost || isGovernor;

  const membersQuery = useManualEntryMembers(leagueId);
  const activitiesQuery = useLeagueActivities(leagueId);

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  const members = membersQuery.data ?? [];
  const activities = activitiesQuery.data ?? [];

  const teamOptions = useMemo(() => {
    const names = new Set<string>();
    members.forEach((member) => names.add(normalizedTeamName(member.teamName)));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [members]);

  useEffect(() => {
    if (!selectedTeam && members.length > 0) {
      setSelectedTeam('all');
    }
  }, [members.length, selectedTeam]);

  const activityNameMap = useMemo(() => getActivityNameMap(activities), [activities]);

  const week = useManualEntryWeek({
    leagueId,
    memberId: selectedMemberId,
    weekOffset,
    showRR,
  });
  const displayWeekRange = getWeekRange(weekOffset);
  const entryForm = useManualEntryForm({
    leagueId,
    selectedMemberId,
    activities,
    onSaveSuccess: () => { void week.refetch(); },
  });

  const handleSelectTeam = useCallback((team: string) => {
    setSelectedTeam(team);
    setSelectedMemberId('');
    setWeekOffset(0);
    entryForm.handleCancelEdit();
  }, [entryForm.handleCancelEdit]);

  const handleSelectMember = useCallback((memberId: string) => {
    setSelectedMemberId(memberId);
    setWeekOffset(0);
    entryForm.handleCancelEdit();
  }, [entryForm.handleCancelEdit]);

  if (!activeLeague) {
    return (
      <ScreenState
        screen="manual-entry"
        state="empty"
        message="Select a league to log a manual entry."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (!canUsePage) {
    return (
      <ScreenState
        screen="manual-entry"
        state="error"
        message="Only the league host or governor can create or overwrite player workouts."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (membersQuery.isLoading) {
    return <ScreenState screen="manual-entry" state="loading" />;
  }

  if (membersQuery.isError) {
    return (
      <ScreenState
        screen="manual-entry"
        state="error"
        message="Failed to load members for manual entry."
        actionLabel="Retry"
        onAction={() => membersQuery.refetch()}
      />
    );
  }

  return (
    <ScreenScrollView
      avoidKeyboard
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
      }}
      onRefresh={async () => {
        await membersQuery.refetch();
        if (selectedMemberId) await week.refetch();
      }}
    >
      <View className="gap-4 pb-12">
        <View className="flex-row items-center py-1">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="w-10 h-10 justify-center items-center rounded-full"
          >
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>
          <AppText className="flex-1 text-xl font-bold text-foreground text-center">
            Manual Activity Entry
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        <ManualEntryPicker
          members={members}
          teamOptions={teamOptions}
          selectedTeam={selectedTeam}
          selectedMemberId={selectedMemberId}
          weekLabel={formatWeekRange(displayWeekRange.start)}
          canGoNextWeek={weekOffset > 0}
          onSelectTeam={handleSelectTeam}
          onSelectMember={handleSelectMember}
          onPreviousWeek={() => {
            setWeekOffset((current) => current + 1);
            entryForm.handleCancelEdit();
          }}
          onNextWeek={() => {
            setWeekOffset((current) => Math.max(0, current - 1));
            entryForm.handleCancelEdit();
          }}
        />

        <ManualEntryWeekList
          rows={week.data}
          isLoading={week.isLoading}
          hasSelectedMember={!!selectedMemberId}
          activityNameMap={activityNameMap}
          onOpenRow={entryForm.handleOpenRow}
        />

        {entryForm.editRow ? (
          <ManualEntryEditor
            row={entryForm.editRow}
            mode={entryForm.editMode}
            form={entryForm.form}
            activities={activities}
            isLoadingActivities={activitiesQuery.isLoading}
            isActivitiesError={activitiesQuery.isError}
            selectedActivity={entryForm.selectedActivity}
            proofImage={entryForm.proofImage}
            computedRR={entryForm.computedRR}
            showRR={showRR}
            showDuration={entryForm.showDuration}
            showDistance={entryForm.showDistance}
            showSteps={entryForm.showSteps}
            showHoles={entryForm.showHoles}
            isBusy={entryForm.isBusy}
            onChange={entryForm.handleFormChange}
            onPickImage={entryForm.handlePickImage}
            onRemoveImage={entryForm.handleRemoveImage}
            onCancel={entryForm.handleCancelEdit}
            onSubmit={entryForm.handleSubmit}
          />
        ) : null}

        <Card className="p-4">
          <View className="flex-row gap-3">
            <Feather name="shield" size={18} color={mflColors.amber} />
            <View className="flex-1">
              <AppText className="text-sm font-semibold text-foreground">
                Audit hint
              </AppText>
              <AppText className="text-xs text-muted mt-1">
                Entries added here are auto-approved and logged under your account as the creator.
                Keep proof links for compliance.
              </AppText>
            </View>
          </View>
        </Card>
      </View>
    </ScreenScrollView>
  );
}
