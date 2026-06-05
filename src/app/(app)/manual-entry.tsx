import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
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
import { useSaveManualEntry } from '../../features/manual-entry/hooks/use-save-manual-entry';
import { uploadManualEntryProof } from '../../features/manual-entry/services/manual-entry.service';
import type {
  ManualEntryForm,
  ManualWeekRow,
  PickedProofImage,
} from '../../features/manual-entry/types/manual-entry';
import {
  computeRunRateFromForm,
  formatWeekRange,
  getActivityNameMap,
  getWeekRange,
  getWorkoutCategory,
  makeEmptyManualEntryForm,
  normalizedTeamName,
  toNumber,
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
  const saveMutation = useSaveManualEntry();

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [editRow, setEditRow] = useState<ManualWeekRow | null>(null);
  const [editMode, setEditMode] = useState<'add' | 'overwrite'>('add');
  const [form, setForm] = useState<ManualEntryForm>(() => makeEmptyManualEntryForm());
  const [proofImage, setProofImage] = useState<PickedProofImage | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

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
  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.value === form.workoutType),
    [activities, form.workoutType],
  );

  const workoutCategory = getWorkoutCategory(
    form.type,
    form.workoutType,
    selectedActivity?.measurement_type,
  );
  const showDuration =
    workoutCategory !== 'rest' &&
    workoutCategory !== 'steps' &&
    workoutCategory !== 'golf' &&
    workoutCategory !== 'none';
  const showDistance = workoutCategory === 'run' || workoutCategory === 'cycling';
  const showSteps = workoutCategory === 'steps';
  const showHoles = workoutCategory === 'golf';
  const computedRR = computeRunRateFromForm(form);

  const week = useManualEntryWeek({
    leagueId,
    memberId: selectedMemberId,
    weekOffset,
    showRR,
  });
  const displayWeekRange = getWeekRange(weekOffset);

  const handleSelectTeam = useCallback((team: string) => {
    setSelectedTeam(team);
    setSelectedMemberId('');
    setWeekOffset(0);
    setEditRow(null);
  }, []);

  const handleSelectMember = useCallback((memberId: string) => {
    setSelectedMemberId(memberId);
    setWeekOffset(0);
    setEditRow(null);
  }, []);

  const handleOpenRow = useCallback((row: ManualWeekRow) => {
    const mode = row.state === 'approved' ? 'overwrite' : 'add';
    setEditMode(mode);
    setEditRow(row);
    setForm(makeEmptyManualEntryForm(row.entry));
    setProofImage(null);
  }, []);

  const handleFormChange = useCallback((patch: Partial<ManualEntryForm>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.type === 'rest') {
        return {
          ...next,
          workoutType: '',
          duration: '',
          distance: '',
          steps: '',
          holes: '',
          proofUrl: '',
        };
      }
      return next;
    });
  }, []);

  const handlePickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please grant photo library access to upload proof.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const name = asset.fileName ?? `manual_entry_proof_${Date.now()}.jpg`;
      const rawType = (asset as { mimeType?: string }).mimeType ?? asset.type;
      setProofImage({
        uri: asset.uri,
        name,
        type: rawType?.startsWith('image/') ? rawType : 'image/jpeg',
      });
    }
  }, []);

  const validateForm = useCallback(() => {
    const duration = toNumber(form.duration);
    const distance = toNumber(form.distance);
    const steps = toNumber(form.steps);
    const holes = toNumber(form.holes);

    if (duration !== null && (duration < 0 || duration > 1440)) {
      return 'Duration must be between 0 and 1440 minutes.';
    }
    if (distance !== null && (distance < 0 || distance > 1000)) {
      return 'Distance must be between 0 and 1000 km.';
    }
    if (steps !== null && (steps < 0 || steps > 500000 || !Number.isInteger(steps))) {
      return 'Steps must be a whole number between 0 and 500,000.';
    }
    if (holes !== null && (holes < 0 || holes > 36 || !Number.isInteger(holes))) {
      return 'Holes must be a whole number between 0 and 36.';
    }

    if (form.type === 'workout') {
      if (!form.workoutType) return 'Select a workout type.';

      if (workoutCategory === 'steps' && (!steps || steps <= 0)) {
        return 'Steps are required for a steps workout.';
      }
      if (workoutCategory === 'golf' && (!holes || holes <= 0)) {
        return 'Holes are required for a golf workout.';
      }
      if (workoutCategory === 'run' || workoutCategory === 'cycling') {
        const hasDuration = typeof duration === 'number' && duration > 0;
        const hasDistance = typeof distance === 'number' && distance > 0;
        if ((hasDuration && hasDistance) || (!hasDuration && !hasDistance)) {
          return 'Provide either duration or distance, not both.';
        }
      }
      if (workoutCategory === 'other' && (!duration || duration <= 0)) {
        return 'Duration is required for this workout.';
      }
      if (computedRR < 1) {
        return 'Workout RR must be at least 1.0 based on the entered values.';
      }
      if (editMode === 'overwrite' && !proofImage && !form.proofUrl.trim()) {
        return 'Proof image is required when overwriting an entry.';
      }
    }

    return null;
  }, [computedRR, editMode, form, proofImage, workoutCategory]);

  const handleSubmit = useCallback(async () => {
    if (!leagueId || !selectedMemberId || !editRow) return;

    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Check Entry', validationError);
      return;
    }

    let finalProofUrl = form.proofUrl.trim() || null;
    if (proofImage) {
      setIsUploadingProof(true);
      try {
        finalProofUrl = await uploadManualEntryProof(leagueId, proofImage);
      } catch (error) {
        Alert.alert(
          'Upload Failed',
          error instanceof Error ? error.message : 'Could not upload proof image.',
        );
        setIsUploadingProof(false);
        return;
      }
      setIsUploadingProof(false);
    }

    const duration = showDuration ? toNumber(form.duration) : null;
    const distance = showDistance ? toNumber(form.distance) : null;
    const steps = showSteps ? toNumber(form.steps) : null;
    const holes = showHoles ? toNumber(form.holes) : null;

    saveMutation.mutate(
      {
        leagueId,
        data: {
          league_member_id: selectedMemberId,
          date: editRow.date,
          type: form.type,
          workout_type: form.type === 'workout' ? form.workoutType || null : null,
          duration,
          distance,
          steps,
          holes,
          rr_value: computedRR,
          proof_url: form.type === 'workout' ? finalProofUrl : null,
          notes: form.notes.trim() || null,
          overwriteExisting: true,
        },
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Saved',
            editMode === 'overwrite' ? 'Entry overwritten.' : 'Entry added.',
          );
          setEditRow(null);
          setProofImage(null);
          week.refetch();
        },
        onError: (error) => {
          Alert.alert('Save Failed', error.message || 'Could not save entry.');
        },
      },
    );
  }, [
    computedRR,
    editMode,
    editRow,
    form,
    leagueId,
    proofImage,
    saveMutation,
    selectedMemberId,
    showDistance,
    showDuration,
    showHoles,
    showSteps,
    validateForm,
    week,
  ]);

  const isBusy = saveMutation.isPending || isUploadingProof;

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
            Manual Workout Entry
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
            setEditRow(null);
          }}
          onNextWeek={() => {
            setWeekOffset((current) => Math.max(0, current - 1));
            setEditRow(null);
          }}
        />

        <ManualEntryWeekList
          rows={week.data}
          isLoading={week.isLoading}
          hasSelectedMember={!!selectedMemberId}
          activityNameMap={activityNameMap}
          onOpenRow={handleOpenRow}
        />

        {editRow ? (
          <ManualEntryEditor
            row={editRow}
            mode={editMode}
            form={form}
            activities={activities}
            isLoadingActivities={activitiesQuery.isLoading}
            isActivitiesError={activitiesQuery.isError}
            selectedActivity={selectedActivity}
            proofImage={proofImage}
            computedRR={computedRR}
            showRR={showRR}
            showDuration={showDuration}
            showDistance={showDistance}
            showSteps={showSteps}
            showHoles={showHoles}
            isBusy={isBusy}
            onChange={handleFormChange}
            onPickImage={handlePickImage}
            onRemoveImage={() => setProofImage(null)}
            onCancel={() => {
              setEditRow(null);
              setProofImage(null);
            }}
            onSubmit={handleSubmit}
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
