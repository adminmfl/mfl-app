import { Pressable, TextInput, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { LeagueActivity } from '../types';
import type { SubmissionFormErrors } from '../types';

const MIN_DURATION = 1;
const MAX_DURATION = 1440;
const DURATION_STEP = 5;

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

interface MeasurementFieldsProps {
  selectedActivity: LeagueActivity | null;
  duration: string;
  distance: string;
  steps: string;
  holes: string;
  errors: SubmissionFormErrors;
  onDurationChange: (value: string) => void;
  onDistanceChange: (value: string) => void;
  onStepsChange: (value: string) => void;
  onHolesChange: (value: string) => void;
}

function getMinRequirement(
  type: string,
  activity: LeagueActivity | null,
): string | null {
  if (!activity) return null;
  const defaults: Record<string, number> = {
    duration: 45,
    distance: 4,
    steps: 10000,
    hole: 9,
  };
  const value = activity.min_value ?? defaults[type];
  if (!value) return null;
  const units: Record<string, string> = {
    duration: 'min',
    distance: 'km',
    steps: 'steps',
    hole: 'holes',
  };
  return `Min: ${value} ${units[type] ?? ''}`;
}

export function MeasurementFields({
  selectedActivity,
  duration,
  distance,
  steps,
  holes,
  errors,
  onDurationChange,
  onDistanceChange,
  onStepsChange,
  onHolesChange,
}: MeasurementFieldsProps) {
  const measurementType = selectedActivity?.measurement_type ?? 'duration';
  const secondaryMeasurement =
    (selectedActivity?.settings?.secondary_measurement_type as string | undefined) ?? null;

  const showDuration =
    measurementType === 'duration' || secondaryMeasurement === 'duration';
  const showDistance =
    measurementType === 'distance' || secondaryMeasurement === 'distance';
  const showSteps =
    measurementType === 'steps' || secondaryMeasurement === 'steps';
  const showHoles =
    measurementType === 'hole' || secondaryMeasurement === 'hole';

  if (!selectedActivity) return null;

  return (
    <>
      {/* Duration */}
      {showDuration && (
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">Duration (minutes)</AppText>
          <View className="bg-card rounded-xl border border-separator p-3">
            <View className="flex-row items-center justify-center gap-8">
              <Pressable
                onPress={() =>
                  onDurationChange(
                    String(Math.max(MIN_DURATION, (parseInt(duration, 10) || 0) - DURATION_STEP)),
                  )
                }
                className="w-11 h-11 rounded-full items-center justify-center bg-default-100"
              >
                <Feather name="minus" size={22} color={mflColors.text} />
              </Pressable>
              <TextInput
                style={{
                  fontSize: 28,
                  color: mflColors.text,
                  minWidth: 60,
                  textAlign: 'center',
                  fontVariant: ['tabular-nums'],
                }}
                value={duration}
                onChangeText={onDurationChange}
                keyboardType="number-pad"
                inputMode="numeric"
              />
              <Pressable
                onPress={() =>
                  onDurationChange(
                    String(Math.min(MAX_DURATION, (parseInt(duration, 10) || 0) + DURATION_STEP)),
                  )
                }
                className="w-11 h-11 rounded-full items-center justify-center bg-default-100"
              >
                <Feather name="plus" size={22} color={mflColors.text} />
              </Pressable>
            </View>
          </View>
          {getMinRequirement('duration', selectedActivity) && (
            <AppText className="text-xs text-muted">
              {getMinRequirement('duration', selectedActivity)}
            </AppText>
          )}
          {errors.duration && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {errors.duration}
            </AppText>
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
            onChangeText={onDistanceChange}
            placeholder="e.g. 5.2"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="decimal-pad"
            inputMode="decimal"
          />
          {getMinRequirement('distance', selectedActivity) && (
            <AppText className="text-xs text-muted">
              {getMinRequirement('distance', selectedActivity)}
            </AppText>
          )}
          {errors.distance && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {errors.distance}
            </AppText>
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
            onChangeText={onStepsChange}
            placeholder="e.g. 6000"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="number-pad"
            inputMode="numeric"
          />
          {getMinRequirement('steps', selectedActivity) && (
            <AppText className="text-xs text-muted">
              {getMinRequirement('steps', selectedActivity)}
            </AppText>
          )}
          {errors.steps && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {errors.steps}
            </AppText>
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
            onChangeText={onHolesChange}
            placeholder="e.g. 9"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="number-pad"
            inputMode="numeric"
          />
          {getMinRequirement('hole', selectedActivity) && (
            <AppText className="text-xs text-muted">
              {getMinRequirement('hole', selectedActivity)}
            </AppText>
          )}
          {errors.holes && (
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {errors.holes}
            </AppText>
          )}
        </View>
      )}
    </>
  );
}
