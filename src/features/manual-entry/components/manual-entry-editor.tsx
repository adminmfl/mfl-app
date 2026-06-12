import Feather from '@expo/vector-icons/Feather';
import { Image, Pressable, TextInput, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type { LeagueActivity } from '../../leagues/hooks/use-league-activities';
import type {
  ManualEntryForm,
  ManualWeekRow,
  PickedProofImage,
} from '../types/manual-entry';

interface ManualEntryEditorProps {
  row: ManualWeekRow;
  mode: 'add' | 'overwrite';
  form: ManualEntryForm;
  activities: LeagueActivity[];
  isLoadingActivities: boolean;
  isActivitiesError: boolean;
  selectedActivity?: LeagueActivity;
  proofImage: PickedProofImage | null;
  computedRR: number;
  showRR: boolean;
  showDuration: boolean;
  showDistance: boolean;
  showSteps: boolean;
  showHoles: boolean;
  isBusy: boolean;
  onChange: (patch: Partial<ManualEntryForm>) => void;
  onPickImage: () => void;
  onRemoveImage: () => void;
  onCancel: () => void;
  onSubmit: () => void;
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
};

export function ManualEntryEditor({
  row,
  mode,
  form,
  activities,
  isLoadingActivities,
  isActivitiesError,
  selectedActivity,
  proofImage,
  computedRR,
  showRR,
  showDuration,
  showDistance,
  showSteps,
  showHoles,
  isBusy,
  onChange,
  onPickImage,
  onRemoveImage,
  onCancel,
  onSubmit,
}: ManualEntryEditorProps) {
  const isWorkout = form.type === 'workout';
  const proofPreview = proofImage?.uri || form.proofUrl.trim();

  return (
    <Card className="p-4 gap-5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText className="text-base font-semibold text-foreground">
            {mode === 'overwrite' ? 'Overwrite entry' : 'Add activity'}
          </AppText>
          <AppText className="text-xs text-muted mt-1">{row.label}</AppText>
        </View>
        <Pressable onPress={onCancel} hitSlop={10}>
          <Feather name="x" size={22} color={mflColors.textMuted} />
        </Pressable>
      </View>

      <View className="gap-2">
        <SectionLabel label="Type" />
        <View className="flex-row gap-2">
          <ChoiceChip
            label="Activity"
            isSelected={form.type === 'workout'}
            onPress={() => onChange({ type: 'workout' })}
          />
          <ChoiceChip
            label="Rest Day"
            isSelected={form.type === 'rest'}
            onPress={() => onChange({ type: 'rest' })}
          />
        </View>
      </View>

      {isWorkout && (
        <View className="gap-2">
          <SectionLabel label="Activity Type" />
          {isLoadingActivities ? (
            <View className="rounded-xl border border-default-200 p-4 bg-default-50">
              <AppText className="text-sm text-muted">Loading activities...</AppText>
            </View>
          ) : isActivitiesError ? (
            <View className="rounded-xl border border-default-200 p-4 bg-default-50">
              <AppText className="text-sm text-muted">
                Unable to load league activities.
              </AppText>
            </View>
          ) : activities.length === 0 ? (
            <View className="rounded-xl border border-default-200 p-4 bg-default-50">
              <AppText className="text-sm text-muted">
                No activities configured for this league.
              </AppText>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {activities.map((activity) => (
                <ChoiceChip
                  key={activity.activity_id}
                  label={activity.activity_name}
                  isSelected={form.workoutType === activity.value}
                  onPress={() =>
                    onChange({
                      workoutType: activity.value,
                      duration: '',
                      distance: '',
                      steps: '',
                      holes: '',
                    })
                  }
                />
              ))}
            </View>
          )}
          {selectedActivity?.description ? (
            <AppText className="text-xs text-muted">{selectedActivity.description}</AppText>
          ) : null}
        </View>
      )}

      {showDuration && (
        <View className="gap-2">
          <SectionLabel
            label={
              showDistance
                ? 'Duration (minutes, required if no distance)'
                : 'Duration (minutes)'
            }
          />
          <TextInput
            style={inputStyle}
            value={form.duration}
            onChangeText={(duration) => onChange({ duration })}
            placeholder="e.g. 45"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="number-pad"
            inputMode="numeric"
          />
          {showDistance ? (
            <AppText className="text-xs text-muted">
              Provide either duration or distance, not both.
            </AppText>
          ) : null}
        </View>
      )}

      {showDistance && (
        <View className="gap-2">
          <SectionLabel label="Distance (km, required if no duration)" />
          <TextInput
            style={inputStyle}
            value={form.distance}
            onChangeText={(distance) => onChange({ distance })}
            placeholder="e.g. 5.2"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="decimal-pad"
            inputMode="decimal"
          />
          <AppText className="text-xs text-muted">
            Provide either distance or duration, not both.
          </AppText>
        </View>
      )}

      {showSteps && (
        <View className="gap-2">
          <SectionLabel label="Steps" />
          <TextInput
            style={inputStyle}
            value={form.steps}
            onChangeText={(steps) => onChange({ steps })}
            placeholder="e.g. 12000"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="number-pad"
            inputMode="numeric"
          />
        </View>
      )}

      {showHoles && (
        <View className="gap-2">
          <SectionLabel label="Holes (golf)" />
          <TextInput
            style={inputStyle}
            value={form.holes}
            onChangeText={(holes) => onChange({ holes })}
            placeholder="e.g. 9"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="number-pad"
            inputMode="numeric"
          />
        </View>
      )}

      {showRR && (
        <View className="gap-2">
          <SectionLabel label="Run Rate (RR)" />
          <View className="rounded-xl border border-default-200 bg-default-50 px-4 py-3">
            <AppText className="text-lg font-semibold text-foreground">
              {computedRR.toFixed(2)}
            </AppText>
            <AppText className="text-xs text-muted mt-1">
              Auto-calculated from activity type, duration, distance, steps, or holes.
            </AppText>
          </View>
        </View>
      )}

      {isWorkout && (
        <View className="gap-3">
          <SectionLabel label="Proof" />
          <Pressable
            onPress={onPickImage}
            className="border-2 border-dashed rounded-xl items-center justify-center overflow-hidden"
            style={{
              borderColor: proofPreview ? mflColors.brand : mflColors.border,
              backgroundColor: mflColors.surface,
              height: proofPreview ? 190 : 116,
            }}
          >
            {proofPreview ? (
              <Image
                source={{ uri: proofPreview }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View className="items-center gap-2">
                <Feather name="image" size={28} color={mflColors.textMuted} />
                <AppText className="text-sm text-muted">Tap to upload proof image</AppText>
              </View>
            )}
          </Pressable>
          {proofImage ? (
            <Pressable onPress={onRemoveImage}>
              <AppText className="text-xs" style={{ color: mflColors.danger }}>
                Remove selected image
              </AppText>
            </Pressable>
          ) : null}

          <View className="gap-2">
            <SectionLabel label="Current proof URL" />
            <TextInput
              style={inputStyle}
              value={form.proofUrl}
              onChangeText={(proofUrl) => onChange({ proofUrl })}
              placeholder="Paste existing proof URL"
              placeholderTextColor={mflColors.textMuted}
              autoCapitalize="none"
              inputMode="url"
            />
            <AppText className="text-xs text-muted">
              {mode === 'overwrite'
                ? 'Required when overwriting: upload or paste proof for the replacement entry.'
                : 'Optional for new activities; upload above to attach proof.'}
            </AppText>
          </View>
        </View>
      )}

      <View className="gap-2">
        <SectionLabel label="Notes" />
        <TextInput
          style={[inputStyle, { minHeight: 90, textAlignVertical: 'top' }]}
          value={form.notes}
          onChangeText={(notes) => onChange({ notes })}
          placeholder="Context for this entry"
          placeholderTextColor={mflColors.textMuted}
          multiline
          maxLength={500}
        />
      </View>

      <View className="flex-row gap-3">
        <Button variant="secondary" size="lg" onPress={onCancel} className="flex-1">
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          variant="primary"
          size="lg"
          onPress={onSubmit}
          isDisabled={isBusy}
          className="flex-1"
        >
          {isBusy ? <Spinner size="sm" /> : <Button.Label>Save Entry</Button.Label>}
        </Button>
      </View>
    </Card>
  );
}

function ChoiceChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="px-4 py-2 rounded-full border"
      style={
        isSelected
          ? { backgroundColor: mflColors.brand, borderColor: mflColors.brand }
          : { backgroundColor: mflColors.card, borderColor: mflColors.border }
      }
    >
      <AppText
        className="text-sm font-medium"
        style={{ color: isSelected ? mflColors.white : mflColors.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
