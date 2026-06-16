import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import Feather from '@expo/vector-icons/Feather';
import { Button, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { StatCard } from '../../../components/stat-card';
import { mflColors } from '../../../constants/colors';
import { useUpsertEntry, usePreviewRR } from '../../submissions';
import { useProofUpload } from '../hooks/use-proof-upload';
import { useProofOcr, getAutoFillFields } from '../hooks/use-proof-ocr';
import { OcrSuggestionPanel } from './ocr-suggestion-panel';
import {
  validateWorkoutForm,
  todayISO,
  formatDisplayDate,
  shiftDateISO,
  clampDate,
  compareDates,
  getIANATimezone,
  getTZOffsetMinutes,
} from '../utils';
import type { LeagueActivity, ResubmitParams } from '../types';
import type { UserLeague } from '../../leagues/types/league.model';
import type { UpsertEntryRequestDTO } from '../../submissions/types/submission.dto';
import { logActivitySubmitted } from '../../../lib/analytics';

const MIN_DURATION = 1;
const MAX_DURATION = 1440;
const DURATION_STEP = 5;

interface Props {
  leagueId: string;
  league: UserLeague;
  activities: LeagueActivity[];
  resubmitParams?: ResubmitParams | null;
  onSuccess: () => void;
}

export function WorkoutSubmission({
  leagueId,
  league,
  activities,
  resubmitParams,
  onSuccess,
}: Props) {
  const upsert = useUpsertEntry();
  const preview = usePreviewRR();
  const proofUpload = useProofUpload(leagueId);
  const proofOcr = useProofOcr();
  const ocrFill = useMemo(
    () => (proofOcr.extraction ? getAutoFillFields(proofOcr.extraction) : null),
    [proofOcr.extraction],
  );
  const ocrProcessing = proofOcr.status === 'processing';

  // RR display config
  const rrFormula = (league.rrConfig as any)?.formula || 'standard';
  const showRR = rrFormula !== 'points_only';
  const pointsUnit = showRR ? 'RR' : 'pts';

  // -- Form state (workoutType needed early for date computations) --
  const [workoutType, setWorkoutType] = useState(resubmitParams?.workoutType ?? '');

  const selectedActivity = useMemo(
    () => activities.find((a) => a.value === workoutType) ?? null,
    [activities, workoutType],
  );

  const isMonthlyFrequency = selectedActivity?.frequency_type === 'monthly';
  const isResubmit = !!resubmitParams;

  // -- Date boundaries --
  const today = todayISO();

  const leagueStartDate = useMemo(() => {
    if (!league.startDate) return null;
    return String(league.startDate).slice(0, 10);
  }, [league.startDate]);

  const leagueEndDate = useMemo(() => {
    if (!league.endDate) return null;
    return String(league.endDate).slice(0, 10);
  }, [league.endDate]);

  const maxActivityDate = useMemo(() => {
    if (!leagueEndDate) return today;
    return compareDates(today, leagueEndDate) < 0 ? today : leagueEndDate;
  }, [leagueEndDate, today]);

  const minActivityDate = useMemo(() => {
    // Trial mode: 3 days before league start
    if (leagueStartDate && compareDates(today, leagueStartDate) < 0) {
      const trialStart = shiftDateISO(leagueStartDate, -3);
      return trialStart;
    }
    // Monthly: any date from league start
    if (isMonthlyFrequency && leagueStartDate) return leagueStartDate;
    // Per-activity submission_window_days
    const swd = selectedActivity?.submission_window_days;
    if (typeof swd === 'number' && swd >= 1) {
      const windowStart = shiftDateISO(today, -swd);
      if (leagueStartDate && compareDates(windowStart, leagueStartDate) < 0) {
        return leagueStartDate;
      }
      return windowStart;
    }
    // Default: today only
    return compareDates(maxActivityDate, today) < 0 ? maxActivityDate : today;
  }, [maxActivityDate, leagueStartDate, today, isMonthlyFrequency, selectedActivity]);

  // -- Rest of form state --
  const [duration, setDuration] = useState(resubmitParams?.duration ?? '30');
  const [distance, setDistance] = useState(resubmitParams?.distance ?? '');
  const [steps, setSteps] = useState(resubmitParams?.steps ?? '');
  const [holes, setHoles] = useState(resubmitParams?.holes ?? '');
  const [notes, setNotes] = useState(resubmitParams?.notes ?? '');
  const [outcome, setOutcome] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [customFieldValue2, setCustomFieldValue2] = useState('');
  const [entryDate, setEntryDate] = useState(() => {
    if (resubmitParams?.date) return resubmitParams.date; // Resubmit: use original date unmodified
    return clampDate(today, minActivityDate, maxActivityDate);
  });
  const [rrPreview, setRRPreview] = useState<number | null>(null);

  // Reclamp entryDate when activity-driven boundaries change
  useEffect(() => {
    if (isResubmit) return; // Date locked for resubmit
    setEntryDate((prev) => clampDate(prev, minActivityDate, maxActivityDate));
  }, [minActivityDate, maxActivityDate, isResubmit]);

  const isTrialMode = useMemo(() => {
    if (!leagueStartDate) return false;
    return compareDates(entryDate, leagueStartDate) < 0;
  }, [entryDate, leagueStartDate]);

  // -- Client-side RR estimate for standard formula --
  const clientRREstimate = useMemo(() => {
    if (rrFormula !== 'standard' || !selectedActivity) return null;
    const mt = selectedActivity.measurement_type;
    if (mt === 'none') return null;
    const defaults: Record<string, number> = { duration: 45, distance: 4, steps: 10000, hole: 9 };
    const minVal = selectedActivity.min_value ?? defaults[mt] ?? 0;
    if (minVal <= 0) return null;
    const fieldMap: Record<string, string> = { duration, distance, steps, hole: holes };
    const rawVal = parseFloat(fieldMap[mt] || '0');
    if (!rawVal || rawVal <= 0) return null;
    return Math.min(rawVal / minVal, 2.0);
  }, [rrFormula, selectedActivity, duration, distance, steps, holes]);

  // -- Derived field visibility from measurement_type --
  const measurementType = selectedActivity?.measurement_type || 'duration';
  const secondaryMeasurement = (selectedActivity?.settings?.secondary_measurement_type as string) || null;

  const showDuration = measurementType === 'duration' || secondaryMeasurement === 'duration';
  const showDistance = measurementType === 'distance' || secondaryMeasurement === 'distance';
  const showSteps = measurementType === 'steps' || secondaryMeasurement === 'steps';
  const showHoles = measurementType === 'hole' || secondaryMeasurement === 'hole';

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
    [workoutType, duration, distance, steps, holes, notes, outcome, customFieldValue, customFieldValue2, selectedActivity, proofUpload.hasProof, isResubmit],
  );
  const isValid = Object.keys(errors).length === 0;

  // -- Min requirement helper --
  const getMinRequirement = useCallback(
    (type: string) => {
      if (!selectedActivity) return null;
      const minVal = selectedActivity.min_value;
      const defaults: Record<string, number> = { duration: 45, distance: 4, steps: 10000, hole: 9 };
      const value = minVal ?? defaults[type];
      if (!value) return null;
      const units: Record<string, string> = { duration: 'min', distance: 'km', steps: 'steps', hole: 'holes' };
      return `Min: ${value} ${units[type] || ''}`;
    },
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
  // -- Preview RR --
  const handlePreviewRR = useCallback(() => {
    if (!workoutType) return;
    preview.mutate(
      {
        league_id: leagueId,
        type: 'workout',
        workout_type: workoutType,
        ...(duration.trim() ? { duration: parseInt(duration, 10) } : {}),
        ...(distance.trim() ? { distance: parseFloat(distance) } : {}),
        ...(steps.trim() ? { steps: parseInt(steps, 10) } : {}),
        ...(holes.trim() ? { holes: parseInt(holes, 10) } : {}),
      },
      {
        onSuccess: (data) => setRRPreview(data.rrScore),
        onError: (err) => Alert.alert('Preview Failed', err.message),
      },
    );
  }, [leagueId, workoutType, duration, distance, steps, holes, preview]);

  // -- Submit --
  const handleSubmit = useCallback(async () => {
    if (!isValid || !workoutType) return;

    // Block if league hasn't opened yet (3 days before start)
    if (leagueStartDate) {
      const trialStart = shiftDateISO(leagueStartDate, -3);
      if (compareDates(today, trialStart) < 0) {
        Alert.alert('Not Yet Open', `Submissions open on ${formatDisplayDate(trialStart)}.`);
        return;
      }
    }

    // Block if RR < 1.0 for standard formula
    if (rrFormula === 'standard' && clientRREstimate !== null && clientRREstimate < 1.0) {
      Alert.alert('Insufficient Effort', 'Activity RR must be at least 1.0. Please increase your effort.');
      return;
    }

    let payload: UpsertEntryRequestDTO | null = null;

    try {
      // Upload proof first
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
    } catch (err: any) {
      if (payload && err?.response?.status === 409 && err?.response?.data?.existing) {
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
                } catch (overwriteErr: any) {
                  const msg =
                    overwriteErr?.response?.data?.error ||
                    overwriteErr?.message ||
                    'Submission failed.';
                  Alert.alert('Submission Failed', msg);
                }
              },
            },
          ],
        );
        return;
      }
      const msg = err?.response?.data?.error || err?.message || 'Submission failed.';
      Alert.alert('Submission Failed', msg);
    }
  }, [
    isValid, workoutType, leagueId, entryDate, duration, distance, steps, holes,
    notes, outcome, customFieldValue, customFieldValue2, resubmitParams,
    proofUpload, upsert, onSuccess, leagueStartDate, today, rrFormula, clientRREstimate,
  ]);

  const isSubmitting = upsert.isPending || proofUpload.uploading;

  // ---- Outcome options from activity config ----
  const outcomeOptions = useMemo<{ label: string; points: number }[]>(() => {
    if (!selectedActivity?.outcome_config) return [];
    const cfg = selectedActivity.outcome_config as any;
    const arr: any[] = Array.isArray(cfg) ? cfg : Array.isArray(cfg?.options) ? cfg.options : [];
    return arr.map((item: any) => ({
      label: typeof item === 'string' ? item : (item?.label ?? ''),
      points: typeof item === 'string' ? 0 : (item?.points ?? 0),
    }));
  }, [selectedActivity]);

  // ---- Render ----
  return (
    <>
      {/* Trial Mode Banner */}
      {isTrialMode && (
        <View className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-200">
          <AppText className="text-sm text-blue-700 dark:text-blue-400">
            Trial Mode - This submission is before the league start date and will not count towards the leaderboard.
          </AppText>
        </View>
      )}

      {/* Activity Type + Activity Day */}
      <View className="gap-2">
        <View className="flex-row gap-3 items-start">
          <View className="flex-1 gap-2">
            <AppText className="text-sm font-semibold text-muted">Activity Type</AppText>
            <View className="flex-row flex-wrap gap-1.5">
              {activities.map((activity) => {
                const isSelected = workoutType === activity.value;
                return (
                  <Pressable
                    key={activity.activity_id}
                    onPress={() => {
                      setWorkoutType(activity.value);
                      setRRPreview(null);
                      setCustomFieldValue('');
                      setCustomFieldValue2('');
                      setOutcome('');
                    }}
                    className={`px-3 py-1.5 rounded-full border ${
                      isSelected ? 'border-transparent' : 'border-default-200 bg-card'
                    }`}
                    style={isSelected ? { backgroundColor: mflColors.brand, borderColor: mflColors.brand } : undefined}
                  >
                    <AppText className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}>
                      {activity.activity_name}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            {errors.workoutType && (
              <AppText className="text-sm" style={{ color: mflColors.danger }}>{errors.workoutType}</AppText>
            )}
          </View>

          <View className="gap-2" style={{ width: 148 }}>
            <View className="flex-row items-center gap-1">
              <AppText className="text-sm font-semibold text-muted">Activity Day</AppText>
              {isResubmit && (
                <View className="bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                  <AppText className="text-[10px] text-amber-700 dark:text-amber-400">Locked</AppText>
                </View>
              )}
            </View>
            <View className="bg-card rounded-xl border border-separator p-2">
              <View className="flex-row items-center justify-between">
                <Pressable onPress={() => shiftDate(-1)} hitSlop={8} disabled={isResubmit || compareDates(entryDate, minActivityDate) <= 0}>
                  <Feather name="chevron-left" size={18} color={isResubmit || compareDates(entryDate, minActivityDate) <= 0 ? mflColors.textMuted : mflColors.text} />
                </Pressable>
                <AppText className="text-xs font-medium text-foreground text-center">
                  {formatDisplayDate(entryDate)}
                </AppText>
                <Pressable
                  onPress={() => shiftDate(1)}
                  hitSlop={8}
                  disabled={isResubmit || compareDates(entryDate, maxActivityDate) >= 0}
                >
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={isResubmit || compareDates(entryDate, maxActivityDate) >= 0 ? mflColors.textMuted : mflColors.text}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Duration */}
      {showDuration && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">Duration (minutes)</AppText>
          <View className="bg-card rounded-xl border border-separator p-3">
            <View className="flex-row items-center justify-center gap-8">
              <Pressable
                onPress={() => setDuration((p) => String(Math.max(MIN_DURATION, (parseInt(p, 10) || 0) - DURATION_STEP)))}
                className="w-11 h-11 rounded-full items-center justify-center bg-default-100"
              >
                <Feather name="minus" size={22} color={mflColors.text} />
              </Pressable>
              <TextInput
                style={{ fontSize: 28, color: mflColors.text, minWidth: 60, textAlign: 'center', fontVariant: ['tabular-nums'] }}
                value={duration}
                onChangeText={(t) => { setDuration(t); setRRPreview(null); }}
                keyboardType="number-pad"
                inputMode="numeric"
              />
              <Pressable
                onPress={() => setDuration((p) => String(Math.min(MAX_DURATION, (parseInt(p, 10) || 0) + DURATION_STEP)))}
                className="w-11 h-11 rounded-full items-center justify-center bg-default-100"
              >
                <Feather name="plus" size={22} color={mflColors.text} />
              </Pressable>
            </View>
          </View>
          {getMinRequirement('duration') && (
            <AppText className="text-xs text-muted">{getMinRequirement('duration')}</AppText>
          )}
          {errors.duration && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>{errors.duration}</AppText>
          )}
        </View>
      )}

      {/* Distance */}
      {showDistance && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">Distance (km)</AppText>
          <TextInput
            style={inputStyle}
            value={distance}
            onChangeText={(t) => { setDistance(t); setRRPreview(null); }}
            placeholder="e.g. 5.2"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="decimal-pad"
            inputMode="decimal"
          />
          {getMinRequirement('distance') && (
            <AppText className="text-xs text-muted">{getMinRequirement('distance')}</AppText>
          )}
          {errors.distance && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>{errors.distance}</AppText>
          )}
        </View>
      )}

      {/* Steps */}
      {showSteps && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">Steps</AppText>
          <TextInput
            style={inputStyle}
            value={steps}
            onChangeText={(t) => { setSteps(t); setRRPreview(null); }}
            placeholder="e.g. 6000"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="number-pad"
            inputMode="numeric"
          />
          {getMinRequirement('steps') && (
            <AppText className="text-xs text-muted">{getMinRequirement('steps')}</AppText>
          )}
          {errors.steps && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>{errors.steps}</AppText>
          )}
        </View>
      )}

      {/* Holes */}
      {showHoles && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">Holes</AppText>
          <TextInput
            style={inputStyle}
            value={holes}
            onChangeText={(t) => { setHoles(t); setRRPreview(null); }}
            placeholder="e.g. 9"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="number-pad"
            inputMode="numeric"
          />
          {getMinRequirement('hole') && (
            <AppText className="text-xs text-muted">{getMinRequirement('hole')}</AppText>
          )}
          {errors.holes && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>{errors.holes}</AppText>
          )}
        </View>
      )}

      {/* Outcome (if activity has outcome_config) */}
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
                  <AppText className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}>{opt.label}</AppText>
                </Pressable>
              );
            })}
          </View>
          {errors.outcome && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>{errors.outcome}</AppText>
          )}
        </View>
      )}

      {/* Proof Upload */}
      <View className="gap-2">
        <AppText className="text-sm font-semibold text-muted">
          Proof Image{(selectedActivity?.proof_requirement === 'mandatory') ? ' *' : ''}
        </AppText>
        {proofUpload.proof ? (
          <View className="rounded-xl overflow-hidden border border-separator">
            <Image
              source={{ uri: proofUpload.proof.uri }}
              style={{ width: '100%', height: 200 }}
              contentFit="cover"
            />
            <Pressable
              onPress={() => { proofUpload.removeImage(1); proofOcr.reset(); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 items-center justify-center"
            >
              <Feather name="x" size={18} color="white" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={async () => {
              const img = await proofUpload.pickImage(1);
              if (img) {
                const extraction = await proofOcr.extract(img);
                if (extraction) {
                  const fill = getAutoFillFields(extraction);
                  if (fill.autoFilledFields.length > 0) {
                    // Build a single consolidated confirmation listing all detected fields.
                    // Firing separate Alert.alert() calls per field stacks alerts on Android
                    // and the user only sees the last one.
                    const lines = fill.autoFilledFields.map((f) => {
                      if (f === 'duration') return `Duration: ${fill.duration} min`;
                      if (f === 'distance') return `Distance: ${fill.distance} km`;
                      if (f === 'steps') return `Steps: ${fill.steps}`;
                      return f;
                    });
                    Alert.alert(
                      'Auto-fill Detected Values?',
                      lines.join('\n'),
                      [
                        { text: 'Skip', style: 'cancel' },
                        {
                          text: 'Apply All',
                          onPress: () => {
                            if (fill.duration !== undefined) setDuration(fill.duration);
                            if (fill.distance !== undefined) setDistance(fill.distance);
                            if (fill.steps !== undefined) setSteps(fill.steps);
                            setRRPreview(null);
                          },
                        },
                      ],
                    );
                  }
                }
              }
            }}
            disabled={ocrProcessing}
            className="border-2 border-dashed border-default-300 rounded-xl p-6 items-center justify-center gap-2"
          >
            <Feather name="camera" size={28} color={mflColors.textMuted} />
            <AppText className="text-sm text-muted">Tap to select proof image</AppText>
          </Pressable>
        )}
        {/* OCR Suggestion Panel */}
        <OcrSuggestionPanel
          extraction={proofOcr.extraction}
          status={proofOcr.status}
          error={proofOcr.error}
          autoFilledFields={ocrFill?.autoFilledFields ?? []}
          suggestedFields={ocrFill?.suggestedFields ?? []}
          onApplySuggestion={(field, value) => {
            if (field === 'duration') setDuration(value);
            else if (field === 'distance') setDistance(value);
            else if (field === 'steps') setSteps(value);
            setRRPreview(null);
          }}
        />
        {/* Second proof image (only if activity allows 2+ images) */}
        {proofUpload.proof && !proofUpload.proof2 && (selectedActivity?.max_images ?? 1) >= 2 && (
          <Pressable
            onPress={() => proofUpload.pickImage(2)}
            className="border border-dashed border-default-300 rounded-xl p-3 items-center"
          >
            <AppText className="text-xs text-muted">+ Add second proof image (optional)</AppText>
          </Pressable>
        )}
        {proofUpload.proof2 && (
          <View className="rounded-xl overflow-hidden border border-separator">
            <Image
              source={{ uri: proofUpload.proof2.uri }}
              style={{ width: '100%', height: 150 }}
              contentFit="cover"
            />
            <Pressable
              onPress={() => proofUpload.removeImage(2)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 items-center justify-center"
            >
              <Feather name="x" size={18} color="white" />
            </Pressable>
          </View>
        )}
        {errors.proof && (
          <AppText className="text-sm" style={{ color: mflColors.danger }}>{errors.proof}</AppText>
        )}
      </View>

      {/* Optional fields */}
      {(selectedActivity?.notes_requirement ?? 'optional') !== 'not_required' && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">
            {selectedActivity?.notes_requirement === 'mandatory' ? 'Notes *' : 'Notes (optional)'}
          </AppText>
          <TextInput
            style={{ ...inputStyle, minHeight: 48, textAlignVertical: 'top' }}
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
            <AppText className="text-sm" style={{ color: mflColors.danger }}>{errors.notes}</AppText>
          )}
        </View>
      )}

      {selectedActivity?.custom_field_label && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">{selectedActivity.custom_field_label} *</AppText>
          <TextInput
            style={{ ...inputStyle, minHeight: 48, textAlignVertical: 'top' }}
            value={customFieldValue}
            onChangeText={setCustomFieldValue}
            placeholder={selectedActivity.custom_field_placeholder || selectedActivity.custom_field_label}
            placeholderTextColor={mflColors.textMuted}
            multiline
          />
          {errors.customField && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>{errors.customField}</AppText>
          )}
        </View>
      )}

      {selectedActivity?.custom_field_label_2 && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">{selectedActivity.custom_field_label_2} *</AppText>
          <TextInput
            style={{ ...inputStyle, minHeight: 48, textAlignVertical: 'top' }}
            value={customFieldValue2}
            onChangeText={setCustomFieldValue2}
            placeholder={selectedActivity.custom_field_placeholder_2 || selectedActivity.custom_field_label_2}
            placeholderTextColor={mflColors.textMuted}
            multiline
          />
          {errors.customField2 && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>{errors.customField2}</AppText>
          )}
        </View>
      )}

      {/* RR Preview */}
      {showRR && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">{pointsUnit} Score Preview</AppText>
          <Button
            variant="secondary"
            size="md"
            onPress={handlePreviewRR}
            isDisabled={!workoutType || preview.isPending}
            className="w-full"
          >
            {preview.isPending ? <Spinner size="sm" /> : <Button.Label>Preview {pointsUnit} Score</Button.Label>}
          </Button>
          {rrPreview != null && (
            <View className="mt-2">
              <StatCard value={rrPreview} label={`Estimated ${pointsUnit} Score`} color={mflColors.brand} />
            </View>
          )}
        </View>
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

const inputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: mflColors.text,
} as const;
