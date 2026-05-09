import Feather from '@expo/vector-icons/Feather';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type {
  ActivityCategory,
  MeasurementType,
} from '../types/custom-activity.model';
import type { CustomActivityFormData } from '../utils/custom-activity-form';
import { CustomActivityChoiceChip } from './custom-activity-choice-chip';
import { MEASUREMENT_OPTIONS } from '../utils/measurement-types';

type FeatherIconName = keyof typeof Feather.glyphMap;

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

const measurementIcons: Record<MeasurementType, FeatherIconName> = {
  none: 'circle',
  duration: 'clock',
  distance: 'map-pin',
  steps: 'trending-up',
  hole: 'target',
};

interface CustomActivityFormCardProps {
  title: string;
  submitLabel: string;
  form: CustomActivityFormData;
  categories: ActivityCategory[];
  categoriesLoading: boolean;
  categoriesError: boolean;
  isSaving: boolean;
  onChange: (patch: Partial<CustomActivityFormData>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onRetryCategories: () => void;
}

export function CustomActivityFormCard({
  title,
  submitLabel,
  form,
  categories,
  categoriesLoading,
  categoriesError,
  isSaving,
  onChange,
  onCancel,
  onSubmit,
  onRetryCategories,
}: CustomActivityFormCardProps) {
  const canSubmit = form.activityName.trim().length >= 2 && !isSaving;

  return (
    <Card className="gap-5 p-4">
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <AppText className="text-base font-semibold text-foreground">{title}</AppText>
        </View>
        <Pressable onPress={onCancel} hitSlop={10} accessibilityRole="button">
          <Feather name="x" size={22} color={mflColors.textMuted} />
        </Pressable>
      </View>

      <View className="gap-2">
        <SectionLabel label="Activity Name" />
        <TextInput
          style={inputStyle}
          value={form.activityName}
          onChangeText={(activityName) => onChange({ activityName })}
          placeholder="e.g. Morning Walk"
          placeholderTextColor={mflColors.textMuted}
          maxLength={100}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>

      <View className="gap-2">
        <SectionLabel label="Description" />
        <TextInput
          style={[inputStyle, { minHeight: 84, textAlignVertical: 'top' }]}
          value={form.description}
          onChangeText={(description) => onChange({ description })}
          placeholder="Brief description of the activity"
          placeholderTextColor={mflColors.textMuted}
          maxLength={500}
          multiline
        />
      </View>

      <CategorySelector
        selectedCategoryId={form.categoryId}
        categories={categories}
        isLoading={categoriesLoading}
        isError={categoriesError}
        onSelect={(categoryId) => onChange({ categoryId })}
        onRetry={onRetryCategories}
      />

      <View className="gap-2">
        <SectionLabel label="Measurement Type" />
        <View className="gap-2">
          {MEASUREMENT_OPTIONS.map((option) => {
            const selected = form.measurementType === option.value;
            const iconName = measurementIcons[option.value];

            return (
              <Pressable
                key={option.value}
                onPress={() => onChange({ measurementType: option.value })}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: selected ? mflColors.brandLight : mflColors.card,
                  borderColor: selected ? mflColors.brand : mflColors.border,
                }}
              >
                <View className="flex-row items-start gap-3">
                  <View
                    className="h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: selected ? mflColors.brand : mflColors.surface,
                    }}
                  >
                    <Feather
                      name={iconName}
                      size={17}
                      color={selected ? mflColors.white : mflColors.textSub}
                    />
                  </View>
                  <View className="flex-1">
                    <AppText className="text-sm font-semibold text-foreground">
                      {option.shortLabel}
                    </AppText>
                    <AppText className="mt-0.5 text-xs text-muted">
                      {option.description}
                    </AppText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-1">
        <SectionLabel label="Requirements" />
        <RequirementToggle
          label="Require proof upload"
          value={form.requiresProof}
          icon="camera"
          onToggle={() => onChange({ requiresProof: !form.requiresProof })}
        />
        <RequirementToggle
          label="Require notes"
          value={form.requiresNotes}
          icon="file-text"
          onToggle={() => onChange({ requiresNotes: !form.requiresNotes })}
        />
      </View>

      <View className="flex-row gap-3">
        <Button
          variant="secondary"
          size="lg"
          onPress={onCancel}
          isDisabled={isSaving}
          className="flex-1"
        >
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          variant="primary"
          size="lg"
          onPress={onSubmit}
          isDisabled={!canSubmit}
          className="flex-1"
          style={{ backgroundColor: canSubmit ? mflColors.brand : mflColors.textMuted }}
        >
          {isSaving ? <Spinner size="sm" /> : <Button.Label>{submitLabel}</Button.Label>}
        </Button>
      </View>
    </Card>
  );
}

function CategorySelector({
  selectedCategoryId,
  categories,
  isLoading,
  isError,
  onSelect,
  onRetry,
}: {
  selectedCategoryId: string;
  categories: ActivityCategory[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (categoryId: string) => void;
  onRetry: () => void;
}) {
  return (
    <View className="gap-2">
      <SectionLabel label="Category" />
      {isError ? (
        <View className="gap-3 rounded-xl border border-default-200 bg-default-50 p-4">
          <AppText className="text-sm text-muted">
            Categories could not be loaded.
          </AppText>
          <Button variant="secondary" size="sm" onPress={onRetry}>
            <Button.Label>Retry</Button.Label>
          </Button>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-4">
            <CustomActivityChoiceChip
              label="No category"
              selected={!selectedCategoryId}
              onPress={() => onSelect('')}
            />
            {isLoading ? (
              <View className="justify-center px-2">
                <AppText className="text-sm text-muted">Loading categories...</AppText>
              </View>
            ) : (
              categories.map((category) => (
                <CustomActivityChoiceChip
                  key={category.categoryId}
                  label={category.displayName}
                  selected={selectedCategoryId === category.categoryId}
                  onPress={() => onSelect(category.categoryId)}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function RequirementToggle({
  label,
  value,
  icon,
  onToggle,
}: {
  label: string;
  value: boolean;
  icon: FeatherIconName;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      className="flex-row items-center justify-between py-3"
    >
      <View className="mr-4 flex-1 flex-row items-center gap-3">
        <Feather name={icon} size={18} color={mflColors.textSub} />
        <AppText className="text-sm font-medium text-foreground">{label}</AppText>
      </View>
      <View
        className="h-7 w-12 justify-center rounded-full px-0.5"
        style={{ backgroundColor: value ? mflColors.brand : mflColors.border }}
      >
        <View
          className="h-6 w-6 rounded-full"
          style={{
            backgroundColor: mflColors.white,
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </Pressable>
  );
}
