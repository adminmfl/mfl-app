import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { MEASUREMENT_TYPES } from '../types/activity-config.model';
import {
  MEASUREMENT_LABELS,
  MEASUREMENT_DESCRIPTIONS
} from '../utils/activity-config';
import { Divider, ToggleRow, inputStyle } from './settings-form-fields';
import type {
  MeasurementType,
} from '../types/activity-config.model';
import { SelectableChip } from './selectable-chip';
import { TextInput, View } from 'react-native';
import { Button, Spinner } from 'heroui-native';

export interface ActivityFormState {
  activity_name: string;
  description: string;
  category_id: string;
  measurement_type: MeasurementType;
  requires_proof: boolean;
  requires_notes: boolean;
}

export const DEFAULT_FORM: ActivityFormState = {
  activity_name: '',
  description: '',
  category_id: '',
  measurement_type: 'none',
  requires_proof: true,
  requires_notes: false,
};

export function CustomActivityForm({
  form,
  onChange,
  categories,
  categoriesLoading,
  categoriesError,
  isSaving,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  form: ActivityFormState;
  onChange: (next: Partial<ActivityFormState>) => void;
  categories: { category_id: string; display_name: string }[];
  categoriesLoading: boolean;
  categoriesError: boolean;
  isSaving: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <View
      className="gap-4 rounded-xl border p-3"
      style={{ borderColor: mflColors.border, backgroundColor: mflColors.surface }}
    >
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">
          Activity Name
        </AppText>
        <TextInput
          style={inputStyle}
          value={form.activity_name}
          onChangeText={(value) => onChange({ activity_name: value })}
          placeholder="e.g. Morning Walk"
          placeholderTextColor={mflColors.textMuted}
          maxLength={100}
        />
      </View>

      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Description</AppText>
        <TextInput
          style={[inputStyle, { minHeight: 72, textAlignVertical: 'top' }]}
          value={form.description}
          onChangeText={(value) => onChange({ description: value })}
          placeholder="Brief description"
          placeholderTextColor={mflColors.textMuted}
          multiline
          maxLength={500}
        />
      </View>

      <View className="gap-2">
        <AppText className="text-sm font-medium text-muted">Category</AppText>
        {categoriesLoading ? (
          <View className="flex-row items-center gap-2">
            <Spinner size="sm" />
            <AppText className="text-xs text-muted">Loading categories...</AppText>
          </View>
        ) : null}
        {categoriesError ? (
          <AppText className="text-xs" style={{ color: mflColors.danger }}>
            Categories are unavailable right now.
          </AppText>
        ) : null}
        <View className="flex-row flex-wrap gap-2">
          <SelectableChip
            label="None"
            selected={!form.category_id}
            onPress={() => onChange({ category_id: '' })}
          />
          {categories.map((category) => (
            <SelectableChip
              key={category.category_id}
              label={category.display_name}
              selected={form.category_id === category.category_id}
              onPress={() => onChange({ category_id: category.category_id })}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <AppText className="text-sm font-medium text-muted">
          Measurement Type
        </AppText>
        <View className="flex-row flex-wrap gap-2">
          {MEASUREMENT_TYPES.map((type) => (
            <SelectableChip
              key={type}
              label={`${MEASUREMENT_LABELS[type]} - ${MEASUREMENT_DESCRIPTIONS[type]}`}
              selected={form.measurement_type === type}
              onPress={() => onChange({ measurement_type: type })}
            />
          ))}
        </View>
      </View>

      <View
        className="rounded-xl border px-3"
        style={{ borderColor: mflColors.border, backgroundColor: mflColors.white }}
      >
        <ToggleRow
          label="Require proof upload"
          value={form.requires_proof}
          onToggle={() => onChange({ requires_proof: !form.requires_proof })}
        />
        <Divider />
        <ToggleRow
          label="Require notes"
          value={form.requires_notes}
          onToggle={() => onChange({ requires_notes: !form.requires_notes })}
        />
      </View>

      <View className="flex-row gap-3">
        <Button
          variant="secondary"
          size="md"
          onPress={onCancel}
          isDisabled={isSaving}
          className="flex-1"
        >
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          variant="primary"
          size="md"
          onPress={onSubmit}
          isDisabled={isSaving || form.activity_name.trim().length < 2}
          className="flex-1"
        >
          {isSaving ? <Spinner size="sm" /> : <Button.Label>{submitLabel}</Button.Label>}
        </Button>
      </View>
    </View>
  );
}
