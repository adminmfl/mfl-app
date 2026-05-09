import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { Button, Card, Chip, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { useRole } from '../../../contexts/role-context';
import { useActivityCategories } from '../hooks/use-activity-categories';
import { useHostCustomActivities } from '../hooks/use-host-custom-activities';
import type {
  CustomActivityConfig,
  MeasurementType,
} from '../types/activity-config.model';
import { MEASUREMENT_TYPES } from '../types/activity-config.model';
import {
  MEASUREMENT_LABELS,
  getApiErrorMessage,
} from '../utils/activity-config';
import { Divider, ToggleRow, inputStyle } from './settings-form-fields';

interface Props {
  leagueId: string;
}

interface ActivityFormState {
  activity_name: string;
  description: string;
  category_id: string;
  measurement_type: MeasurementType;
  requires_proof: boolean;
  requires_notes: boolean;
}

const DEFAULT_FORM: ActivityFormState = {
  activity_name: '',
  description: '',
  category_id: '',
  measurement_type: 'none',
  requires_proof: true,
  requires_notes: false,
};

const MEASUREMENT_DESCRIPTIONS: Record<MeasurementType, string> = {
  none: 'Completion only',
  duration: 'Minutes',
  distance: 'Distance',
  steps: 'Step count',
  hole: 'Holes',
};

export function SettingsCustomActivitiesSection({ leagueId }: Props) {
  const { isHost, isGovernor, availableRoles } = useRole();
  const canManage =
    isHost ||
    isGovernor ||
    availableRoles.includes('host') ||
    availableRoles.includes('governor');
  const categoriesQuery = useActivityCategories();
  const customActivities = useHostCustomActivities(leagueId);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ActivityFormState>(DEFAULT_FORM);
  const [successMsg, setSuccessMsg] = useState('');

  const activeActivities = (customActivities.data ?? []).filter(
    (activity) => activity.is_active,
  );
  const isSaving =
    customActivities.createMutation.isPending ||
    customActivities.updateMutation.isPending;

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowForm(true);
    setSuccessMsg('');
  };

  const startEdit = (activity: CustomActivityConfig) => {
    setForm({
      activity_name: activity.activity_name,
      description: activity.description ?? '',
      category_id: activity.category_id ?? '',
      measurement_type: activity.measurement_type,
      requires_proof: activity.requires_proof,
      requires_notes: activity.requires_notes,
    });
    setEditingId(activity.custom_activity_id);
    setShowForm(true);
    setSuccessMsg('');
  };

  const handleSubmit = () => {
    const name = form.activity_name.trim();
    if (name.length < 2) {
      Alert.alert('Validation Error', 'Activity name is required.');
      return;
    }

    setSuccessMsg('');
    if (editingId) {
      customActivities.updateMutation.mutate(
        {
          custom_activity_id: editingId,
          activity_name: name,
          description: form.description.trim() || undefined,
          category_id: form.category_id || null,
          measurement_type: form.measurement_type,
          requires_proof: form.requires_proof,
          requires_notes: form.requires_notes,
        },
        {
          onSuccess: () => {
            resetForm();
            setSuccessMsg('Custom activity updated.');
          },
          onError: (error) =>
            Alert.alert(
              'Save Failed',
              getApiErrorMessage(error, 'Failed to update custom activity.'),
            ),
        },
      );
      return;
    }

    customActivities.createMutation.mutate(
      {
        activity_name: name,
        description: form.description.trim() || undefined,
        category_id: form.category_id || undefined,
        measurement_type: form.measurement_type,
        requires_proof: form.requires_proof,
        requires_notes: form.requires_notes,
      },
      {
        onSuccess: () => {
          resetForm();
          setSuccessMsg('Custom activity created.');
        },
        onError: (error) =>
          Alert.alert(
            'Create Failed',
            getApiErrorMessage(error, 'Failed to create custom activity.'),
          ),
      },
    );
  };

  const handleDelete = (activity: CustomActivityConfig) => {
    Alert.alert(
      'Delete Activity',
      `Delete "${activity.activity_name}"? This removes it from any leagues using it and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSuccessMsg('');
            customActivities.deleteMutation.mutate(
              activity.custom_activity_id,
              {
                onSuccess: () => setSuccessMsg('Custom activity deleted.'),
                onError: (error) =>
                  Alert.alert(
                    'Delete Failed',
                    getApiErrorMessage(
                      error,
                      'Failed to delete custom activity.',
                    ),
                  ),
              },
            );
          },
        },
      ],
    );
  };

  return (
    <View className="gap-3">
      <SectionLabel
        label="CUSTOM ACTIVITIES"
        actionLabel={canManage ? (showForm ? 'Cancel' : 'Add') : undefined}
        onAction={canManage ? (showForm ? resetForm : startCreate) : undefined}
      />

      <Card className="p-4 gap-4">
        <View>
          <AppText className="text-base font-bold text-foreground">
            Host-Created Activities
          </AppText>
          <AppText className="text-xs text-muted mt-0.5">
            Create reusable activities with category, measurement, proof, and
            notes rules.
          </AppText>
        </View>

        {successMsg ? (
          <View
            className="rounded-lg p-3"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <AppText
              className="text-sm font-medium"
              style={{ color: mflColors.brand }}
            >
              {successMsg}
            </AppText>
          </View>
        ) : null}

        {customActivities.isError ? (
          <View
            className="rounded-lg p-3"
            style={{ backgroundColor: mflColors.dangerLight }}
          >
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {getApiErrorMessage(
                customActivities.error,
                'Failed to load custom activities.',
              )}
            </AppText>
          </View>
        ) : null}

        {showForm ? (
          <CustomActivityForm
            form={form}
            onChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
            categories={categoriesQuery.data ?? []}
            categoriesLoading={categoriesQuery.isLoading}
            categoriesError={categoriesQuery.isError}
            isSaving={isSaving}
            submitLabel={editingId ? 'Save Changes' : 'Create Activity'}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        ) : null}

        {customActivities.isLoading ? (
          <View className="items-center py-6">
            <Spinner size="sm" />
            <AppText className="text-sm text-muted mt-2">
              Loading custom activities...
            </AppText>
          </View>
        ) : null}

        {!customActivities.isLoading && activeActivities.length === 0 ? (
          <View
            className="items-center rounded-lg border p-5"
            style={{ borderColor: mflColors.border }}
          >
            <Feather name="plus-circle" size={24} color={mflColors.textMuted} />
            <AppText className="text-sm text-muted mt-2 text-center">
              No custom activities yet.
            </AppText>
            {canManage && !showForm ? (
              <Button
                variant="primary"
                size="sm"
                onPress={startCreate}
                className="mt-3"
              >
                <Button.Label>Add Activity</Button.Label>
              </Button>
            ) : null}
          </View>
        ) : null}

        <View className="gap-3">
          {activeActivities.map((activity) => (
            <CustomActivityCard
              key={activity.custom_activity_id}
              activity={activity}
              canManage={canManage}
              isDeleting={customActivities.deleteMutation.isPending}
              onEdit={() => startEdit(activity)}
              onDelete={() => handleDelete(activity)}
            />
          ))}
        </View>
      </Card>
    </View>
  );
}

function CustomActivityForm({
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

function CustomActivityCard({
  activity,
  canManage,
  isDeleting,
  onEdit,
  onDelete,
}: {
  activity: CustomActivityConfig;
  canManage: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View
      className="rounded-xl border p-3"
      style={{ borderColor: mflColors.border, backgroundColor: mflColors.white }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-2">
          <View className="flex-row flex-wrap items-center gap-2">
            <AppText className="text-sm font-bold text-foreground">
              {activity.activity_name}
            </AppText>
            <Chip size="sm" variant="soft">
              <Chip.Label>Custom</Chip.Label>
            </Chip>
            {activity.category ? (
              <Chip size="sm" variant="soft">
                <Chip.Label>{activity.category.display_name}</Chip.Label>
              </Chip>
            ) : null}
          </View>
          {activity.description ? (
            <AppText className="text-xs text-muted" numberOfLines={2}>
              {activity.description}
            </AppText>
          ) : null}
          <View className="flex-row flex-wrap gap-2">
            <Chip size="sm" variant="soft">
              <Chip.Label>
                {MEASUREMENT_LABELS[activity.measurement_type]}
              </Chip.Label>
            </Chip>
            <Chip size="sm" variant="soft">
              <Chip.Label>
                Proof {activity.requires_proof ? 'required' : 'optional'}
              </Chip.Label>
            </Chip>
            <Chip size="sm" variant="soft">
              <Chip.Label>
                Notes {activity.requires_notes ? 'required' : 'optional'}
              </Chip.Label>
            </Chip>
            {typeof activity.usage_count === 'number' ? (
              <Chip size="sm" variant="soft">
                <Chip.Label>{activity.usage_count} uses</Chip.Label>
              </Chip>
            ) : null}
          </View>
        </View>

        {canManage ? (
          <View className="flex-row gap-2">
            <Pressable onPress={onEdit} hitSlop={8}>
              <View
                className="h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: mflColors.brandLight }}
              >
                <Feather name="edit-2" size={16} color={mflColors.brand} />
              </View>
            </Pressable>
            <Pressable onPress={onDelete} disabled={isDeleting} hitSlop={8}>
              <View
                className="h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: mflColors.dangerLight,
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                <Feather name="trash-2" size={16} color={mflColors.danger} />
              </View>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function SelectableChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        className="rounded-full px-3 py-1.5"
        style={{
          backgroundColor: selected ? mflColors.brandLight : mflColors.white,
          borderWidth: 1,
          borderColor: selected ? mflColors.brand : mflColors.border,
        }}
      >
        <AppText
          className="text-xs font-medium"
          style={{ color: selected ? mflColors.brand : mflColors.textSub }}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}
