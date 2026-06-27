import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { Button, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { useUpsertEntry } from '../../submissions';
import { useProofUpload } from '../hooks/use-proof-upload';
import { useProofOcr } from '../hooks/use-proof-ocr';
import { ActivityTypePicker } from './activity-type-picker';
import { MeasurementFields } from './measurement-fields';
import { ProofUploadSection } from './proof-upload-section';
import { DatePickerRow } from './date-picker-row';
import { RRPreviewSection } from './rr-preview-section';
import { validateWorkoutForm } from '../utils/validation';
import { submissionInputStyle as inputStyle } from '../styles/form-styles';
import {
  clampDate,
  compareDates,
  getIANATimezone,
  getTZOffsetMinutes,
  shiftDateISO,
  todayISO,
  yesterdayISO,
  formatDisplayDate,
} from '../utils/date-helpers';
import { logActivitySubmitted } from '../../../lib/analytics';
import type { LeagueActivity, ResubmitParams } from '../types';
import type { UserLeague } from '../../leagues/types/league.model';
import type { UpsertEntryRequestDTO } from '../../submissions/types/submission.dto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OutcomeOption {
  label: string;
  points: number;
}

interface RRConfig {
  formula?: string;
}

interface OutcomeConfigWithOptions {
  options?: Array<string | { label?: string; points?: number }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseOutcomeOptions(
  outcomeConfig: unknown,
): OutcomeOption[] {
  if (!outcomeConfig) return [];
  const cfg = outcomeConfig as Array<unknown> | OutcomeConfigWithOptions;
  const arr: Array<unknown> = Array.isArray(cfg)
    ? cfg
    : Array.isArray((cfg as OutcomeConfigWithOptions).options)
      ? (cfg as OutcomeConfigWithOptions).options!
      : [];
  return arr.map((item) => {
    if (typeof item === 'string') return { label: item, points: 0 };
    const typed = item as { label?: string; points?: number };
    return { label: typed.label ?? '', points: typed.points ?? 0 };
  });
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  leagueId: string;
  league: UserLeague;
  activities: LeagueActivity[];
  resubmitParams?: ResubmitParams | null;
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkoutSubmission({
  leagueId,
  league,
  activities,
  resubmitParams,
  onSuccess,
}: Props) {
  const upsert = useUpsertEntry();
  const proofUpload = useProofUpload(leagueId);
  const proofOcr = useProofOcr();

  // RR display config — typed cast via known interface
  const rrConfig = league.rrConfig as RRConfig | null;
  const rrFormula = rrConfig?.formula ?? 'standard';
  const showRR = rrFormula !== 'points_only';
  const pointsUnit = showRR ? 'RR' : 'pts';

  // -- Form state --
  const [workoutType, setWorkoutType] = useState(resubmitParams?.workoutType ?? '');
  const [duration, setDuration] = useState(resubmitParams?.duration ?? '30');
  const [distance, setDistance] = useState(resubmitParams?.distance ?? '');
  const [steps, setSteps] = useState(resubmitParams?.steps ?? '');
  const [holes, setHoles] = useState(resubmitParams?.holes ?? '');
  const [notes, setNotes] = useState(resubmitParams?.notes ?? '');
  const [outcome, setOutcome] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [customFieldValue2, setCustomFieldValue2] = useState('');
  const [rrPreview, setRRPreview] = useState<number | null>(null);

  const isResubmit = !!resubmitParams;

  const selectedActivity = useMemo(
    () => activities.find((a) => a.value === workoutType) ?? null,
    [activities, workoutType],
  );

  const isMonthlyFrequency = selectedActivity?.frequency_type === 'monthly';

  // -- Date boundaries --
  const today = todayISO();
  const yesterday = yesterdayISO();

  const leagueStartDate = useMemo(
    () => (league.startDate ? String(league.startDate).slice(0, 10) : null),
    [league.startDate],
  );
  const leagueEndDate = useMemo(
    () => (league.endDate ? String(league.endDate).slice(0, 10) : null),
    [league.endDate],
  );

  const maxActivityDate = useMemo(() => {
    if (!leagueEndDate) return today;
    return compareDates(today, leagueEndDate) < 0 ? today : leagueEndDate;
  }, [leagueEndDate, today]);

  const minActivityDate = useMemo(() => {
    if (leagueStartDate && compareDates(today, leagueStartDate) < 0) {
      return shiftDateISO(leagueStartDate, -3);
    }
    if (isMonthlyFrequency && leagueStartDate) return leagueStartDate;
    if (selectedActivity?.submission_window_days) {
      const windowStart = shiftDateISO(today, -(selectedActivity.submission_window_days - 1));
      if (leagueStartDate && compareDates(windowStart, leagueStartDate) < 0) {
        return leagueStartDate;
      }
      return windowStart;
    }
    return compareDates(maxActivityDate, yesterday) < 0 ? maxActivityDate : yesterday;
  }, [maxActivityDate, yesterday, leagueStartDate, today, isMonthlyFrequency, selectedActivity]);

  const [entryDate, setEntryDate] = useState(() => {
    if (resubmitParams?.date) return resubmitParams.date;
    return clampDate(today, minActivityDate, maxActivityDate);
  });

  // Reclamp when activity-driven boundaries change
  useEffect(() => {
    if (isResubmit) return;
    setEntryDate((prev) => clampDate(prev, minActivityDate, maxActivityDate));
  }, [minActivityDate, maxActivityDate, isResubmit]);

  const isTrialMode = useMemo(() => {
    if (!leagueStartDate) return false;
    return compareDates(entryDate, leagueStartDate) < 0;
  }, [entryDate, leagueStartDate]);

  // -- Client-side RR estimate for validation --
  const clientRREstimate = useMemo(() => {
    if (rrFormula !== 'standard' || !selectedActivity) return null;
    const measurementType = selectedActivity.measurement_type;
    if (measurementType === 'none') return null;
    const defaults: Record<string, number> = {
      duration: 45,
      distance: 4,
      steps: 10000,
      hole: 9,
    };
    const minVal = selectedActivity.min_value ?? defaults[measurementType] ?? 0;
    if (minVal <= 0) return null;
    const fieldMap: Record<string, string> = {
      duration,
      distance,
      steps,
      hole: holes,
    };
    const rawVal = parseFloat(fieldMap[measurementType] ?? '0');
    if (!rawVal || rawVal <= 0) return null;
    return Math.min(rawVal / minVal, 2.0);
  }, [rrFormula, selectedActivity, duration, distance, steps, holes]);

  // -- Validation --
  const errors = useMemo(
    () =>
      validateWorkoutForm({
        workoutType,
        duration,
        distance,
        steps,
        holes,
        notes,
        outcome,
        customFieldValue,
        customFieldValue2,
        selectedActivity,
        hasProof: proofUpload.hasProof,
        isResubmit,
      }),
    [
      workoutType,
      duration,
      distance,
      steps,
      holes,
      notes,
      outcome,
      customFieldValue,
      customFieldValue2,
      selectedActivity,
      proofUpload.hasProof,
      isResubmit,
    ],
  );
  const isValid = Object.keys(errors).length === 0;

  // -- Outcome options --
  const outcomeOptions = useMemo(
    () => parseOutcomeOptions(selectedActivity?.outcome_config),
    [selectedActivity],
  );

  // -- Date navigation --
  const shiftDate = useCallback(
    (days: number) => {
      setEntryDate((prev) => {
        const shifted = shiftDateISO(prev, days);
        return clampDate(shifted, minActivityDate, maxActivityDate);
      });
    },
    [minActivityDate, maxActivityDate],
  );

  // -- OCR field apply --
  const handleOcrApply = useCallback((field: string, value: string) => {
    if (field === 'duration') setDuration(value);
    else if (field === 'distance') setDistance(value);
    else if (field === 'steps') setSteps(value);
    setRRPreview(null);
  }, []);

  // -- Clear RR preview on measurement change --
  const handleDurationChange = useCallback((v: string) => {
    setDuration(v);
    setRRPreview(null);
  }, []);
  const handleDistanceChange = useCallback((v: string) => {
    setDistance(v);
    setRRPreview(null);
  }, []);
  const handleStepsChange = useCallback((v: string) => {
    setSteps(v);
    setRRPreview(null);
  }, []);
  const handleHolesChange = useCallback((v: string) => {
    setHoles(v);
    setRRPreview(null);
  }, []);

  // -- Submit --
  const handleSubmit = useCallback(async () => {
    if (!isValid || !workoutType) return;

    if (leagueStartDate) {
      const trialStart = shiftDateISO(leagueStartDate, -3);
      if (compareDates(today, trialStart) < 0) {
        Alert.alert(
          'Not Yet Open',
          `Submissions open on ${formatDisplayDate(trialStart)}.`,
        );
        return;
      }
    }

    if (rrFormula === 'standard' && clientRREstimate !== null && clientRREstimate < 1.0) {
      Alert.alert(
        'Insufficient Effort',
        'Workout RR must be at least 1.0. Please increase your effort.',
      );
      return;
    }

    let payload: UpsertEntryRequestDTO | null = null;

    try {
      const { proofUrl, proofUrl2 } = await proofUpload.uploadAll();

      payload = {
        league_id: leagueId,
        date: entryDate,
        type: 'workout',
        workout_type: workoutType,
        ...(duration.trim() ? { duration: parseInt(duration, 10) } : {}),
        ...(distance.trim() ? { distance: parseFloat(distance) } : {}),
        ...(steps.trim() ? { steps: parseInt(steps, 10) } : {}),
        ...(holes.trim() ? { holes: parseInt(holes, 10) } : {}),
        ...(proofUrl ? { proof_url: proofUrl } : {}),
        ...(proofUrl2 ? { proof_url_2: proofUrl2 } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(outcome ? { outcome } : {}),
        ...(customFieldValue.trim() ? { custom_field_value: customFieldValue.trim() } : {}),
        ...(customFieldValue2.trim() ? { custom_field_value_2: customFieldValue2.trim() } : {}),
        ...(resubmitParams?.resubmitId ? { reupload_of: resubmitParams.resubmitId } : {}),
        overwrite: false,
        tzOffsetMinutes: getTZOffsetMinutes(),
        ianaTimezone: getIANATimezone() ?? undefined,
      };

      await upsert.mutateAsync(payload);

      logActivitySubmitted({
        league_id: leagueId,
        activity_type: workoutType,
        is_resubmit: !!resubmitParams?.resubmitId,
      }).catch(() => {});

      Alert.alert('Success', 'Activity submitted successfully!', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch (err: unknown) {
      const apiErr = err as {
        message?: string;
        response?: { status?: number; data?: { error?: string; existing?: unknown } };
      };

      if (
        payload &&
        apiErr?.response?.status === 409 &&
        apiErr?.response?.data?.existing
      ) {
        Alert.alert(
          'Entry Already Exists',
          'You already submitted an entry for this date. Do you want to overwrite it?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Overwrite',
              style: 'destructive',
              onPress: async () => {
                try {
                  await upsert.mutateAsync({ ...payload!, overwrite: true });
                  Alert.alert('Success', 'Activity updated successfully!', [
                    { text: 'OK', onPress: onSuccess },
                  ]);
                } catch (overwriteErr: unknown) {
                  const owErr = overwriteErr as {
                    message?: string;
                    response?: { data?: { error?: string } };
                  };
                  Alert.alert(
                    'Submission Failed',
                    owErr?.response?.data?.error ?? owErr?.message ?? 'Submission failed.',
                  );
                }
              },
            },
          ],
        );
        return;
      }

      Alert.alert(
        'Submission Failed',
        apiErr?.response?.data?.error ?? apiErr?.message ?? 'Submission failed.',
      );
    }
  }, [
    isValid,
    workoutType,
    leagueId,
    entryDate,
    duration,
    distance,
    steps,
    holes,
    notes,
    outcome,
    customFieldValue,
    customFieldValue2,
    resubmitParams,
    proofUpload,
    upsert,
    onSuccess,
    leagueStartDate,
    today,
    rrFormula,
    clientRREstimate,
  ]);

  const isSubmitting = upsert.isPending || proofUpload.uploading;

  // ---- Render ----
  return (
    <>
      {/* Trial Mode Banner */}
      {isTrialMode && (
        <View className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-200">
          <AppText className="text-sm text-blue-700 dark:text-blue-400">
            Trial Mode — This submission is before the league start date and will not count towards
            the leaderboard.
          </AppText>
        </View>
      )}

      {/* Activity Type Picker */}
      <ActivityTypePicker
        activities={activities}
        value={workoutType}
        error={errors.workoutType}
        onChange={(val) => {
          setWorkoutType(val);
          setRRPreview(null);
          setCustomFieldValue('');
          setCustomFieldValue2('');
          setOutcome('');
        }}
      />

      {/* Measurement Fields */}
      <MeasurementFields
        selectedActivity={selectedActivity}
        duration={duration}
        distance={distance}
        steps={steps}
        holes={holes}
        errors={errors}
        onDurationChange={handleDurationChange}
        onDistanceChange={handleDistanceChange}
        onStepsChange={handleStepsChange}
        onHolesChange={handleHolesChange}
      />

      {/* Outcome */}
      {outcomeOptions.length > 0 && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">Outcome *</AppText>
          <View className="flex-row flex-wrap gap-2">
            {outcomeOptions.map((opt) => {
              const isSelected = outcome === opt.label;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setOutcome(opt.label)}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected ? 'border-transparent' : 'border-default-200 bg-card'
                  }`}
                  style={isSelected ? { backgroundColor: mflColors.brand } : undefined}
                >
                  <AppText
                    className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}
                  >
                    {opt.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {errors.outcome && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {errors.outcome}
            </AppText>
          )}
        </View>
      )}

      {/* Custom Field 1 */}
      {selectedActivity?.custom_field_label && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">
            {selectedActivity.custom_field_label} *
          </AppText>
          <TextInput
            style={{ ...inputStyle, minHeight: 60, textAlignVertical: 'top' }}
            value={customFieldValue}
            onChangeText={setCustomFieldValue}
            placeholder={
              selectedActivity.custom_field_placeholder ?? selectedActivity.custom_field_label
            }
            placeholderTextColor={mflColors.textMuted}
            multiline
          />
          {errors.customField && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {errors.customField}
            </AppText>
          )}
        </View>
      )}

      {/* Custom Field 2 */}
      {selectedActivity?.custom_field_label_2 && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">
            {selectedActivity.custom_field_label_2} *
          </AppText>
          <TextInput
            style={{ ...inputStyle, minHeight: 60, textAlignVertical: 'top' }}
            value={customFieldValue2}
            onChangeText={setCustomFieldValue2}
            placeholder={
              selectedActivity.custom_field_placeholder_2 ?? selectedActivity.custom_field_label_2
            }
            placeholderTextColor={mflColors.textMuted}
            multiline
          />
          {errors.customField2 && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {errors.customField2}
            </AppText>
          )}
        </View>
      )}

      {/* Notes */}
      {(selectedActivity?.notes_requirement ?? 'optional') !== 'not_required' && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">
            Notes{selectedActivity?.notes_requirement === 'mandatory' ? ' *' : ''}
          </AppText>
          <TextInput
            style={{ ...inputStyle, minHeight: 60, textAlignVertical: 'top' }}
            value={notes}
            onChangeText={setNotes}
            placeholder={
              selectedActivity?.notes_requirement === 'mandatory'
                ? 'Required — add notes about your activity'
                : 'Optional notes about your activity'
            }
            placeholderTextColor={mflColors.textMuted}
            multiline
          />
          {errors.notes && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {errors.notes}
            </AppText>
          )}
        </View>
      )}

      {/* Proof Upload */}
      <ProofUploadSection
        selectedActivity={selectedActivity}
        proofUpload={proofUpload}
        proofOcr={proofOcr}
        error={errors.proof}
        onOcrApply={handleOcrApply}
      />

      {/* Date Picker */}
      <DatePickerRow
        value={entryDate}
        minDate={minActivityDate}
        maxDate={maxActivityDate}
        isLocked={isResubmit}
        onShift={shiftDate}
      />

      {/* RR Preview */}
      {showRR && (
        <RRPreviewSection
          leagueId={leagueId}
          workoutType={workoutType}
          duration={duration}
          distance={distance}
          steps={steps}
          holes={holes}
          pointsUnit={pointsUnit}
          rrPreview={rrPreview}
          onPreviewResult={setRRPreview}
        />
      )}

      {/* Submit */}
      <View className="pt-2">
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          isDisabled={!isValid || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? <Spinner size="sm" /> : <Button.Label>Submit Activity</Button.Label>}
        </Button>
      </View>
    </>
  );
}
